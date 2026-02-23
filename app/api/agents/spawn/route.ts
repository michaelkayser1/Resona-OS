import { NextResponse } from "next/server"
import { spawnAgent, type SpawnOptions } from "@/lib/agents/runner"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const options: SpawnOptions = {
      agentType: body.agentType ?? "builder",
      scope: body.scope,
      actor: body.actor ?? "api",
    }

    const validTypes = ["builder", "tester", "refactorer", "clinician", "guardian"]
    if (!validTypes.includes(options.agentType)) {
      return NextResponse.json(
        { success: false, error: `Invalid agent type. Must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      )
    }

    const run = await spawnAgent(options)

    return NextResponse.json({
      success: true,
      run,
    })
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    )
  }
}
