# RESONA-SI destination-process test — 2026-10-23

**Status:** LOCAL ISOLATED PROCESS PASS (16/16); **INDEPENDENT ACCEPTANCE OPEN**; **PRODUCTION AUTHORITY DENIED**.

Separate 127.0.0.1 HTTP process verified Ed25519 grants with a public key; issuer private key stayed in test process. SQLite durable used/revoked-ID ledger, BEGIN IMMEDIATE single-use transactions, synthetic fixture writes only. Tests covered authentic and forged grants, wrong action/audience/payload, not-before and expiry, replay, pre-execution revoked ID, 32 concurrent replays (1 allowed), post-orderly-restart replay denial, missing-token alternate request, overlong TTL, consensus without grant, ledger event inspection.

No live AI, GitHub, Vercel, physical actuation, or clinical data was involved. One developer controlled all test components. No independent custody/verifier, crash-during-commit, asynchronous in-flight revocation, database restoration rollback, hardened remote deployment, or arbitrary-route bypass was established. This test must NOT be used as Gate A/B signoff.

An exact, reproducible source/archive and test log was generated in the ChatGPT conversation on this date; independent reviewers should request and hash the archive before reproducing.
