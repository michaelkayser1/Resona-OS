# RS-1 reservation slice (engineering target)

Local reservation-protocol engineering harness for the expectations frozen in
[EXPECTATIONS.md](EXPECTATIONS.md). Python standard library only; no other dependencies.
Not connected to the external-action sandbox, the Next.js app, or any acceptance run.
A pass advances this slice only. Gate A and Gate B are unchanged by it.

## Run

```bash
cd sandbox/reservation-slice
python3 run_slice.py        # requires a clean tree; writes evidence/<UTC>-<commit>/
# or, without an evidence bundle:
python3 -m unittest discover -s tests -v
```

## What runs

- `src/rs_slice/server.py` — witness process over a Unix socket, one persistent SQLite
  store (`WAL`, `synchronous=FULL`). Triggers make reservation identity immutable,
  status one-way (`ACTIVE → REVOKED`), and reservations and events undeletable.
- `src/rs_slice/client.py` — reservation client with a local effect-record stand-in and
  an observational recovery step (lookup by `op_id`; no automatic retry).
- Fault injection fires only after the witness commit and is announced on stdout
  (`COMMITTED …`); the harness synchronizes on that line, never on sleeps.
- The crash case SIGKILLs the witness (after commit, before reply) and the client
  (after response loss, before any local record), then starts fresh processes on the
  same store files.

| Case | Expectation |
| --- | --- |
| `test_e4_response_loss_then_idempotent_retry` | E4, E1 |
| `test_e1_same_op_id_different_bytes_conflicts` | E1 (changed value, whitespace-only, trailing newline) |
| `test_e3_sigkill_restart_recovery` | E3, H2, plus a never-sent control op |
| `test_e2_revocation_aware_retry` | E2, persisted across a witness SIGKILL/restart |
| `StoreGuards` | schema guards via direct SQL |

## Known limits

- One host, one user, local files: no independent custody, no separate trust domains.
  Anyone with file access can alter the store.
- Destination fencing, effect enforcement, and the revocation ordering point at the
  effect boundary are out of scope; the "local effect record" is a stand-in row.
- No concurrent racing owners, no VFS/I/O fault injection, no power-loss testing.
  `synchronous=FULL` is configured but power-loss durability is not demonstrated.
- Recovery classifies; it does not reconcile. `WITNESS_PERSISTED_LOCAL_EFFECT_UNRESOLVED`
  stays unresolved until other evidence establishes the effect's outcome.

## RS-2 recovery gate

Expectations: [EXPECTATIONS-RS2.md](EXPECTATIONS-RS2.md), frozen in commit `714500a`
before any RS-2 code. `run_slice.py` runs RS-1 and RS-2 together and now refuses to run
unless the **whole repository** working tree is clean.

- `src/rs_slice/writer.py` — effect writer process, the enforcement boundary. It checks
  gate state in the same transaction as the effect write. Identity comes only from the
  presented credential (`{sha256(token): actor}` file); any request field outside the
  per-operation allow-list, including `actor` or `identity`, is refused. Reconciliation
  exposes hooks immediately before and after its commit (`--hold-at`).
- `src/rs_slice/gated.py` — client and reconciler CLI; the credential comes from
  `RS_CREDENTIAL`. Normal path: register attempt (single-use attempt credential held
  in memory only), reserve, write.

| Case | Expectation |
| --- | --- |
| `test_g0_normal_path_control` | control: one write via attempt, second refused |
| `test_h2_rs1_sequence_routed_through_writer` | H2, G2: RS-1 sequence; ACTIVE replay refused at writer, before and after writer restart |
| `test_g1_restart_without_recovery_refused` | G1: restart loses the attempt credential; retry and re-registration refused |
| `test_g1_fail_closed_gate_states` | G1: missing, malformed, and mismatched gate state refused |
| `test_g3_authenticated_authority` | G3: wrong/no credential, client credential, identity fields |
| `test_g4_resolution_semantics` | G4: INDETERMINATE, CONFIRMED, AUTHORIZED once, revocation before and after |
| `test_g5_sigkill_at_reconcile_commit_hooks` | G5: SIGKILL immediately before and after reconcile commit |

RS-2 limits, in addition to RS-1's: credential separation is local (one host, one OS
user; the operator can read every credential and store). The writer's revocation check
is a witness lookup at write time, not atomic with witness revocation. The H2 case
routes the RS-1 sequence through the writer; the unchanged RS-1 client writing to its
own local database would bypass the writer and is not tested. Malformed-gate cases use
state injected directly into the store while the writer is stopped.
