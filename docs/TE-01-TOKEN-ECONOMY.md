# TE-01 — The Living Token Economy

**Status:** Prototype design; minting blocked

## Provenance correction

The initial PR summary incorrectly stated that the field additions had been approved. They had not. Three defects were explicitly identified before this correction:

1. An `EVENT_ID` hash cannot contain an unspecified timestamp tolerance.
2. `CORROBORATION_COUNT` cannot be mutated inside an append-only record.
3. Estimated values cannot cross the `[OBS]` membrane merely because they appear in a structured line.

The schema now treats event identity as an opaque UUID plus a separately derived, versioned deduplication key using an explicit bucket start. Corroboration is represented by appended records, and counts are projections. Estimates and interpretations must be appended as `[HYP]` or `[INF]`, not embedded in `[OBS]` or `[MISS]`.

## Constitutional rule

> The token never outranks the living field that produced it.

TE-01 separates evidence, contribution, utility, governance, identity, and authority.

| Layer | Object | Transferable | Purchasable | Truth authority |
|---|---|---:|---:|---:|
| Evidence | Witness Record | No | No | Supports claims only |
| Contribution | Resonance Receipt (RR) | No | No | No |
| Utility | Coherence Credit (CC) | Bounded | Yes | No |
| Governance | Stewardship Mandate | No | No | Scope-limited |
| Identity | Human or agent identity | No | No | No |
| Authority | Explicit role grant | No | No | Scope-limited |

## Load-bearing transition

`DROP → CONTACT → WITNESS → ADMISSION → RECEIPT → OPTIONAL CREDIT → USE → LANDING → RETURN`

The load-bearing transition is:

> **Witness Record → Admission Decision**

Everything before admission is capture and preservation. Everything after admission is consequence. Whoever controls admission authority controls access to minting, regardless of how the token layer is described.

Admission therefore requires an independently inspectable authority receipt, a versioned policy, and a durable decision record. Coherence, popularity, ownership, or token balance cannot confer admission authority.

## Known v0 limitation: not yet an economy

The current deployment has one principal designer, likely contributor, admission authority, and auditor. Under those conditions, Coherence Credits would be self-issued even when the software separates the fields correctly.

Accordingly:

- no CC minting is authorized;
- no financial rails are connected;
- no claim is made that the current prototype constitutes an independent economy;
- the v0 is a scoring and receipt rubric awaiting separation of offices;
- an admitter may not benefit from the mint decision without independent authorization;
- infrastructure-layer model review is not treated as independent review when that model helped shape the specification.

A reviewer with no prior participation in the design is required before any minting pilot.

## Witness is untokenized

The Witness function must remain unpaid.

Witness preserves contact, provenance, and checked absence. It does not earn RR or CC merely for witnessing. Paying for witness activity would create pressure to over-witness, inflate `[MISS]` entries, and convert the anti-bias layer into a production target.

This does not prohibit compensating a person's separately contracted time or infrastructure costs. It prohibits making the number or content of Witness records itself the basis of reward.

> Witness has no jurisdiction and no yield.

Verification, correction, building, care, translation, guarding, and landing may become contribution candidates only after they are separated from the neutral Witness act.

## RAW and interpretive membrane

`[OBS]` and `[MISS]` contain direct or externally sourced capture only.

- Observer estimates must identify their source but cannot be represented as directly observed facts.
- Derived mass, inferred route, motive, intent, probability, or causal linkage must be appended as `[HYP]` or `[INF]` with basis references and confidence.
- Free-form metadata may not be used to smuggle interpretive claims into RAW.

## Event identity and corroboration

`event_id` is an immutable opaque identifier.

A deduplication key may be derived from:

- explicit bucket start;
- location;
- species or subject class;
- action class;
- versioned canonicalization policy.

The bucket width belongs to the policy version. It is not an invisible `± tolerance` inside the hash.

Corroboration is an appended relationship record containing the subject event, corroborating event, independence basis, matching policy version, and timestamp. `corroboration_count` is a query projection and never an authoritative mutable field.

## Required states

`OBSERVED`, `CONTACT_DEFINED`, `REALITY_PENDING`, `REALITY_RECEIVED`, `UNDER_REVIEW`, `VERIFIED`, `ADMITTED`, `REWARDED`, `REDEEMED`, `REVISED`, `RETRACTED`, `DORMANT`, `DISPUTED`.

Unresolved events may change attention, but cannot change baseline truth, mint spendable value, or alter governance.

## Contribution classes

- `VERIFY` — independent evidence beyond neutral Witness capture
- `CORRECT` — repair of an inaccurate claim, record, model, or output
- `BUILD` — code, writing, research, design, documentation, infrastructure
- `CARE` — work preserving another person's safe participation
- `TRANSLATE` — faithful movement across languages, disciplines, cultures, or accessibility layers
- `GUARD` — prevention of unsafe release, capture, privacy loss, or premature closure
- `LAND` — documentation of real-world outcome, failure, adoption, or unresolved remainder

`OBSERVE` is retained as a descriptive classification for ingestion compatibility but is not reward-eligible while it overlaps the Witness function.

## Anti-Goodhart controls

- Witness records generate no token yield.
- No reward for raw volume.
- Diminishing rewards for repeated equivalent actions.
- Delayed landing reserve for significant awards.
- Correction dividends for genuine error discovery.
- No secret multipliers.
- Retractions remain visible and linked.
- No actor may be sole observer, evaluator, authorizer, and beneficiary of the same mint.
- No admission authority may be purchased or inferred from token balance.

## AI boundary

AI agents may extract evidence, detect duplication, compare claims, propose scores, and draft receipts. They may not independently mint CC, certify their own work, grant themselves authority, resolve disputes involving themselves, change policy, erase ledger history, or qualify as independent reviewers of a design they helped produce.

Every AI proposal is marked `PROPOSED_BY_AGENT` and `NOT_YET_HUMAN_BOUND`.

## Field pilot: Bird Feeder Commons

The first low-stakes pilot records wildlife observations, corrections, maintenance, environmental context, and outcomes. It tests duplicate detection, image evidence, uncertainty, correction handling, and landing receipts.

RAW observation itself is unpaid. Only separately admitted work such as a verified correction, feeder maintenance, accessibility work, or completed landing may become a contribution candidate.

Honorary event class:

`FIELD_DISRUPTION — Unauthorized Buffet Optimization`

No financial reward for the raccoon.

## Invariants

1. **Token–Reality:** A token cannot serve as evidence for the event that authorized it.
2. **Non-Sovereignty:** Tokens confer utility only within declared scope.
3. **Reversibility:** Financial effects are reversible through linked entries; history is never silently deleted.
4. **Contribution Dignity:** Unrecognized work is not valueless because the system failed to tokenize it.
5. **Untokenizable Witness:** Witness records and checked absence do not generate token yield.
6. **Untokenizable Remainder:** Every program declares what it refuses to price.
7. **Landing:** Significant rewards require a documented landing or an explicit unresolved reserve.
8. **No Self-Certification:** Separation of observer, evaluator, authorizer, and beneficiary is mandatory.
9. **Admission Independence:** An admission decision that benefits its admitter requires independent authorization.
10. **Review Independence:** Participation in specification design must be disclosed and disqualifies a reviewer from being labeled independent.
11. **Geometry Revision:** When behavior exploits the policy, revise the geometry rather than blaming reality.
