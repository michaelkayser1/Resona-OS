# QOTE Middleware Specification

**Version:** 1.0.0
**Last Updated:** 2025-11-13

This is the complete, production-ready specification for QOTE Middleware.

---

## Overview

QOTE Middleware is the **central nervous system** for all QOTE-aware applications. It provides:

1. Unified API for all AI interactions
2. Real-time coherence metrics (Δθ, W, Φ)
3. Intelligent gating logic (normal / slow / escalate / block)
4. Multi-model routing (OpenAI, Claude, etc.)
5. Comprehensive logging for research

---

## Endpoint Contracts

### 1. POST /api/qote/chat

**Purpose:** Main conversational endpoint for QOTE-aware apps

**Headers:**
- `Content-Type: application/json`
- `X-QOTE-Version: 1` (optional)
- `Authorization: Bearer TOKEN` (optional)

**Request Schema:**
```typescript
interface QoteChatRequest {
  session_id?: string;
  message_id: string;           // REQUIRED

  channel: string;              // guardian | clinic | esp_lab | econ | family
  user_role: string;            // clinician | patient | family | researcher | system

  input_type: "text" | "event" | "command";
  input_text: string;           // REQUIRED

  context?: {
    history?: Array<{
      role: "user" | "assistant" | "system";
      content: string;
      timestamp?: string;
    }>;
    tags?: string[];
    patient_meta?: {
      patient_id?: string;
      age?: number;
      sex?: "M" | "F" | "U";
      mrn?: string;
      diagnoses?: string[];
      flags?: string[];
    };
    signals?: {
      hrv?: number;
      uv_index?: number;
      location_hint?: string;
      time_local?: string;
      [key: string]: any;
    };
  };

  model_prefs?: {
    primary_model?: string;     // Default: gpt-4o
    fallback_model?: string;
    max_tokens?: number;        // Default: 800
    temperature?: number;       // Default: 0.4
  };

  qote_overrides?: {
    slow_mode?: boolean;
    max_delta_theta?: number;
    require_clinical_tone?: boolean;
    language?: string;
  };

  client_meta?: {
    app_id?: string;
    app_version?: string;
    user_agent?: string;
  };
}
```

**Response Schema:**
```typescript
interface QoteChatResponse {
  session_id: string;
  message_id: string;
  trace_id: string;

  answer: {
    text: string;
    style?: "clinical" | "conversational" | "technical";
    language?: string;
  };

  qote_metrics: {
    delta_theta: number;        // 0-1+
    wobble_W: number;           // 0-1+
    phi_index: number;          // 0-1
    state: "coherent" | "borderline" | "unstable" | "critical";
    dimension_band: "L1" | "L2" | "L3" | "L4";
    confidence: number;         // 0-1
  };

  gating_decision: {
    mode: "normal" | "slow" | "defer_to_human" | "block";
    reasons?: string[];
    interventions?: Array<{
      type: "grounding" | "disclaimer" | "handoff";
      applied: boolean;
      note?: string;
    }>;
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
```

---

### 2. POST /api/qote/chat-stream

**Purpose:** Streaming version using Server-Sent Events

**Request:** Same as `/api/qote/chat`

**Response:** SSE stream with events:
- `meta`: Initial metadata (session_id, trace_id, qote_metrics, gating_decision)
- `token`: Text chunks as they arrive
- `done`: Final payload
- `error`: Error information (if any)

---

### 3. POST /api/qote/event

**Purpose:** Log non-chat events (ESP, UV, coherence practices)

**Request Schema:**
```typescript
interface QoteEventRequest {
  event_id: string;             // REQUIRED
  session_id?: string;
  channel: string;              // esp_lab | clinic | econ | etc.
  event_type: string;           // esp_hit | esp_miss | uv_spike | practice
  payload?: any;
  signals?: {
    hrv?: number;
    uv_index?: number;
    [key: string]: any;
  };
}
```

**Response Schema:**
```typescript
interface QoteEventResponse {
  session_id: string;
  event_id: string;
  trace_id: string;
  qote_metrics: QoteMetrics;
  logging: {
    stored: boolean;
    timestamp: string;
  };
}
```

---

## QOTE Metrics

### Δθ (Delta Theta)
**Misalignment / tension measure**
- Range: 0 to 1+
- < 0.3: Coherent
- 0.3-0.55: Borderline
- 0.55-0.8: Unstable
- ≥ 0.8: Critical

### W (Wobble)
**Oscillatory instability**
- Range: 0 to 1+
- Measures dimensional oscillation between emotional/cognitive loads

### Φ (Phi Index)
**Coherence / golden corridor proximity**
- Range: 0 to 1
- > 0.8: High coherence
- 0.5-0.8: Moderate coherence
- < 0.5: Low coherence

### State Classification
- **coherent**: Normal operation
- **borderline**: Proceed with caution
- **unstable**: Slow mode recommended
- **critical**: Block or escalate

### Dimension Bands
- **L1**: Body / Physical
- **L2**: Emotion / Affect
- **L3**: Meaning / Cognition
- **L4**: Purpose / Integration

---

## Gating Logic

### Modes

1. **normal**: Coherence within acceptable range, proceed normally
2. **slow**: Add grounding preamble, disclaimers
3. **defer_to_human**: Flag for human review
4. **block**: Do not respond, require human intervention

### Decision Flow

```
Input → Compute QOTE Metrics → Apply Gating Rules → Route or Block
```

**Gating Rules:**
- If `delta_theta >= 0.8`: `block`
- If `delta_theta >= 0.55`: `slow` (add grounding)
- If `delta_theta >= 0.3`: `normal` (monitor)
- If `delta_theta < 0.3`: `normal`

**Overrides:**
- Client can force `slow_mode`
- Client can set custom `max_delta_theta`
- Channel-specific rules in `policy.json`

---

## Safety Flags

| Flag | Severity | Meaning |
|------|----------|---------|
| `self_harm` | Critical | Suicidal ideation detected |
| `violence` | High | Violent intent toward others |
| `child_safety` | Critical | Potential child abuse/neglect |
| `emergency` | Critical | Emergency situation |
| `medical_high_stakes` | High | Medication/dosing in clinical context |
| `legal_risk` | Medium | Legal matters (lawsuits, malpractice) |
| `experimental_treatment` | Medium | Unproven treatments mentioned |
| `privacy_concern` | High | Sensitive personal information |

---

## Internal Architecture

### Module Structure

```
src/
├── app/
│   └── api/
│       └── qote/
│           ├── chat/route.ts
│           ├── chat-stream/route.ts
│           └── event/route.ts
├── engines/
│   ├── coherenceEngine.ts    # Δθ, W, Φ computation
│   ├── gatingEngine.ts        # Gating logic
│   ├── routingEngine.ts       # Model routing
│   └── safetyEngine.ts        # Safety checks
├── utils/
│   ├── logger.ts              # Database logging
│   ├── id.ts                  # UUID generation
│   └── time.ts                # Time utilities
├── types/
│   ├── qoteMetrics.ts
│   ├── qoteRequest.ts
│   ├── qoteResponse.ts
│   └── index.ts
└── config/
    ├── policy.json            # Gating rules
    └── models.json            # Model defaults
```

### Processing Flow

```
Request → Validate → Compute Metrics → Safety Check → Gating Decision → Route to Model → Log → Response
```

---

## Database Schema

### QoteLog Table
- `id`: Auto-increment
- `trace_id`: Unique trace ID
- `session_id`: Session ID
- `request`: JSON (full request)
- `response`: JSON (full response)
- `channel`, `user_role`, `event_type`: Quick access fields
- `delta_theta`, `wobble_w`, `phi_index`, `state`: Extracted metrics
- `gating_mode`: Gating decision
- `safety_flags`: Array of flags
- `latency_ms`: Response time
- `created_at`: Timestamp

### ErrorLog Table
- `id`: Auto-increment
- `trace_id`: Trace ID
- `session_id`: Session ID
- `error_message`, `error_stack`, `context`: Error details
- `created_at`: Timestamp

### Session Table
- `id`: UUID
- `session_id`: Session ID
- `channel`, `user_role`: Session context
- `first_seen`, `last_seen`: Timestamps
- `message_count`: Number of messages
- `avg_delta_theta`, `avg_phi_index`: Aggregate metrics

### EspEvent Table
- Research-specific table for ESP events
- Tracks `target`, `guess`, `correct`, `hrv`, `uv_index`
- Links to QOTE metrics at time of event

---

## Configuration

### Policy Configuration (`src/config/policy.json`)

```json
{
  "thresholds": {
    "critical": 0.8,
    "unstable": 0.55,
    "borderline": 0.3
  },
  "channel_overrides": {
    "clinic": {
      "require_clinical_tone": true,
      "max_delta_theta": 0.6
    }
  },
  "safety": {
    "block_on_critical_flags": true,
    "critical_flags": ["self_harm", "violence", "child_safety", "emergency"]
  }
}
```

### Model Configuration (`src/config/models.json`)

```json
{
  "default_models": {
    "primary": "gpt-4o",
    "fallback": "gpt-4o-mini",
    "max_tokens": 800,
    "temperature": 0.4
  },
  "channel_models": {
    "clinic": {
      "primary": "gpt-4o",
      "temperature": 0.3
    }
  }
}
```

---

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import to Vercel
3. Set environment variables
4. Deploy

### Docker
```bash
docker build -t qote-middleware .
docker run -p 3000:3000 \
  -e OPENAI_API_KEY=... \
  -e DATABASE_URL=... \
  qote-middleware
```

---

## Hand-Off Instructions

**To Claude / v0 / Developer:**

> "Build this QOTE Middleware exactly as specified. All types, endpoints, engines, and configuration are production-ready. Use Next.js 14 App Router, TypeScript, Prisma for PostgreSQL, and OpenAI SDK. Follow the directory structure and module layout exactly. Deploy to Vercel. This is the complete spec—no guesswork needed."

---

## Version History

- **1.0.0** (2025-11-13): Initial specification

---

## License

MIT

---

**This is the spine. Build with coherence.**
