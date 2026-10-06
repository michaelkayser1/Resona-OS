# Offline adaptive oscillator verification

This is an experimental mathematical reference, separate from Resona's
middleware and authorization decisions. It runs synthetic data only. It has
no network access, actuator, safety controller, coherence-setpoint feedback,
or task-progress guarantee. See the [specification](../../docs/ADAPTIVE_OSCILLATOR_RESEARCH.md).

## Reproduce

Use Python 3.12 with the pinned NumPy/SciPy dependencies in an isolated environment:

```bash
cd research/adaptive-oscillators
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python -m unittest discover -s . -p 'test_*.py' -v
.venv/bin/python verify.py
```

The final command emits one JSON report to stdout; it does not save files.
For an intentional new result file, explicitly redirect stdout. The committed
`verification-results.json` is the recorded reference, not a claim that every
machine returns bitwise-identical floating-point results.

The report distinguishes the last pre-update sample from the integrated
endpoint and includes edgewise extrema, damped and undamped step refinement,
sampled ODE reference minima, and exact counterexamples. Default Euler
parameters and seed remain those supplied in the original harness.

All numerical times are elapsed seconds. Documentation dates use UTC.
Importing `verify.py` does not execute the verification suite or change the
global random generator. Eight regression tests check mathematical boundaries
and measurement errors, with 60 scalar-initialization bound subcases and one
mixed-edge initialization. They compare with analytical bounds rather than
seed-specific minima or ten-digit trajectory targets. The separate 19 sandbox
and three audit tests do not exercise this module; they are regression evidence
only. None of these checks is an external-action acceptance test.
