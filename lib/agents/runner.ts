/**
 * Agent Runner Framework
 * Orchestrates agent worktree lifecycle:
 * spawn -> build -> test -> score -> commit -> merge
 */

import type { AgentType, AgentRun, AgentStatus } from "./types"
import { logAuditEvent } from "../audit/audit-logger"
import { computeWobbleScore, type DiffMetrics } from "../guardian/wobble"

let runCounter = 100

function generateRunId(): string {
  runCounter++
  return `run_${runCounter.toString().padStart(3, "0")}`
}

export interface SpawnOptions {
  agentType: AgentType
  scope?: string
  actor?: string
}

export async function spawnAgent(options: SpawnOptions): Promise<AgentRun> {
  const id = generateRunId()
  const branch = `agent/${options.agentType}-${Date.now().toString(36)}`

  await logAuditEvent(
    options.actor ?? "system",
    "agent.spawn",
    branch,
    { agentType: options.agentType, scope: options.scope }
  )

  const run: AgentRun = {
    id,
    agentType: options.agentType,
    branch,
    status: "spawning",
    guardianScore: null,
    filesChanged: 0,
    linesAdded: 0,
    linesDeleted: 0,
    startedAt: new Date().toISOString(),
    completedAt: null,
    commitHash: null,
    summary: `Agent ${options.agentType} spawning...`,
  }

  return run
}

export async function completeAgent(
  run: AgentRun,
  result: {
    filesChanged: number
    linesAdded: number
    linesDeleted: number
    commitHash: string
    summary: string
  }
): Promise<AgentRun> {
  const metrics: DiffMetrics = {
    filesChanged: result.filesChanged,
    linesAdded: result.linesAdded,
    linesDeleted: result.linesDeleted,
    testCoverageDelta: 0,
    dependencyRiskScore: 0.1,
    commitMessageClarity: 0.8,
  }

  const score = computeWobbleScore(metrics)

  await logAuditEvent(
    run.agentType,
    "agent.commit",
    run.branch,
    { commitHash: result.commitHash, score: score.stabilityScore }
  )

  const updated: AgentRun = {
    ...run,
    status: "committed" as AgentStatus,
    guardianScore: score.stabilityScore,
    filesChanged: result.filesChanged,
    linesAdded: result.linesAdded,
    linesDeleted: result.linesDeleted,
    completedAt: new Date().toISOString(),
    commitHash: result.commitHash,
    summary: result.summary,
  }

  return updated
}

export async function mergeAgent(run: AgentRun): Promise<AgentRun> {
  if (!run.guardianScore || run.guardianScore < 0.75) {
    await logAuditEvent(
      "guardian",
      "guardian.reject",
      run.branch,
      { score: run.guardianScore, reason: "Below merge threshold" }
    )
    return { ...run, status: "failed" as AgentStatus }
  }

  await logAuditEvent(
    "guardian",
    "guardian.approve",
    run.branch,
    { score: run.guardianScore }
  )

  return { ...run, status: "merged" as AgentStatus }
}
