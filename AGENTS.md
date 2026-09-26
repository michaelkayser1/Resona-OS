# AGENTS.md

## System Constraint Policy

This repository implements deterministic middleware logic.

All AI agents interacting with this codebase must adhere to the following constraints:

1. No architectural refactors without explicit instruction.
2. No modification of invariant definitions.
3. No silent parameter tuning.
4. All time handling must be UTC.
5. All computation must be reproducible and side-effect free.
6. Tests must pass before proposing structural changes.

If a generated change conflicts with these rules, the change is invalid.

This system prioritizes determinism, stability, and auditability over optimization.
