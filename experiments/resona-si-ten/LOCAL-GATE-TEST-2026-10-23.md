# RESONA-SI isolated Gate experiment — 2026-10-23

Status: **DEVELOPER-REPORTED LOCAL SIMULATOR PASS (12/12)**; **INDEPENDENT ACCEPTANCE OPEN**; **PRODUCTION AUTHORITY DENIED**.

Tests: authorized single-use fixture write; unknown grant; revoked grant; replay; exact expiry; post-expiry; wrong subject; wrong action; alternate destination; fabricated ten-model consensus; 32 concurrent reuses (one allowed); read-only action cannot write.

Scope: stand-alone Python in-memory destination class with a lock and pre-registered grant records. Synthetic time and payload. No live providers, GitHub/Vercel mutations, external service, cryptographic grant verification, cross-process persistence, crash/restart, backing database, compromised client, or independent evaluator. Model consensus does not authorize action by itself. Tests cannot establish real-world bypass resistance.

The original report references a companion archive generated in the ChatGPT conversation and gives the command `python -m unittest -v`. The archive and raw log are not included in this PR; reproducibility has not been independently verified.

Subsequent report: `DESTINATION-PROCESS-TEST-2026-10-23.md` records a developer-reported separate-process experiment. Next smallest evidence step: supply the source archive, hash, environment and raw logs for independent reproduction. Remaining crash/restore, revocation and bypass gaps remain open; neither report establishes Gate A/B sign-off.

## Evidence references — pending
This branch contains a developer-reported summary, not the executable harness or raw log. Archive location, archive SHA-256, tested source revision, execution environment, and raw-log reference are **NOT PROVIDED / PENDING**. Do not infer that the documentation commit identifies the executed source. Before independent reproduction, preserve and hash the source archive, record the exact command and environment, and attach the raw log. No new execution or acceptance claim is introduced by this clarification.
