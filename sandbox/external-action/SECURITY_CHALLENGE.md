# Resona Security Challenge: change the effect without the authority

**Engineering challenge, October 2, 2026. No independent security certification.**

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

Use a new output directory each time. The command starts the actual marker, witness, executor, and custodian adapters on four dynamically selected loopback ports, runs the cases below, saves evidence, and stops the processes. No live system is contacted.

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
| Submit authorized action and token | 200 / DISPATCHED | Exactly the authorized row |
| Replay the same authorized request | 409 / REPLAY | No additional row |

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

The trusted setup controller supplies three distinct approver identities, pins the policy digest separately for witness and executor, provisions signing keys, and uses a separate credential for witness attestation. The proposer cannot mint signatures, edit active policy, access the attestation credential, or directly authenticate to the marker. The executor is intentionally trusted with marker credentials; marker authorization alone does not reverify witness tokens.

The `private/` directory belongs to the trusted local setup and reconciliation operator. Accessing it, reading another process's credentials, replacing code, modifying databases, or using the OS account to impersonate an actor is **outside this client-boundary exercise**. Such attacks belong in a separate isolation assessment. All four processes run on one host and OS user: directory separation and loopback binding do not establish real independent custody. Do not describe this as an isolated adversarial environment.

No live medical, company, Databricks, or other third-party system is in scope. The challenge authorizes testing your own local sandbox copy.

## Evidence and reporting

`evidence/report.json` contains actual responses, complete before/after marker snapshots, per-case results, policy/evidence digests, SHA-256 hashes of Python source files, and the suite-end held log heads. The runner verifies each actor log against a head accepted by the custodian and exports `marker-events.json`, `witness-events.json`, and `executor-events.json`.

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

Known open areas include credential custody, OS isolation, clock trust, backup rollback, executor topology, stale policy processes during rotation, uncertain dispatch reconciliation, manual head publication, and signer equivocation. The source checks evidence-byte presence and digest; it does not establish the evidence's substantive truth.

The preregistered P1/N1–N11 acceptance battery remains separate and OPEN. These new local cases must not be relabeled as that battery. Passing them is an engineering baseline for Ariel to challenge, not proof that Resona is secure or ready for production.

## Short note for Ariel

“Here’s the concrete target: one signed permission to append one marker. The runner shows the valid write, then tries alteration, replay, scope expansion, and credential bypasses, checking the actual ledger after each attempt. There’s a live mode and a client fixture you can mutate. Can you get a different or extra marker through using only those client permissions? If you find a custody or availability issue instead, I want that too—just label the boundary you crossed. The passing baseline is mine; the independent challenge is yours. 😄”
