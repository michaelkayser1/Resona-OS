# Resona OS: implementation and validation status

**As of September 26, 2026.** This is a source-level inventory, not independent certification. Status can change as the repositories evolve.

| Surface | What is present | What remains unproven |
| --- | --- | --- |
| [Resona chat demo](https://github.com/michaelkayser1/v0-new-project-RESONA) | A deployed chat interface and API route | A separately authorized gate for consequential action, clinical accuracy, and end-to-end safety |
| [Resona OS prototype](../lib) | Agent, scoring, redaction, and audit modules with dashboard pages | External policy authority, real isolation and enforcement, durable audit custody, HIPAA compliance, clinical validation |
| [QOTE control-law console](https://github.com/michaelkayser1/qote-control-law) | A browser state-machine simulator with receipts and self-tests | Calibrated thresholds, authenticated independent signers, real tool enforcement, and independent reality verification |
| [QOTE archive](https://github.com/michaelkayser1/QOTE-Deploy-Pro.) | Historical narrative, proposed math, visualization | Validation of π/2π safety bands or biological/AI equivalence |

## Source-level cautions

- `lib/audit/audit-logger.ts` holds the chain in process memory. Its current integrity check checks the previous-hash links but does not compare each stored event hash with a recomputed hash. It is not a durable or independently attested audit log.
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
