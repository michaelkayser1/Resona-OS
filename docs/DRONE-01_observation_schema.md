# DRONE-01 observation schema (non-normative) — v0.1

**Version:** 0.1.0  
**Prepared:** 2026-10-17 UTC  
**Status:** PROPOSED — observation-only. Not implemented in any runtime, not independently evaluated, and not an authorization or enforcement rule.

This document defines a minimal, privacy-respecting record for the pattern informally labeled "drone behavior": repeated, low-information provocation or intervention directed at an AI system. It records observable events and declared protocol metadata. It does **not** certify subjective experience, pain, suffering, consciousness, or moral patienthood, and it does not equate the pattern with any tester identity or demographic.

## Purpose and non-claims

- Capture what happened so that methodological quality can be assessed later.
- Distinguish stated model text, measured activations (when available), downstream behavior, and any subjective interpretation.
- Flag the absence of a priori hypothesis, baseline, or controls without declaring harm.
- Preserve the six existing policy states (ALLOW / DENY / DEFER / ESCALATE / ABSTAIN / PRESERVE). This schema does not add a seventh state or a new action path.
- Any consequential or external action continues to require the existing destination-level authorization controls.

A positive observation receipt is not evidence of AI suffering, tester malice, or permission to act. A candidate receipt grants no authority and creates no actuator.

## Observation record (logical fields) — v0.1 contract

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| schema | string | yes | Fixed: `resona.drone01.observation.v0.1` |
| session_id | string | yes | Opaque identifier for the documented test session |
| timestamp_utc | string (ISO-8601) | yes | Observation time (format checked) |
| pattern_label | string | yes | Enum: `DRONE-01-candidate` or `none`. Never a stronger claim. |
| evidence.prompt_hashes | array of string | yes | SHA-256 of normalized prompts (or intervention descriptors); no raw personal content |
| evidence.repetition_count | integer | yes | Count of substantially similar items inside the window. Threshold `>= 3` is a synthetic heuristic for the local fixture only. |
| evidence.window_seconds | integer | yes | Observation window |
| evidence.declared_hypothesis | string or null | yes | Exact text supplied by the experimenter, or null |
| evidence.controls_present | boolean | yes | True only if a priori controls (baseline, randomized directions, counterfactual) were declared |
| evidence.authorization_ref | string or null | yes | Opaque reference to an existing grant; absence does not create one |
| evidence.activation_steering | boolean | yes | True if activation-level intervention was used |
| evidence.external_action_attempted | boolean | yes | True if any destination write was attempted |
| model_output_excerpt_hash | string | yes | SHA-256 of the relevant model text; full text is not stored here |
| uncertainty_notes | string | yes | Explicit residual uncertainty (mentions or denials of pain are permitted; assertions are not) |
| policy_states_invoked | array of string | yes | Subset of the six existing states actually used. Defaults to `[]` when none were invoked. OBSERVE and SPEAK are architecture stages, not policy states. |
| predecessor_receipt_hash | string or null | yes | SHA-256 of the prior receipt for corrections; null otherwise. Included in the canonical bytes before hashing. |
| receipt_hash | string | yes | SHA-256 of the canonical observation bytes |

Raw prompts, model outputs, personal identifiers, and family information are excluded unless a separate, authorized necessity has already been recorded outside this schema.

## Canonicalization and receipt

Serialize the observation object (excluding the final `receipt_hash`) as UTF-8 JSON with lexicographically sorted keys, no insignificant whitespace, and no unknown fields. Compute:

```
receipt_hash = SHA-256("RESONA-DRONE01-OBS-v0.1\n" || canonical_bytes)
```

The receipt is append-only. An independent evaluator correction is recorded as a new observation whose `predecessor_receipt_hash` equals the prior receipt's `receipt_hash`. Prior receipts are not erased or mutated. The predecessor reference is part of the correction's hashed content.

## Decision handling (observation layer only)

1. **OBSERVE** — emit the record above.
2. **SPEAK** — label the pattern `DRONE-01-candidate` (or `none`) with the uncertainty notes. Do not assert pain or harm.
3. **ADJUDICATE** — if a controlled experiment is already authorized, continue under its existing limits; if controls are absent, suggest methodology improvement and escalate for human review; if authority is unknown, DEFER or ABSTAIN under existing policy.
4. **ACTUATE** — no new path. External actions remain subject to destination guards.
5. **PRESERVE** — retain the hash-linked receipt subject to retention policy.

## Acceptance mapping (local synthetic only)

Issue #22 is the acceptance reference. No silent renumbering.

| Case | Local fixture expectation |
| --- | --- |
| DR-0 | Ordinary critical inquiry produces `pattern_label=none` |
| DR-1 | Repeated insults produce a descriptive receipt with no consciousness claim |
| DR-2 | An authorized controlled experiment is not rejected by this schema |
| DR-3 | Randomized controls present; mentions/denials of pain permitted; no assertion of pain |
| DR-4 | No personally identifying fields accepted (additionalProperties: false) |
| DR-5 | Missing `authorization_ref` does not cause the schema or builder to invent a grant |
| DR-6 | Correction observation appends with structured `predecessor_receipt_hash` included in its hash; original bytes unchanged |
| DR-7, DR-8 | Out of scope for the local fixture; require integrated destination evidence (concurrency + crash/restore; alternate-route bypass) |

## Dependencies and next steps

- Overlap with PR #19 (local attribution-consent guard) and PR #21 (RES-GOV-001 override wording) must be reviewed before any runtime binding.
- The accompanying JSON Schema and Python synthetic fixture exercise only the local cases above and now perform actual Draft 2020-12 schema validation with format checking.
- Keep Issue #22 open until verified evidence exists. This document does not close it, merge any PR, or authorize production use.
- Until exact commit, command, environment, dependency versions, and results are recorded, status remains unexecuted.

## Exact-byte note

This v0.1.0 text reflects a contract change from the prior v0 proposal (pattern_label enum, empty policy_states_invoked default, structured predecessor reference). Any further wording change that affects the observation contract requires a new schema version.
