import { NextResponse } from "next/server"
import { computeWobbleScore, type DiffMetrics } from "@/lib/guardian/wobble"
import { logAuditEvent } from "@/lib/audit/audit-logger"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const metrics: DiffMetrics = {
      filesChanged: body.filesChanged ?? 0,
      linesAdded: body.linesAdded ?? 0,
      linesDeleted: body.linesDeleted ?? 0,
      testCoverageDelta: body.testCoverageDelta ?? 0,
      dependencyRiskScore: body.dependencyRiskScore ?? 0,
      commitMessageClarity: body.commitMessageClarity ?? 0,
    }

    const score = computeWobbleScore(metrics)

    await logAuditEvent(
      body.actor ?? "guardian-api",
      "guardian.score",
      body.resource ?? "unknown-pr",
      { metrics, score }
    )

    return NextResponse.json({
      success: true,
      score,
      metrics,
    })
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    )
  }
}
