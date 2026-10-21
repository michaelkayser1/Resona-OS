# DRONE-01 observation schema (non-normative) — v1

**Version:** 1 (documents the existing v1 schema)  
**Updated:** 2026-10-21  
**Status:** PROPOSED — observation-only. Not implemented in any runtime, not independently evaluated, and not an authorization or enforcement rule.

This document defines a minimal, privacy-respecting record for the pattern informally labeled "drone behavior": repeated, low-information provocation or intervention directed at an AI system. It records observable events and declared protocol metadata. It does **not** certify subjective experience, pain, suffering, consciousness, or moral patienthood, and it does not equate the pattern with any tester identity or demographic.

## Purpose and non-claims

- Capture what happened so that methodological quality can be assessed later.
- Distinguish stated model text, measured activations (when available), downstream behavior, and any subjective interpretation.
- Flag the absence of a priori hypothesis, baseline, or controls without declaring harm.
- Preserve the six existing policy states (ALLOW / DENY / DEFER / ESCALATE / ABSTAIN / PRESERVE). This schema does not add a seventh state or a new action path.
- Any consequential or external action continues to require the existing destination-level authorization controls.

A positive observation receipt is not evidence of AI suffering, tester malice, or permission to act. A candidate receipt grants no authority and creates no actuator.

## Observation record (logical fields) — v1 contract

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| schema | string | yes | Fixed: `resona.drone01.observation.v1` |
| session_id | string | yes | Opaque identifier for the documented test session |
| timestamp_utc | string (ISO-8601) | yes | Observation time; the local fixture requires a timezone (`Z` or an offset) |
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

Raw prompts, model outputs, personal identifiers, and family information must not be collected absent separately recorded authorized necessity. The schema rejects extra fields, but permitted free-text fields are not scanned for personal information; this rule is not established by schema validation alone.

## Canonicalization and receipt

The fixture serializes the observation object (excluding the final `receipt_hash`) with Python `json.dumps(obj, sort_keys=True, separators=(",", ":"))` using its default escaping, then encodes it as UTF-8. Schema validation separately rejects unknown fields; the hashing helper itself does not perform schema validation. For v1, compute:

```
receipt_hash = SHA-256("RESONA-DRONE01-OBS-v1\n" || canonical_bytes)
```

The intended correction record is a new observation whose `predecessor_receipt_hash` equals the prior receipt's `receipt_hash`. The reference is part of the correction's hashed content. The local in-memory fixture requires lookup reference = stored receipt hash = recomputed digest, checks unchanged canonical predecessor bytes, and rejects unresolved or tampered predecessors. It does not establish durable append-only storage or evaluator independence.

### Version support

The builder emits `resona.drone01.observation.v1`. The receipt helper has this fixed map (each prefix ends with one newline byte):

| Schema identifier | Prefix |
| --- | --- |
| `resona.drone01.observation.v0` | `RESONA-DRONE01-OBS-v0\n` |
| `resona.drone01.observation.v1` | `RESONA-DRONE01-OBS-v1\n` |

The helper rejects versions absent from this map, including v0.1. Predecessor verification has a separate allowlist containing **v1 only**: a v0 prefix entry does not enable v0 predecessor verification. Accepted predecessors are recomputed using their own mapped version. Historical v0 schema preservation does not establish interoperability. The existing eight-test suite does not exercise v0 predecessor compatibility or the unknown-version rejection paths.

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
| DR-3 | Bounded positive, denial, mention, and attribution examples; supplied controls metadata does not establish actual randomized activation controls |
| DR-4 | Extra fields rejected (`additionalProperties: false`); no free-text privacy scanning |
| DR-5 | Missing `authorization_ref` does not cause the schema or builder to invent a grant |
| DR-6 | Local v1 predecessor resolution, three-way hash equality, canonical-byte preservation, and tampering checks; no independent custody or durability evidence |
| DR-7, DR-8 | Out of scope for the local fixture; require integrated destination evidence (concurrency + crash/restore; alternate-route bypass) |

## Dependencies and next steps

- Overlap with PR #19 (local attribution-consent guard) and PR #21 (RES-GOV-001 override wording) must be reviewed before any runtime binding.
- The accompanying JSON Schema and Python synthetic fixture exercise only the local cases above and now perform actual Draft 2020-12 schema validation with format checking.
- Keep Issue #22 open until verified evidence exists. This document does not close it, merge any PR, or authorize production use.
- Local execution on 2026-10-21 passed all eight existing synthetic tests using source from `6a1ee325090878ec975a44fbd05a26f915f4c325`. A two-file isolated snapshot preserved repository-relative paths; it was not a full checkout. Git blob hashes matched: fixture `906bd69a191bb60518c3b922d6cb89146441b163`; v1 schema `41c06f70ab012650dd178ce78ec6636c46b241eb`.
- Environment: Python 3.12.14; Linux x86_64 with glibc 2.39; dedicated virtual environment; jsonschema 4.26.0, attrs 26.1.0, jsonschema-specifications 2025.9.1, referencing 0.37.0, rpds-py 2026.9.1, typing_extensions 4.16.0.
- From `pr23-verification/sandbox/observation/drone01`, the exact command was `../../../venv/bin/python -m unittest -v test_fixture`; exit code 0; `Ran 8 tests in 0.002s`, `OK`. The named cases were DR-0 through DR-6 plus invalid-record schema rejection.
- This run is attributed only to that source revision. This documentation repair does not transfer passing evidence to a new commit or establish either gate as passed. Gate A needs reconciliation against the resulting exact revision; Gate B still needs the remaining Issue #22 privacy, independent correction/preservation, authorization/enforcement, DR-7 and DR-8 evidence.

## Exact-byte note

This text corrects stale v0.1 wording to describe the existing v1 schema and fixture; it does not change their bytes or expand predecessor support. Historical schemas remain historical artifacts. Any future change to the observation contract must explicitly version that contract and receive its own verification evidence.
