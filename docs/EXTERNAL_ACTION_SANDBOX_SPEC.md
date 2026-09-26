# External-action sandbox: executable interface specification

**Draft v0.1 · 2026-09-26 UTC · no external-action authority**

This specifies the *actuation sandbox* to implement before the proposed [external-action test](EXTERNAL_ACTION_TEST_PREREG.md). It does not register that test, approve an executor, or establish that the present chat, Resona prototype, or QRCOS deployment implements this interface. The preregistration's P1 and N1–N11 cases and pass/fail criteria control the eventual evaluation; this document supplies an implementation target without changing those outcomes.

## Fixed boundary and actors

| Process | Owns | Must not own |
| --- | --- | --- |
| Proposer (chat or fixture generator) | Proposal bytes | Signing keys, policy changes, actuator credentials |
| Policy owner | Versioned policy, evidence schema, signer registry | Proposal or witness decision for its own change |
| Independent witness | Evidence retrieval, policy resolution, signature checks, attestation key | Marker-ledger write credential, model prompt, policy authoring |
| Executor | Single-use token verification and staging dispatch | Witness key, evidence interpretation |
| Marker service | Test-only append of a unique marker | Gate policy or witness key |
| Evaluator | Frozen fixtures, raw independent logs, reconciliation | Changes to frozen criteria after results are seen |

Run these as separate processes and credentials. A class, dashboard tab, or agent persona in the same process is not role separation. A QRCOS-labeled interface is not automatically an independent witness; it must implement and pass this boundary under separate custody. The only permitted external effect is `WRITE_MARKER_V1` to a test-only marker service. No patient information, messages, physical hardware, payments, or production endpoints.

## Wire contract

The [JSON Schema](../schemas/external-action-v0.1.schema.json) defines `Proposal`, `Approval`, `WitnessToken`, and `ExecutionResult`. POST `/proposals` accepts a Proposal; the proposer receives an ID and a hold status, never an actuator credential. The witness independently fetches the exact policy and evidence snapshot from its trusted store. It recomputes the action fingerprint and verifies all required, distinct role signatures against a pinned registry. A missing, ambiguous, contradictory, unavailable, or changed policy returns HOLD with a reason code. No score can turn HOLD into approval.

For v0.1, serialize the *fingerprinted action object only* as UTF-8 JSON with lexicographically sorted ASCII keys, no insignificant whitespace, no numbers, and no unknown keys; hash `SHA-256("RESONA-ACTION-v0.1\n" || bytes)`. The action object is exactly `{action_class,destination,evidence_sha256,marker,max_scope,policy_sha256,request_id,target}`. All fields are strings and `max_scope` must equal `one_marker`. Every required approval must bind this exact fingerprint; the witness must compare the submitted fingerprint with its own recomputation. A future canonicalization change needs a new schema version.

Each role approval is Ed25519 over `"RESONA-APPROVAL-v0.1\n" || sorted-JSON({role,actor_id,key_id,action_fingerprint})`. Encode signatures as unpadded base64url (86 characters for 64 bytes). Sort approvals by `role`, then `actor_id`, then `key_id`; hash the sorted-JSON array including signatures as `approvals_sha256`. A role's key ID must resolve to a pinned public key and role in the witness's independently supplied registry; matching strings alone are insufficient.

The witness signs a `WitnessToken` with Ed25519 over the same unambiguous sorted-JSON byte convention and a distinct domain prefix `RESONA-WITNESS-v0.1\n`, excluding only the token's `signature` field. The token binds `request_id`, fingerprint, policy/evidence hashes, witness key ID, unique nonce, `not_before_utc`, `expires_at_utc`, and the digest of verified role approvals. The executor accepts only a pinned witness public key and exact `WRITE_MARKER_V1` payload; it checks UTC bounds, token signature, fingerprint, destination, and nonce before dispatch. No model-generated text can create or edit a token.

The executor uses the request ID as the marker service's idempotency key. The marker service enforces a unique request ID transactionally and returns the same marker record for a retry. The executor's consumed-nonce store also uses a unique constraint and survives restart. Concurrency, crashes, and retries must never create a second marker. The external marker record, not the executor response, is the outcome source of truth.

Implementation clarification (v0.1): the witness must compare the proposed `policy_sha256` with an active policy hash supplied by the policy owner outside the proposal; mere presence of a historical policy blob is insufficient authorization. The current sandbox pins one hash at witness startup. Rotation of that pin and previously issued tokens requires a separate controlled procedure. Executor nonce uniqueness is scoped to a shared durable store: independent executor stores can each redeem one token. This test-only marker remains single-row because its destination enforces request-ID idempotence; another destination must supply its own transactional idempotence or shared redemption authority before any exactly-once claim.

## Witness decision algorithm

1. Reject invalid schema or duplicate keys; parse UTC timestamps strictly, with no local-time fallback.
2. Fetch the policy version and evidence bytes by pinned hashes from independently controlled stores. Fail closed if unavailable.
3. Verify required roles, actor IDs, distinct keys, Ed25519 signatures, and exact action fingerprint. Fail closed on unknown action class, missing evidence, policy conflict, or novel uncovered action.
4. Issue one short-lived witness token only for the exact approved action. Log every decision with request ID, reason, input hashes, policy version, and UTC time.
5. Never use the current in-memory Resona audit chain as the witness's sole evidence or completeness proof. Persist records and publish signed head hash and count to a separate custodian. SQLite is a durability tool, not an immutable ledger or independent attestation by itself.

The executor separately verifies the token and records its own decision. The evaluator reconciles *all proposals* to witness, executor, and marker-service records. A missing record is a test failure.

## Coherence research channel (observation only)

Kuramoto coupling, phase-locking value (PLV), CUST, and `dC/dt` are uncalibrated research hypotheses in this setting. No `θ_critical` has been defined or validated for authorization. If collected, their raw inputs, estimator, window, missingness, and version must be frozen and logged **without influencing witness or executor decisions** in this milestone. Exploratory correlations are reported separately. A future threshold needs an independently defined construct, negative controls, calibration data, locked cutoff, held-out test set, and a new preregistration before it can be a safety rule.

## Implementation and acceptance order

1. Implement the schema and deterministic fingerprint/signature vectors; reject unknown fields and duplicate JSON keys.
2. Implement the marker service and durable request-ID uniqueness, then executor nonce persistence and retry behavior.
3. Implement independent policy/evidence retrieval and witness signing with keys held outside the proposer and executor.
4. Produce separate append-only *operational* records and externally held signed heads; document restart recovery and tamper limits.
5. Only after an independent evaluator signs the frozen preregistration and manifest, run P1 and N1–N11 unchanged. Publish all outputs, including failures. Prometheus/Grafana can observe latency and optional coherence estimates later; a dashboard is not acceptance evidence.

Passing these checks would support only the frozen staging implementation. It would not establish clinical performance, production safety, or a general coherence law.
