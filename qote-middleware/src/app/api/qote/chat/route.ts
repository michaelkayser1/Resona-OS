/**
 * QOTE Chat Endpoint
 * POST /api/qote/chat
 *
 * Main endpoint for all QOTE-aware applications
 * Accepts text input, computes QOTE metrics, applies gating, routes to models
 */

import { NextRequest, NextResponse } from "next/server";
import { computeQoteMetrics } from "@/engines/coherenceEngine";
import { applyGating, applyInterventions, shouldBlock } from "@/engines/gatingEngine";
import { routeToModel } from "@/engines/routingEngine";
import { runSafetyChecks, hasCriticalFlags, generateSafetyDisclaimer } from "@/engines/safetyEngine";
import { logEvent, logError } from "@/utils/logger";
import { generateTraceId, generateSessionId } from "@/utils/id";
import { getCurrentTimestamp } from "@/utils/time";
import { QoteChatRequest, QoteChatResponse } from "@/types";

export async function POST(req: NextRequest) {
  let trace_id = "";
  let session_id = "";

  try {
    // Parse request
    const request: QoteChatRequest = await req.json();

    // Generate IDs
    trace_id = generateTraceId();
    session_id = request.session_id || generateSessionId();

    // Validate required fields
    if (!request.message_id) {
      return NextResponse.json(
        { error: "message_id is required" },
        { status: 400 }
      );
    }

    if (!request.input_text) {
      return NextResponse.json(
        { error: "input_text is required" },
        { status: 400 }
      );
    }

    // Step 1: Compute QOTE metrics
    const qote_metrics = computeQoteMetrics(request.input_text, request.context);

    // Step 2: Run safety checks
    const safety_flags = runSafetyChecks(request.input_text, request.context);

    // Step 3: Apply gating logic
    const gating_decision = applyGating(
      qote_metrics,
      {}, // Policy can be loaded from config
      request.qote_overrides
    );

    // Step 4: Check if request should be blocked
    if (shouldBlock(gating_decision)) {
      const response: QoteChatResponse = {
        session_id,
        message_id: request.message_id,
        trace_id,
        answer: {
          text: "This request requires human intervention. Please consult with a healthcare provider or appropriate professional.",
          style: "clinical",
          language: request.qote_overrides?.language || "en"
        },
        qote_metrics,
        gating_decision,
        safety_flags,
        logging: {
          stored: true,
          timestamp: getCurrentTimestamp()
        }
      };

      await logEvent({ trace_id, session_id, request, response });

      return NextResponse.json(response, { status: 200 });
    }

    // Step 5: Apply interventions to prompt
    const modifiedPrompt = applyInterventions(
      request.input_text,
      gating_decision,
      request.context
    );

    // Step 6: Route to model
    const startTime = Date.now();
    const routed = await routeToModel(
      modifiedPrompt,
      request.model_prefs,
      request.context
    );
    const latency_ms = Date.now() - startTime;

    // Step 7: Add safety disclaimer if needed
    let finalText = routed.text;
    const disclaimer = generateSafetyDisclaimer(safety_flags);
    if (disclaimer) {
      finalText = `${routed.text}\n\n${disclaimer}`;
    }

    // Step 8: Build response
    const response: QoteChatResponse = {
      session_id,
      message_id: request.message_id,
      trace_id,

      answer: {
        text: finalText,
        style: request.qote_overrides?.require_clinical_tone ? "clinical" : "conversational",
        language: request.qote_overrides?.language || "en"
      },

      qote_metrics,
      gating_decision,
      safety_flags,

      routing_trace: {
        primary_model: routed.model,
        tools_used: ["openai_chat"],
        latency_ms: routed.latency_ms,
        prompt_tokens: routed.tokens.prompt,
        completion_tokens: routed.tokens.completion
      },

      logging: {
        stored: true,
        log_bucket: "prod",
        timestamp: getCurrentTimestamp()
      }
    };

    // Step 9: Log everything
    await logEvent({ trace_id, session_id, request, response });

    // Step 10: Return response
    return NextResponse.json(response, { status: 200 });

  } catch (error: any) {
    console.error("QOTE Chat endpoint error:", error);

    // Log error
    await logError({
      trace_id: trace_id || generateTraceId(),
      session_id: session_id || "unknown",
      error,
      context: { endpoint: "/api/qote/chat" }
    });

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message,
        trace_id
      },
      { status: 500 }
    );
  }
}

// OPTIONS handler for CORS
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-QOTE-Version, Authorization"
    }
  });
}
