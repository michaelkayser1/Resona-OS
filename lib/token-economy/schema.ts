import { z } from "zod"

export const EpistemicTag = z.enum(["OBS", "EVI", "HYP", "INF", "MISS"])
export const ContributionClass = z.enum([
  "OBSERVE",
  "VERIFY",
  "CORRECT",
  "BUILD",
  "CARE",
  "TRANSLATE",
  "GUARD",
  "LAND",
])
export const TokenClass = z.enum(["RR", "CC"])
export const EventState = z.enum([
  "OBSERVED",
  "CONTACT_DEFINED",
  "REALITY_PENDING",
  "REALITY_RECEIVED",
  "UNDER_REVIEW",
  "VERIFIED",
  "ADMITTED",
  "REWARDED",
  "REDEEMED",
  "REVISED",
  "RETRACTED",
  "DORMANT",
  "DISPUTED",
])

export const WeatherCondition = z.object({
  temperatureC: z.number().optional(),
  precipitation: z.enum(["none", "rain", "drizzle", "snow", "unknown"]).optional(),
  precipitationMm: z.number().nonnegative().optional(),
  wind: z.enum(["calm", "low", "gusting", "unknown"]).optional(),
  windMph: z.number().nonnegative().optional(),
  pressureHpa: z.number().positive().optional(),
  pressureTrend: z.enum(["rising", "falling", "steady", "unknown"]).optional(),
  humidityPct: z.number().min(0).max(100).optional(),
  illumination: z.enum(["daylight", "dusk", "night", "unknown"]).optional(),
  lux: z.number().nonnegative().optional(),
  source: z.enum(["on_site_sensor", "nearest_station", "observer_estimate"]),
})

// eventId is an opaque immutable identifier. Similarity windows are policy inputs,
// not values embedded in a hash. dedupKey is derived from an explicit bucket start
// and a versioned canonicalization policy so replay does not depend on hidden tolerance.
export const EventIdentity = z.object({
  eventId: z.string().uuid(),
  dedupKey: z.string().min(1),
  bucketStartedAt: z.string().datetime({ offset: true }),
  identityPolicyVersion: z.string().min(1),
})

const BaseEvent = z.object({
  identity: EventIdentity,
  occurredAt: z.string().datetime({ offset: true }),
  locationId: z.string().min(1),
  contributorId: z.string().min(1),
  evidenceRefs: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1),
  weather: WeatherCondition.optional(),
})

// OBS and MISS remain direct capture. Estimates and interpretations cannot be
// inserted into these records; they must be appended as HYP or INF records.
export const RawEvent = z.discriminatedUnion("epistemicTag", [
  BaseEvent.extend({
    epistemicTag: z.literal("OBS"),
    observedFact: z.string().min(1),
    sourceType: z.enum(["direct_observer", "on_site_sensor", "external_source"]),
  }).strict(),
  BaseEvent.extend({
    epistemicTag: z.literal("MISS"),
    checkedIntervalStart: z.string().datetime({ offset: true }),
    checkedIntervalEnd: z.string().datetime({ offset: true }),
    reviewMethod: z.enum(["video_review", "sensor_review", "direct_observation"]),
    observedFact: z.literal("no_event_seen"),
  }).strict(),
])

export const InterpretiveEvent = z.object({
  interpretationId: z.string().uuid(),
  subjectEventId: z.string().uuid(),
  epistemicTag: z.enum(["HYP", "INF"]),
  claim: z.string().min(1),
  basisRefs: z.array(z.string()).min(1),
  confidence: z.number().min(0).max(1),
  createdAt: z.string().datetime({ offset: true }),
}).strict()

// Corroboration is append-only. Counts are projections computed from records;
// no contribution row contains a mutable corroboration counter.
export const CorroborationRecord = z.object({
  corroborationId: z.string().uuid(),
  subjectEventId: z.string().uuid(),
  corroboratingEventId: z.string().uuid(),
  independenceBasis: z.string().min(1),
  matchingPolicyVersion: z.string().min(1),
  appendedAt: z.string().datetime({ offset: true }),
}).strict()

export const Contribution = z.object({
  contributionId: z.string().uuid(),
  subjectEventId: z.string().uuid(),
  contributorId: z.string().min(1),
  contributionClass: ContributionClass,
  claim: z.string().min(1),
  evidenceRefs: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1),
  state: EventState.default("OBSERVED"),
}).strict()

export const AdmissionDecision = z.object({
  decisionId: z.string().uuid(),
  witnessRecordId: z.string().uuid(),
  authorityReceiptId: z.string().uuid(),
  disposition: z.enum([
    "ADMIT_CORE",
    "ADMIT_PROVISIONAL",
    "ADMIT_CONTESTED",
    "QUARANTINE",
    "DEFER",
    "REJECT",
  ]),
  policyVersion: z.string().min(1),
  decidedAt: z.string().datetime({ offset: true }),
}).strict()

export const MintReceipt = z.object({
  receiptId: z.string().uuid(),
  contributionId: z.string().uuid(),
  admissionDecisionId: z.string().uuid(),
  contributorId: z.string().min(1),
  tokenClass: TokenClass,
  amount: z.number().int().nonnegative(),
  claim: z.string().min(1),
  evidenceRefs: z.array(z.string()).min(1),
  provenanceRefs: z.array(z.string()).default([]),
  alternativesConsidered: z.array(z.string()).default([]),
  uncertainty: z.number().min(0).max(1),
  authorityBasis: z.string().min(1),
  policyVersion: z.string().min(1),
  approvalRequirement: z.enum(["single", "dual"]),
  approvals: z.array(z.string()).min(1),
  previousHash: z.string().min(1),
  eventHash: z.string().min(1),
  issuedAt: z.string().datetime({ offset: true }),
  reversible: z.boolean().default(true),
  proposedByAgent: z.boolean().default(false),
  humanBound: z.boolean().default(false),
}).strict()

export type RawEvent = z.infer<typeof RawEvent>
export type InterpretiveEvent = z.infer<typeof InterpretiveEvent>
export type CorroborationRecord = z.infer<typeof CorroborationRecord>
export type Contribution = z.infer<typeof Contribution>
export type AdmissionDecision = z.infer<typeof AdmissionDecision>
export type MintReceipt = z.infer<typeof MintReceipt>
