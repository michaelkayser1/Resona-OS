# DRONE-01 local synthetic fixture (v1)

**Status:** Local observation-only tests. No runtime integration, no destination enforcement, no production authority.

This directory contains a minimal unittest that exercises acceptance cases DR-0 through DR-6 against a pure-function observation builder and the Draft 2020-12 schema (with format checking enabled).

DR-7 (100-request concurrency and crash/restore) and DR-8 (alternate-write-route bypass under verified destination enforcement) remain out of local scope.

## Decisions implemented

- Issue #22 remains the acceptance reference. No silent renumbering.
- Schema covers both ordinary (`pattern_label=none`) and candidate (`DRONE-01-candidate`) observations via explicit enum.
- `policy_states_invoked` defaults to `[]`. OBSERVE and SPEAK are architecture stages, never emitted as policy states.
- The six execution states remain ALLOW / DENY / DEFER / ESCALATE / ABSTAIN / PRESERVE.
- Structured `predecessor_receipt_hash` (null or SHA-256) is included in the canonical bytes before the receipt hash is computed.
- Contract version is `resona.drone01.observation.v1` with an explicit allowlist; predecessor verification is version-aware.
- Receipt prefix is version-aware.
- `repetition_count >= 3` is an explicit synthetic heuristic for this local fixture only.
- Timestamp format requires timezone (Z or ±offset).
- DR-3 uses bounded fixtures for positive assertion, denial, mention, and attribution.
- DR-6 uses an in-memory predecessor store with resolution, unresolved rejection, hash recomputation, and tampering detection.
- DR-4 coverage is limited to schema rejection of extra fields; free-text privacy scanning is not implemented.

## Run

```bash
cd sandbox/observation/drone01
pip install jsonschema   # required for schema validation tests
python3 -m unittest -v test_fixture
```

## Limits

- Does not connect to any model, activation steering mechanism, or external-action sandbox.
- Does not collect personal data.
- Passing these tests does not close Issue #22, demonstrate randomized controls, verify authorization, demonstrate classification accuracy, or authorize any change to policy states.

## Execution evidence and open gates

On 2026-10-21, all eight existing tests passed using byte-verified source at `4c85b53784b32adb6d9a9f4b70fbd4d7851bdd0a` (exit 0; `Ran 8 tests in 0.002s`, `OK`). The isolated snapshot contained fixture blob `906bd69a191bb60518c3b922d6cb89146441b163` and schema blob `41c06f70ab012650dd178ce78ec6636c46b241eb`; it was not a full checkout. From the snapshot's `sandbox/observation/drone01` directory, the command was `../../../venv/bin/python -m unittest -v test_fixture`.

Environment: Python 3.12.14, Linux x86_64/glibc 2.39; jsonschema 4.26.0, attrs 26.1.0, jsonschema-specifications 2025.9.1, referencing 0.37.0, rpds-py 2026.9.1, typing_extensions 4.16.0. This is separate from the earlier eight-test run attributed to `6a1ee325090878ec975a44fbd05a26f915f4c325` in the [observation document](../../../docs/DRONE-01_observation_schema.md).

This status reconciliation changes documentation only. Subsequent revisions require their own execution record; see the PR #23 body for the latest exact tested head. Gate A (artifact and local execution review) and Gate B (remaining Issue #22 evidence) both await formal verification sign-off. Neither gate is declared passed; keep this PR draft and Issue #22 open.
