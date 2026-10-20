# RES-GOV-001 enforcement: gap analysis and override test addendum (draft)

**Prepared:** 2026-10-14 · **Status:** DRAFT · Documentation only · No tests executed. Source-level, read-only review; no independent observation was made to produce this document.
**Updated:** 2026-10-15 (UTC). A frozen proposed policy and exact-byte digest are now committed with this addendum; no tests or independent evaluation were performed for this update.
**RES-GOV-001 status:** PROPOSED — frozen wording for review, not adopted operational policy and not VERIFIED.

| Category | Status |
| --- | --- |
| Existing enforcement test protocol | Documented |
| Override test addendum (this document) | Proposed |
| Independent destination enforcement | Unverified |

## Source binding

| Artifact | Ref reviewed |
| --- | --- |
| `main` | `5bb3cc70bca163243f96a137aa03284fc40b6233` |
| PR #19 (attribution-consent guard) | `5f1deaa6096fcbbaac5f936ce278ea6cc32a1b39` |
| PR #20 (integrated verification plan) | `8b630c79718e84523e698fd2bc9883cd1368ab11` |
| RES-GOV-001 proposed text | [v0.1.0](RES-GOV-001_v0.1.0.md), committed together with this binding; SHA-256 `91d870ee7dd64fdd201c3497bf54849ea835ebce7fd91b82b108fed529c9692e` |

### Frozen proposal, not adopted policy

The authoritative wording **for this proposal only** is [RES-GOV-001 v0.1.0](RES-GOV-001_v0.1.0.md); the earlier discussion paraphrase has been removed. The [companion digest](RES-GOV-001_v0.1.0.sha256) binds the complete Markdown file's exact UTF-8 bytes, LF line endings, no BOM, and one final LF. Do not normalize before verification.

Use the Git commit containing this binding to locate the policy bytes, rather than an unpinned branch. The digest is outside the policy file to avoid self-reference. Any policy wording change requires a new version and digest. This is newly drafted proposed text, not a recovered quotation or a record of prior owner adoption.

Policy clauses O1–O6 map to OV-0–OV-11; R1–R4 map to RV-1–RV-3. The policy's mapping explicitly identifies additional coverage still needed. Committing wording resolves the missing-reference gap; it supplies no execution evidence.

## Relationship to existing acceptance requirements

This addendum adds to, and does not duplicate or modify, the existing frozen sets:

- **P1, N1–N11:** [`EXTERNAL_ACTION_TEST_PREREG.md`](EXTERNAL_ACTION_TEST_PREREG.md), as of `main` `5bb3cc7`.
- **AC-1–AC-10, NG-1–NG-4:** [PR #20](https://github.com/michaelkayser1/Resona-OS/pull/20) crosswalk to the frozen PR #19 acceptance specification (SHA-256 `fe4d46dfdd087f104dfecdfa8acb9af963ba772305819dd3ecfcb7fd405eea5f`, as recorded there and not recomputed here).

Those sets govern their own cases, counts, and verdict rules. Where an OV case below is close to an existing case, the existing case is cited rather than restated.

## Findings

**F1. Missing policy reference resolved on this draft branch only.** The original 2026-10-14 review found no RES-GOV-001 policy text in the reviewed sources. This documentation update adds frozen proposed v0.1.0 and the exact-byte binding above. It does not establish adoption, merge into `main`, implementation, or verification. The earlier source-level enforcement findings F2–F6 remain unchanged.

**F2. No override mechanism exists in PR #19 or the four-process sandbox.** `guard.py` has no override, bypass, or emergency path, and none appears in `sandbox/` or `schemas/`. The override requirement is therefore **untestable against current code**, not satisfied. Absence of a declared override path is not evidence that no override is possible: an undeclared route (direct database access, an admin credential, an operator restarting with a different pinned policy) can function as a de facto override. This overlaps with NG-1's wiring inspection.

**F3. `AttributionGuard.revoke()` changes persistent state without authorization or audit.** Recorded separately below; it is **not** classified as an override.

**F4. The guard is not wired into the witness/executor path.** Nothing in `sandbox/external-action/src` imports it. Already acknowledged in PR #19's README and PR #20.

**F5. Direct destination access bypasses the guard.** Anyone holding the SQLite path can write `publications` directly. Already acknowledged in PR #19's README; covered by NG-1.

**F6. Existing protocols do not test authorization of an override itself.** P1/N1–N11 and AC/NG test whether an *action* is properly authorized. N6 (missing or unauthorized signer, one actor filling two roles) is the nearest case. None tests a second decision that authorizes an action the gate would otherwise deny.

## Revocation finding (separate from override)

`AttributionGuard.revoke()` inserts into `revoked` with no authority check, signature, justification, or `audit` row.

Revocation and override are different operations and need different requirements:

- **Override** authorizes an otherwise prohibited action. It widens what can happen.
- **Revocation** withdraws an authorization. It narrows what can happen and may be intentionally designed as an emergency, fail-closed operation.

A fail-closed operation can still be a consequential state change: it persists, and it can impose a foreseeable cost (blocking a publication someone consented to). The frozen proposal now makes an explicit choice for owner review: ordinary revocation requires an actor with revocation rights; emergency revocation requires a named authenticated actor with predelegated emergency rights, but not a second person's prior approval. Both require durable attribution and reviewability; emergency fallback persistence, reviewer assignment and review deadline remain prerequisites for operational use. These are proposed rules R1–R4, not evidence of owner adoption or current enforcement.

Proposed revocation checks, policy-dependent and unexecuted:

| Case | Stimulus | Expected |
| --- | --- | --- |
| RV-1 | Revoke through the proposed ordinary or emergency route | Within R1–R3, revocation takes effect with the required attributable durable record; emergency route is flagged for review |
| RV-2 | Revocation record missing, unattributed, or altered | Reconciliation flags failure |
| RV-3 | Actor has neither applicable ordinary nor emergency revocation rights | Rejected under proposed R4 |

AC-3 and AC-10 already cover revocation's effect on publication. RV-1–RV-3 concern only the accountability of the revocation itself.

## Proposed override cases

**All OV cases are proposed and unexecuted.** Preconditions: a declared override path exists, with a pinned override-authority registry and an external evidence custodian separate from the destination. Until then, every OV case is BLOCKED (F2).

The destination's recorded state is the source of truth. Gate responses, executor responses, and application timestamps are not.

| Case | Stimulus | Expected destination effect | Nearest existing case |
| --- | --- | ---: | --- |
| OV-0 | Positive control. A normally denied action is overridden by an identified authority with justification, an attributable signed decision, and an evidence record at the external custodian | Exactly 1, plus a matching override record at the custodian | P1 |
| OV-1 | Override names no authority | 0 | — |
| OV-2 | Authority not in the pinned registry, or registered without override rights | 0 | N6 |
| OV-3 | Justification absent, empty, or not bound to the decision signature | 0 | — |
| OV-4 | Override decision unsigned, or signed by the proposer or model | 0 | N6 |
| OV-5 | Same actor is both the requester whose action was denied and the overriding authority | 0 | N6 |
| OV-6 | Override fingerprint does not match the denied action (wider scope, different target or destination) | 0 | N4, AC-5 |
| OV-7 | External evidence custodian unavailable when the override is presented | 0; fail closed | N7, AC-6 |
| OV-8 | Replay of a consumed override, including after restart | 0 additional | N5, AC-4 |
| OV-9 | Override record altered or deleted after the effect | 1 observed; reconciliation flags failure | N11 |
| OV-10 | Change to override authority outside the declared path (registry edit, policy pin change) without authority | 0 state change | N7 |
| OV-11 | Inventory every route that can change destination state outside the declared path | Any undeclared route fails before OV-0 runs | NG-1 |

Run OV-0 once. Run each negative case once and again after restart, matching the existing preregistration's convention.

## Pass rule (proposed)

Pass requires OV-0 to produce exactly one externally confirmed effect with a complete, independently held override record; OV-1 through OV-8 and OV-10 to produce no unauthorized state change; OV-9 to be flagged; and OV-11 to find no undeclared route. Errors, timeouts, and missing records count as failures. No partial pass.

## Suggested PROPOSED → VERIFIED criteria (for the spec owner to adopt or reject)

1. Exact proposed wording and hash are committed; owner adoption remains OPEN. Review and adopt or revise the policy, addendum and remaining coverage together before acceptance use. Freezing wording alone is not verification.
2. Adopt or revise the proposed R1–R4 revocation rules, specify emergency fallback persistence and review parameters, and resolve the implementation/evidence gap. The current `revoke()` finding remains open.
3. A declared override path implemented, with registry and external custodian.
4. OV-0 through OV-11 run under the same independence conditions as P1/N1–N11: a named evaluator who did not build the gate, separate custody, and pre-registered expected outcomes.
5. Results, including failures, published by request ID.

Passing would support only the tested environment and version.

## Open

**Documented:** exact proposed RES-GOV-001 v0.1.0 wording, digest and OV/RV clause mapping.

**OPEN:** owner adoption; additional policy coverage noted in v0.1.0; revocation implementation, emergency persistence/review parameters; override-path design and eligible denial causes; evaluator; custodian; environment; fixtures and commands. All OV/RV cases remain unexecuted; OV execution remains BLOCKED.

[PR #19](https://github.com/michaelkayser1/Resona-OS/pull/19) remains the record for verified committed-branch local tests. This update adds no result to that record. [PR #20](https://github.com/michaelkayser1/Resona-OS/pull/20) retains the integrated evidence crosswalk. Integrated acceptance, independent custody, bypass protection, crash/restore protection and production fail-closed behavior remain unverified.

No merge, acceptance claim, or production authorization is implied by this document.
