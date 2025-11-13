/**
 * QOTE Chat Request Schema
 * What every app sends to /qote/chat
 */
export interface QoteChatRequest {
  session_id?: string;          // If omitted, middleware generates one
  message_id: string;           // ID from the calling app

  channel: "guardian" | "clinic" | "esp_lab" | "econ" | "family" | string;
  user_role: "clinician" | "patient" | "family" | "researcher" | "system" | string;

  input_type: "text" | "event" | "command";
  input_text: string;

  context?: {
    history?: {
      role: "user" | "assistant" | "system";
      content: string;
      timestamp?: string;
    }[];
    tags?: string[];

    patient_meta?: {
      patient_id?: string;
      age?: number;
      sex?: "M" | "F" | "U" | string;
      mrn?: string;
      diagnoses?: string[];
      flags?: string[];
    };

    signals?: {
      hrv?: number | null;
      uv_index?: number | null;
      location_hint?: string | null;
      time_local?: string | null;
      [key: string]: any;
    };
  };

  model_prefs?: {
    primary_model?: string;
    fallback_model?: string;
    max_tokens?: number;
    temperature?: number;
  };

  qote_overrides?: {
    slow_mode?: boolean;
    max_delta_theta?: number;
    require_clinical_tone?: boolean;
    language?: string;
    [key: string]: any;
  };

  client_meta?: {
    app_id?: string;
    app_version?: string;
    user_agent?: string;
    [key: string]: any;
  };
}

/**
 * QOTE Event Request Schema
 * For logging non-chat events: ESP hits, UV spikes, coherence practices
 */
export interface QoteEventRequest {
  event_id: string;
  session_id?: string;
  channel: string;          // esp_lab | clinic | econ | etc.
  event_type: string;       // esp_hit | esp_miss | uv_spike | practice | etc.
  payload?: any;
  signals?: {
    hrv?: number | null;
    uv_index?: number | null;
    [key: string]: any;
  };
}
