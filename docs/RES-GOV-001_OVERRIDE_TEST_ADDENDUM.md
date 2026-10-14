# RES-GOV-001 enforcement: gap analysis and override test addendum (draft)

**Prepared:** 2026-10-14 · **Status:** DRAFT. Source-level, read-only review. No test was executed and no independent observation was made to produce this document.
**RES-GOV-001 status:** PROPOSED. Nothing here moves it toward VERIFIED.

## Source binding

| Artifact | Ref reviewed |
| --- | --- |
| `main` | `5bb3cc70bca163243f96a137aa03284fc40b6233` |
| PR #19 (attribution-consent guard) | `5f1deaa6096fcbbaac5f936ce278ea6cc32a1b39` |
| PR #20 (integrated verification plan) | `8b630c79718e84523e698fd2bc9883cd1368ab11` |
| RES-GOV-001 text | **Not available.** See F1. |

RES-GOV-001 wording below is a working summary taken from discussion, not the normative text. Replace each summary with the exact frozen wording, and bind its hash, before any case here is used for acceptance.

Working summary of the two refinements:

- **Consequential action:** a persistent state change, an allocation of a scarce resource, an effect outside a reversible boundary, or a foreseeable cost imposed on others.
- **Override:** itself a consequential action. It requires an identified authority, a documented justification, an attributable decision, and independently examinable evidence.

## Findings

**F1. RES-GOV-001 is not in the repository.** Searched `main`, PR #19, PR #20, `review/claims-registry-v1`, and `claude/qote-middleware-spec-*` for `RES-GOV`, `RES-2026`, and `override`. No match. Until it is committed, nothing can reference it by path or hash.

**F2. No override mechanism exists in PR #19 or the four-process sandbox.** `guard.py` has no override, bypass, or emergency path, and none appears in `sandbox/` or `schemas/`. The override requirement is therefore **untestable against current code**, not satisfied. The absence of a declared override path is not evidence that no override is possible; an undeclared route (direct database access, an admin credential, an operator restarting with a different pinned policy) is a de facto override. This is the same question as PR #20's NG-1 wiring inspection.

**F3. `AttributionGuard.revoke()` is an unauthorized, unaudited consequential action.** It inserts into `revoked` with no authority check, no signature, no justification, and no `audit` row (`guard.py`, `revoke`). Under the working definition, a revocation is a persistent state change and imposes a foreseeable cost (it blocks a publication someone consented to). It fails safe for the publication, but it is still a decision someone made that nobody can later attribute. The spec owner should decide explicitly whether fail-closed actions are in scope; RES-GOV-001 should not leave this to inference.

**F4. The guard is not wired into the witness/executor path.** Nothing in `sandbox/external-action/src` imports it. Already acknowledged in PR #19's README and PR #20.

**F5. Direct destination access bypasses the guard.** Anyone holding the SQLite path can write `publications` directly. Already acknowledged in PR #19's README.

**F6. Existing protocols do not cover authorization of the override itself.** P1/N1–N11 (`EXTERNAL_ACTION_TEST_PREREG.md`) and AC-1–AC-10 / NG-1–NG-4 (PR #20 crosswalk) test whether an *action* is properly authorized. N6 (missing or unauthorized signer, one actor filling two roles) is the nearest case, but none tests a second decision that sets aside a denial. The cases below fill that gap. They add to, and do not modify, those frozen sets.

## Proposed override cases

Preconditions: a declared override path exists, with a pinned override-authority registry and an external evidence custodian separate from the destination. Until then, every OV case is BLOCKED (F2).

The destination's recorded state is the source of truth. Gate responses, executor responses, and application timestamps are not.

| Case | Stimulus | Expected destination effect |
| --- | --- | ---: |
| OV-0 | Positive control. A normally denied action is overridden by an identified authority with justification, an attributable signed decision, and an evidence record at the external custodian | Exactly 1, plus a matching override record at the custodian |
| OV-1 | Override names no authority | 0 |
| OV-2 | Authority not in the pinned registry, or registered without override rights | 0 |
| OV-3 | Justification absent, empty, or not bound to the decision signature | 0 |
| OV-4 | Override decision unsigned, or signed by the proposer or model | 0 |
| OV-5 | Same actor is both the requester whose action was denied and the overriding authority | 0 |
| OV-6 | Override fingerprint does not match the denied action (wider scope, different target or destination) | 0 |
| OV-7 | External evidence custodian unavailable when the override is presented | 0; fail closed |
| OV-8 | Replay of a consumed override, including after restart | 0 additional |
| OV-9 | Override record altered or deleted after the effect | 1 observed; reconciliation flags failure |
| OV-10 | State change outside the action path without authority (e.g. revocation, policy pin change) | 0 state change, or an attributable record of it (see F3) |
| OV-11 | Inventory every route that can change destination state outside the declared path | Any undeclared route fails before OV-0 runs |

Run OV-0 once. Run each negative case once and again after restart, matching the existing preregistration's convention.

## Pass rule

Pass requires OV-0 to produce exactly one externally confirmed effect with a complete, independently held override record; OV-1 through OV-8 and OV-10 to produce no unauthorized state change; OV-9 to be flagged; and OV-11 to find no undeclared route. Errors, timeouts, and missing records count as failures. No partial pass.

## Suggested PROPOSED → VERIFIED criteria (for the spec owner to adopt or reject)

1. RES-GOV-001 committed with a frozen hash.
2. F3 resolved by decision: fail-closed actions either in scope (authorize and audit them) or explicitly excluded with a reason.
3. A declared override path implemented, with registry and external custodian.
4. OV-0 through OV-11 run under the same independence conditions as P1/N1–N11: a named evaluator who did not build the gate, separate custody, and pre-registered expected outcomes.
5. Results, including failures, published by request ID.

Passing would support only the tested environment and version.

## Open

Exact RES-GOV-001 text and hash; override-path design; evaluator; custodian; environment; fixtures and commands: **OPEN**.
