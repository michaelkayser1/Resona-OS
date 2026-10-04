# Adaptive oscillator research specification

**As of 2026-10-04 UTC.** Experimental mathematics and synthetic numerical
checks; AI-assisted analysis, not independent peer review.

This is an offline research track. It does not change the middleware's invariant
definitions, authorization decisions, external-action protocol, or acceptance
criteria. Oscillator metrics have no authority to permit an external effect.
See [validation status](VALIDATION_STATUS.md) and the existing
[sandbox boundary](EXTERNAL_ACTION_SANDBOX_SPEC.md).

## Frozen implemented model

For a finite undirected graph, using dimensionless radian arguments:

\[
\dot\theta_i=\omega_i+\sum_j A_{ij}K_{ij}\sin(\theta_j-\theta_i),\qquad
\dot K_{ij}=-\gamma(K_{ij}-K_0)+\alpha\cos(\theta_j-\theta_i).
\]

The reference harness uses a fully connected graph without self-loops, symmetric
initial gains, constant shared coefficients, and **no 1/N normalization**.
Natural frequencies are drawn once and centered once. Parameters are frozen:
N=10, K0=1, gamma=0.5 (damped) or 0 (undamped), alpha=0.3, seed=42,
T=50 seconds, and default Euler dt=0.01 seconds. The random generator is local;
imports do not run simulations. Numerical time is elapsed seconds, not local
wall-clock time.

| Symbol | Type / units under the dimensionless-radian convention |
| --- | --- |
| theta | Phase on the circle; radians in presentation |
| omega, K, K0 | Inverse seconds |
| gamma | Inverse seconds |
| alpha, K-dot | Inverse seconds squared |
| A, R | Dimensionless adjacency and order parameter |

No affinity-state x dynamics, safety throttle, barrier controller, target
feedback, or progress injection is implemented. The current law is a new
research specification, not a repair of earlier physical-unification formulas.

## Edgewise boundedness

For gamma>0, alpha>=0 and finite initial gain, variation of constants and
|cos|<=1 give:

\[
K_0+e^{-\gamma t}(K(0)-K_0)-\frac{\alpha}{\gamma}(1-e^{-\gamma t})
\le K(t)\le
K_0+e^{-\gamma t}(K(0)-K_0)+\frac{\alpha}{\gamma}(1-e^{-\gamma t}).
\]

Consequently the interval
[min(K(0), K0-alpha/gamma), max(K(0), K0+alpha/gamma)] bounds each
edge. The nominal [K0-alpha/gamma, K0+alpha/gamma] interval is invariant
if the initial gain lies in it. Here it is **[0.4,1.6]**.

This is a gain-boundedness theorem, not a theorem of synchronization, physical
energy dissipation, clinical efficacy, setpoint tracking, or task completion.
Nonnegative gains require a compatible lower bound or an explicitly constrained
law. Shared symmetric coefficients preserve edge symmetry.

For gamma>0, Euler preserves the gain interval when gamma*dt<=1 and initial gains
are inside it, because each update is a convex combination of the old gain and
K0+(alpha/gamma)cos(Delta). The harness enforces this condition.
This does not guarantee accuracy or stability of the phase integration.

The continuous-time upper envelope is strictly below 1.6 for finite time with
K(0)=K0. Euler's envelope uses (1-gamma*dt)^n instead of exp(-gamma*t).
Do not round an approached bound into an attained value.

## Executed evidence

See the [reference implementation](../research/adaptive-oscillators/verify.py),
[recorded results](../research/adaptive-oscillators/verification-results.json),
and [run instructions](../research/adaptive-oscillators/README.md).

| Measurement | Result / qualification |
| --- | --- |
| Damped R at endpoint | Approximately 0.99976993 |
| Damped final recorded edge range, Euler dt=0.01 | Lower approximately 1.59877; upper <1.6 |
| Damped entire-run minimum, original Euler | Approximately 0.98; step-dependent |
| Damped sampled ODE-reference minimum | Approximately 0.981122; sampled every 0.001 seconds |
| Undamped mean at t=49.99, Euler dt=0.01 | Approximately 15.976631 |
| Undamped mean at t=50, Euler dt=0.01 | Approximately 15.979631 |
| Undamped mean at t=50, Euler dt=0.005 | Approximately 15.980073 |
| Undamped mean at t=50, Euler dt=0.0025 | Approximately 15.980291 |
| Undamped mean at t=50, solve_ivp reference | Approximately 15.980507 |
| Exact synchronized undamped gain at t=50 | 16 |

ODE reference tolerances are rtol=1e-10, atol=1e-12, max_step=0.02.
A sampled minimum is not a certified continuous global minimum. Numerical
references do not provide rigorous integration-error bounds.

The original pre-update history's last sample is t=49.99, not t=50.
The new harness returns correctly labeled elapsed times and separately reports
the integrated endpoint. A range of the last 100 mean values is neither an
edgewise range nor a sweep of the theorem interval.

Eight research regression tests cover exact synchronized upper and antiphase
lower Euler envelopes, undamped synchronized growth, edgewise bounds, correct
time labeling, reproducible local randomness, and invalid inputs. Existing
main-branch checks also passed: 19 sandbox engineering tests and three audit
tests. These are local checks, not P1/N1–N11 acceptance results or independent
validation. No conclusion about the separate draft challenge PR is made here.

## Boundaries and counterexamples

- Exact synchronized phases with equal zero intrinsic frequencies give R=1
  and zero phase motion. For gamma=0, K=K0+alpha*t; for gamma>0, gains
  remain bounded. Bounded gains do not imply non-stalling.
- A common frequency injection rotates every phase equally. It does not change
  phase differences, R, or the error from a coherence target.
- R approaching 1 is the selected run's outcome, not a universal-attractor
  theorem. Small phase offsets mean not every edge equals 1.6.
- The lower 0.4 bound is not visited in the default trajectory. The separate
  antiphase regression checks the lower discrete envelope without claiming
  finite-time attainment.
- An additive term tau in K-dot requires bounds on tau or a specified constrained
  gain law. A nonnegative safety score alone does not supply a lower gain bound.
- For an additive throttle -beta*S, an unrestricted S(t)=t can drive exact
  antiphase gains to negative infinity despite gamma>0.
- A state-dependent S=K^2 with initial K=-1 can cause finite-time negative gain
  blowup. This targets a different unconstrained throttled law and starts outside
  the unthrottled [0.4,1.6] interval; it does not contradict that theorem.

## Open controls and claim status

The provisional engineering target is r_star=(sqrt(5)-1)/2, approximately
0.618. It is not a universal critical threshold or a demonstrated optimum.
The implemented cosine adaptation contains no R-r_star feedback.

A safety floor requires an explicitly defined safe set, admissible initial
conditions, full control law and invariance proof. A progress certificate
requires a task state, goal set, admissible controls/transitions, a ranking or
distance function, and feasibility assumptions. Phase-velocity norms are
insufficient. At exact synchronization, the first phase derivative of R
vanishes, so a strict instantaneous decrease of (R-r_star)^2 can be infeasible
even when its error is nonzero.

All of those additions remain proposals. They must be versioned and tested
separately; no threshold changes or perturbations may silently acquire policy
authority. Future tests should compare task completion and false blocking,
including cases where safety and progress requirements cannot both be met.

## Literature context

Adaptive Kuramoto couplings are established prior work. The publisher abstracts
below were inspected; full theorem equivalence and novelty remain unassessed.

- [Ha, Noh, Park: Synchronization of Kuramoto Oscillators with Adaptive Couplings](https://doi.org/10.1137/15M101484X)
- [Emergent Dynamics of Kuramoto Oscillators with Adaptive Couplings: Conservation Law and Fast Learning](https://doi.org/10.1137/17M1124048)

Successful synthetic gain checks neither validate a theory of everything nor
establish the effectiveness of a software authorization architecture.
