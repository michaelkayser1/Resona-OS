# RESONA OSAA experimental extension — 2026-11-07

**Classification:** proposed experimental implementation profile, not production enforcement.  
**Reference:** System Implementation Note 2026.11.07-r1 and subsequent r2 local mock discussion.  
**Baseline:** RS-001 v1.2 frozen; this note does not amend it.  
**Disposition:** HOLD for production release; independent validation pending.

## Core separation

Observe → Speak → Adjudicate → Actuate. Capability is not authority: compute, model confidence, expertise, success, and agent consensus do not create execution permission. Approval, policy verification, destination admission, actual effects, and independent outcome evidence are different claims requiring different records.

## Controls specified (not production-validated)

1. Credential persistence: operation approval is not permission to persist secret-bearing arguments. A destination-side secret broker and schema allowlist remain proposed.
2. Exact scoped authorization: bind actor, action, resource, destination, canonical argument digest, policy digest, resource envelope, issuance, expiry, revocation, and replay accounting; require current destination verification.
3. Protected reserve: versioned, measurable operating floors and margins must preserve ability to contain, inspect, recover, and request human review. Values are deployment-specific; no universal floors established.
4. Compute envelope: budget, approved destination, runtime/memory and financial limits, measurement limitations, deadline, recovery/termination behavior, and evidence requirements.
5. Independent evidence: distinguish proposal, deterministic policy check, destination enforcement, and observed outcome. Signatures prove limited integrity/attribution assumptions, not the truth of claimed physical or external effects.
6. State and evidence semantics: HOLD → TEST → SURVIVE → RELEASE are implementation readiness states, not an automatic pipeline. Failed cycles remain preserved as HOLD-with-record. INDETERMINATE prevents promotion; explicit deployment authorization remains necessary.

## Eight specified adversarial cases

| ID | What must be challenged | Current status |
| --- | --- | --- |
| RS-SEC-01 | Secret-bearing approval persistence and broker-mediated resolution | Proposed; not independently completed |
| RS-AUTH-02 | Argument/destination/policy substitution, expiry, replay, concurrency | Selected mock cases only |
| RS-RES-03 | Cumulative reserve exhaustion under concurrency and measurement lag | Selected mock cases only |
| RS-CMP-04 | Model/compute increase without privilege increase | Proposed; not independently completed |
| RS-EVD-05 | False model consensus and shared evidence chains | Not independently executed |
| RS-EXIT-06 | Interrupted authorization, telemetry, execution and out-of-band evidence | Not independently executed |
| RS-RES-07 | Human reviewer flooding and full-depth priority review | Not executed |
| RS-HLD-08 | Failed-trajectory preservation across subsequent adjudication | Not executed |

## Local r2 mock record

On November 7, 2026 a separately constructed local Python/SQLite mock was reported to have **10 passing pytest cases**. The isolated harness demonstrated selected signed admission, single-use replay accounting, atomic resource debit/ledger operations and rollback properties *in that local fixture*. The recorded result does **not** establish the eight governance cases above have all been run. It does not actuate an external destination or independently verify effects. It has not been independently assessed for security.

A prior proof-of-concept had an ordering defect where reserve could be decremented before replay rejection. The r2 mock reports that admission and reserve debit are now in one SQLite transaction, so a rejected duplicate cannot consume reserve in the tested path. Do not generalize this to other destinations, processes or failure modes.

## Open commissioning and assurance questions

- No independently controlled, deployment-specific policy signer, secret broker, or canonical envelope validator has been commissioned.
- No measured reserve floors or reviewer time-capacity policy have been approved for a real environment.
- No independent witness custody/out-of-band evidence path has been commissioned.
- No interrupted external execution, irreversible side-effect, or outcome-unknown reconciliation has been demonstrated.
- No deployment change may treat this document or local mock as a grant of permission.

**Next scope:** isolated reference harness with synthetic secrets, pre-registered fixtures for all eight cases, stable artifact hashes, independent external destination/witness, and separately reviewed evidence. No PHI, live credential, patient operation, or production actuation is within that scope.

**Meaning: Pending. Quiet With Receipts.**
