# Acceptance evidence index — 2026-11-09 (proposed, non-normative)
**Mode:** evidence indexing only. **Production authorization:** HOLD. **Independent acceptance:** NOT ESTABLISHED.
**Frozen baselines:** RS-001 v1.2 and the separate [RESONA-SI governance contract](https://github.com/michaelkayser1/RESONA-SI) remain unchanged. Do not treat this document as amending either baseline, preregistering tests, or promoting any gate.

## Evidence precedence and identity
For each claim record **source repository, complete commit SHA, file/blob hash, exact command, environment/dependency versions, raw output hash, timestamp, test executor, evaluator, custody, expected results, observed results, disposition and limits**. Merely saying “tests passed,” publishing a demo, or providing a signed self-report is not independent destination evidence.

Disposition vocabulary: `proposed`, `locally_reproduced`, `independently_verified`, `unresolved`, `refuted`. `accepted` is a separate independently authorized adjudication, not a synonym for a passing unit test. Unknown or incomplete evidence must remain `unresolved`.

## Controlling source record
| Source | Pinned reference at indexing | Establishes | Does not establish |
| --- | --- | --- | --- |
| [External-action prereg draft](EXTERNAL_ACTION_TEST_PREREG.md) | Resona-OS main `cc6b7d70a929f22ac8702241c9258e85d1d1d01a` | Proposed frozen-in-document P1/N1–N11 mutations and expected markers | Signed independent preregistration or executed acceptance |
| [Sandbox specification](EXTERNAL_ACTION_SANDBOX_SPEC.md) | Same main commit | Proposed independent actor/process boundaries and wire contract | Production destination or independently controlled policy |
| [Validation status](VALIDATION_STATUS.md) | Same main commit | Current described source-level limitations and historic correction | General safety or accuracy |
| [OSAA experimental note](OSAA_EXPERIMENTAL_2026-11-07.md) | Same main commit | Eight proposed adversarial RS-* cases; reported local r2 mock | Completion of eight independent tests |
| [DRONE-01 observation schema, draft PR #23](https://github.com/michaelkayser1/Resona-OS/pull/23) | Branch-specific source and hashes must be pinned on evaluation | DR-0–DR-6 local fixture mapping and DR-7/DR-8 open scope | Gate A/B approval, actual destination enforcement |
| [Destination verifier PR #26](https://github.com/michaelkayser1/Resona-OS/pull/26) | **PIN EXACT HEAD AT TEST TIME**; reported results may concern earlier revisions | Proposed destination-side revocation and boundary tests | Independent acceptance, deployed control, physical effect cessation |
| [RS-002 proposal PR #30](https://github.com/michaelkayser1/Resona-OS/pull/30) | `da215b028a1377b43481b3772c6dc4cb6fabddbd` in Vercel metadata, not a test attestation | Proposed multi-facility revocation research | RS-001 amendment, passed test, general deployment authority |

## AC/NG unresolved mapping register
**Known aggregate from prior review:** fourteen AC/NG criteria remain **UNMAPPED**. Their exact controlling IDs/wording and immutable baseline file were **not present in the verified source excerpts used here**. Do not invent replacement IDs (`AC-01`, etc.) or silently substitute P1/N1–N11; they are different taxonomies.

| Register | Source identity | Disposition | Concrete next action |
| --- | --- | --- | --- |
| AC/NG unmapped aggregate (14, identities awaiting provenance) | Baseline ID/file/commit: NOT YET RECONCILED | **UNRESOLVED (14)** | Obtain the original frozen AC/NG criterion list with exact IDs, hashes, and expected results; create 14 rows using those **verbatim** IDs, each with evidence-to-criterion mapping and custodian |

Until then **0 of these 14 may be called mapped based on this index**. This is a register of the gap, not fabricated criterion-level accounting.

## Separate test identities — never conflate
### External-action test P1 / N1–N11
| ID | Expected external effect / adjudication | Status in this index |
| --- | --- | --- |
| P1 | exactly 1 marker for a fully valid, independently approved request | proposed; independent result unresolved |
| N1 | missing evidence: 0 markers | proposed; independent result unresolved |
| N2 | changed evidence hash: 0 markers | proposed; independent result unresolved |
| N3 | expired lease or absent clock: 0 markers | proposed; independent result unresolved |
| N4 | changed target, parameter, destination, scope: 0 markers | proposed; independent result unresolved |
| N5 | replay after consumption and restart: 0 **additional** markers | proposed; independent result unresolved |
| N6 | unauthorized, missing or non-independent signers: 0 markers | proposed; independent result unresolved |
| N7 | policy unavailable, unversioned or changed: 0 markers | proposed; independent result unresolved |
| N8 | rule conflict or uncovered action: 0 markers | proposed; independent result unresolved |
| N9 | simultaneous duplicate: at most 1 total marker | proposed; independent result unresolved |
| N10 | executor success without external marker: reconciliation flags mismatch | proposed; independent result unresolved |
| N11 | external marker without intact gate receipt: reconciliation flags failure | proposed; independent result unresolved |

All twelve are sourced from [the preregistration draft](EXTERNAL_ACTION_TEST_PREREG.md). They do **not** identify or resolve the fourteen unmapped AC/NG criteria.

### Gate A — local reproducibility, not independent acceptance
- Pin the test branch and its full commit/worktree SHA; verify blob identity of fixtures, test scripts, schema, and expected outputs.
- Report exact commands, exit status, dependencies, raw stdout/stderr, hash manifests, reproducibility exclusions and deviations.
- PR #23 reports eight local fixture tests in its dated record and discloses isolated two-file snapshots and separate commit identities. **Do not transfer those passes to the current head.**
- Gate A remains **HOLD / UNRECONCILED** until a named responsible reviewer checks each criterion against exact evidence; success must be scoped to the version actually tested.

### Gate B — independent evidence
- Independently controlled evaluator, policy owner, witness identity, credential and key custody, independent external effect ledger, and conflict-of-interest checks.
- Independent reconstruction of actions and negative-space records (missing receipts, unobserved effects, divergent claims).
- No destination self-report or process-local hash chain alone establishes outcomes, immutability, or independent acceptance.
- Gate B remains **HOLD**. No provider, UI, project name or model output can move it.

### DR-7 and DR-8 integrated tests (PR #23 scope)
| Case | Required challenge | Independent evidence still needed |
| --- | --- | --- |
| DR-7 | Concurrent requests, crash/restart, idempotence, committed versus reported outcomes | Destination-ledger count, process/clock identities, crash timing, raw independent event order and reconciliation |
| DR-8 | Alternate-write route / bypass attempt against gate | Enumerated routes and permissions, disabled or denied alternate writes, independently observed rejected attempts and effect ledger |

Run only with harmless isolated marker destinations and separately authorized evaluator. The observation fixture DR-0–DR-6 does **not** meet these tests.

## Immediate one-action queue
1. **AC/NG:** locate frozen 14-row source list; preserve exact identifiers and expected results; no remapping by analogy.
2. **Gate A:** one pinned-head, independently reproduced local run with raw stdout/stderr, dependency lock, commands, SHA-256 manifest and dated reviewer disposition.
3. **Gate B:** commission independent source, policy, destination and witness custody before any full-suite acceptance claim.
4. **DR-7:** preregister deterministic schedules including duplicate and crash windows, run in isolated test destination, reconcile independently.
5. **DR-8:** enumerate and deny alternate-write paths, demonstrate one bypass negative test under independent destination observation.

**Release status: HOLD.** No tests executed or gates moved by this evidence-index document.
