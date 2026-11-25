# Attribution consent: isolated destination-side reference guard

**Status: local prototype, not integrated into the four-process sandbox or production.** No claim of independent custody, identity verification, legal sufficiency of consent, or actual publication blocking on a public site.

This module is deliberately not connected to the website, API, or existing marker ledger. It adds a small SQLite destination adapter with Ed25519 signature verification using the existing sandbox `cryptography` dependency.

* The signing authority is an explicit trusted issuer; the model cannot self-issue consent. A signature by itself does **not** establish that the named human actually gave consent. Real deployment would need an authenticated consent-capture and issuer-custody process.
* Authorization binds the exact UTF-8 statement SHA-256, subject identifier, destination identifier, purpose, active policy version, grant ID, and half-open validity interval `issued_at <= now < expires_at`.
* The destination checks revocation and unique `grant_id` and `request_id`, serializes mutations with `BEGIN IMMEDIATE`, and writes publication plus successful audit in one transaction.
* Rejections leave publications unchanged and append a denial audit record. If a mandatory audit write fails, the transaction rolls back; no audit of that failure can be promised from the failed store.
* A supplied `now` is only for local testing; an integrated service must use a trusted destination clock. Operational exceptions are **not** an ALLOW and must fail closed at the caller.

## Local tests

From `sandbox/external-action`:

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
cd attribution
../.venv/bin/python -m unittest -v test_guard
```

Synthetic cases: valid grant, missing grant, tampered signature, changed content/subject/destination/purpose, wrong policy, timing boundaries, revocation, grant replay, reused request ID, concurrent duplicates, and audit failure rollback.

## Not yet established

This is **not** a safety boundary for arbitrary publisher access: a caller with direct database or publication destination access can bypass it. The model must not be given the issuer private key or publisher database credentials. No external policy authority availability or signed revocation-head protocol is modeled. Audit records are ordinary mutable SQLite rows, not independently held immutable evidence. No end-to-end test with the existing four-process witness/executor/marker stack has run.

Next acceptance slice: wire this policy into the existing trusted witness/executor flow, add authenticated consent issuance and issuer-key rotation, destination-enforced revocation with defined outage behavior, independent custody, and an externally inspected final publishing state. Keep all real identities and real publication targets out of synthetic tests.
