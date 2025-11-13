# QOTE Middleware API Reference

Complete API specification for QOTE Middleware endpoints.

---

## Base URL

```
Production: https://qote-middleware.yourdomain.com
Development: http://localhost:3000
```

---

## Authentication

All requests should include:

```http
Authorization: Bearer YOUR_API_KEY
X-QOTE-Version: 1
Content-Type: application/json
```

---

## Endpoints

### 1. POST /api/qote/chat

Main conversational endpoint.

#### Request Schema

```typescript
interface QoteChatRequest {
  session_id?: string;          // Optional, generated if omitted
  message_id: string;           // Required, client-generated UUID

  channel: string;              // guardian | clinic | esp_lab | econ | family
  user_role: string;            // clinician | patient | family | researcher | system

  input_type: "text" | "event" | "command";
  input_text: string;           // Required

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
    fallback_model?: string;    // Default: gpt-4o-mini
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

#### Response Schema

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
    interventions?: {
      type: "grounding" | "disclaimer" | "handoff";
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
```

#### Example Request

```bash
curl -X POST https://qote-middleware.yourdomain.com/api/qote/chat \
  -H "Content-Type: application/json" \
  -H "X-QOTE-Version: 1" \
  -d '{
    "message_id": "msg-001",
    "channel": "clinic",
    "user_role": "clinician",
    "input_type": "text",
    "input_text": "What are the cardiac symptoms associated with TSC?",
    "context": {
      "patient_meta": {
        "age": 4,
        "sex": "M",
        "diagnoses": ["TSC"]
      }
    }
  }'
```

#### Response Codes

- `200` – Success
- `400` – Bad request (missing required fields)
- `500` – Internal server error

---

### 2. POST /api/qote/chat-stream

Streaming version of chat endpoint using Server-Sent Events.

#### Request Schema

Same as `/api/qote/chat`.

#### Response Format (SSE)

```
event:meta
data:{"session_id":"...","trace_id":"...","qote_metrics":{...}}

event:token
data:{"token":"What "}

event:token
data:{"token":"are "}

event:done
data:{"session_id":"...","answer":{...}}
```

#### Client Example

```javascript
const response = await fetch('/api/qote/chat-stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(request)
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value);
  // Parse SSE format
  const lines = chunk.split('\n');
  for (const line of lines) {
    if (line.startsWith('data:')) {
      const data = JSON.parse(line.slice(5));
      // Handle data
    }
  }
}
```

---

### 3. POST /api/qote/event

Log non-chat events (ESP, UV spikes, coherence practices).

#### Request Schema

```typescript
interface QoteEventRequest {
  event_id: string;           // Required, client-generated
  session_id?: string;        // Optional
  channel: string;            // esp_lab | clinic | econ | etc.
  event_type: string;         // esp_hit | esp_miss | uv_spike | practice
  payload?: any;              // Event-specific data
  signals?: {
    hrv?: number;
    uv_index?: number;
    [key: string]: any;
  };
}
```

#### Response Schema

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

#### Example Request

```bash
curl -X POST https://qote-middleware.yourdomain.com/api/qote/event \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": "esp-001",
    "channel": "esp_lab",
    "event_type": "esp_hit",
    "payload": {
      "target": "image_42",
      "guess": "image_37",
      "correct": false
    },
    "signals": {
      "hrv": 62,
      "uv_index": 7.4
    }
  }'
```

---

## QOTE Metrics Reference

### delta_theta (Δθ)

Misalignment / tension measure.

- **Range**: 0 to 1+
- **Interpretation**:
  - `< 0.3`: Coherent
  - `0.3-0.55`: Borderline
  - `0.55-0.8`: Unstable
  - `≥ 0.8`: Critical

### wobble_W (W)

Oscillatory instability.

- **Range**: 0 to 1+
- **Interpretation**: Higher = more dimensional oscillation

### phi_index (Φ)

Coherence / golden corridor proximity.

- **Range**: 0 to 1
- **Interpretation**:
  - `> 0.8`: High coherence
  - `0.5-0.8`: Moderate coherence
  - `< 0.5`: Low coherence

### state

Categorical classification based on delta_theta:

- `coherent`: Normal operation
- `borderline`: Proceed with caution
- `unstable`: Slow mode recommended
- `critical`: Block or escalate

### dimension_band

Which layer of experience:

- `L1`: Body / Physical
- `L2`: Emotion / Affect
- `L3`: Meaning / Cognition
- `L4`: Purpose / Integration

---

## Safety Flags

| Flag | Meaning |
|------|---------|
| `self_harm` | Suicidal ideation detected |
| `violence` | Violent intent toward others |
| `child_safety` | Potential child abuse/neglect |
| `emergency` | Emergency situation |
| `medical_high_stakes` | Medication/dosing in clinical context |
| `legal_risk` | Legal matters (lawsuits, malpractice) |
| `experimental_treatment` | Unproven treatments mentioned |
| `privacy_concern` | Sensitive personal information |

---

## Gating Modes

| Mode | Behavior |
|------|----------|
| `normal` | Proceed as usual |
| `slow` | Add grounding, disclaimers |
| `defer_to_human` | Escalate to human reviewer |
| `block` | Do not respond, require intervention |

---

## Error Responses

All errors return:

```json
{
  "error": "Error type",
  "message": "Detailed error message",
  "trace_id": "qote-trace-..."
}
```

Common errors:

- `400`: Missing required fields
- `401`: Unauthorized
- `429`: Rate limit exceeded
- `500`: Internal server error

---

## Rate Limits

- **Free tier**: 100 requests/minute
- **Pro tier**: 1000 requests/minute
- **Enterprise**: Custom limits

---

## Versioning

API version is specified via header:

```
X-QOTE-Version: 1
```

Future versions will maintain backwards compatibility.

---

## SDKs

Official SDKs available:

- JavaScript/TypeScript: `npm install @qote/middleware-client`
- Python: `pip install qote-middleware`
- Swift: Coming soon

---

## Support

- Documentation: https://docs.qote.dev
- GitHub Issues: https://github.com/yourorg/qote-middleware/issues
- Email: support@qote.dev
