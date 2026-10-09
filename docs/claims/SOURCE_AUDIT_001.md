# Source Audit 001

**Audit id:** SA-001

**Date:** 2026-10-09

**Scope:** confirm where claim records live, which Git commits serve the two production sites, and which previously recorded findings remain unresolved. This is a source and deployment-metadata audit. It is not an independent scientific review, a penetration test, or a clinical evaluation.

**Registry produced:** [Research Claims Registry v1.0](RESEARCH_CLAIMS_REGISTRY_v1.md)

**Prior inventory used:** [VALIDATION_STATUS.md](../VALIDATION_STATUS.md) at Resona-OS `main` commit `5bb3cc70bca163243f96a137aa03284fc40b6233`.

## Method

1. Listed `docs/` on `michaelkayser1/Resona-OS` `main`.
2. Searched that repository for a claims registry and a source audit. None existed before this branch.
3. Read Vercel production deployments for `kayser-medical-production` and `v0-resona-chat-api`, filtered to target `production` and state `READY`.
4. Carried forward findings already recorded in `VALIDATION_STATUS.md` where this pass did not re-execute the underlying tests.

No production site was edited. No Vercel deployment was created.

## Findings

### F1. Governance and production sources are separate

`Resona-OS` holds validation notes and research docs. The production Git sources reported by Vercel are different repositories:

- Kayser Medical website: `michaelkayser1/kayser-medical-website` at `25a519286291ac2fdc971b1c1935dcf75ffe20dd`
- Resona chat: `michaelkayser1/v0-new-project-RESONA` at `b44037442ed1dcda6f841342505521e1046b93c8`

Putting the registry in `Resona-OS` keeps claim status off the production application commits.

### F2. READY is not validation

Both latest production deployments were `READY` on 2026-10-09.

- `kayser-medical-production`: `dpl_14preMg8Coz1ouSe6yCxSBmVyshh`
- `v0-resona-chat-api`: `dpl_2q7gkL8HKATts3nWbTnXsXvwtMmB`

That confirms the recorded builds completed. It does not confirm every page, API route, clinical behavior, or safety gate.

### F3. No registry existed on main

`docs/` contained `VALIDATION_STATUS.md`, `ADAPTIVE_OSCILLATOR_RESEARCH.md`, `EXTERNAL_ACTION_SANDBOX_SPEC.md`, `EXTERNAL_ACTION_TEST_PREREG.md`, and `TE-01-TOKEN-ECONOMY.md`. Code search for a claims registry or source audit returned no matches. This audit creates the missing inventory; it does not certify the claims in it.

### F4. Withdrawn tamper-detection result still stands

`VALIDATION_STATUS.md` withdraws earlier passes of `verifyChainIntegrity` as evidence of stored-hash or payload tamper detection, before commit `ff9719265319110381cda387aba51f5cfcf3f840`. This audit did not re-run those fixtures. The withdrawal remains in force. See RCR-005.

### F5. Witness Ledger suite remains unverified

The six-fixture Witness Ledger suite named in `VALIDATION_STATUS.md` was still not located. Its outcome stays `unverified`. See RCR-006.

### F6. Public QOTE research app remains an open correction

`VALIDATION_STATUS.md` records https://v0-qote-research-app.vercel.app/ as an uncorrected public claim of shared topology, with no linked GitHub source in the deployment metadata available to that review. This audit did not retire or relabel that deployment. See RCR-008.

### F7. Cross-platform text is not reconciled

Substack, X, and any provisional patent language were not audited in this pass. No patent filing identifier was in the source record. See RCR-012.

## Limits

- Live HTML of kayser-medical.com and chat.kayser-medical.com was not re-scraped for SA-001. Demo labeling is carried from the 2026-09-26 note.
- Application tests were not re-executed.
- Other Vercel projects whose names contain "kayser" exist. They are outside the two-site mapping above and are not certified by this audit.

## Required before a site link

1. Review this audit and the registry on `review/claims-registry-v1`.
2. Merge only if the status vocabulary and withdrawals are acceptable.
3. Then add a link from each production site to the merged registry. Do not paste hypothesis text into marketing pages.
