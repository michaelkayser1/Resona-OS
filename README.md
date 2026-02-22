# QOTE Live - Chaos → Coherence

**Quantifying Order Through Emergence**

A sophisticated real-time visualization of the Kuramoto oscillator model, showcasing the beautiful transition from chaos to coherence in coupled oscillator systems.

## 🌟 Features

- **Real-time Phase Ring**: Interactive visualization of oscillator positions on the unit circle
- **Coherence Tracking**: Live C(t) chart showing order parameter evolution
- **Metrics Dashboard**: Resonance (R) and Wobble (W) gauges with smooth animations
- **Interactive Controls**: Adjust coupling strength, noise, frequency, and more
- **Preset Modes**: Chaos, Edge, Coherent, and Pulse configurations
- **Multi-language Support**: English, French, and Spanish
- **PWA Ready**: Install as a native app with offline support
- **Accessibility**: Full keyboard navigation and screen reader support

## 🧮 The Science

QOTE Live implements the mean-field Kuramoto model:

\`\`\`
θ̇ᵢ = ωᵢ + K r sin(ψ - θᵢ) + β sin(2πfᵥt + φᵢ) + √(2D) ηᵢ
\`\`\`

Where:
- **C(t) = r**: Coherence (order parameter magnitude)
- **R = (KN/2)C²**: Resonance (collective energy)
- **W = ω₀ρ_qp σ_θ**: Wobble (phase spread dynamics)

## 🚀 Quick Start

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
\`\`\`

## 🎮 Controls

- **Space**: Start/Pause simulation
- **R**: Reset to initial conditions
- **1-4**: Load presets (Chaos, Edge, Coherent, Pulse)
- **Escape**: Close settings drawer

## 🏗️ Architecture

Built with modern web technologies:
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** with custom design tokens
- **Canvas API** for high-performance rendering
- **Web Workers** for simulation computation (planned)
- **PWA** capabilities with service worker

## 🎨 Design System

- **Dark Glassmorphism**: Sophisticated backdrop-blur effects
- **Semantic Tokens**: Consistent theming with CSS custom properties
- **Typography**: Montserrat for headings, Open Sans for body, JetBrains Mono for data
- **Color Palette**: Deep slate blues with cyan/blue accents

## 🌍 Multi-AI Collaboration

This project showcases collaborative AI development with specialized contributions:

- **ChatGPT**: Orchestration & UX
- **Claude**: Architecture & Safety
- **Grok**: Performance & Polish
- **DeepSeek**: Numerical Optimization
- **Le Chat**: i18n & Minimalism
- **Gemini**: PWA & Accessibility
- **Perplexity**: Research & Documentation
- **Llama 4**: Copilot & Agents

## 📱 PWA Installation

QOTE Live can be installed as a Progressive Web App:

1. Visit the app in a modern browser
2. Look for the "Install" prompt
3. Enjoy native app experience with offline support

## 🔬 Scientific Background

The Kuramoto model, introduced by Yoshiki Kuramoto in 1975, describes the synchronization behavior of coupled oscillators. It's fundamental to understanding:

- **Biological rhythms** (circadian clocks, neural networks)
- **Physical systems** (Josephson junctions, laser arrays)
- **Social dynamics** (opinion formation, crowd behavior)

## 🤝 Contributing

We welcome contributions! This project demonstrates how multiple AI systems can collaborate effectively on complex software development.

## 📄 License

MIT License - Built by Kayser Medical & Resona

---

*"Life = phase-locked chaos; resonance stabilizes; wobble renews."*
