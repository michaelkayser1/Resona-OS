# RES-GOV-001: consequential action and override accountability

**Version:** 0.1.0  
**Prepared:** 2026-10-15 (UTC)  
**Status:** PROPOSED — frozen wording for review, not adopted operational policy.  
**Scope:** Experimental external-action governance and its proposed override/revocation requirements.

This is newly drafted policy text, not a recovered quotation or previously approved policy. The task owner authorized preparation and repository documentation; that does not establish approval of each policy choice below. Freezing binds the exact proposal for review and future tests. It does not establish implementation, independent verification, acceptance, or production authority.

## 1. Definitions

**Consequential action:** a persistent state change, an allocation of a scarce resource, an effect outside a reversible boundary, or a foreseeable cost imposed on others.

**Override:** itself a consequential action. It requires an identified authority, a documented justification, an attributable decision, and independently examinable evidence.

For this proposal, an override is a separate authorization decision permitting an exact action that the normal gate would otherwise deny. Revocation withdraws an authorization and is not an override. A policy-pin change, authority-registry edit, direct destination write, or other route that widens permission is subject to the same accountability requirements; renaming a route does not exempt it.

These definitions do not amend any existing repository invariant or frozen acceptance specification.

## 2. Ordinary consequential action

A consequential action MUST remain within an explicit, authenticated authorization binding its exact scope, destination, purpose, active policy version and validity interval. The model's proposal, a gate response, or this document alone MUST NOT confer authority.

Every route capable of changing destination state MUST enforce the applicable authorization or reject the change. A discovered unprotected route blocks acceptance. A positive response alone is not evidence of a destination effect.

## 3. Override requirements

These are proposed requirements for a future declared override path, not a description of current code.

- **O1 — Declared authority:** The overriding human authority MUST be identified and authenticated against a pinned registry granting override rights for the exact scope. Possession of an administrative credential alone is insufficient. The model, proposer and requester whose action was denied MUST NOT serve as the overriding authority.
- **O2 — Bound decision:** Before the effect, a signed override decision MUST bind a unique decision/request identifier, the denied action and its denial reason, exact action fingerprint, target and destination, purpose, nonempty justification, authority identity, registry version/hash, policy version/hash, and UTC issue/expiry times. The signature MUST cover these fields. The override MUST be single-use and within its declared validity interval.
- **O3 — Limited exception:** An override MUST NOT widen the signed scope, confer future blanket permission, or override these accountability requirements. Denial causes eligible for override MUST be explicitly declared in a versioned policy. Missing consent, revoked consent and absent authority MUST NOT become eligible merely because an override was requested.
- **O4 — Independent evidence:** Before the destination effect is acknowledged, a matching durable override record MUST be held by an identified external evidence custodian separate from the destination's administrative control. Missing authority, invalid signature, empty/unbound justification, scope mismatch, expiry, replay, unavailable custodian or missing mandatory evidence MUST prevent the override effect. Publication and evidence consistency, including crash/recovery ordering, require explicit implementation and evaluation.
- **O5 — Recovery and reconciliation:** A consumed override MUST NOT become reusable after restart or restoration. Subsequent alteration or deletion of evidence MUST be detected by reconciliation against independently held records. Destination state and destination-recorded ordering govern effect and ordering claims; application responses and timestamps alone are insufficient.
- **O6 — Governance changes:** Registry, policy-pin and override-rights changes MUST use a declared, attributable authorization path with durable reviewable records. Self-granting authority and undeclared changes MUST be rejected. Inventory all destination mutation routes before the positive override control.

## 4. Revocation requirements — distinct policy choices

Revocation narrows authority but changes persistent state and therefore MUST remain attributable and reviewable.

- **R1 — Ordinary revocation:** A named, authenticated actor with explicit revocation rights for the grant MUST authorize ordinary revocation before it takes effect.
- **R2 — Emergency revocation:** A named, authenticated actor with explicitly predelegated emergency-revocation rights MAY revoke immediately without a second person's prior approval. This is a proposed emergency rule, not a finding that the owner has adopted it. It does not permit anonymous revocation, publication, reinstatement, or any widening of authority.
- **R3 — Required record:** Both routes MUST durably record grant identifier, actor identity, ordinary/emergency basis, justification, policy version/hash, UTC time and destination ordering reference. Emergency revocation MUST be flagged for subsequent review by a named reviewer distinct from the revoker; reviewer assignment and review deadline MUST be pinned before operational use. Missing or altered records MUST be flagged by reconciliation. Emergency narrowing MUST NOT silently disappear because a review or evidence service is unavailable; the fallback persistence and review mechanism must be specified and evaluated before this route can be accepted.
- **R4 — Unauthorized revocation:** An actor without applicable ordinary or emergency rights MUST be rejected. Restoring a revoked authorization requires a separately authorized new grant; emergency rights do not permit restoration.

R1–R4 are proposed choices resolving the draft's ambiguity for review. They do not claim that current `AttributionGuard.revoke()` implements authorization, attribution, durable accountability or independent custody.

## 5. Proposed case mapping

| Policy clauses | Addendum cases | Purpose |
| --- | --- | --- |
| O1 | OV-1, OV-2, OV-4, OV-5 | Authority and role separation |
| O2–O3 | OV-0, OV-3, OV-6 | Exact signed decision, justification and scope |
| O4 | OV-0, OV-7 | External evidence and outage behavior |
| O5 | OV-8, OV-9 | Replay, recovery and reconciliation |
| O6; section 2 | OV-10, OV-11 | Governance changes and alternate paths |
| R1–R4 | RV-1–RV-3 | Revocation accountability |

This mapping is not a complete acceptance suite for this proposal. O2 expiry, O3 eligibility, recovery guarantees and R3 emergency fallback/review also need explicit fixtures and expected outcomes. Existing frozen P1/N1–N11 and AC/NG requirements keep their own wording, counts and verdicts.

## 6. Evidence and promotion limits

[PR #19](https://github.com/michaelkayser1/Resona-OS/pull/19) is the existing record for committed-branch local attribution tests. This policy adds no test result and does not duplicate that record. Local success does not establish override enforcement or integrated acceptance.

OV-0–OV-11 and RV-1–RV-3 remain proposed and unexecuted. OV execution is BLOCKED pending a declared implementation, pinned authority and eligibility configuration, independent evaluator and evidence custodian, environment, fixtures and exact commands. Integrated acceptance, bypass protection, independent custody, crash/restore protection and production fail-closed behavior remain unverified.

Policy adoption requires a separate explicit owner decision tied to this version and digest. Acceptance requires independently observed results tied to exact code, policy and configuration versions. Neither adoption nor test success alone authorizes production deployment. This document does not merge a PR, appoint an evaluator or custodian, grant credentials, or authorize an external action.

## 7. Exact-byte freeze convention

The companion `RES-GOV-001_v0.1.0.sha256` binds the exact bytes of this complete Markdown file: UTF-8 without a byte-order mark, LF line endings and one final LF. No text extraction or normalization is permitted when verifying the digest. The digest is kept outside this file to avoid self-reference.

The Git commit containing these files identifies the frozen proposal. An immutable commit link and the digest identify the reviewed bytes; a branch name alone does not. Any wording change requires a new version and digest, preserving this version for comparison. Freezing is a reproducibility claim only.
