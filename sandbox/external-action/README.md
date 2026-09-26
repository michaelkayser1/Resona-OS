# Resona external-action sandbox (engineering target)

This is a test-only implementation of [the v0.1 sandbox interface](../../docs/EXTERNAL_ACTION_SANDBOX_SPEC.md). It is not connected to the Resona chat, an IoT actuator, a production tool, or the frozen P1/N1–N11 test. It has no clinical or production authority.

## Run engineering tests

```bash
cd sandbox/external-action
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
PYTHONPATH=src .venv/bin/python -m unittest discover -s tests -v
```

These engineering tests exercise actor logic and one four-process loopback smoke path on a single host. The process test creates keys and credentials under one test user. It verifies wiring, not separate trust domains. These tests are explicitly **not** the external-action acceptance run.

## Process adapters

`scripts/serve.py` starts one loopback-only process per role:

| Role | Port example | Required environment |
| --- | --- | --- |
| Marker | 8111 | `MARKER_AUTH_TOKEN`, `MARKER_DB`, `MARKER_LOG_DB` |
| Witness | 8112 | `WITNESS_AUTH_TOKEN` (intake), distinct `WITNESS_ATTEST_AUTH_TOKEN` (trusted evaluator), `WITNESS_CONTENT_DB`, `WITNESS_LOG_DB`, `WITNESS_KEY_ID`, `WITNESS_PRIVATE_KEY_FILE`, `WITNESS_ACTIVE_POLICY_SHA256` |
| Executor | 8113 | `EXECUTOR_AUTH_TOKEN`, `EXECUTOR_NONCE_DB`, `EXECUTOR_LOG_DB`, `EXECUTOR_ACTIVE_POLICY_SHA256`, `WITNESS_KEY_ID`, `WITNESS_PUBLIC_KEY_FILE`, `MARKER_URL`, `MARKER_AUTH_TOKEN` |
| Head custodian | 8114 | `CUSTODIAN_AUTH_TOKEN`, `CUSTODIAN_DB`, `CUSTODIAN_KEYS_FILE` |

From separate shells, with distinct credentials and file permissions:

```bash
export RESONA_SANDBOX_MODE=local_test  # set separately in each shell
PYTHONPATH=src python3 scripts/serve.py marker --port 8111
PYTHONPATH=src python3 scripts/serve.py witness --port 8112
PYTHONPATH=src python3 scripts/serve.py executor --port 8113
PYTHONPATH=src python3 scripts/serve.py custodian --port 8114
```

Each process requires `RESONA_SANDBOX_MODE=local_test` in its environment and refuses to start otherwise. The sandbox directory is not imported by the Next.js application. This guard prevents accidental startup through the documented adapter; it is not a security boundary against someone who can run arbitrary code or set environment variables.

Only `127.0.0.1` is bound. The marker endpoint accepts a bearer credential held by the executor; it enforces request-ID uniqueness in SQLite. The witness content store is opened read-only in the witness process and must be populated and protected by a different policy owner before testing. The witness cannot write marker records, and the marker cannot read policy or signing keys. Keep each database, key, and bearer credential in actor-specific operating-system custody.

The policy owner must supply the current 64-character lowercase SHA-256 digest as `WITNESS_ACTIVE_POLICY_SHA256` outside the proposal. The executor separately requires `EXECUTOR_ACTIVE_POLICY_SHA256` and rejects even a correctly signed, unexpired token whose policy digest differs. The witness rejects any other policy hash, even if the old policy and its signing keys remain in the content store. Changing either pin requires a controlled restart. Configuration custody and synchronized rollout are external responsibilities: old executor processes that have not restarted can still redeem old tokens; a witness and executor on different pins fail closed for new tokens. The two variables in this single-host smoke test do not establish independently held authority or an atomic rotation instant.

Generate **separate** test-only Ed25519 keys with `scripts/gen_key.py`. The witness token key, three approver keys, and each actor's log-head key must differ. `CUSTODIAN_KEYS_FILE` is JSON mapping actor names to their raw public key hex strings. The custodian accepts signed heads through `POST /heads`; `scripts/publish_head.py` publishes a head from an actor's own log. Publishing is explicit, not automatic: **a missing or stale externally held head means no completeness claim**.

The process API is `POST /proposals` on witness for an intake acknowledgement (`HOLD`, no token), then `POST /attest` under a **different** credential available only to the trusted test controller. The latter independently checks policy and evidence and returns a signed token. `POST /execute` on executor takes `{"proposal": ..., "token": ...}`; `POST /marker` on marker requires the executor credential. `GET /markers` supports independent staging reconciliation. The trusted controller must keep the attestation credential out of the proposer. Do not use real personal data. Bearer HTTP on loopback is for local research only; it is not a production authentication design.

## Scope and known limits

- SQLite provides durable uniqueness, but an operator with database access can alter or delete it. Signed heads help detect changes **only when a separate custodian already holds a later head**; they do not prove every event was logged. The actor's own process cannot certify its independence.
- The custodian currently checks signatures and a monotonic count, but **does not verify an append-only consistency proof between two heads**. A signer can equivocate with a later fabricated head. Head publication is manual; neither non-equivocation nor independent custody has been demonstrated.
- A backup restore of the marker and nonce stores can reopen uniqueness and replay windows. An external marker record and held head are needed to detect and reconcile rollback; this code does not automatically repair it.
- Local wall clocks can be skewed. The executor enforces the exact token expiry boundary against its UTC clock, but the test does not establish a trusted shared clock.
- The executor consumes its nonce before dispatch. On an uncertain marker-service result it holds for reconciliation; it does not silently retry under a new token. The marker service's request-ID uniqueness prevents a duplicate on a controlled retry.
- Nonce uniqueness applies only among executors sharing one durable nonce database. Two executors with independent nonce stores can both report `DISPATCHED` for the same token; the marker store writes one row because it enforces request-ID idempotence. There is no general exactly-once guarantee for a different external destination. A registered run must fix executor topology and use destination-side transactional idempotence or a shared redemption authority.
- The content store is populated by the test setup. Freeze policy bytes, evidence, signer registry, filesystem permissions, clocks, code hashes, and evaluator identity before any registered run.
- PLV, CUST, and coherence slope are absent from witness and executor decision code. There is no validated threshold.
- The [preregistration draft](../../docs/EXTERNAL_ACTION_TEST_PREREG.md) remains OPEN. Engineering tests and any local smoke check cannot be labeled P1 or N1–N11.
