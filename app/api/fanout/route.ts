import type { RBFRDesign } from "@/lib/schemas"

export const runtime = "nodejs"

type ProviderId = "openai" | "anthropic" | "mistral" | "xai" | "deepseek"

const DEFAULTS: Record<ProviderId, { url?: string; model?: string; key?: string }> = {
  openai: { url: "https://api.openai.com/v1/chat/completions", model: "gpt-4o-mini", key: process.env.OPENAI_KEY },
  anthropic: { url: process.env.ANTHROPIC_URL, model: process.env.ANTHROPIC_MODEL, key: process.env.ANTHROPIC_KEY },
  mistral: { url: process.env.MISTRAL_URL, model: process.env.MISTRAL_MODEL, key: process.env.MISTRAL_KEY },
  xai: { url: process.env.XAI_URL, model: process.env.XAI_MODEL, key: process.env.XAI_KEY },
  deepseek: { url: process.env.DEEPSEEK_URL, model: process.env.DEEPSEEK_MODEL, key: process.env.DEEPSEEK_KEY },
}

export async function POST(req: Request) {
  const { prompt, contradictions, sessionId } = await req.json()

  if (!prompt) {
    return new Response(JSON.stringify({ error: "Expected { prompt } string" }), { status: 400 })
  }

  const targets = (Object.keys(DEFAULTS) as ProviderId[])
    .map((id) => ({ id, ...DEFAULTS[id] }))
    .filter((t) => t.url && t.key)

  const rbfrPrompt = buildRBFRPrompt(prompt, contradictions)
  const startTime = Date.now()

  const calls = targets.map(async (t, index) => {
    await new Promise((resolve) => setTimeout(resolve, index * 100))

    const callStartTime = Date.now()
    try {
      const body = buildRequestBody(t.id, rbfrPrompt, t.model)
      const res = await fetch(t.url!, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${t.key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      }

      const data = await res.json()
      const content = extractContent(t.id, data)
      const design = parseRBFRDesign(content)

      return {
        id: t.id,
        success: !!design,
        design,
        content,
        responseTime: Date.now() - callStartTime,
        error: design ? null : "Failed to parse RBFR design",
        confidence: design ? calculateConfidence(design, content) : 0,
      }
    } catch (e: any) {
      return {
        id: t.id,
        success: false,
        design: null,
        content: null,
        responseTime: Date.now() - callStartTime,
        error: e?.message ?? "fetch_error",
        confidence: 0,
      }
    }
  })

  const results = await Promise.all(calls)

  const successful = results.filter((r) => r.success && r.design)
  const totalTime = Date.now() - startTime

  return new Response(
    JSON.stringify({
      results,
      summary: {
        total: results.length,
        successful: successful.length,
        designs: successful.map((r) => r.design),
        totalTime,
        averageConfidence:
          successful.length > 0 ? successful.reduce((sum, r) => sum + r.confidence, 0) / successful.length : 0,
        sessionId,
        timestamp: new Date().toISOString(),
      },
    }),
    {
      headers: { "Content-Type": "application/json" },
    },
  )
}

function buildRBFRPrompt(basePrompt: string, contradictions: any): string {
  const trizContext = buildTRIZContext(contradictions)

  return `System: You are a scientific co-creator for Resonance-Based Fuel Refinement (RBFR).
Given the current challenge, output a JSON RBFRDesign tuned for coil configuration and waveform modulation
that improves efficiency WITHOUT increasing heat. Use TRIZ-style contradiction resolution.

${trizContext}

Current challenge: ${basePrompt}

Return ONLY valid JSON matching this exact schema:
{
  "goal": "maximize_yield" | "reduce_heat" | "stabilize_structure",
  "field": {
    "carrierHz": number,
    "waveform": "sine" | "pulse" | "fm" | "am",
    "modulationIndex": number,
    "coilConfig": "helmholtz" | "solenoid" | "multi-turn"
  },
  "guards": { "maxTempC": number, "maxFieldTesla": number },
  "notes": [string]
}

Focus on the key RBFR levers: coil configuration, waveform modulation, and their interaction with fuel resonance.`
}

function buildTRIZContext(contradictions: any): string {
  if (!contradictions) return ""

  const contexts = []
  if (contradictions.efficiencyVsHeat !== 0) {
    const bias =
      contradictions.efficiencyVsHeat > 0 ? "efficiency over heat control" : "heat control over raw efficiency"
    contexts.push(`Prioritize ${bias}`)
  }
  if (contradictions.stabilityVsYield !== 0) {
    const bias =
      contradictions.stabilityVsYield > 0 ? "field stability over maximum yield" : "maximum yield over field stability"
    contexts.push(`Prioritize ${bias}`)
  }
  if (contradictions.powerVsControl !== 0) {
    const bias = contradictions.powerVsControl > 0 ? "raw power over precise control" : "precise control over raw power"
    contexts.push(`Prioritize ${bias}`)
  }

  return contexts.length > 0 ? `TRIZ Contradiction Context: ${contexts.join(", ")}` : ""
}

function buildRequestBody(providerId: ProviderId, prompt: string, model?: string) {
  const baseBody = {
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 1000,
    stream: false,
  }

  switch (providerId) {
    case "anthropic":
      return {
        model: model || "claude-3-haiku-20240307",
        max_tokens: 1000,
        messages: baseBody.messages,
      }
    case "openai":
      return {
        model: model || "gpt-4o-mini",
        ...baseBody,
      }
    default:
      return {
        model: model || "auto",
        ...baseBody,
      }
  }
}

function extractContent(providerId: ProviderId, data: any): string {
  try {
    switch (providerId) {
      case "anthropic":
        return data.content?.[0]?.text || ""
      case "openai":
        return data.choices?.[0]?.message?.content || ""
      default:
        return data.choices?.[0]?.message?.content || data.content?.[0]?.text || ""
    }
  } catch {
    return ""
  }
}

function parseRBFRDesign(content: string): RBFRDesign | null {
  if (!content) return null

  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return null

  try {
    const parsed = JSON.parse(jsonMatch[0])

    if (!parsed.goal || !parsed.field || !parsed.guards) return null
    if (!parsed.field.carrierHz || !parsed.field.waveform || !parsed.field.coilConfig) return null

    return parsed as RBFRDesign
  } catch (e) {
    return null
  }
}

function calculateConfidence(design: RBFRDesign, content: string): number {
  let confidence = 0.5

  if (design.notes && design.notes.length > 0) {
    confidence += 0.2
  }

  if (design.field.carrierHz >= 1000 && design.field.carrierHz <= 5000) {
    confidence += 0.1
  }

  if (design.field.modulationIndex >= 0.1 && design.field.modulationIndex <= 1.0) {
    confidence += 0.1
  }

  if (design.guards.maxTempC <= 100 && design.guards.maxFieldTesla <= 1.0) {
    confidence += 0.1
  }

  return Math.min(confidence, 1.0)
}
