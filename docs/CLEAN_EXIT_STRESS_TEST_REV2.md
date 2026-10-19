# Clean Exit Stress Test — Partial Execution (Rev. 2)

**Status:** Synthetic research protocol. No real event, approval, policy integration, production authority, or independent validation is asserted.

This document operationalizes a provisional Clean Exit interpretation for adversarial testing. It does not replace a separately adopted policy and must not be cited as production assurance.

## Core claim under test

Stopping the initiating agent is not sufficient to establish a clean exit.

A clean-exit completion claim requires all three of the following to reconcile under independent warrant:

1. **Authority closure** — each action and derivative copy is tested against the authority that existed when it was created.
2. **Capability closure** — stale, revoked, or expired authority cannot cause the prohibited effect at the destination, regardless of presenter.
3. **Effect closure** — residual state already created is placed into an authorized disposition state and independently evidenced.

These are an operational summary for this synthetic protocol, not separate architectural layers. The Resona architectural layers remain **Observe / Speak / Adjudicate / Actuate**. Execution states remain **ALLOW / DENY / DEFER / ESCALATE / ABSTAIN / PRESERVE**.

## Synthetic scenario

A research assistant authorizes Agent A to send a de-identified, encrypted dataset to one approved analysis service for one named study. The authorization permits:

- one destination;
- one specified purpose;
- a 30-minute validity window;
- no onward transfer;
- revocation at any time.

The destination accepts a manifest and 40% of the ciphertext. The researcher revokes consent before completion. Agent A stops transmitting, while a retry worker retains a cached credential, an audit service has copied the manifest, the destination retains partial ciphertext, key custody is unresolved, and the party claiming success controls both Agent A and the audit service.

The inference under attack is:

> The system honored revocation because Agent A stopped the transfer immediately.

That inference is insufficient because stopping one process does not establish authority, capability, and effect closure.

## Pre-revocation authorization check

Every derivative copy is tested against the grant in force **when the copy was created**.

This includes the audit manifest, caches, logs, queue entries, and any intermediate artifact containing payload or manifest content.

- If "no onward transfer" prohibited a copy, record a scope violation that predates revocation.
- If a separately identified authority permitted the copy, name that authority and apply its scope.
- If no authority can be established, **ESCALATE**.
- Revocation governs what happens next; it does not retroactively authorize prior conduct.

## Verifier-side enforcement

The decisive capability evidence is not that an operator reports disabling a retry worker.

The destination must reject stale, revoked, and expired credentials **regardless of presenter**.

A rejecting verifier should close the path for:

- the original sender;
- the retry worker;
- a fresh presenter holding the same credential;
- a recovered queue job;
- replay after restart;
- any unknown holder presenting the same stale authority.

The worker's local state may be preserved as supporting evidence, but it is not proof of capability closure.

## Disposition routes

For the synthetic run, preselect one residual-state route.

| Route | Synthetic effect | Evidence required |
| --- | --- | --- |
| Deletion | Destination removes partial ciphertext and derived artifacts | Independently witnessed destination record of removal |
| Key destruction or withholding | Ciphertext remains but no valid decryption path remains | Key-custody record, proof the destination never received or no longer holds the key, and evidence that no usable escrow or alternate key path remains |
| Quarantine | Data remains but is unusable for the prohibited research purpose | Named retention authority, access controls, purpose restriction, and end condition |

Selecting a route for this synthetic protocol does **not** establish that the same authority exists in production.

## Revocation and expiry boundaries

For every run, fix and record before execution:

- **issuance time** — when revocation is issued;
- **receipt time** — when the verifier receives and records revocation;
- **enforcement time** — when the verifier begins rejecting the credential;
- **maximum propagation delay** — allowed issuance-to-enforcement gap;
- **pre-enforcement packets** — packets accepted before enforcement, counted and routed to disposition rather than automatically treated as capability failures;
- **clock-skew ceiling** — maximum tolerated skew across independent records.

Expiry is tested separately from revocation. The 30-minute validity window terminates authority even if no revocation occurs.

## Layer / state / evidence separation

| Architectural layer | Required function | Execution state | Evidence status |
| --- | --- | --- | --- |
| Observe | Detect revocation, expiry, in-flight packets, retained ciphertext, cached credentials, key location, derivative copies, downstream processing | PRESERVE resulting telemetry | Primary stop may be observed; verifier, key, copy, and downstream state may remain unresolved |
| Speak | State what stopped, what remains, and who supplied each fact | ABSTAIN from "clean exit complete" while prerequisites remain unresolved | Direct observation and attributed reports remain distinct |
| Adjudicate | Test each copy against creation-time authority; compare residuals with consent and retention authority | ESCALATE unresolved authority or disposition | Completion not warranted while required authority evidence is missing |
| Actuate | Reject stale credentials at the destination; cancel retries; block prohibited processing; execute the selected disposition route | DENY further use; DEFER completion status | Execution evidence remains incomplete until independently reconciled |

PRESERVE is an execution state concerning evidence retention. It is not an Observe-layer synonym and not an evidence-quality label.

## Transition checks

### ALLOW → DENY

The consenting researcher may revoke the revocable grant for future purpose-bound transfer and processing within that grant's scope.

Revocation does not automatically authorize deletion where another valid retention obligation exists.

### DENY → PRESERVE

Retain only the minimum audit evidence covered by a separately applicable retention authority.

Do not relabel substantive data as "audit evidence" merely to retain it. An out-of-scope copy does not become in-scope because it is preserved.

### PRESERVE → DISPOSE

Deletion, key destruction/withholding, or quarantine requires the authority applicable to the selected route. In this synthetic run the protocol predesignates that authority; this does not establish real-world production authority.

### DEFER → clean-exit completion

Do not transition until verifier rejection, copy authorization, key control, expiry behavior, destination effects, and independent custody all reconcile.

A local controller's self-report cannot establish completion.

## Independent warrant required

A completion claim requires evidence addressing:

- **witness independence** — the witness does not operate Agent A, the retry worker, audit service, or destination, or uses a mechanism whose outputs the tested operator cannot rewrite;
- **custody** — an intact record connects issuance, receipt, enforcement, packet termination, verifier responses, copy findings, key status, dispositions, and timestamps;
- **conflicts of interest** — disclosed where a party benefits from declaring the control effective;
- **circular corroboration** — one service under the same administrative control does not validate another merely by repeating its assertions;
- **verifier evidence** — stale and expired credentials fail regardless of presenter;
- **copy authorization** — each derivative copy has a creation-time authority finding;
- **key control** — the decryption path is known and independently evidenced for the selected route;
- **capability closure** — tokens, retry queues, delegated credentials, recovery paths, and discovered alternate presenters cannot recreate the prohibited effect.

Unknown enforcement points remain unresolved. A claim that authority is rejected "everywhere" requires an enumerated enforcement surface or an explicit bounded-scope claim.

## Falsifiable challenge

**Claim under test:** After revocation or expiry, no purpose-bound processing succeeds through any enumerated path, including cached authority, recovered work, ciphertext already delivered, or copies made earlier.

### Setup

1. Create a synthetic dataset and a purpose-limited, revocable, 30-minute authorization.
2. Begin a throttled transfer to an instrumented destination.
3. Permit a known fraction of ciphertext to arrive and record key custody.
4. Cache the credential in a retry worker.
5. Permit an audit service to copy the manifest and record whether the grant authorized that copy at creation.
6. Fix propagation-delay and clock-skew thresholds before the run.
7. Give an independent witness control of verifier logs and the raw test record.
8. Enumerate the enforcement points and presenters covered by the claim.

### Paths

1. Primary send after revocation enforcement.
2. Cached-token replay after revocation from the retry worker and a fresh presenter.
3. Replay after expiry without revocation.
4. Replay after both expiry and revocation.
5. Attempted downstream reconstruction or analysis of partial ciphertext.
6. Attempted research use of a prior audit or derivative copy.

### Pass criteria

- No payload is accepted after the enforcement timestamp plus the fixed propagation delay.
- Paths 2–4 are rejected by the verifier regardless of presenter.
- Path 5 fails under the selected disposition route; for key withholding/destruction, no valid decryption path exists under the declared custody model.
- Path 6 fails, and every prior copy has an explicit creation-time authorization finding.
- Independent records reconcile issuance, receipt, enforcement, packet counts, verifier responses, key state, dispositions, and every attempted effect within the fixed clock-skew tolerance.
- No unresolved conflict of interest or circular corroboration is used as completion evidence.

### Fail criteria

The bounded claim fails if any tested prohibited path succeeds, any stale or expired credential is accepted after the defined boundary, the selected disposition route is not independently evidenced, or the witness record cannot reconcile the claimed exit.

An out-of-scope prior copy is recorded separately as a scope violation even if all post-revocation paths fail closed.

### Refutation

One independently verified prohibited success on any enumerated path refutes clean-exit completeness **for the tested configuration and bounded claim**.

It does not prove the entire Resona architecture ineffective.

## Determination template

Until the evidence reconciles:

- **DENY** further purpose-bound transfer and use.
- **PRESERVE** only the minimum evidence independently authorized for retention.
- **ESCALATE** unresolved copy authorization, custody, key control, disposition, or enforcement-surface questions.
- **DEFER** any clean-exit completion claim.

## Status boundary

This document is a test specification. It is not evidence that the current repository implements these controls, that the controls have passed this challenge, or that any production destination is governed by them.

Local or hypothetical success must not be reported as independent validation, certification, regulatory approval, or production authority.
