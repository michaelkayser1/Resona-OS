import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { QOTEEngine } from "@/lib/qote-engine"

export async function POST(request: NextRequest) {
  try {
    const { prompt, parameters, provider = "openai" } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    console.log("[v0] QOTE API request", { prompt: prompt.substring(0, 50), provider, parameters })

    // Initialize QOTE engine
    const qoteEngine = new QOTEEngine()

    // Step 1: Pre-process with QOTE algorithm
    const qotePreprocessing = await qoteEngine.preprocessPrompt(prompt, parameters)

    console.log("[v0] QOTE preprocessing complete", {
      coherence: qotePreprocessing.coherence,
      resonance: qotePreprocessing.resonance,
    })

    let text = ""
    let aiProvider = provider

    const hasOpenAIKey = !!process.env.OPENAI_API_KEY
    console.log("[v0] OpenAI API Key available:", hasOpenAIKey)

    try {
      // Step 2: Select AI model - AI Gateway supports these by default
      const model = getModelForProvider(provider)

      // Step 3: Generate response with QOTE-enhanced prompt
      const enhancedPrompt = qoteEngine.enhancePromptWithQOTE(prompt, qotePreprocessing)

      console.log("[v0] Generating AI response with model:", model)

      const result = await generateText({
        model,
        prompt: enhancedPrompt,
        temperature: 0.7 - qotePreprocessing.coherence * 0.2, // Lower temp for higher coherence
        maxTokens: 500,
      })

      text = result.text
      console.log("[v0] AI response generated successfully", { length: text.length })
    } catch (error) {
      console.log("[v0] AI generation failed:", error)

      const errorMessage = error instanceof Error ? error.message : "Unknown error"

      if (!hasOpenAIKey && provider === "openai") {
        console.log("[v0] OpenAI key missing, using QOTE simulation mode")
        aiProvider = "simulation"
        text = generateQOTESimulationResponse(prompt, qotePreprocessing, "missing_api_key")
      } else {
        console.log("[v0] AI Gateway error, using QOTE simulation mode")
        aiProvider = "simulation"
        text = generateQOTESimulationResponse(prompt, qotePreprocessing, "gateway_error")
      }
    }

    // Step 4: Post-process response with QOTE
    const finalResult = await qoteEngine.postprocessResponse(text, qotePreprocessing, parameters)

    console.log("[v0] QOTE post-processing complete", {
      finalCoherence: finalResult.coherence,
      finalResonance: finalResult.resonance,
    })

    return NextResponse.json({
      success: true,
      result: finalResult,
      provider: aiProvider,
      processingTime: finalResult.processingTime,
      usingAIGateway: aiProvider !== "simulation",
      status:
        aiProvider === "simulation"
          ? hasOpenAIKey
            ? "Using QOTE simulation (AI Gateway unavailable)"
            : "Using QOTE simulation (Add OPENAI_API_KEY to enable real AI)"
          : "AI-powered response via QOTE",
    })
  } catch (error) {
    console.error("[v0] QOTE API error:", error)
    return NextResponse.json(
      {
        error: "Failed to process QOTE request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

function getModelForProvider(provider: string) {
  switch (provider) {
    case "anthropic":
      return "anthropic/claude-3-5-sonnet-20241022"
    case "openai":
    default:
      return "openai/gpt-4o-mini"
  }
}

function generateQOTESimulationResponse(prompt: string, preprocessing: any, reason: string): string {
  const coherencePercent = (preprocessing.coherence * 100).toFixed(1)
  const orderParam = (preprocessing.orderParameter * 100).toFixed(1)

  // Generate contextual response based on prompt characteristics
  const promptLower = prompt.toLowerCase()
  let responseContext = ""

  if (promptLower.includes("what") || promptLower.includes("explain")) {
    responseContext = "Through quantum phase synchronization analysis, I can provide insight into your query. "
  } else if (promptLower.includes("how")) {
    responseContext = "The QOTE system has analyzed the procedural aspects of your question. "
  } else if (promptLower.includes("why")) {
    responseContext = "Examining the causal relationships through oscillatory embedding reveals: "
  } else {
    responseContext = "Processing your prompt through quantum oscillatory token embedding: "
  }

  const apiKeyNote =
    reason === "missing_api_key"
      ? "\n\n**Note:** Add your OPENAI_API_KEY environment variable to enable real AI-powered responses with QOTE enhancement."
      : ""

  return `${responseContext}

**QOTE Analysis Complete**

Your prompt achieved ${coherencePercent}% coherence through Kuramoto phase synchronization, with ${preprocessing.enhancedTokens.length} token oscillators reaching an order parameter of ${orderParam}%. This indicates ${preprocessing.coherence > 0.618 ? "strong" : "moderate"} semantic resonance across the embedding space.

**Phase Synchronization Insights:**
- Golden ratio coherence threshold: ${preprocessing.coherence > 0.618 ? "✓ ACHIEVED" : "○ In progress"}
- Token coupling strength: ${preprocessing.coherence > 0.7 ? "High" : preprocessing.coherence > 0.5 ? "Moderate" : "Building"}
- Entropy level: ${preprocessing.entropy.toFixed(2)} bits

The quantum oscillatory processing has successfully mapped your semantic intent across ${preprocessing.phases.length} phase dimensions, creating optimal conditions for coherent AI response generation.${apiKeyNote}

*This is a QOTE demonstration response showing all core algorithms: Kuramoto synchronization, CUST coherence gating (φ ≈ 0.618), and delta-theta personalization.*`
}
