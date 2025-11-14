/**
 * QOTE Chat Stream Endpoint
 * POST /api/qote/chat-stream
 *
 * Streaming version for real-time UI updates
 * Uses Server-Sent Events (SSE)
 */

import { NextRequest, NextResponse } from "next/server";
import { computeQoteMetrics } from "@/engines/coherenceEngine";
import { applyGating, applyInterventions, shouldBlock } from "@/engines/gatingEngine";
import { streamFromModel } from "@/engines/routingEngine";
import { runSafetyChecks, generateSafetyDisclaimer } from "@/engines/safetyEngine";
import { logEvent, logError } from "@/utils/logger";
import { generateTraceId, generateSessionId } from "@/utils/id";
import { getCurrentTimestamp } from "@/utils/time";
import { QoteChatRequest } from "@/types";

// Note: Using default Node.js runtime for database/logger compatibility
// Edge runtime doesn't support Prisma and some Node.js APIs

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
    if (!request.message_id || !request.input_text) {
      return NextResponse.json(
        { error: "message_id and input_text are required" },
        { status: 400 }
      );
    }

    // Compute metrics and gating
    const qote_metrics = computeQoteMetrics(request.input_text, request.context);
    const safety_flags = runSafetyChecks(request.input_text, request.context);
    const gating_decision = applyGating(qote_metrics, {}, request.qote_overrides);

    const encoder = new TextEncoder();

    // Create SSE stream
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send metadata first
          const metadata = {
            session_id,
            message_id: request.message_id,
            trace_id,
            qote_metrics,
            gating_decision,
            safety_flags
          };

          controller.enqueue(
            encoder.encode(`event:meta\ndata:${JSON.stringify(metadata)}\n\n`)
          );

          // Check if blocked
          if (shouldBlock(gating_decision)) {
            const blockedMessage = "This request requires human intervention. Please consult with a healthcare provider or appropriate professional.";

            controller.enqueue(
              encoder.encode(`event:token\ndata:${JSON.stringify({ token: blockedMessage })}\n\n`)
            );

            controller.enqueue(
              encoder.encode(`event:done\ndata:${JSON.stringify({ session_id, trace_id })}\n\n`)
            );

            controller.close();
            return;
          }

          // Apply interventions
          const modifiedPrompt = applyInterventions(
            request.input_text,
            gating_decision,
            request.context
          );

          // Stream from model
          const modelStream = await streamFromModel(
            modifiedPrompt,
            request.model_prefs,
            request.context
          );

          let fullText = "";

          for await (const chunk of modelStream) {
            const delta = chunk.choices[0]?.delta?.content || "";
            if (delta) {
              fullText += delta;
              controller.enqueue(
                encoder.encode(`event:token\ndata:${JSON.stringify({ token: delta })}\n\n`)
              );
            }
          }

          // Add safety disclaimer if needed
          const disclaimer = generateSafetyDisclaimer(safety_flags);
          if (disclaimer) {
            controller.enqueue(
              encoder.encode(`event:token\ndata:${JSON.stringify({ token: `\n\n${disclaimer}` })}\n\n`)
            );
            fullText += `\n\n${disclaimer}`;
          }

          // Send done event
          const finalPayload = {
            session_id,
            trace_id,
            answer: {
              text: fullText,
              style: request.qote_overrides?.require_clinical_tone ? "clinical" : "conversational",
              language: request.qote_overrides?.language || "en"
            }
          };

          controller.enqueue(
            encoder.encode(`event:done\ndata:${JSON.stringify(finalPayload)}\n\n`)
          );

          // Log full event
          await logEvent({
            trace_id,
            session_id,
            request,
            response: {
              ...finalPayload,
              qote_metrics,
              gating_decision,
              safety_flags
            }
          });

          controller.close();

        } catch (error: any) {
          console.error("Stream error:", error);

          controller.enqueue(
            encoder.encode(`event:error\ndata:${JSON.stringify({ error: error.message })}\n\n`)
          );

          await logError({
            trace_id,
            session_id,
            error,
            context: { endpoint: "/api/qote/chat-stream" }
          });

          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (error: any) {
    console.error("QOTE Chat Stream endpoint error:", error);

    await logError({
      trace_id: trace_id || generateTraceId(),
      session_id: session_id || "unknown",
      error,
      context: { endpoint: "/api/qote/chat-stream" }
    });

    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}
