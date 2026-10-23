# RESONA-SI isolated Gate experiment — 2026-10-23

Status: **LOCAL SIMULATOR PASS (12/12)**; **INDEPENDENT ACCEPTANCE OPEN**; **PRODUCTION AUTHORITY DENIED**.

Tests: authorized single-use fixture write; unknown grant; revoked grant; replay; exact expiry; post-expiry; wrong subject; wrong action; alternate destination; fabricated ten-model consensus; 32 concurrent reuses (one allowed); read-only action cannot write.

Scope: stand-alone Python in-memory destination class with a lock and pre-registered grant records. Synthetic time and payload. No live providers, GitHub/Vercel mutations, external service, cryptographic grant verification, cross-process persistence, crash/restart, backing database, compromised client, or independent evaluator. Model consensus does not authorize action by itself. Tests cannot establish real-world bypass resistance.

Reproduce using the companion archive generated in this conversation: `python -m unittest -v`. Primary test outcome 12/12 at this local implementation; the branch records a status summary, not an independently attested result.

Next smallest advance: isolate a separate destination process, remove all direct client credentials to it, validate externally signed short-lived grants, then verify denied writes, revocation and crash/restart at an exact code revision with an independent observer.
