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
