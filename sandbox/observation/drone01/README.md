# DRONE-01 local synthetic fixture

**Status:** Local observation-only tests. No runtime integration, no destination enforcement, no production authority.

This directory contains a minimal unittest that exercises the early acceptance cases (DR-0 through DR-3) against a pure-function observation builder. Later cases (DR-4 privacy, DR-5 authority non-minting, DR-6 append-only correction, DR-7/DR-8 integration) are noted but not fully implemented here.

## Run

```bash
cd sandbox/observation/drone01
python3 -m unittest -v test_fixture
```

No external dependencies are required.

## Limits

- Does not connect to any model, activation steering mechanism, or external-action sandbox.
- Does not collect personal data.
- Passing these tests does not close Issue #22 or authorize any change to policy states.
