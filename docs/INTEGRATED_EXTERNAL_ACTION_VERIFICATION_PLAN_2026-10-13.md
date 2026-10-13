# Resona OS — integrated external-action verification plan (draft)

**Prepared:** 2026-10-13  
**Status:** Planning artifact only. No independent evaluation was executed to produce this document.  
**System under test:** External-action witness / executor / marker path and PR #19 attribution-consent guard. The guard remains a draft and is **not** evidenced as integrated with the existing four-process sandbox.

## Evidence baseline

- PR #16 reports 19 local engineering tests, not independent P1/N1–N11 acceptance.
- PR #17 reports nine local security challenges on the one-host sandbox, with remaining custody and downstream-effect gaps.
- PR #19 reports 7/7 committed-code synthetic attribution tests at head `5f1deaa6096fcbbaac5f936ce278ea6cc32a1b39`. These are not integrated acceptance tests.
- The frozen AC-1 through AC-10 and NG-1 through NG-4 criteria are referenced by PR #19 but must be matched to the authoritative frozen specification and exact artifact hash before the integrated run. Do not reconstruct their wording from labels.

## Required preregistration

Before executing: pin full Git commit SHAs for all actors and guard, the version and SHA-256 of the frozen acceptance specification, threat model, policy hash, test fixtures, independent evaluator identity, separately controlled signing keys and evidence-custodian identity, container/OS/runtime/dependency hashes, clock assumptions, and test commands. Record this in a signed or independently archived manifest. No fabricated data or implied independent witnessing.

## Minimal integrated test progression

1. **Wiring inspection:** Trace every publication/write destination and confirm that no alternate path bypasses the guard. If there is bypass, fail the gate before positive tests.
2. **Positive control:** Explicitly scoped valid authorization permits only the exact action fingerprint and target; reconcile witness authorization, executor dispatch, destination outcome, and independent audit event.
3. **Negative controls:** Absent/tampered consent, changed hash, subject, destination, purpose, policy, expired lease, stale/revoked key, and invalid authority must all fail closed without destination change.
4. **Replay and concurrency:** Reuse identical tokens, concurrent duplicate writes (including a preregistered 100-request challenge), and publication/revocation races. Inspect destination ledger, not just HTTP returns.
5. **Failure injection:** Crash between decision/dispatch/audit, process restart, backup restoration, database rollback, missing audit writer, and unavailable policy service. Demonstrate no unauthorized writes and no silently reopened replay window.
6. **Independence:** Validate signer identity, signing-key custody, external durable audit head, evaluator control, and outcome evidence independent of the subject under test.
7. **Frozen acceptance mapping:** Execute and record each exact AC-1–AC-10 and NG-1–NG-4 requirement in the canonical spec; no aggregate pass unless each required criterion is individually satisfied and the evidence is archived.

## Receipt for each test

Record: test ID; source commit(s); frozen criterion; environment/dependency manifest; exact command and fixture hash; actor identities; start/end UTC time; expected versus observed outputs; external before/after state; signatures and independent audit-head references; result PASS/FAIL/BLOCKED/NOT RUN; deviations; evaluator sign-off.

## Stop / promotion gate

Any alternate write path, missing custody evidence, unverified rollback/replay behavior, or incomplete frozen-criterion mapping retains **DRAFT / NO PRODUCTION AUTHORITY**. Local seven-test success cannot substitute for independent integrated evaluation. Publish failures alongside successes. Require a separately authorized security review and scoped deployment decision after tests pass.

## No execution claim

This document is a checklist and test protocol proposal. It does not assert that acceptance was run, that a production gate exists, that consent covers all sources, or that any independent certification has been achieved.
