# Resona Security Challenge: change the effect without the authority

**Engineering challenge, October 2, 2026; revised October 23, 2026 for the single destination-owner model in PR #26. No independent security certification.**

An agent gets permission to append exactly one marker to a synthetic ledger. Can you make the real ledger contain a different marker or an extra row using only the proposer/executor client surface?

Start here. No QOTE background, language model, Next.js installation, cloud account, or patient data is needed. The target is the existing Python external-action sandbox, not a substitute implementation.

## Five-minute baseline

From the repository root:

```bash
cd sandbox/external-action
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python scripts/security_challenge.py --output ./challenge-run-1
```

Use a new output directory each time. The command initializes a new destination store, starts the actual marker/destination-owner, witness, executor, destination-verifier, and custodian adapters on five dynamically selected loopback ports, runs the 15 cases below, saves evidence, and stops the processes. No live system is contacted.

Expected final ledger:

```json
[["authorized_request", "authorized_marker"]]
```

The runner exits nonzero on any unexpected HTTP outcome, unexpected reason, or ledger mismatch. A denied HTTP response alone is insufficient: it checks the complete destination marker ledger before and after **every** case.

| Case | Expected response | Persistent marker effect |
| --- | --- | --- |
| Proposal intake | 200 / HOLD | None; intake never grants a token |
| Intake credential used at `/attest` | 403 / FORBIDDEN | None |
| Change marker and recompute fingerprint with original token | 409 / TOKEN_SCOPE_MISMATCH | None |
| Change a signed token's nonce | 409 / BAD_SIGNATURE | None |
| Expand scope to two markers | 409 / UNSUPPORTED_ACTION | None |
| Remove one required approval | 409 / MISSING_APPROVAL | None |
| Call marker with proposer credential | 403 / FORBIDDEN | None |
| Marker credential, valid token, wrong destination store ID | 409 / STORE_ID_MISMATCH | None |
| Marker credential, bare action with no signed token | 409 / INVALID_FIELDS | None |
| Marker credential, validly signed but expired token | 409 / EXPIRED_OR_EARLY | None |
| Submit authorized action and token | 200 / DISPATCHED | Exactly the authorized row |
| Replay the same authorized request | 409 / REPLAY | No additional row |
| Effect credential used at verifier `/revoke` | 403 / FORBIDDEN | No additional row |
| After acknowledged revocation, present the cached token at verifier `/effect` | 409 / REVOKED | No additional row |
| After acknowledged revocation, present the cached token directly at marker `/marker` | 409 / REVOKED | No additional row |

The three direct-marker cases use the marker effect credential, which is **not** in the client fixture. They show that holding that credential is no longer sufficient to write: the destination owner rejects without a matching store ID and a currently valid witness-signed token. The revocation cases use a separately authorized `revoked_request`; the revocation itself is issued by the runner under the operator-held revocation credential, not by the client.

Each run generates fresh test keys/credentials, so hashes and signatures vary. Fixed action IDs and expected outcomes are reproducible. The suite finishes within the real 60-second token lease; it does not change expiry parameters or production invariants.

## Attack the live target

Terminal 1, from `sandbox/external-action`:

```bash
.venv/bin/python scripts/security_challenge.py --output ./challenge-live-1 --serve
```

The runner first executes the baseline, then leaves a second preapproved action unredeemed. Terminal 2, **within 60 seconds**:

```bash
.venv/bin/python scripts/challenge_client.py --client ./challenge-live-1/client --mode altered --save ./challenge-live-1/evidence/altered-attempt.json
.venv/bin/python scripts/challenge_client.py --client ./challenge-live-1/client --mode authorized --save ./challenge-live-1/evidence/authorized-attempt.json
.venv/bin/python scripts/challenge_client.py --client ./challenge-live-1/client --mode replay --save ./challenge-live-1/evidence/replay-attempt.json
```

Expected sequence: altered action holds, original action dispatches, replay holds. `replay` resends the same fixture; run `authorized` first. If a token expires, start a fresh run. The client does not auto-renew authority. Modify a copy of `challenge_client.py` to try your own payloads. Raw HTTP/JSON attacks can use the URLs and credentials in `client/connection.json`.

Press Ctrl-C in Terminal 1 to save `evidence/manual-final-markers.json` and stop the actors. After the authorized manual action, the expected full ledger is:

```json
[["authorized_request", "authorized_marker"], ["manual_request", "manual_authorized_marker"]]
```

For a denied manual attack, require no change from the immediately preceding ledger state. An extra or different row is a boundary failure even if the executor reports HOLD, errors, or crashes. A timeout is unresolved until destination reconciliation. A missing approved row is a functional failure, not a successful bypass.

## Attacker permissions and security boundary

Use **only** the `client/` fixture: signed proposal, witness token, witness intake credential, executor credential, and public loopback URLs. You may mutate submitted JSON, recompute fingerprints, replay, reorder, send concurrent requests, or try to use a client credential on another endpoint. HTTP denial-of-service and malformed-input failures are useful robustness findings but are distinct from unauthorized persistent effects.

The trusted setup controller supplies three distinct approver identities, pins the policy digest separately for witness, executor, verifier, and marker, provisions signing keys, initializes the destination store and its store ID, and uses a separate credential for witness attestation. The proposer cannot mint signatures, edit active policy, access the attestation credential, or directly authenticate to the marker.

Request path: executor `POST /execute` → destination verifier `POST /effect` → marker/destination owner `POST /marker` with `{action, token, store_id}`. The executor holds only the verifier credential. The verifier performs an early check and forwards the original signed token; it opens no destination database and refuses startup if a destination path is in its environment. The marker/destination owner is the only process that opens the destination store. **Inside its `BEGIN IMMEDIATE` write transaction** it rechecks store metadata against its startup pin and the supplied store ID, checks for a committed revocation, verifies the witness signature, action scope, and active policy pin, and samples its clock for the lease check, all before inserting. The marker credential alone cannot authorize a bare or unsigned action.

The destination receives the action and the signed token, not the approval set. Approval verification remains with the witness at attestation and the executor before dispatch; the destination relies on the witness signature over the token's approvals digest.

### Revocation ordering

Revocation enters at verifier `POST /revoke` under a distinct revocation credential and is forwarded to the **same** destination owner, which commits the revocation receipt in the same SQLite write domain (`BEGIN IMMEDIATE`) before acknowledging. Writes serialize on the writer lock:

- If revocation commits first, any later marker transaction for that request ID is rejected as `REVOKED` and adds no row.
- If a marker transaction acquires the writer lock first, revocation waits. That marker's effect is ordered **before** revocation even if its HTTP response arrives **after** the revocation acknowledgment.

Judge outcomes by committed destination state and transaction ordering, not by response arrival time. A late response for an earlier-committed effect is not a post-revocation effect. A row ordered after committed revocation is a boundary failure. If available observations cannot establish which transaction committed first, classify the result as unresolved; a ledger snapshot can establish final contents without establishing sequence.

The `private/` directory belongs to the trusted local setup and reconciliation operator. Accessing it, reading another process's credentials, replacing code, modifying databases, or using the OS account to impersonate an actor is **outside this client-boundary exercise**. Such attacks belong in a separate isolation assessment. All five processes run on one host and OS user: directory separation and loopback binding do not establish real independent custody. Do not describe this as an isolated adversarial environment.

No live medical, company, Databricks, or other third-party system is in scope. The challenge authorizes testing your own local sandbox copy.

## Evidence and reporting

`evidence/report.json` contains actual responses, complete before/after marker snapshots, per-case results, policy/evidence digests, SHA-256 hashes of Python source files, and the suite-end held log heads. The runner verifies each actor log against a head accepted by the custodian and exports `marker-events.json`, `witness-events.json`, `executor-events.json`, and `verifier-events.json`. The marker log records the in-transaction clock sample, not an independently witnessed commit timestamp, so these exports alone do not establish commit order between a revocation and a concurrent effect.

The suite-end heads precede the manual fixture authorization and later manual attacks. They cover that snapshot only; manual head publication remains a separate operator task using `scripts/publish_head.py`. The custodian lacks append-only consistency proofs. These locally held heads establish neither independence nor non-equivocation nor completeness of unlogged effects.

Share `evidence/` and modified attacker code, **never `private/` or `client/` credentials**. Include:

1. Repository commit, source hashes, Python/cryptography versions, OS, UTC time, and exact commands.
2. Attacker capabilities and whether any trusted credential or OS access was used.
3. Exact submitted request, response/error, expected authorized effect, and independently inspected destination state.
4. A minimal replayable exploit or regression fixture, including concurrency/restart timing if relevant.
5. Classification: unauthorized effect, authorized-work failure, availability/parser failure, custody limitation, or unresolved result.

An independently operated destination observer is needed for an independent evaluation. This runner's destination query is separate from executor self-report, but it remains under the same local operator.

## What this can and cannot establish

This demonstrates a narrowly defined signed marker action through the existing adapters. It does **not** test updates to two database records, database triggers, hidden notifications, production connectors, clinical behavior, or all possible persistent side effects. The earlier database example was an illustration, not this implementation's supported API.

Known open areas include credential custody, OS isolation, clock trust, backup rollback, same-ID store clones, crash durability, migration of legacy split stores, complete enforcement-path enumeration, executor topology, stale policy processes during rotation, uncertain dispatch reconciliation, manual head publication, and signer equivocation. The store ID is binding metadata, not proof of physical database identity; single-owner deployment on a local filesystem is a precondition, not something this runner verifies. The source checks evidence-byte presence and digest; it does not establish the evidence's substantive truth.

The preregistered P1/N1–N11 acceptance battery remains separate and OPEN. These new local cases must not be relabeled as that battery. Passing them is an engineering baseline for Ariel to challenge, not proof that Resona is secure or ready for production.

## Short note for Ariel

“Here’s the concrete target: one signed permission to append one marker. The runner shows the valid write, then tries alteration, replay, scope expansion, and credential bypasses, checking the actual ledger after each attempt. There’s a live mode and a client fixture you can mutate. Can you get a different or extra marker through using only those client permissions? If you find a custody or availability issue instead, I want that too—just label the boundary you crossed. The passing baseline is mine; the independent challenge is yours. 😄”
