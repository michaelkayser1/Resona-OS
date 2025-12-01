# QOTE • Resona Dashboard v0.2

**Provisional Patent Demonstrator**  
_The Lens of QOTE: Oscillatory Neural Framework for Resonant Coherence and Relational Adaptation_

This app is a live demo of the **QOTE** framework, showcasing oscillatory embeddings, Kuramoto synchronization, coherence gating (CUST), relational Δθ control, resonance mapping, and distributed multi-agent synchronization.

It directly illustrates the **claims of the provisional patent** and integrates **TRIZ methodology** for adaptive recovery.

---

## 🚀 Features

### Core (v0 → v0.1)
- **Dashboard View** (`/dashboard`)
  - Coherence gauge (R) with CUST gate (φ ≈ 0.618)
  - Kuramoto synchronization sim
  - Resonance Map (W) readout
- **Lab View** (`/lab`)
  - Lucide/Tailwind chat interface
  - Tone selector (Δθ controller: Standard / Formal / Creative)
  - Simulated "Answer when Ready" gating

### New in v0.2
- **Patent Alignment Mode**  
  Live overlay shows which claims are currently demonstrated:
  - Oscillatory embeddings ✔️
  - Kuramoto synchronization ✔️
  - Phase-coherent attention ◐ (partial)
  - Relational Δθ controller ✔️
  - CUST gating ✔️
  - Resonance map W ✔️
  - Multi-agent sync ◐ (planned)
- **Interactive TRIZ Mode**  
  When coherence dips (R < τ), a TRIZ panel proposes recovery ideas:
  - Drawn from a compact inventive principle set (Dynamics, Feedback, Phase Transition, etc.)
  - Click **Adopt** to inject into the Answer panel
- **Δθ Slider**  
  Direct control of relational phase offset for experiments

---

## 🛠️ Local Setup

### 1. Clone the repo
\`\`\`bash
git clone https://github.com/<your-org>/<your-repo>.git
cd <your-repo>
\`\`\`

### 2. Install dependencies
\`\`\`bash
pnpm install
# or
npm install
# or
yarn install
\`\`\`

### 3. Environment variables
Copy the example and edit:
\`\`\`bash
cp .env.local.example .env.local
\`\`\`

Add your Resona API endpoint:
\`\`\`env
RESONA_API_ENDPOINT=https://www.kayser-medical.com/resona/api/message
RESONA_API_KEY=your_api_key_if_needed
\`\`\`

If no API is available, the app runs in demo mode with simulated CUST gating.

### 4. Run locally
\`\`\`bash
pnpm dev
# or npm run dev / yarn dev
\`\`\`

Open http://localhost:3000.

---

## ☁️ Deployment (Vercel)

1. Push this repo to GitHub/GitLab/Bitbucket.
2. Log into Vercel → New Project → import the repo.
3. Framework: Next.js (auto-detected).
4. Set environment variables in Project Settings:
   - `RESONA_API_ENDPOINT`
   - `RESONA_API_KEY` (optional)
5. Deploy.

### Custom Domain
- In Vercel → Project → Settings → Domains → Add `resona.kayser-medical.com`
- Point DNS CNAME to `cname.vercel-dns.com`
- SSL is automatic.

---

## 📂 Project Structure

\`\`\`
app/
  dashboard/        # Main QOTE dashboard
  lab/              # Chat-style Lab view
  api/resona/       # Proxy route → forwards to RESONA_API_ENDPOINT
components/
  PatentAlignment.js # Claim alignment overlay
  TRIZPanel.js       # Interactive TRIZ suggestions
lib/
  triz.js            # TRIZ principle library + helpers
\`\`\`

---

## 🔬 Patent Claim Mapping (v0.2)

- **Claim 1(a)**: Oscillatory Embeddings → Active (phase states simulated)
- **Claim 1(b)**: Kuramoto Synchronization → Active
- **Claim 1(c)**: Phase-Coherent Attention → Partial (attention entropy proxy, ready for full λ·cos(θ) injection)
- **Claim 1(d)**: Relational Δθ Controller → Active (tone + slider)
- **Claim 1(e)**: CUST Gate → Active (R ≥ φ)
- **Claim 1(f)**: Resonance Map W → Active
- **Claim 2–4** (System, Content Ladder, Multi-Agent) → UI stubs + roadmap

---

## 📈 Next Extensions

- **Phase Attention Heatmap**: display λ·cos(θ_i−θ_j−Δθ) per head → flip Claim 1(c) to active.
- **Content Ladder Route**: `/ladder` with Idea → Short → Mid → Long → Final progression and resonance collapse animations.
- **Multi-Agent Sync View**: Research / Creative / Dialogue / Quality columns, shared Δθ pool, coherence voting.

---

## 👤 Author

**Dr. Michael A. Kayser, DO, FACMG**  
Kayser Medical PLLC  
[Kayser-Medical.com](https://kayser-medical.com)

---

## 📜 License

This repo is a patent demonstrator for *The Lens of QOTE* provisional filing (Aug 27, 2025).  
All rights reserved. Do not copy, redistribute, or repurpose without permission.
