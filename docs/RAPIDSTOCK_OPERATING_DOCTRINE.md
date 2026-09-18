# RapidStock Operating Doctrine — Rigidity Classification

Status: FROZEN
Authority: Founder
Scope: RapidStock / Nellis pipeline
Effective: 2026-09-18

## Governing rule

Be rigid about ownership, money, destructive actions, publication, authentication, provenance, and data integrity.

Be flexible about inference, enrichment, presentation, and reversible operational choices.

Small controls must protect the big system, not become the big system.

## Classification model

Every requirement, blocker, review rule, or implementation choice must be classified before it is added, preserved, or defended.

### 1. HARD INVARIANT — rigid, fail-closed

Use only when uncertainty can materially affect:
- ownership
- money / loss floor
- destructive actions
- publication authority
- authentication / authorization
- provenance
- irreversible mutation
- material data integrity

Examples:
- do not list or publish an item we cannot prove we own
- do not publish without Founder approval
- do not knowingly price below the no-loss floor
- do not expose credentials
- do not perform destructive actions without explicit authorization / confirmation
- do not treat uncertain provenance as proven

If classified as HARD INVARIANT, state the specific material harm prevented.

### 2. CONFIGURABLE POLICY — changeable without architectural rebuild

Founder preferences and business rules belong here unless they intersect a hard invariant.

Examples:
- starting pricing percentage
- markdown schedule
- stock-photo preference
- minimum real-photo count
- incomplete-item handling
- review-queue routing thresholds
- category / aspect preference behavior

Policy changes should be centralized in configuration/control surfaces wherever practical.

A policy-only change must not trigger unrelated pipeline rework or broad re-certification.

### 3. HEURISTIC / DEFAULT — flexible, auto-resolve where safe

Inference and enrichment problems belong here.

Examples:
- missing dimensions
- probable item type
- inferred package dimensions from comparable products
- suggested aspects
- comparable-product matching
- photo-kind inference
- display / presentation choices

Prefer:
auto-resolve -> warn if needed -> route to review only when useful

Do not let "unknown" automatically mean "stop."

## Mandatory blocker test

Before adding or retaining a blocker:

1. Classify it as HARD INVARIANT, CONFIGURABLE POLICY, or HEURISTIC / DEFAULT.
2. If HARD INVARIANT, state the concrete material harm prevented.
3. If CONFIGURABLE POLICY, prefer centralized config.
4. If HEURISTIC / DEFAULT, prefer automatic resolution plus warning / review routing over blocking.

Do not retain a blocker merely because it already exists.

Do not promote a Founder preference into a hard invariant without explicit Founder approval.

Do not require exact evidence when an approximate, reversible answer is sufficient.

## QA scope

Broad invariant sweeps are reserved for HARD INVARIANT changes.

CONFIGURABLE POLICY and HEURISTIC / DEFAULT changes receive targeted review only.

Once a property is certified and untouched by later changes, do not reopen it without:
- a concrete dependency,
- new evidence,
- or a hard-invariant conflict.

## Category / taxonomy rule

Category or taxonomy uncertainty routes to review with a warning by default.

It becomes a hard block only when there is a concrete eBay compliance, account-risk, ownership, financial, or invalid-listing consequence that can be stated specifically.

Do not hard-block category ambiguity merely because the category is not exact.

## Photo rule

Photo-kind uncertainty is heuristic, not automatically a blocker.

Minimum real-photo count is configurable policy.

Prefer auto-resolution and warning / review routing over blocking unless a hard invariant is implicated.

## Dimensions rule

Missing dimensions are not a blocker.

Infer conservatively, preferring over-estimation where shipping cost could otherwise be understated.

The conservative default is what keeps this in the heuristic layer rather than turning it into a money-risk issue.

## Change-control test

For every Founder refinement, ask:

1. Does this alter a HARD INVARIANT?
2. Does this only change CONFIGURABLE POLICY?
3. Is this merely changing a HEURISTIC / DEFAULT?

Only category 1 should routinely trigger deep architectural review.

## Anti-drift

- Do not silently preserve the stricter interpretation.
- If an interpretation conflicts with this doctrine, surface the exact conflict before implementation.
- Do not broaden QA beyond the changed classification without a concrete reason.
- Do not reopen certified ground casually.
- Do not turn reversible uncertainty into a stop condition.
- Preserve Founder final publication authority.
- Preserve fail-closed behavior only where the hard-invariant criteria are actually met.

## Reopening this doctrine

This doctrine is FROZEN.

Do not reopen or renegotiate it for normal edge cases.

Future edge cases are classification questions under this doctrine, not grounds to revisit the doctrine itself.

Reopen only if a genuinely new class of material risk demonstrates that this three-layer model is insufficient, or if the Founder explicitly changes the doctrine.
