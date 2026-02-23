import { NextResponse } from "next/server"
import { getAuditChain, verifyChainIntegrity, logAuditEvent } from "@/lib/audit/audit-logger"

export async function GET() {
  const chain = getAuditChain()
  const integrity = await verifyChainIntegrity()

  return NextResponse.json({
    events: chain,
    integrity,
    count: chain.length,
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const event = await logAuditEvent(
      body.actor ?? "system",
      body.action ?? "agent.spawn",
      body.resource ?? "unknown",
      body.metadata ?? {}
    )

    return NextResponse.json({
      success: true,
      event,
    })
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    )
  }
}
