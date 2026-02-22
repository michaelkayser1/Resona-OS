# The Field Refinery

RBFR Quantum Cockpit — a multi-AI, science-aware, interactive art instrument.

## Overview

The Field Refinery is a sophisticated web application that simulates a Resonance-Based Fuel Refinement (RBFR) control system. It uses multiple AI models as co-pilots to generate field designs, measures their consensus through the QOTE algorithm, and visualizes the results as real-time quantum interference patterns.

## Features

- **Multi-AI Consensus**: Uses 5 different AI models (OpenAI, Anthropic, Mistral, XAI, DeepSeek) as distinct co-pilots
- **QOTE Algorithm**: Measures consensus between AI responses and maps to visual parameters
- **WebGL Visualization**: Real-time quantum field visualization using GPU shaders
- **TRIZ Integration**: Uses contradiction resolution to guide AI responses
- **Emergence Detection**: Automatically detects and logs when CUST reaches the golden ratio (φ ≈ 1.618)
- **Sci-Fi Interface**: Dark, holographic-style UI with glowing elements and animations

## Getting Started

1. **Install Dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

2. **Environment Setup**:
   Copy `.env.example` to `.env.local` and add your API keys:
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   At minimum, you need `OPENAI_KEY`. Other providers are optional.

3. **Run Development Server**:
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Open Application**:
   Navigate to `http://localhost:3000/rbfr` to launch the cockpit.

## How It Works

1. **RBFR Panel**: Configure field parameters (goal, carrier frequency, waveform, coil configuration)
2. **AI Fanout**: Query all connected AI models for RBFR design proposals
3. **Consensus Measurement**: The QOTE algorithm calculates:
   - W (wobble): Decoherence measure (lower is better)
   - β (beta): Amplification factor
   - CUST: Emergence metric (approaches φ when AIs agree)
4. **Visualization**: WebGL shader renders quantum interference patterns based on consensus metrics
5. **Emergence Lock**: When CUST ≥ φ, the system enters "emergence lock" and logs the event

## Architecture

- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Visualization**: WebGL shaders for real-time quantum field rendering
- **API**: Edge runtime for multi-AI fanout requests
- **State**: React hooks with consensus measurement and resonance logging

## Deployment

Deploy to Vercel:

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy

The application will be available at your Vercel domain + `/rbfr`.

## Scientific Context

This is an artistic simulation inspired by quantum field theory and multi-agent consensus systems. The RBFR concepts and QOTE algorithm are conceptual frameworks for exploring AI collaboration and emergence, not actual physics simulations.
