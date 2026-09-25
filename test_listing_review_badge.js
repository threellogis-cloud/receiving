[Reading 162 lines from start (total: 162 lines, 0 remaining)]

#!/usr/bin/env node
/* Founder Review page: BOOT + ATTRIBUTE_MATCHED badge regression tests.
 *
 * Run:  node test_listing_review_badge.js
 *
 * WHY THE BOOT TEST EXISTS. On 2026-09-25 the published page rendered its header
 * and then nothing -- no login panel, no queue. Cause: the inline script
 * contained a LITERAL backslash-n where a newline belonged:
 *
 *     ...+'</span>'}\nfunction renderCards(){...
 *
 * That is a hard SyntaxError, so the whole script failed to parse and boot()
 * never ran. Nothing in the page was broken except two characters, and no
 * function-level test could see it -- the file never became executable code.
 * So the FIRST test here parses the entire shipped script, which is the only
 * check that catches this class of damage.
 */
const fs = require("fs");
const assert = require("assert");
const vm = require("vm");

const PAGE = __dirname + "/listing-review.html";
const html = fs.readFileSync(PAGE, "utf8");

function inlineScript() {
  const blocks = [...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)]
    .filter(m => !/\bsrc=/.test(m[1]))
    .map(m => m[2]);
  assert.ok(blocks.length, "no inline script found");
  return blocks.join("\n");
}

let passed = 0;
function ok(name, fn) { fn(); passed++; console.log("  ok  " + name); }

// ---------------------------------------------------------------- boot
ok("the entire inline script PARSES (catches the \\n SyntaxError)", () => {
  // new vm.Script compiles without executing -- exactly what the browser does
  // first, and what failed on 2026-09-25.
  new vm.Script(inlineScript(), { filename: "listing-review.inline.js" });
});

ok("no literal backslash-n sequences survive in the script", () => {
  const src = inlineScript();
  const hits = (src.match(/\\n/g) || []).length;
  assert.strictEqual(hits, 0,
    hits + " literal \\n found -- a real newline was meant. This is the exact " +
    "defect that stopped the page booting.");
});

ok("boot and its visibility targets are defined", () => {
  const src = inlineScript();
  assert.ok(/async function boot\(/.test(src), "boot() missing");
  assert.ok(/#login/.test(src), "login panel reference missing");
  assert.ok(/#queue/.test(src), "queue reference missing");
});

ok("boot is reachable: declarations compile and boot is callable", () => {
  const src = inlineScript();
  // Compile in a sandbox with a minimal DOM so declarations evaluate. Network
  // and Supabase are absent, so boot() is checked for CALLABILITY, not outcome.
  const stub = () => ({ hidden: false, innerHTML: "", textContent: "",
                        querySelectorAll: () => [], addEventListener() {},
                        appendChild() {}, style: {}, value: "", focus() {} });
  const sandbox = {
    document: { querySelector: stub, querySelectorAll: () => [],
                getElementById: stub, addEventListener() {}, body: stub() },
    window: { supabase: { createClient: () => ({
                auth: { getSession: async () => ({ data: { session: null } }),
                        onAuthStateChange() {}, signInWithPassword: async () => ({}) },
                from: () => ({ select: () => ({ order: async () => ({ data: [], error: null }) }) }) }) } },
    console, setTimeout, fetch: async () => ({ ok: true, json: async () => ({}) }),
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
  };
  sandbox.globalThis = sandbox;
  const ctx = vm.createContext(sandbox);
  new vm.Script(src + "\n;globalThis.__boot = typeof boot;").runInContext(ctx, { timeout: 4000 });
  assert.strictEqual(sandbox.__boot, "function", "boot() did not survive evaluation");
});

// ---------------------------------------------------------------- badge
// Evaluate the WHOLE shipped script once in a sandbox and pull the real
// functions out of it. Re-extracting them with regexes was fragile: esc()
// contains HTML entities whose semicolons truncated a non-greedy match.
function sandboxPage() {
  const stub = () => ({ hidden: false, innerHTML: "", textContent: "",
                        querySelectorAll: () => [], addEventListener() {},
                        appendChild() {}, style: {}, value: "", focus() {} });
  const sandbox = {
    document: { querySelector: stub, querySelectorAll: () => [],
                getElementById: stub, addEventListener() {}, body: stub() },
    window: { supabase: { createClient: () => ({
                auth: { getSession: async () => ({ data: { session: null } }),
                        onAuthStateChange() {}, signInWithPassword: async () => ({}) },
                from: () => ({ select: () => ({ order: async () => ({ data: [], error: null }) }) }) }) } },
    console, setTimeout, fetch: async () => ({ ok: true, json: async () => ({}) }),
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
  };
  sandbox.globalThis = sandbox;
  const ctx = vm.createContext(sandbox);
  new vm.Script(inlineScript() +
    "\n;globalThis.__fns={boot:typeof boot,amBadge:amBadge,esc:esc};")
    .runInContext(ctx, { timeout: 4000 });
  return sandbox.__fns;
}
const FNS = sandboxPage();
const amBadge = () => FNS.amBadge;

const MATCHED = { identity_designation: { designation: "ATTRIBUTE_MATCHED",
  requires_identity_review: true,
  badge: { label: "ATTRIBUTE MATCHED / IDENTITY REVIEW", short: "ATTRIBUTE MATCHED",
           tooltip: "Identity matched on brand + attributes, not on a lot-stated part number.",
           aria_label: "Attribute matched, identity review required" } } };

ok("ATTRIBUTE_MATCHED renders the amber badge with a text label", () => {
  const h = amBadge()(MATCHED);
  assert.ok(h.includes("ATTRIBUTE MATCHED"), "visible label required");
  assert.ok(h.includes("IDENTITY REVIEW"), "must say why it needs attention");
  assert.ok(h.includes('class="state attrmatch"'), "amber class required");
});

ok("badge is accessible (aria-label + tooltip, not colour alone)", () => {
  const h = amBadge()(MATCHED);
  assert.ok(h.includes("aria-label="), "aria-label required");
  assert.ok(h.includes("title="), "tooltip required");
});

ok("VERIFIED renders NO badge", () => {
  const f = amBadge();
  assert.strictEqual(f({}), "");
  assert.strictEqual(f(null), "");
  assert.strictEqual(f({ identity_designation: { requires_identity_review: false } }), "");
});

ok("badge label is HTML-escaped", () => {
  const h = amBadge()({ identity_designation: { requires_identity_review: true,
    badge: { label: "<img src=x onerror=1>" } } });
  assert.ok(!h.includes("<img"), "label must be escaped");
});

ok("amber CSS class exists", () => {
  assert.ok(/\.attrmatch\{[^}]*var\(--amber\)/.test(html), "amber background missing");
});

ok("badge is rendered in BOTH the queue card and the detail view", () => {
  const n = (html.match(/\+amBadge\(p\)\+/g) || []).length;
  assert.strictEqual(n, 2, "expected 2 call sites, got " + n);
});

ok("READY status and controls untouched by the badge", () => {
  const src = inlineScript();
  const badge = src.match(/function amBadge\(p\)\{[\s\S]*?\n/)[0];
  assert.ok(!/review_state/.test(badge), "amBadge must not touch review_state");
  assert.ok(/s==="needs_review"\|\|s==="ready"/.test(src), "approve control changed");
});

ok("warning code has plain-English wording", () => {
  assert.ok(html.includes("identity_attribute_matched_requires_review:"),
            "label() mapping missing");
});

console.log("\n" + passed + " passed");

[executed on device: srv1900281 (ebc041ed-d859-4593-9f53-73120dd98d69)]