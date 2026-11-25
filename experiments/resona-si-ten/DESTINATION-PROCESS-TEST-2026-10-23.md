# RESONA-SI destination-process test — 2026-10-23

**Status:** DEVELOPER-REPORTED LOCAL ISOLATED PROCESS PASS (16/16); **INDEPENDENT ACCEPTANCE OPEN**; **PRODUCTION AUTHORITY DENIED**.

Separate 127.0.0.1 HTTP process verified Ed25519 grants with a public key; issuer private key stayed in test process. SQLite durable used/revoked-ID ledger, BEGIN IMMEDIATE single-use transactions, synthetic fixture writes only. Tests covered authentic and forged grants, wrong action/audience/payload, not-before and expiry, replay, pre-execution revoked ID, 32 concurrent replays (1 allowed), post-orderly-restart replay denial, missing-token alternate request, overlong TTL, consensus without grant, ledger event inspection.

The reported local enforcement experiment made no live AI provider calls or GitHub/Vercel API mutations and involved no physical actuation or clinical data. Repository-triggered Vercel preview deployments are separate from the experiment. One developer controlled all test components. No independent custody/verifier, crash-during-commit, asynchronous in-flight revocation, database restoration rollback, hardened remote deployment, or arbitrary-route bypass was established. This test must NOT be used as Gate A/B signoff.

The original report states that a source archive and test log were generated in the ChatGPT conversation on this date. They are not included in this PR; their contents and reproducibility have not been independently verified.

## Evidence references — pending
This branch contains a developer-reported summary, not the executable harness or raw log. Archive location, archive SHA-256, tested source revision, execution environment, and raw-log reference are **NOT PROVIDED / PENDING**. Do not infer that the documentation commit identifies the executed source. Before independent reproduction, preserve and hash the source archive, record the exact command and environment, and attach the raw log. No new execution or acceptance claim is introduced by this clarification.
