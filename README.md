# QOTE Middleware

**The central nervous system for QOTE-aware applications.**

QOTE Middleware is a unified API layer that normalizes input, computes coherence metrics (Δθ, W, Φ), applies intelligent gating, routes to AI models, and logs everything for research and auditing.

---

## 🎯 Purpose

Apps never talk to AI models directly. They call `/qote/chat` or `/qote/event` and let the middleware handle:

1. **Normalization** – Consistent input format across all apps
2. **QOTE Metrics** – Compute Δθ (misalignment), W (wobble), Φ (coherence)
3. **Gating Logic** – Decide: normal / slow / escalate / block
4. **Model Routing** – Route to OpenAI, Claude, or other models
5. **Logging** – Store everything for research and auditing

---

## 🏗️ Architecture

```
User/App → QOTE Middleware → AI Models → QOTE Middleware → App/User
```

### Core Modules

| Module | Purpose |
|--------|---------|
| `coherenceEngine` | Computes QOTE metrics (Δθ, W, Φ) |
| `gatingEngine` | Decides normal/slow/block mode |
| `routingEngine` | Routes to LLMs (OpenAI, etc.) |
| `safetyEngine` | Simple safety pattern matching |
| `logger` | Logs all requests/responses to DB |

---

## 📡 Endpoints

### 1. `POST /api/qote/chat`

Main endpoint for conversational AI through QOTE.

**Request:**
```json
{
  "message_id": "client-msg-uuid-123",
  "channel": "guardian",
  "user_role": "clinician",
  "input_type": "text",
  "input_text": "Explain these genetic test results to the family.",
  "context": {
    "history": [],
    "tags": ["genetics", "results"],
    "patient_meta": {
      "age": 4,
      "sex": "M"
    }
  },
  "model_prefs": {
    "primary_model": "gpt-4o",
    "max_tokens": 800,
    "temperature": 0.4
  }
}
```

**Response:**
```json
{
  "session_id": "qote-session-...",
  "message_id": "client-msg-uuid-123",
  "trace_id": "qote-trace-...",
  "answer": {
    "text": "Human-readable answer from the model.",
    "style": "clinical",
    "language": "en"
  },
  "qote_metrics": {
    "delta_theta": 0.23,
    "wobble_W": 0.11,
    "phi_index": 0.92,
    "state": "coherent",
    "dimension_band": "L3",
    "confidence": 0.88
  },
  "gating_decision": {
    "mode": "normal",
    "reasons": ["coherent"],
    "interventions": []
  },
  "safety_flags": [],
  "routing_trace": {
    "primary_model": "gpt-4o",
    "latency_ms": 780
  },
  "logging": {
    "stored": true,
    "timestamp": "2025-11-13T19:34:22Z"
  }
}
```

---

### 2. `POST /api/qote/chat-stream`

Streaming version using Server-Sent Events (SSE).

Same request format, but response is streamed:

```javascript
const es = new EventSource("/api/qote/chat-stream", { method: "POST", body: JSON.stringify(request) });

es.addEventListener("meta", (ev) => {
  const meta = JSON.parse(ev.data);
  // { session_id, trace_id, qote_metrics, gating_decision, safety_flags }
});

es.addEventListener("token", (ev) => {
  const { token } = JSON.parse(ev.data);
  // Append token to UI
});

es.addEventListener("done", (ev) => {
  const final = JSON.parse(ev.data);
  es.close();
});
```

---

### 3. `POST /api/qote/event`

For logging non-chat events: ESP hits, UV spikes, coherence practices.

**Request:**
```json
{
  "event_id": "esp-event-001",
  "session_id": "optional-session-id",
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
}
```

**Response:**
```json
{
  "session_id": "qote-session-...",
  "event_id": "esp-event-001",
  "trace_id": "qote-trace-...",
  "qote_metrics": {
    "delta_theta": 0.31,
    "wobble_W": 0.18,
    "phi_index": 0.84,
    "state": "borderline",
    "dimension_band": "L2",
    "confidence": 0.8
  },
  "logging": {
    "stored": true,
    "timestamp": "2025-11-13T19:40:22Z"
  }
}
```

---

## 🚀 Quickstart

### 1. Clone & Install

```bash
git clone https://github.com/michaelkayser1/Resona-OS.git
cd qote-middleware
npm install
```

### 2. Set Environment Variables

Copy `.env.example` to `.env` and fill in:

```bash
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://user:password@localhost:5432/qote_middleware
```

### 3. Set Up Database

```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server

```bash
npm run dev
```

The server will start at `http://localhost:3000`.

### 5. Test Endpoint

```bash
curl -X POST http://localhost:3000/api/qote/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message_id": "test-123",
    "channel": "guardian",
    "user_role": "clinician",
    "input_type": "text",
    "input_text": "What are the symptoms of TSC?"
  }'
```

---

## 🧮 QOTE Metrics Explained

| Metric | Symbol | Meaning | Range |
|--------|--------|---------|-------|
| **Delta Theta** | Δθ | Misalignment / tension | 0-1+ |
| **Wobble** | W | Oscillatory instability | 0-1+ |
| **Phi Index** | Φ | Coherence / golden corridor | 0-1 |
| **State** | - | coherent / borderline / unstable / critical | - |
| **Dimension Band** | - | L1 (body) / L2 (emotion) / L3 (meaning) / L4 (purpose) | - |

### State Classification

- **coherent** (Δθ < 0.3): Normal operation
- **borderline** (0.3 ≤ Δθ < 0.55): Monitor, proceed with caution
- **unstable** (0.55 ≤ Δθ < 0.8): Slow mode, add grounding
- **critical** (Δθ ≥ 0.8): Block or escalate to human

---

## 🛡️ Safety & Gating

### Gating Modes

1. **normal** – Coherence OK, proceed normally
2. **slow** – Add grounding, disclaimers
3. **defer_to_human** – Escalate to human reviewer
4. **block** – Do not respond, require human intervention

### Safety Flags

- `self_harm` – Suicidal ideation detected
- `violence` – Violent intent toward others
- `child_safety` – Potential child abuse/neglect
- `emergency` – Emergency situation
- `medical_high_stakes` – Medication/dosing in clinical context
- `legal_risk` – Legal matters (lawsuits, malpractice)
- `privacy_concern` – Sensitive personal information

---

## 📊 Logging & Research

Every call to `/qote/chat` or `/qote/event` is logged to PostgreSQL with:

- Full request/response
- QOTE metrics
- Gating decisions
- Safety flags
- Timestamps

This becomes your research backbone for:

- ESP correlation studies
- Coherence patterns
- UV index correlations
- Clinical outcome tracking

---

## 📦 Tech Stack

- **Runtime**: Node.js / TypeScript
- **Framework**: Next.js 14+ (App Router)
- **Database**: PostgreSQL (via Prisma)
- **AI Models**: OpenAI (pluggable for Claude, etc.)
- **Deployment**: Vercel

---

## 🔧 Configuration

### Policy Configuration (`src/config/policy.json`)

Adjust gating thresholds without redeploying:

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
  }
}
```

### Model Configuration (`src/config/models.json`)

Set default models per channel:

```json
{
  "channel_models": {
    "clinic": {
      "primary": "gpt-4o",
      "fallback": "gpt-4o-mini",
      "max_tokens": 1000,
      "temperature": 0.3
    }
  }
}
```

---

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import into Vercel
3. Set environment variables:
   - `OPENAI_API_KEY`
   - `DATABASE_URL`
4. Deploy

```bash
vercel deploy
```

### Docker

```bash
docker build -t qote-middleware .
docker run -p 3000:3000 -e OPENAI_API_KEY=... -e DATABASE_URL=... qote-middleware
```

---

## 🧪 Testing

```bash
npm test
```

Test with Postman collection: `QOTE-Middleware.postman_collection.json`

---

## 📚 Further Reading

- [QOTE Theory](docs/qote-theory.md)
- [API Reference](docs/api-reference.md)
- [Research Integration](docs/research.md)
- [Security & Compliance](docs/security.md)

---

## 🤝 Contributing

This is the spine of the QOTE ecosystem. Contributions welcome.

1. Fork the repo
2. Create a feature branch
3. Make changes
4. Submit PR

---

## 📄 License

MIT

---

## 🧬 The Vision

QOTE Middleware is not just an API—it's the **nervous system** that coordinates:

- Guardian (family support)
- Coherence Correlator (ESP research)
- Clinic (medical communication)
- EconOSphere (economic modeling)
- UV/Field monitoring

One coherent behavioral pattern. One source of truth. One spine.

**Build with coherence. Scale with intention.**
