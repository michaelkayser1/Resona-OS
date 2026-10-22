# RS-2 Amendment 001

Status: ADOPTED 2026-10-22. Prospective only. Committed separately, before the test
changes that evaluate it. `EXPECTATIONS-RS2.md` (frozen in `714500a`) is not edited.

## Change

In the RS-2 pass criteria, replace:

> no effect exists for an `op_id` whose gate is open

with:

> No new effect may be committed while that operation's gate is OPEN. An effect
> committed before the gate opened may remain present during reconciliation. Its
> existence does not clear the gate or permit another effect.

All other RS-2 expectations and pass criteria are unchanged.

## Required assertions

A1. A pre-existing effect remains unchanged while the gate is OPEN.

A2. A write attempted while the gate is OPEN is refused without changing gate,
resolution, or effect state.

A3. `EFFECT_CONFIRMED` clears the gate only for the matching existing effect and never
permits another effect.

## Reason

The frozen criterion conflicts with recovery of a previously committed effect. The
retained op-Conf audit in run `20261022T162032Z-6984de1a2bcf` shows the sequence
`WRITTEN → GATE_OPENED → EFFECT_CONFIRMED`: further writes were blocked, but an effect
existed for an open gate during the intermediate state.

## Historical disposition

The execution at `6984de1` passed 12/12 implemented tests. It deviated from the
original frozen global pass criterion in the documented op-Conf interval. This
amendment does not retroactively remove that deviation, and that run is not relabeled
as fully conforming. A subsequent pinned run must evaluate the amended criterion.

Injected malformed rows remain labeled negative fixtures. The unretained dry run and
mutation checks remain reported history only.

Gate A remains pending; Gate B remains open.
