# Resona OS: implementation and validation status

**As of September 26, 2026.** This is a source-level inventory, not independent certification. Status can change as the repositories evolve.

| Surface | What is present | What remains unproven |
| --- | --- | --- |
| [Resona chat demo](https://github.com/michaelkayser1/v0-new-project-RESONA) | A deployed chat interface and API route | A separately authorized gate for consequential action, clinical accuracy, and end-to-end safety |
| [Resona OS prototype](../lib) | Agent, scoring, redaction, and audit modules with dashboard pages | External policy authority, real isolation and enforcement, durable audit custody, HIPAA compliance, clinical validation |
| [QOTE control-law console](https://github.com/michaelkayser1/qote-control-law) | A browser state-machine simulator with receipts and self-tests | Calibrated thresholds, authenticated independent signers, real tool enforcement, and independent reality verification |
| [QOTE archive](https://github.com/michaelkayser1/QOTE-Deploy-Pro.) | Historical narrative, proposed math, visualization | Validation of π/2π safety bands or biological/AI equivalence |

## Source-level cautions

- `lib/audit/audit-logger.ts` holds the chain in process memory. The repaired verifier compares each stored hash with a recomputed hash and checks previous-hash links. The chain remains process-local, mutable through returned event references, resettable, and neither durable nor independently attested. An unanchored, internally consistent prefix cannot reveal tail deletion.
- `lib/agents/runner.ts` models branch names and statuses in memory. Its `mergeAgent` function returns a status; the function alone does not perform a GitHub merge or authenticate an approver.
- `lib/compliance/redaction.ts` matches a limited set of patterns. Pattern matching alone cannot establish that logs contain no protected health information.
- The control-law console labels most numeric calibration values `CALIBRATION_PENDING` and blocks one institutional integrity floor. A simulation score must not be treated as a validated authorization.

## Proposed control contract

1. The model proposes an exact action, scope, destination, and evidence references.
2. A versioned policy owned outside the model defines required evidence and authorized signers.
3. An independent gate checks evidence, authority, reversibility, and lease expiry; unknowns hold.
4. A separate executor accepts only the approved, single-use action fingerprint.
5. The system records the proposed action, gate decision, actual external outcome, and any reversal.
6. A human can stop or exit without prior conversation memory silently conferring authority.

This is an intended architecture. The repositories above demonstrate pieces, not a completed implementation of this contract.

## First meaningful validation milestone

Use one harmless external action in a controlled test environment. Pre-register the policy and evidence schema. Demonstrate that a valid signed request executes exactly once and that missing evidence, expired authority, changed parameters, replay, signer conflicts, and unavailable policy services all hold without execution. Keep independent logs of the gate and external system; reconcile both after the test. Repeat across model versions and after a restart. Publish the test protocol, results, and failures before claiming the control is effective.

## Historical validity correction (September 26, 2026)

Before commit [ff971926](https://github.com/michaelkayser1/Resona-OS/commit/ff9719265319110381cda387aba51f5cfcf3f840), `verifyChainIntegrity` recomputed each digest to advance its local comparison value but never compared the stored `event.hash` with that digest. Therefore **any earlier pass using this function as evidence of payload or stored-hash tamper detection is invalid**. It could still reject a mismatched `prevHash` link; that narrower behavior is not retroactively invalidated. Do not count old passing tamper fixtures as successful validation of hash integrity.

The two current tamper tests were run against the committed pre-fix implementation at [47ffbe1f](https://github.com/michaelkayser1/Resona-OS/blob/47ffbe1f60977ab4bbb461519e3a73c83f16c94e/lib/audit/audit-logger.ts): both failed because that verifier returned `{valid:true}` for altered data. Both then passed on the repaired implementation. This is a regression demonstration, not independent security assurance.

A separately described **six-fixture Witness Ledger suite** has not been located in the accessible repositories. Its code, fixtures, assertions, version, and execution record must be retrieved before its results can be attributed to this function or assessed individually. Pending that review, its claimed tamper-detection outcome is **unverified**, and it must not be cited as support for this implementation. If it depended on the old function for digest checks, those particular passes are invalid for the reason above.

The expanded regression tests cover stored-hash alteration, payload alteration, broken previous-hash linkage, reordering, middle deletion, and tail truncation. The unanchored truncated prefix correctly passes internal checks; it fails only when checked against an expected count and head hash. The current in-process head is not an external anchor. A separately controlled, persisted head and independent custody are prerequisites for a meaningful completeness claim.

See [the proposed external-action preregistration](EXTERNAL_ACTION_TEST_PREREG.md). It is a draft protocol, not a completed external evaluation.
