import { NextResponse } from "next/server"
import { redact, isSafe } from "@/lib/compliance/redaction"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const input = body.text ?? ""

    const result = redact(input)

    return NextResponse.json({
      success: true,
      original_safe: isSafe(input),
      sanitized: result.sanitized,
      redactions: result.redactionsApplied,
    })
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    )
  }
}
