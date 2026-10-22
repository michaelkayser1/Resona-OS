# Reservation slice: frozen expectations (RS-1)

Status: FROZEN before implementation. This file is committed on its own, before any
code in this directory exists. Changes after that commit are amendments and must be
recorded as such, not edited in place.

Evidence class: local reservation-protocol engineering evidence. A pass advances this
slice only. It does not change Gate A or Gate B, and it is not an acceptance run.

## Scope

In scope: reservation persistence, response loss, idempotency conflicts, restart
recovery, and revocation-aware retry.

Out of scope: destination fencing, effect enforcement, revocation ordering at the
effect boundary, concurrency between racing owners, VFS fault injection, independent
custody of the witness store. Nothing here demonstrates any of those.

## Frozen expectations

E1 — Identity. There is exactly one immutable reservation per `op_id`. The
reservation binds the SHA-256 of the exact request payload bytes. A request with the
same `op_id` and byte-identical payload returns the original reservation. A request
with the same `op_id` and any different bytes returns `IDEMPOTENCY_CONFLICT` and
leaves the stored reservation unchanged. Byte identity is literal: semantically
equivalent but byte-different payloads conflict.

E2 — Revocation. A retry after revocation returns the original reservation identity
together with its current status `REVOKED`. It creates no replacement reservation, and
the response does not imply that the original reservation is absent. A
different-bytes request against a revoked reservation still returns
`IDEMPOTENCY_CONFLICT`.

E3 — Recovery. Finding the reservation at the witness by `op_id` establishes witness
persistence of that reservation, and nothing more. A missing local effect record
remains `UNRESOLVED` unless additional evidence establishes the effect's outcome.
Recovery must never classify a missing local record as "not executed".

E4 — Response loss. When the witness has committed a reservation and the response is
lost, the client classifies the attempt as `RESPONSE_LOST` (outcome unknown to the
client), not as failure. A retry with the same `op_id` and bytes returns the same
reservation, and the witness holds exactly one reservation for that `op_id`.

## Harness requirements

H1 — The witness store is a persistent SQLite file, opened by a separate witness
process.

H2 — The crash case uses an actual process kill (SIGKILL) and a fresh process on the
same store file, for both witness and client.

H3 — Response loss is injected only after the witness has committed. The harness
waits on an explicit commit signal from the witness process; no timing sleeps are
used for synchronization.

H4 — Every run retains: exact commit, commands, environment, raw outputs, the full
witness records, reservation counts, and per-case outcome classifications, including
failures.

## Pass criteria

Every case passes and, for every `op_id` exercised, the witness holds at most one
reservation row; the total row count equals the number of distinct `op_id`s that
reached the witness. Any failure is retained and reported as a failure.
