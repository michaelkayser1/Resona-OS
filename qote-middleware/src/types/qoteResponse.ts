import { QoteMetrics } from "./qoteMetrics";

/**
 * QOTE Chat Response Schema
 * What middleware sends back to apps
 */
export interface QoteChatResponse {
  session_id: string;
  message_id: string;
  trace_id: string;

  answer: {
    text: string;
    style?: "clinical" | "conversational" | "technical" | string;
    language?: string;
  };

  qote_metrics: QoteMetrics;

  gating_decision: {
    mode: "normal" | "slow" | "defer_to_human" | "block";
    reasons?: string[];
    interventions?: {
      type: "grounding" | "disclaimer" | "handoff" | string;
      applied: boolean;
      note?: string;
    }[];
  };

  safety_flags?: string[];

  routing_trace?: {
    primary_model?: string;
    tools_used?: string[];
    latency_ms?: number;
    prompt_tokens?: number;
    completion_tokens?: number;
  };

  logging?: {
    stored: boolean;
    log_bucket?: string;
    timestamp: string;
  };
}

/**
 * QOTE Event Response Schema
 * Simpler response for event logging
 */
export interface QoteEventResponse {
  session_id: string;
  event_id: string;
  trace_id: string;
  qote_metrics: QoteMetrics;
  logging: {
    stored: boolean;
    timestamp: string;
  };
}
