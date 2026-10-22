# Recovery-gate slice: frozen expectations (RS-2)

Status: FROZEN before implementation. This file is committed on its own, before any
RS-2 code exists. Later changes are amendments and are recorded as such.

Builds on RS-1 (`EXPECTATIONS.md`, evidence run `20261022T155906Z-8a35d7cf74c8`,
implementation commit `8a35d7c`). RS-1 is not modified by this slice except for the
runner change listed under H3.

Evidence class: local recovery-gate engineering evidence. A pass would establish local
recovery-gate enforcement under the tested conditions only. Gate A and Gate B are
unchanged.

## Target

An operation that recovery classified as unresolved cannot reach the effect writer
until separately authorized reconciliation succeeds. An `ACTIVE` reservation alone
never bypasses an open gate.

## Terms

- Effect writer: a separate process that owns the effect store (a local SQLite stand-in
  for a destination). It is the enforcement boundary. Client-side checks do not count.
- Gate: the writer's per-`op_id` record. "Open" means blocking; "cleared" means a
  complete authenticated resolution permits the stated outcome.
- Normal path: before reserving, the client registers an attempt with the writer for
  `op_id` and payload hash; the writer issues a single-use attempt credential that the
  client holds only in process memory. A process restart loses it. A second attempt
  registration for the same `op_id` is refused.

## Frozen expectations

G1 — Persistent gate, bound identity, fail-closed. An `UNRESOLVED` recovery
classification opens a gate that survives SIGKILL and restart. The gate is bound to
`op_id`, reservation ID, and payload SHA-256. Only a resolution record clears it. A
write is refused when the gate row is missing, malformed (unknown state, missing
binding fields, or a cleared state without a matching resolution record), or
mismatched (reservation ID or payload hash differs from the request). Snapshot or
backup rollback of the writer store is outside this slice.

G2 — Enforcement at the writer. The writer checks gate state in the same transaction
as the effect write. It refuses the write while the gate is open, including when the
witness reports the reservation `ACTIVE` and the request carries the correct
reservation ID and payload.

G3 — Authenticated authority. The writer derives the acting identity from a
separately validated credential, never from a caller-supplied identity field; a request
carrying such a field is refused. Only the reconciler credential may reconcile. Wrong
credentials and client-credential reconciliation attempts are refused and leave the
gate byte-for-byte unchanged with no resolution recorded. Each resolution records the
derived identity. This establishes local credential separation on one host, not
independence from the host operator.

G4 — Resolution semantics. Reconciliation starts only from an open gate and ends as:
- `EFFECT_CONFIRMED`: accepted only if a matching effect (same `op_id`, reservation
  ID, payload hash) already exists. It never permits another effect.
- `EFFECT_ABSENT_AUTHORIZED_TO_PROCEED`: accepted only if no effect exists for the
  `op_id` and the witness does not report the reservation `REVOKED`. It permits at most
  one matching effect. The write rechecks current revocation status, and the permission
  is consumed in the same transaction as the effect write.
- `INDETERMINATE`: recorded; the gate stays open and permits no effect.

G5 — Crash precision. The writer exposes synchronization hooks immediately before and
immediately after the reconciliation transaction commits. After a SIGKILL at either
hook and a restart, the store shows either an open gate with no new resolution, or a
cleared gate with its complete authenticated resolution record. A cleared gate without
its resolution record must never be observed.

## Harness requirements

H1 — Witness, writer, client, and reconciler run as separate processes. Synchronization
uses explicit process signals (stdout lines), never timing sleeps.

H2 — Negative case: the RS-1 request sequence and payload (`op-C`,
`{"marker":"C","v":1}`: reserve, response lost at witness commit, SIGKILL witness and
client, restart, recover, retry, write) are preserved, with the write routed through
the RS-2 writer. The evidence must record this distinction: the unchanged RS-1 client
writing directly to its own local database would bypass the RS-2 writer entirely and is
not what this case tests.

H3 — The runner refuses to execute when the whole repository working tree is dirty, not
only `sandbox/reservation-slice/`.

H4 — Every run retains exact commit, commands, environment, raw outputs, witness
records, gate, resolution and effect records, counts, and per-case classifications,
including failures.

## Pass criteria

All RS-2 cases pass, and across every case: at most one effect per `op_id`; every
cleared gate has exactly one matching authenticated resolution record; no effect exists
for an `op_id` whose gate is open; and every refused request left gate, resolution and
effect state unchanged.

## Out of scope

Destination fencing at a real external destination, atomic revocation ordering between
witness and writer (the writer's revocation check is a lookup at write time), snapshot
rollback, racing owners, I/O fault injection, power-loss durability, and independent
custody.
