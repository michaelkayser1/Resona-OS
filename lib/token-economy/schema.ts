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

export const Contribution = z.object({
  contributionId: z.string().uuid(),
  eventId: z.string().min(1),
  occurredAt: z.string().datetime({ offset: true }),
  locationId: z.string().min(1),
  contributorId: z.string().min(1),
  contributionClass: ContributionClass,
  epistemicTag: EpistemicTag,
  claim: z.string().min(1),
  evidenceRefs: z.array(z.string()).default([]),
  corroborationCount: z.number().int().nonnegative().default(0),
  confidence: z.number().min(0).max(1),
  state: EventState.default("OBSERVED"),
  weather: WeatherCondition.optional(),
  metadata: z.record(z.unknown()).default({}),
})

export const MintReceipt = z.object({
  receiptId: z.string().uuid(),
  contributionId: z.string().uuid(),
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
  approvalRequirement: z.enum(["none", "single", "dual"]),
  approvals: z.array(z.string()).default([]),
  previousHash: z.string().min(1),
  eventHash: z.string().min(1),
  issuedAt: z.string().datetime({ offset: true }),
  reversible: z.boolean().default(true),
  proposedByAgent: z.boolean().default(false),
  humanBound: z.boolean().default(false),
})

export type Contribution = z.infer<typeof Contribution>
export type MintReceipt = z.infer<typeof MintReceipt>
