/**
 * QOTE Event Endpoint
 * POST /api/qote/event
 *
 * For logging non-chat events: ESP hits, UV spikes, coherence practices
 * Computes metrics but doesn't route to models
 */

import { NextRequest, NextResponse } from "next/server";
import { computeQoteMetrics } from "@/engines/coherenceEngine";
import { logEvent, logError } from "@/utils/logger";
import { generateTraceId, generateSessionId } from "@/utils/id";
import { getCurrentTimestamp } from "@/utils/time";
import { QoteEventRequest, QoteEventResponse } from "@/types";

export async function POST(req: NextRequest) {
  let trace_id = "";
  let session_id = "";

  try {
    // Parse request
    const request: QoteEventRequest = await req.json();

    // Generate IDs
    trace_id = generateTraceId();
    session_id = request.session_id || generateSessionId();

    // Validate required fields
    if (!request.event_id) {
      return NextResponse.json(
        { error: "event_id is required" },
        { status: 400 }
      );
    }

    if (!request.event_type) {
      return NextResponse.json(
        { error: "event_type is required" },
        { status: 400 }
      );
    }

    // Create synthetic text from event for QOTE analysis
    const syntheticText = JSON.stringify({
      event_type: request.event_type,
      payload: request.payload,
      signals: request.signals
    });

    // Compute QOTE metrics
    const qote_metrics = computeQoteMetrics(syntheticText, {
      channel: request.channel,
      signals: request.signals
    });

    // Build response
    const response: QoteEventResponse = {
      session_id,
      event_id: request.event_id,
      trace_id,
      qote_metrics,
      logging: {
        stored: true,
        timestamp: getCurrentTimestamp()
      }
    };

    // Log event
    await logEvent({ trace_id, session_id, request, response });

    return NextResponse.json(response, { status: 200 });

  } catch (error: any) {
    console.error("QOTE Event endpoint error:", error);

    // Log error
    await logError({
      trace_id: trace_id || generateTraceId(),
      session_id: session_id || "unknown",
      error,
      context: { endpoint: "/api/qote/event" }
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
