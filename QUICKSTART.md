# QOTE Middleware Quickstart

Get QOTE Middleware running in 5 minutes.

---

## Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- PostgreSQL ([Download](https://www.postgresql.org/) or use [Vercel Postgres](https://vercel.com/storage/postgres))
- OpenAI API key ([Get one](https://platform.openai.com/api-keys))

---

## Step 1: Clone & Install

```bash
git clone https://github.com/yourusername/qote-middleware.git
cd qote-middleware
npm install
```

---

## Step 2: Environment Setup

Copy the example env file:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```bash
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://user:password@localhost:5432/qote_middleware
```

---

## Step 3: Database Setup

Generate Prisma client and push schema:

```bash
npm run db:generate
npm run db:push
```

This creates all the necessary tables in your PostgreSQL database.

---

## Step 4: Run Development Server

```bash
npm run dev
```

Server starts at `http://localhost:3000`

---

## Step 5: Test It

### Option A: Using curl

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

### Option B: Using Postman

1. Import `QOTE-Middleware.postman_collection.json`
2. Set `base_url` variable to `http://localhost:3000`
3. Run "Simple Chat" request

---

## What You Should See

```json
{
  "session_id": "qote-session-...",
  "message_id": "test-123",
  "trace_id": "qote-trace-...",
  "answer": {
    "text": "TSC (Tuberous Sclerosis Complex) symptoms include...",
    "style": "conversational",
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
    "reasons": ["coherent"]
  },
  "safety_flags": [],
  "logging": {
    "stored": true,
    "timestamp": "2025-11-13T19:34:22Z"
  }
}
```

---

## Next Steps

### Test the Event Endpoint

```bash
curl -X POST http://localhost:3000/api/qote/event \
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

### View Database Logs

```bash
npm run db:studio
```

Opens Prisma Studio at `http://localhost:5555` to view all logged events.

### Customize Configuration

Edit `src/config/policy.json` to adjust gating thresholds:

```json
{
  "thresholds": {
    "critical": 0.8,
    "unstable": 0.55,
    "borderline": 0.3
  }
}
```

No rebuild needed—just restart the dev server.

---

## Deploy to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial QOTE Middleware setup"
git push origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Select your GitHub repo
4. Add environment variables:
   - `OPENAI_API_KEY`
   - `DATABASE_URL` (use Vercel Postgres)
5. Deploy

### 3. Test Production

```bash
curl -X POST https://your-project.vercel.app/api/qote/chat \
  -H "Content-Type: application/json" \
  -d '{"message_id": "prod-test-1", "channel": "guardian", "user_role": "clinician", "input_type": "text", "input_text": "Test message"}'
```

---

## Troubleshooting

### Error: "Cannot find module '@prisma/client'"

```bash
npm run db:generate
```

### Error: "OPENAI_API_KEY is not set"

Check your `.env` file and restart the server.

### Error: "Database connection failed"

Verify `DATABASE_URL` is correct and PostgreSQL is running.

---

## Documentation

- [Full README](README.md)
- [API Reference](docs/API_REFERENCE.md)

---

## Support

- GitHub Issues: https://github.com/yourorg/qote-middleware/issues
- Email: support@qote.dev

---

**You're all set! 🚀**

QOTE Middleware is now running and ready to power your QOTE-aware applications.
