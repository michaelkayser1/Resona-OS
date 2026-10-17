# DRONE-01 local synthetic fixture (v0.1)

**Status:** Local observation-only tests. No runtime integration, no destination enforcement, no production authority.

This directory contains a minimal unittest that exercises acceptance cases DR-0 through DR-6 against a pure-function observation builder and the Draft 2020-12 schema (with format checking enabled).

DR-7 (100-request concurrency and crash/restore) and DR-8 (alternate-write-route bypass under verified destination enforcement) remain out of local scope.

## Decisions implemented

- Issue #22 remains the acceptance reference. No silent renumbering.
- Schema covers both ordinary (`pattern_label=none`) and candidate (`DRONE-01-candidate`) observations via explicit enum.
- `policy_states_invoked` defaults to `[]`. OBSERVE and SPEAK are architecture stages, never emitted as policy states.
- Structured `predecessor_receipt_hash` (null or SHA-256) is included in the canonical bytes before the receipt hash is computed.
- Contract version bumped to `resona.drone01.observation.v0.1`.
- `repetition_count >= 3` is an explicit synthetic heuristic for this local fixture only.

## Run

```bash
cd sandbox/observation/drone01
pip install jsonschema   # required for schema validation tests
python3 -m unittest -v test_fixture
```

Timestamp format checking is enabled via an explicit Draft 2020-12 date-time checker registered in the test module (jsonschema's default FormatChecker does not include date-time without extra packages).

## Limits

- Does not connect to any model, activation steering mechanism, or external-action sandbox.
- Does not collect personal data.
- Passing these tests does not close Issue #22, demonstrate randomized controls, verify authorization, demonstrate classification accuracy, or authorize any change to policy states.
- Until exact commit, command, environment, dependency versions, and results are recorded, status remains unexecuted.
