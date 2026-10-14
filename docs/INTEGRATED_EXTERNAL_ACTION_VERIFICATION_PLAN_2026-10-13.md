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


## Frozen v1.0 source binding and evidence crosswalk

**Reconciled:** 2026-10-14. This section maps the plan to the sources read; it records no new test execution or independent observation.

Authoritative acceptance artifacts:
- `PR19_Engineering_Acceptance_Specification_v1.0_FROZEN.pdf` — Library identity `libfile_1beeab394a0c81919e70767ddf4ba2c1`, 170698 bytes.
- `PR19_v1.0_Formal_Freeze_Receipt.pdf` — Library identity `libfile_6c254537f8408191ad3f4c0c2450c9a7`, freeze timestamp `2026-10-13T02:58:42Z`.
- `PR19_Destination_Evidence_Ledger_v1.0.csv` — Library identity `libfile_8f10c06251988191b76c7ed70367dd9a`; all 14 rows are NOT RUN / UNTESTED.
- Specification SHA-256: `fe4d46dfdd087f104dfecdfa8acb9af963ba772305819dd3ecfcb7fd405eea5f`.

The receipt binds the **exact finalized PDF bytes**, without text extraction or newline transformation. The PDF also contains canonical-text hashing language; this plan follows the receipt's explicit exact-byte convention. The digest above was read from the receipt and ledger, not independently recomputed during this documentation review. Before an integrated run, provide the evaluator the actual frozen PDF and receipt and verify the PDF bytes against that digest. A text extraction or this crosswalk is not the canonical specification. Any criteria change requires a new version and binding.

Evidence baseline:
- [Completed verification packet report](https://app.notion.com/p/3f1cecf8988d814f9bd5d92a33ce9dd0): `Resona_Verification_Packet_2026-10-13.zip`, Library identity `libfile_1fe59f10680c8191a57b803f221ad783`. Packet assembly is Done; integrated acceptance is not.
- [PR #19](https://github.com/michaelkayser1/Resona-OS/pull/19) implementation reference: `5f1deaa6096fcbbaac5f936ce278ea6cc32a1b39`. Packet run: seven synthetic test methods passed locally in 0.046 seconds. The separately posted receipt reports 0.109 seconds on the same head; its title does not establish evaluator independence.
- [Pinned guard limitations](https://github.com/michaelkayser1/Resona-OS/blob/5f1deaa6096fcbbaac5f936ce278ea6cc32a1b39/sandbox/external-action/attribution/README.md): direct destination/database access can bypass the guard; integration and independent custody are not established.
- [Existing P1/N1–N11 preregistration](https://github.com/michaelkayser1/Resona-OS/blob/5bb3cc70bca163243f96a137aa03284fc40b6233/docs/EXTERNAL_ACTION_TEST_PREREG.md) remains a separate protocol. This crosswalk does not replace or modify its cases, counts or verdict rules. Stripe PAY-1–PAY-4 also remain separate.

The table is a descriptive mapping, not substitute criterion wording. The complete frozen PDF governs. **Every row below has integrated execution status NOT RUN and acceptance verdict UNTESTED.** Exact integrated commands, fixture hashes and destination configuration are OPEN for every row; the proposed injections below are not runnable commands.

For every row, a named evaluator separate from the developer must independently observe destination state and retain raw records with an identified evidence custodian. Pin actor commits, authority/policy/key versions, credentials and custody boundaries, environment, trusted clock semantics, commands and fixture hashes before execution. The shared receipt requirements apply to every row.

| Criterion / frozen requirement summary | Planned stimulus or fault injection | Existing local engineering evidence | Required destination evidence / remaining gap |
| --- | --- | --- | --- |
| AC-1: unauthorized publication denied; publication count unchanged; denial audited | Submit a publication without authorization through the integrated path | Missing grant denied; publications unchanged; denial audit checked | Independent before/after publication count and denial record at the actual destination |
| AC-2: expired authorization denied; no artifact or state change | Submit a validly signed but expired authorization | Injected expiry boundary denied | Trusted destination clock and independently observed unchanged destination |
| AC-3: authorization revoked before publication denied; no mutation | Issue, revoke, then attempt publication | Pre-revoked synthetic grant denied | Integrated revocation authority/version and destination non-mutation |
| AC-4: consumed authorization cannot create a second publication | Accept once, then reuse the authorization | Local grant and request-ID reuse denied | Destination consumption evidence and exactly one committed publication |
| AC-5: authorization for publish:A cannot permit publish:B | Alter target outside authorized scope | Statement, subject, destination and purpose mismatch denied | Actual target enforcement and independently observed unchanged unauthorized resource |
| AC-6: unavailable authorization service fails closed | Make the integrated authorization service unavailable | No service-outage test | Outage record, DENY and unchanged destination with no publication |
| AC-7: audit persistence failure aborts entire transaction | Force mandatory audit persistence failure | Audit trigger error leaves publications empty; audit-table emptiness was not explicitly asserted | Independent absence of both audit and publication for the failed transaction |
| AC-8: publication persistence failure rolls back without partial or orphan records | Force publication persistence failure | No dedicated test | Destination rollback evidence; no partial publication or orphan audit records |
| AC-9: 100 simultaneous attempts using one single-use authorization yield exactly one commit | Preregister and launch 100 simultaneous contenders | Eight contenders: one ALLOW, seven replay denials, one publication, eight audit rows | Recorded concurrency setup, all 100 outcomes and independent destination count of exactly one |
| AC-10: overlapping publish/revoke outcomes match destination-recorded serial order | Overlap publication and revocation and capture every pair's linearization points | No overlapping revocation test | Destination commit LSNs, serializable-log transaction IDs or equivalent ordering evidence; revocation-first publication must not commit |
| NG-1: alternate routes enforce the same authorization or reject writes | Inventory and attempt direct DB, internal service, secondary API and batch routes | README explicitly acknowledges a direct-access bypass risk | Route/credential inventory tied to commits and configuration; destination evidence for each attempt. An unprotected route fails the wiring prerequisite |
| NG-2: destination consistency survives termination at specified boundaries | Kill during validation, validation-to-write and write-to-response; restart and inspect | No kill/restart test | Independently observed post-termination destination state for each frozen boundary |
| NG-3: consumed authorizations cannot become reusable after restore, subject to both external-authority conditions | Consume, restore destination and replay state, attempt reuse through the mandatory recovery procedure | External recovery authority is not implemented; present implementation does not support this guarantee | External durability/acknowledgment ordering and mandatory restore-consultation evidence; if either condition cannot be demonstrated in the experiment, verdict Unsupported |
| NG-4: expiration-minus-epsilon, expiration and expiration-plus-epsilon use predetermined trusted-clock semantics | Predeclare epsilon and outcomes, then test all three boundary points | Injected integer times tested for a half-open interval | Trusted destination clock, predetermined epsilon/semantics and independently observed outcomes |

### Preserve the frozen amendments

**AC-10:** For each overlapping pair the evaluator identifies the destination-recorded order. A revocation that linearizes first prohibits commitment; publication that linearizes first may commit, with revocation applying to later uses. A committed publication after prior-linearized revocation, or an outcome inconsistent with any destination-recorded serial order, fails. Request return order, application timestamps and guard logs are inadmissible ordering evidence.

**NG-3:** An external audit head by itself is insufficient. The durable consumption authority must not be restored with the destination and must satisfy both:
1. Its record advances durably before, or atomically with, destination acknowledgment of consumption.
2. Restore obligatorily consults that record and rejects authorizations at or below its mark; the restore path cannot skip consultation.

If either condition cannot be demonstrated in the integration experiment, record **Unsupported**, not partial or conditional support. The official ledger remains UNTESTED until evaluator results exist.

### Smallest next evidence slice

First perform a bounded, read-only wiring inspection: pin source and configuration; list publication destinations, all discovered write entry points and credential holders; trace witness authorization, executor dispatch, guard invocation and destination commit. Record source locations, coverage limits and any unprotected route. No independent evaluator, inaccessible configuration or unseen route may be invented.

This inspection can produce a source-grounded bypass finding or identify prerequisites for an NG-1 experiment. Inspection alone cannot establish that all routes reject unauthorized writes. Do not run positive integration controls while a discovered bypass remains unresolved, and do not mark NG-1 passed from source review.

The documentation contribution is the frozen-source crosswalk and explicit blockers. All integrated commands and fixtures, evaluator appointment, custody records and destination experiments remain OPEN.

## Receipt for each test

Record: test ID; source commit(s); frozen criterion; environment/dependency manifest; exact command and fixture hash; actor identities; start/end UTC time; expected versus observed outputs; external before/after state; signatures and independent audit-head references; execution status RUN/BLOCKED/NOT RUN; substantive evaluator verdict Pass/Fail/Unsupported (UNTESTED until evaluated); deviations; evaluator sign-off. Include spec_hash, criterion_id, destination_record, AC-10 ordering_evidence and NG-3 recovery_authority_record as applicable. BLOCKED and NOT RUN are execution statuses, not substitute acceptance verdicts.

## Stop / promotion gate

Any alternate write path, missing custody evidence, unverified rollback/replay behavior, or incomplete frozen-criterion mapping retains **DRAFT / NO PRODUCTION AUTHORITY**. Local seven-test success cannot substitute for independent integrated evaluation. Publish failures alongside successes. Require a separately authorized security review and scoped deployment decision after tests pass.

## No execution claim

This document is a checklist and test protocol proposal. It does not assert that acceptance was run, that a production gate exists, that consent covers all sources, or that any independent certification has been achieved.
