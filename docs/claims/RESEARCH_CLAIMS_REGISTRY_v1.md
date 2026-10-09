# Research Claims Registry v1.0

**Status:** review draft. Not merged to `main`. Not linked from production sites.

**Registry date:** 2026-10-09 (America/Chicago).

**Authority:** this file, once reviewed, is the claim inventory for public Kayser Medical and Resona surfaces. A Vercel deployment with state `READY` records a successful build only. It does not validate a scientific, clinical, or safety claim.

**Source audit:** [Source Audit 001](SOURCE_AUDIT_001.md).

**Existing inventory this registry does not replace:** [VALIDATION_STATUS.md](../VALIDATION_STATUS.md), dated 2026-09-26.

## Status vocabulary

| Status | Meaning |
| --- | --- |
| `deployment-verified` | Production deployment is `READY` and the Git commit mapping was read from Vercel metadata. Not a scientific result. |
| `source-present` | The cited repository contains the described code or document. Behavior beyond that text is not claimed. |
| `withdrawn` | An earlier result must not be cited for the stated purpose. |
| `unverified` | The claimed suite, passage, or outcome was not located in accessible sources. |
| `uncorrected-public` | A live page still states a stronger claim than the current source record supports. |
| `hypothesis` | A research statement without external validation. |
| `open` | Named surfaces were not exhaustively audited. |

## Verified deployment mappings

Checked 2026-10-09 against the authenticated Vercel team `qote` (`team_v2MVooNZNUf16byPrmJNsMZC`).

| Surface | Vercel project | Project id | Latest production deployment | State | Git source | Commit |
| --- | --- | --- | --- | --- | --- | --- |
| kayser-medical.com | `kayser-medical-production` | `prj_NnJFuM0VgNENKgqXJngyhnUhY9vA` | `dpl_14preMg8Coz1ouSe6yCxSBmVyshh` | `READY` | `michaelkayser1/kayser-medical-website` | `25a519286291ac2fdc971b1c1935dcf75ffe20dd` |
| chat.kayser-medical.com | `v0-resona-chat-api` | `prj_GKUJqQDiXQUM23wBjG658NmjTzmY` | `dpl_2q7gkL8HKATts3nWbTnXsXvwtMmB` | `READY` | `michaelkayser1/v0-new-project-RESONA` | `b44037442ed1dcda6f841342505521e1046b93c8` |

`michaelkayser1/Resona-OS` is the governance repository. It is not the verified production source of either site. Registry files live here so claim status can change without a production deploy.

## Claims

| ID | Claim | Surface | Status | Evidence | Correction |
| --- | --- | --- | --- | --- | --- |
| RCR-001 | Kayser Medical production build succeeded from commit `25a5192`. | kayser-medical.com | `deployment-verified` | Vercel deployment `dpl_14preMg8Coz1ouSe6yCxSBmVyshh`, state `READY`, meta `githubCommitSha` `25a519286291ac2fdc971b1c1935dcf75ffe20dd`. | Do not read this as feature, API, or clinical validation. |
| RCR-002 | Resona chat production build succeeded from commit `b440374`. | chat.kayser-medical.com | `deployment-verified` | Vercel deployment `dpl_2q7gkL8HKATts3nWbTnXsXvwtMmB`, state `READY`, meta `githubCommitSha` `b44037442ed1dcda6f841342505521e1046b93c8`, message "Preserve Suno music versions with source provenance". | Do not read this as clinical accuracy, authorization, or end-to-end safety. |
| RCR-003 | The chat is a research demo, not a clinical system. | Kayser Medical site and live chat, as recorded in `VALIDATION_STATUS.md` | `source-present` | [VALIDATION_STATUS.md](../VALIDATION_STATUS.md) public-surface note, 2026-09-26. Live page text was not re-scraped for this registry version. | Re-check the live DOM before treating the label as current. |
| RCR-004 | Resona OS contains agent, scoring, redaction, and audit modules. | `Resona-OS` `lib/` | `source-present` | [VALIDATION_STATUS.md](../VALIDATION_STATUS.md). | External policy authority, isolation, durable audit custody, HIPAA compliance, and clinical validation remain unproven. |
| RCR-005 | Earlier audit-verifier passes establish stored-hash or payload tamper detection. | `lib/audit/audit-logger.ts` before `ff971926` | `withdrawn` | Historical correction in [VALIDATION_STATUS.md](../VALIDATION_STATUS.md). Pre-fix `verifyChainIntegrity` advanced a local digest without comparing stored `event.hash`. | Do not cite pre-`ff971926` passes as tamper detection. A mismatched `prevHash` check is a narrower claim and is not withdrawn. |
| RCR-006 | A six-fixture Witness Ledger suite demonstrated tamper detection. | Not located in accessible repositories | `unverified` | [VALIDATION_STATUS.md](../VALIDATION_STATUS.md), 2026-09-26. Still not located during this registry pass. | Do not cite. Retrieve code, fixtures, assertions, version, and execution record before any attribution. |
| RCR-007 | In-process audit chain proves durable, complete custody. | `lib/audit/audit-logger.ts` | `withdrawn` as a custody claim; `source-present` as an in-memory chain | Repaired verifier compares stored and recomputed hashes and previous-hash links. Chain remains process-local. | An unanchored prefix cannot reveal tail deletion. Completeness requires a persisted head under separate custody. |
| RCR-008 | QOTE research app asserts a shared topology across domains as a current result. | https://v0-qote-research-app.vercel.app/ | `uncorrected-public` | [VALIDATION_STATUS.md](../VALIDATION_STATUS.md). Deployment metadata available there did not link a GitHub source. | Treat as a historical hypothesis until the page carries an archive label or is retired. GitHub archive banner does not update this deployment. |
| RCR-009 | QOTE archive validates pi/2pi safety bands or biological/AI equivalence. | `michaelkayser1/QOTE-Deploy-Pro.` | `hypothesis` | Historical notice on the repository; stronger claims retained below it for provenance. | Do not cite the retained text as a current result. |
| RCR-010 | Adaptive-oscillator notes establish coherence-setpoint control, safety invariance, task progress, novelty, or clinical meaning. | `docs/ADAPTIVE_OSCILLATOR_RESEARCH.md`, added 2026-10-04 UTC | `hypothesis` | Offline unthrottled model and research tests are source-present. | Those tests do not authorize control, safety, or clinical interpretation. |
| RCR-011 | External-action preregistration is a completed evaluation. | `docs/EXTERNAL_ACTION_TEST_PREREG.md` | `source-present` as a draft protocol | Document itself. | Not a completed external evaluation. |
| RCR-012 | Substack, X, and any provisional patent match this registry. | Named public surfaces | `open` | No exhaustive audit. No patent identifier was supplied for this pass. | Do not claim cross-platform consistency. |

## What production sites may link after review

Until this pull request is merged, sites must not treat these statuses as published. After merge, a site may link:

- the registry URL on `main`
- the status of a specific claim id
- `VALIDATION_STATUS.md` for implementation limits

A site must not copy a `hypothesis`, `withdrawn`, `unverified`, or `uncorrected-public` row into marketing language as a positive finding.

## Change control

1. New claims are added on a review branch, not by editing production copy first.
2. A status change names the evidence commit or deployment id.
3. Withdrawals stay in the table. They are not deleted.
4. Merging this registry does not deploy either Vercel project.
