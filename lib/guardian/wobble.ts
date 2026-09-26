/**
 * Guardian Wobble Scoring Engine
 * Deterministic merge gate that evaluates PR quality
 * based on diff metrics, test coverage, and risk factors.
 */

export interface DiffMetrics {
  filesChanged: number
  linesAdded: number
  linesDeleted: number
  testCoverageDelta: number
  dependencyRiskScore: number
  commitMessageClarity: number
}

export interface GuardianScore {
  stabilityScore: number
  regulatoryRisk: "low" | "moderate" | "high"
  recommendation: "merge" | "revise" | "reject"
  breakdown: {
    diffComplexity: number
    testConfidence: number
    dependencyRisk: number
    commitQuality: number
  }
}

const WEIGHTS = {
  diffComplexity: 0.30,
  testConfidence: 0.35,
  dependencyRisk: 0.20,
  commitQuality: 0.15,
} as const

function scoreDiffComplexity(metrics: DiffMetrics): number {
  const totalLines = metrics.linesAdded + metrics.linesDeleted
  const fileScale = Math.min(metrics.filesChanged / 20, 1)
  const lineScale = Math.min(totalLines / 1000, 1)
  return Math.max(0, 1 - (fileScale * 0.5 + lineScale * 0.5))
}

function scoreTestConfidence(metrics: DiffMetrics): number {
  const delta = metrics.testCoverageDelta
  if (delta >= 5) return 1.0
  if (delta >= 0) return 0.8
  if (delta >= -5) return 0.5
  return 0.2
}

function scoreDependencyRisk(metrics: DiffMetrics): number {
  return Math.max(0, 1 - metrics.dependencyRiskScore)
}

function scoreCommitQuality(metrics: DiffMetrics): number {
  return Math.max(0, Math.min(1, metrics.commitMessageClarity))
}

export function computeWobbleScore(metrics: DiffMetrics): GuardianScore {
  const breakdown = {
    diffComplexity: scoreDiffComplexity(metrics),
    testConfidence: scoreTestConfidence(metrics),
    dependencyRisk: scoreDependencyRisk(metrics),
    commitQuality: scoreCommitQuality(metrics),
  }

  const stabilityScore =
    breakdown.diffComplexity * WEIGHTS.diffComplexity +
    breakdown.testConfidence * WEIGHTS.testConfidence +
    breakdown.dependencyRisk * WEIGHTS.dependencyRisk +
    breakdown.commitQuality * WEIGHTS.commitQuality

  const roundedScore = Math.round(stabilityScore * 100) / 100

  let regulatoryRisk: "low" | "moderate" | "high"
  if (roundedScore >= 0.75) regulatoryRisk = "low"
  else if (roundedScore >= 0.6) regulatoryRisk = "moderate"
  else regulatoryRisk = "high"

  let recommendation: "merge" | "revise" | "reject"
  if (roundedScore >= 0.75) recommendation = "merge"
  else if (roundedScore >= 0.6) recommendation = "revise"
  else recommendation = "reject"

  return {
    stabilityScore: roundedScore,
    regulatoryRisk,
    recommendation,
    breakdown,
  }
}
