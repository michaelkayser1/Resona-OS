# Resona OS: implementation and validation status

**As of October 19, 2026.** This is a source-level inventory, not independent certification. Status can change as the repositories evolve.

> **Historical result withdrawn:** Earlier passes of this repository's audit verifier do not establish stored-hash or payload tamper detection. See [Historical validity correction](#historical-validity-correction-september-26-2026).

| Surface | What is present | What remains unproven |
| --- | --- | --- |
| [Resona chat demo](https://github.com/michaelkayser1/v0-new-project-RESONA) | A deployed chat interface and API route | A separately authorized gate for consequential action, clinical accuracy, and end-to-end safety |
| [Resona OS prototype](../lib) | Agent, scoring, redaction, and audit modules with dashboard pages | External policy authority, real isolation and enforcement, durable audit custody, HIPAA compliance, clinical validation |
| [QOTE control-law console](https://github.com/michaelkayser1/qote-control-law) | A browser state-machine simulator with receipts and self-tests | Calibrated thresholds, authenticated independent signers, real tool enforcement, and independent reality verification |
| [QOTE archive](https://github.com/michaelkayser1/QOTE-Deploy-Pro.) | Historical narrative, proposed math, visualization | Validation of π/2π safety bands or biological/AI equivalence |
| [Adaptive oscillator research](ADAPTIVE_OSCILLATOR_RESEARCH.md), added 2026-10-04 UTC | Offline unthrottled model, conditional edgewise gain bounds, eight research tests with multi-seed/initial-gain bound cases, Euler refinement and ODE comparisons | Coherence-setpoint control, safety invariance, task progress, novelty, and any authorization or clinical interpretation |
| [Clean Exit stress test rev. 2](CLEAN_EXIT_STRESS_TEST_REV2.md), added 2026-10-19 UTC | Synthetic test specification for creation-time authority, destination-side revocation/expiry enforcement, residual disposition, key custody, and independent reconciliation | Implementation in the runtime, execution of the six-path challenge, independent witness custody, production authority, and any claim of validated clean-exit behavior |

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

## Clean Exit validation boundary (October 19, 2026)

A new synthetic stress-test specification separates three completion questions without changing the four architectural layers:

1. **Authority closure:** was each action or derivative copy authorized when it was created?
2. **Capability closure:** can revoked or expired authority still produce the prohibited effect at the destination, regardless of presenter?
3. **Effect closure:** what authorized disposition governs state already created, including partial ciphertext, keys, audit artifacts, and queued work?

The decisive capability test is verifier-side rejection, not an operator report that a sender or retry worker stopped. Revocation and expiry are separate boundaries. Any completion claim remains **DEFER** until independently controlled records reconcile creation-time authority, verifier behavior, residual disposition, key custody, clock bounds, conflicts of interest, and circular-corroboration risk.

This is a protocol addition only. The current repository does **not** thereby implement revocation, key destruction, destination-side policy enforcement, or independent custody. See [Clean Exit Stress Test — Partial Execution (Rev. 2)](CLEAN_EXIT_STRESS_TEST_REV2.md).

## Path 2 implementation status (October 19, 2026)

The external-action sandbox now contains a **synthetic destination-side revocation verifier** for the Clean Exit Path 2 probe. The executor path is routed through the verifier before the marker effect. The verifier maintains a separate revocation-receipt store, rechecks the signed witness token, action fingerprint, active policy pin, lease boundary, and revocation state at the effect boundary, and only then may call the marker service.

Engineering tests have been added for:

- cached-token presentation after revocation from two verifier instances sharing the verifier-owned revocation store;
- separation of revocation and expiry boundaries;
- action-scope mismatch at the destination verifier;
- five-process loopback wiring in which the executor no longer holds the marker credential; and
- direct stale-token presentation to the verifier after a recorded revocation.

**Evidence status:** implementation and test definitions are present in source. Their successful execution has **not been established in this status record**. This is not independent validation, not production authority, and not evidence that all real enforcement points are enumerated. The revocation database, clocks, verifier process, and marker process remain local engineering components without independent custody.

## Path 2 serialization repair (October 21, 2026)

The earlier evidence record is historical: at `b168757c518197af12da0d00900566c70a3b318d`, Actions run 39274347667 ran 22 tests on test-merge `74c84d58954f366b9c44c23f2582455b343b23b5`, with one process-test failure (witness head count 3 versus expected 2). A local paused-effect diagnostic also reproduced a marker write after revocation acknowledgment.

The repair uses one `DESTINATION_DB` file for marker rows and revocation receipts. Both revocation commitment and the marker's final receipt check/write use SQLite writer transactions. Revocation acknowledged first prevents a later marker commit; a marker transaction already holding the writer lock completes before revocation can acknowledge. Receipt existence rejects stale caller clocks. Delayed responses are not evidence of delayed effect commitment.

The regression definitions cover 100 paused requests released after revocation acknowledgment, writer-lock ordering, stale clocks, and direct revoked-marker presentation. The five-process wiring and challenge script use the shared destination store. See PR #26 for the exact tested commit and execution results; definitions and historical results alone are not a pass at an untested revision. The repair does not establish independent acceptance, production authority, complete destination enumeration, crash/restore durability, or atomic lease/policy checks at the marker. No gates or acceptance milestones are declared passed.

## Destination identity and final lease follow-up (October 21, 2026)

The shared-store precondition was **not startup-enforced at `f0bfc27`**. Follow-up probes reproduced acceptance with split stores and after simulated lease expiry. Those findings limit the earlier passing engineering results to their tested configuration; they do not invalidate the recorded run provenance.

The follow-up repair makes one destination owner serve both revocation and marker writes. Verifier startup refuses a local database-path configuration and binds to the authenticated owner identity. Explicit initialization assigns a UUID to new stores only; existing stores are not migrated. Metadata is rechecked inside final write transactions. UUIDs do not distinguish same-ID byte copies or establish rollback protection; one owner on a single-host local filesystem remains a deployment precondition.

The marker now receives the original signed witness token and pinned store ID. After acquiring `BEGIN IMMEDIATE`, it samples its injected UTC clock and checks identity, signed scope, the static active policy pin, lease bounds, and revocation before inserting. The lease is inclusive at not-before and exclusive at expiry. This sampled in-transaction check is not a hard real-time commit-deadline guarantee. There is no mutable renewal/unrevocation API.

The initial three targeted regression probes failed at `f0bfc27` before source changes; the current fixture adapters reflect the revised protocol. Further tests cover lock-wait expiry, exact not-before, missing/changed metadata, initialization refusal for existing stores, known-network-mount rejection, mismatched startup pins, and rejection of legacy split-path verifier configuration. Linux filesystem inspection is explicitly best-effort and does not verify the deployment precondition.

See PR #26 for exact-revision execution results and separately attributed CI evidence. Neither PR #23 gate, independent acceptance, migration success, nor production acceptance is established by this repair.

## First meaningful validation milestone

Use one harmless external action in a controlled test environment. Pre-register the policy and evidence schema. Demonstrate that a valid signed request executes exactly once and that missing evidence, expired authority, changed parameters, replay, signer conflicts, and unavailable policy services all hold without execution. Keep independent logs of the gate and external system; reconcile both after the test. Repeat across model versions and after a restart. Publish the test protocol, results, and failures before claiming the control is effective.

## Historical validity correction (September 26, 2026)

Before commit [ff971926](https://github.com/michaelkayser1/Resona-OS/commit/ff9719265319110381cda387aba51f5cfcf3f840), `verifyChainIntegrity` recomputed each digest to advance its local comparison value but never compared the stored `event.hash` with that digest. Therefore **any earlier pass using this function as evidence of payload or stored-hash tamper detection is invalid**. It could still reject a mismatched `prevHash` link; that narrower behavior is not retroactively invalidated. Do not count old passing tamper fixtures as successful validation of hash integrity.

The two current tamper tests were run against the committed pre-fix implementation at [47ffbe1f](https://github.com/michaelkayser1/Resona-OS/blob/47ffbe1f60977ab4bbb461519e3a73c83f16c94e/lib/audit/audit-logger.ts): both failed because that verifier returned `{valid:true}` for altered data. Both then passed on the repaired implementation. This is a regression demonstration, not independent security assurance.

A separately described **six-fixture Witness Ledger suite** has not been located in the accessible repositories. Its code, fixtures, assertions, version, and execution record must be retrieved before its results can be attributed to this function or assessed individually. Pending that review, its claimed tamper-detection outcome is **unverified**, and it must not be cited as support for this implementation. If it depended on the old function for digest checks, those particular passes are invalid for the reason above.

The expanded regression tests cover stored-hash alteration, payload alteration, broken previous-hash linkage, reordering, middle deletion, and tail truncation. The unanchored truncated prefix correctly passes internal checks; it fails only when checked against an expected count and head hash. The current in-process head is not an external anchor. A separately controlled, persisted head and independent custody are prerequisites for a meaningful completeness claim.

See [the proposed external-action preregistration](EXTERNAL_ACTION_TEST_PREREG.md). It is a draft protocol, not a completed external evaluation.

## Public-surface reconciliation (open)

- [Kayser Medical](https://www.kayser-medical.com/) labels the chat as a demo and links this validation status; the live chat also displays a research-demo notice.
- [QOTE research app](https://v0-qote-research-app.vercel.app/) remains online with the title “Quantum Oscillator Theory of Everything” and a description asserting a shared topology across several domains. Its Vercel project exposes no linked GitHub source in the deployment metadata available here. **Uncorrected public claim**; the GitHub archive banner does not update this deployment. Treat its old claims as historical hypotheses pending an on-page archive label or retirement.
- The [QOTE repository](https://github.com/michaelkayser1/QOTE-Deploy-Pro.) carries a historical notice, but the original stronger claims remain below it for provenance.
- Substack/X and language in any provisional patent have **not** been exhaustively audited. The Substack feed was unavailable during this review; no patent text or filing identifier was supplied. No claim of cross-platform consistency is made. A dated claim inventory with URLs and exact passages is needed before asserting reconciliation.
