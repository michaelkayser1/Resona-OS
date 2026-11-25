# Resona external-action sandbox (engineering target)

This is a test-only implementation of [the v0.1 sandbox interface](../../docs/EXTERNAL_ACTION_SANDBOX_SPEC.md). It is not connected to the Resona chat, an IoT actuator, a production tool, or the frozen P1/N1–N11 test. It has no clinical or production authority.

## Run engineering tests

For a concrete runnable attack target, start with the [Resona Security Challenge](SECURITY_CHALLENGE.md): authorized write, rejected mutations and replay, destination reconciliation, and a live client fixture. It is a local engineering baseline, not independent acceptance evidence.

```bash
cd sandbox/external-action
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
PYTHONPATH=src .venv/bin/python -m unittest discover -s tests -v
```

These engineering tests exercise actor logic and one five-process loopback smoke path on a single host. The process test creates keys and credentials under one test user. It verifies wiring, not separate trust domains. These tests are explicitly **not** the external-action acceptance run.

## Process adapters and destination initialization

`scripts/serve.py` starts one loopback-only process per role. Only the marker/destination owner opens `DESTINATION_DB`. The verifier forwards both effects and revocations to the same `MARKER_URL`; it refuses startup if `DESTINATION_DB`, `VERIFIER_REVOCATION_DB`, or `MARKER_DB` is set in its environment.

| Role | Port example | Required environment |
| --- | --- | --- |
| Marker / destination owner | 8111 | `MARKER_AUTH_TOKEN`, distinct `MARKER_REVOKE_AUTH_TOKEN`, `DESTINATION_DB`, `DESTINATION_STORE_ID`, `MARKER_LOG_DB`, `MARKER_ACTIVE_POLICY_SHA256`, `WITNESS_KEY_ID`, `WITNESS_PUBLIC_KEY_FILE` |
| Witness | 8112 | `WITNESS_AUTH_TOKEN`, distinct `WITNESS_ATTEST_AUTH_TOKEN`, `WITNESS_CONTENT_DB`, `WITNESS_LOG_DB`, `WITNESS_KEY_ID`, `WITNESS_PRIVATE_KEY_FILE`, `WITNESS_ACTIVE_POLICY_SHA256` |
| Executor | 8113 | `EXECUTOR_AUTH_TOKEN`, `EXECUTOR_NONCE_DB`, `EXECUTOR_LOG_DB`, `EXECUTOR_ACTIVE_POLICY_SHA256`, `WITNESS_KEY_ID`, `WITNESS_PUBLIC_KEY_FILE`, `VERIFIER_URL`, `VERIFIER_AUTH_TOKEN` |
| Destination verifier | 8115 | `VERIFIER_AUTH_TOKEN`, distinct `VERIFIER_REVOKE_AUTH_TOKEN`, `DESTINATION_STORE_ID`, `VERIFIER_LOG_DB`, `VERIFIER_ACTIVE_POLICY_SHA256`, `WITNESS_KEY_ID`, `WITNESS_PUBLIC_KEY_FILE`, `MARKER_URL`, `MARKER_AUTH_TOKEN`, `MARKER_REVOKE_AUTH_TOKEN` |
| Head custodian | 8114 | `CUSTODIAN_AUTH_TOKEN`, `CUSTODIAN_DB`, `CUSTODIAN_KEYS_FILE` |

Initialize a **new** local destination database deliberately:

```bash
PYTHONPATH=src python scripts/init_destination.py /absolute/local/path/destination.sqlite
```

The command prints a UUID stored in a single-row metadata table. Pin that value as `DESTINATION_STORE_ID` in the marker and verifier environments. Marker startup reads the database identity; verifier startup reads the owner's authenticated `/identity` response and compares it with its pin. An existing file is never automatically initialized, migrated, or assigned new metadata. Old split stores and stores without metadata require a separately reviewed migration; no migration procedure or successful migration evidence is supplied here.

From separate shells with the listed settings and actor-specific credentials:

```bash
export RESONA_SANDBOX_MODE=local_test
PYTHONPATH=src python scripts/serve.py marker --port 8111
PYTHONPATH=src python scripts/serve.py witness --port 8112
PYTHONPATH=src python scripts/serve.py executor --port 8113
PYTHONPATH=src python scripts/serve.py verifier --port 8115
PYTHONPATH=src python scripts/serve.py custodian --port 8114
```

Set `RESONA_SANDBOX_MODE=local_test` separately in each shell. Only `127.0.0.1` is bound. This startup guard is not a security boundary against an operator who can run arbitrary code or alter configuration. Do not inherit the marker's database-path environment into the verifier. The Next.js application does not import this sandbox.

Generate separate test-only Ed25519 keys with `scripts/gen_key.py`. The witness token key, three approval keys, and log-head keys must differ. The witness fixture content store is read-only in the witness process; populate policy/evidence and pin active policy digests before starting actors. Marker, verifier, executor, and witness policy pins require controlled configuration/restart; no live policy-rotation transaction is implemented.

The process API is witness `POST /proposals` (intake `HOLD`, no token), then `POST /attest` with the distinct trusted-controller credential. Executor `POST /execute` accepts `{proposal, token}` and forwards to verifier `POST /effect` with `{action, token}`. The verifier forwards the original signed token and its pinned store ID to destination-owner `POST /marker` as `{action, token, store_id}`. The marker credential alone cannot authorize a bare action. The owner verifies signed authority, action scope, static active policy pin, and lease inside the final marker transaction.

Verifier `POST /revoke` accepts `{request_id}` under its separate revocation credential, then forwards to the **same destination URL** at `POST /revoke` with `{request_id, store_id}` under the owner's distinct revocation credential. The owner commits the receipt before acknowledgment. The verifier holds no local revocation database. `GET /markers` supports ledger reconciliation; `GET /identity` reports the currently checked store ID and a best-effort filesystem-check result. All HTTP credentials are local research credentials, not a production authentication design.

### Identity and revocation boundary

Marker insertion and revocation commitment use the same destination database connection factory and `BEGIN IMMEDIATE` transactions. The destination rechecks metadata inside each write transaction against its startup pin; effect messages must also supply the matching verifier pin. Missing, invalid, or mismatched metadata refuses effects. Replacing metadata with a different ID after startup is tested and rejected.

If revocation commits and acknowledges first, later marker insertion is rejected with reason `REVOKED`. If a marker transaction acquired the writer lock first, revocation waits before committing and acknowledging. A delayed response for an earlier accepted effect is not a post-revocation effect. Reason codes do not add execution states.

A UUID is binding metadata, **not proof of physical database identity or independent custody**. Byte-for-byte copying also copies the UUID; this mechanism does not detect a same-ID clone, rollback, malicious operator replacement, or a second owner intentionally configured over a cloned database. The supported adapter removes split authority/effect databases within one configured owner service; single-owner deployment remains a precondition. No cross-host/failover or complete destination-enumeration claim is established.

### Lease boundary and clock

Verifier and marker use the same `utc_now` clock implementation, injectable in actor tests. The marker samples its clock **after** `BEGIN IMMEDIATE` acquires the writer lock, rechecks signed scope and the lease, and then inserts. The lease is `[not_before, expires_at)`: equality with `not_before` is allowed; equality with `expires_at` is rejected as `EXPIRED_OR_EARLY`. Caller timestamps are not used for final authorization. In separate processes these are local system-clock readings, not a trusted synchronized clock service.

Tests pause a valid request across expiry and across a synthetic clock rollback below not-before; both leave zero markers. Another test expires authority while the final transaction waits for the writer lock. Ordinary early presentation is rejected at the verifier without dispatch. There is no mutable lease-renewal API: the witness issues immutable signed tokens; destination revocation is by request ID and blocks later tokens for that ID. Any future renewal/unrevocation mechanism needs the same destination transaction domain and separate verification.

Lease validity is checked at the sampled authorization point inside the transaction. This is not a hard real-time guarantee that wall-clock expiry cannot occur between sampling and SQLite commit or response delivery. Verifier response timestamps describe its early check; the marker log records the later in-transaction sample, not an independently witnessed commit timestamp.

### Filesystem precondition (best-effort check)

The destination store must be on a **single-host, local filesystem with reliable SQLite locking**. Linux startup checks `/proc/self/mountinfo` and rejects recognized network filesystem types; unavailable inspection, unrecognized mounts, container backing storage, and later mount changes are not certified safe. This is a best-effort rejection check, not verification of the deployment precondition. Do not use network filesystems, cross-host access, or multiple independently copied owner stores under this evidence claim.

### Engineering regressions and evidence

At `f0bfc27be631d44dfd51e7591b2a851f79baddbb`, the initial forms of three boundary probes failed: mismatched stores, a request paused across expiry, and a request paused across clock rollback below not-before all returned `EFFECT_ALLOWED`. The fixtures were adapted to the revised signed destination protocol; see `tests/test_destination_boundaries.py`. The existing 100-paused-request revocation regression remains, as do process wiring and challenge checks. Test definitions alone are not execution evidence; PR #26 records the exact tested revision, commands, environment, local results, and any separately inspected CI test-merge result.

The custodian accepts signed heads via `POST /heads`; `scripts/publish_head.py` publishes them explicitly. A missing or stale externally held head prevents a completeness claim. These are local engineering components, without independent acceptance or production authority.

## Scope and known limits

- SQLite provides durable uniqueness, but an operator with database access can alter or delete it. Signed heads help detect changes **only when a separate custodian already holds a later head**; they do not prove every event was logged. The actor's own process cannot certify its independence.
- The custodian currently checks signatures and a monotonic count, but **does not verify an append-only consistency proof between two heads**. A signer can equivocate with a later fabricated head. Head publication is manual; neither non-equivocation nor independent custody has been demonstrated.
- A backup restore of the marker, nonce, or revocation stores can reopen uniqueness, replay, or stale-authority windows. External records and held heads are needed to detect and reconcile rollback; this code does not automatically repair it.
- Local wall clocks can be skewed. The executor and destination verifier enforce token time boundaries against their local UTC clocks, but the test does not establish a trusted shared clock or a bounded propagation delay.
- The executor consumes its nonce before dispatch. On an uncertain marker-service result it holds for reconciliation; it does not silently retry under a new token. The marker service's request-ID uniqueness prevents a duplicate on a controlled retry.
- Nonce uniqueness applies only among executors sharing one durable nonce database. Two executors with independent nonce stores can both report `DISPATCHED` for the same token; the marker store writes one row because it enforces request-ID idempotence. There is no general exactly-once guarantee for a different external destination. A registered run must fix executor topology and use destination-side transactional idempotence or a shared redemption authority.
- The content store is populated by the test setup. Freeze policy bytes, evidence, signer registry, filesystem permissions, clocks, code hashes, and evaluator identity before any registered run.
- PLV, CUST, and coherence slope are absent from witness and executor decision code. There is no validated threshold.
- The [preregistration draft](../../docs/EXTERNAL_ACTION_TEST_PREREG.md) remains OPEN. Engineering tests and any local smoke check cannot be labeled P1 or N1–N11.
