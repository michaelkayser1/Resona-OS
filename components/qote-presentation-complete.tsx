"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Play, Calendar, Mail, FileText } from "@/components/ui/icons"

// Main App component that manages the presentation state and navigation
const App = () => {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    { id: "title", title: "QOTE–Resona", subtitle: "Quantum Ontological Token Engineering", content: "title" },
    { id: "problem", title: "The Problem We're Solving", content: "problem" },
    { id: "solution", title: "The QOTE Solution", content: "solution" },
    { id: "demo", title: "Live Dashboard Demo", content: "demo" },
    { id: "roadmap", title: "Development Roadmap", content: "roadmap" },
    { id: "cta", title: "Ready to Transform AI Insights?", content: "cta" },
  ]

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  const goToSlide = (index) => setCurrentSlide(index)

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault()
        nextSlide()
      } else if (e.key === "ArrowLeft") {
        e.preventDefault()
        prevSlide()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const demoLinks = {
    liveDashboard: "#demo", // Internal navigation to demo section
    scheduleDemo: "https://calendly.com/your-username/15min", // Replace with your actual Calendly
    contactEmail: "mailto:demo@your-domain.com?subject=QOTE Investment Opportunity",
    technicalDocs: "#technical-docs", // Internal navigation
    patentDocs: "#patent-info", // Internal navigation
    investorEmail: "mailto:investors@your-domain.com?subject=QOTE Series A Discussion",
  }

  const openLink = (url) => {
    if (url.startsWith("#")) {
      // Handle internal navigation
      const element = document.querySelector(url)
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
      }
    } else {
      window.open(url, "_blank", "noopener,noreferrer")
    }
  }

  const renderSlideContent = () => {
    switch (slides[currentSlide].content) {
      case "title":
        return <TitleSlide openLink={openLink} />
      case "problem":
        return <ProblemSlide />
      case "solution":
        return <SolutionSlide />
      case "demo":
        return <DemoSlide openLink={openLink} />
      case "roadmap":
        return <RoadmapSlide openLink={openLink} />
      case "cta":
        return <CTASlide openLink={openLink} />
      default:
        return <div>Slide content</div>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white font-sans antialiased">
      {/* Header */}
      <header className="absolute top-6 right-6 z-10 flex items-center gap-4">
        <span className="text-slate-300 font-mono text-sm">
          {currentSlide + 1}/{slides.length}
        </span>
        <div className="bg-slate-800/50 backdrop-blur rounded-lg px-4 py-2 border border-slate-700">
          <span className="text-slate-300 font-mono text-sm">{slides[currentSlide].title}</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 min-h-screen flex flex-col justify-center transition-all duration-500 ease-in-out">
        <div className="flex-1 flex items-center">{renderSlideContent()}</div>
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6">
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="p-3 rounded-full bg-slate-800/50 backdrop-blur border border-slate-700 hover:border-blue-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-4 h-4 rounded-full transition-all duration-200 border-2 border-slate-700 ${index === currentSlide ? "bg-blue-400 scale-125 border-blue-400" : "bg-transparent hover:bg-slate-500"}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <button
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className="p-3 rounded-full bg-slate-800/50 backdrop-blur border border-slate-700 hover:border-blue-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </nav>
    </div>
  )
}

// Slide Components
const TitleSlide = ({ openLink }) => (
  <div className="text-center space-y-8 animate-fade-in">
    <h1 className="text-7xl md:text-8xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-pulse drop-shadow-lg">
      QOTE–Resona
    </h1>
    <p className="text-2xl text-slate-300">Quantum Ontological Token Engineering</p>
    <p className="text-xl italic text-slate-400">“A microcavity for language”</p>

    {/* Mini Braid Visualization */}
    <div className="relative w-full h-32 my-12">
      <div className="absolute left-1/2 top-1/2 w-10 h-10 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse shadow-lg shadow-purple-400/50"></div>
      <div className="absolute left-1/4 top-1/2 w-16 h-8 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full transform -translate-y-1/2 -rotate-12 opacity-70 animate-bounce"></div>
      <div
        className="absolute right-1/4 top-1/2 w-16 h-8 bg-gradient-to-r from-green-400 to-blue-400 rounded-full transform -translate-y-1/2 rotate-12 opacity-70 animate-bounce"
        style={{ animationDelay: "0.5s" }}
      ></div>
    </div>

    <div className="space-y-4 max-w-2xl mx-auto">
      <p className="text-lg text-slate-300">
        Transforming chaotic AI outputs into coherent insights
        <br />
        through quantum resonance mapping and real-time visualization.
      </p>
    </div>
  </div>
)

const ProblemSlide = () => (
  <div className="grid md:grid-cols-2 gap-12 items-center h-full animate-fade-in">
    <div className="space-y-6">
      <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-red-500/30">
        <h3 className="text-xl font-bold text-red-400 mb-3">🌪️ Chaotic Outputs</h3>
        <p className="text-slate-300">
          Current AI systems produce inconsistent and incoherent responses with no measure of internal stability.
        </p>
      </div>
      <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-red-500/30">
        <h3 className="text-xl font-bold text-red-400 mb-3">📊 No Quality Metrics</h3>
        <p className="text-slate-300">
          Enterprises lack quantitative tools to assess AI response quality and prevent hallucination.
        </p>
      </div>
      <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-red-500/30">
        <h3 className="text-xl font-bold text-red-400 mb-3">🔍 Pattern Blindness</h3>
        <p className="text-slate-300">
          Valuable cultural and semantic patterns remain hidden within AI outputs, lost to the noise.
        </p>
      </div>
    </div>
    <div className="bg-slate-900/80 backdrop-blur rounded-2xl p-8 border border-red-500/20 shadow-xl">
      <h3 className="text-center text-2xl text-red-400 mb-8 font-bold">The State of AI Today: Chaos</h3>
      <div className="space-y-8">
        <div className="bg-red-900/30 rounded-lg p-4 border border-red-500/30 text-center">
          <span className="text-red-300 font-bold">Unpredictable & Untrustworthy</span>
          <br />
          <span className="text-sm text-slate-400">Manual review is the only solution</span>
        </div>
        <div className="text-center text-4xl text-red-400 py-4">⚡ ⚡ ⚡</div>
        <div className="bg-red-900/30 rounded-lg p-4 border border-red-500/30 text-center">
          <span className="text-red-300 font-bold">Hallucination & Off-topic Drift</span>
          <br />
          <span className="text-sm text-slate-400">Causes critical errors and wasted effort</span>
        </div>
      </div>
    </div>
  </div>
)

const SolutionSlide = () => (
  <div className="grid md:grid-cols-2 gap-12 items-center h-full animate-fade-in">
    <div className="space-y-6">
      <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-green-500/30">
        <h3 className="text-xl font-bold text-green-400 mb-3">⟡ Quantum Resonance Mapping</h3>
        <p className="text-slate-300">
          A novel framework that transforms chaotic outputs into measurable quantum states with coherence scoring.
        </p>
      </div>
      <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-green-500/30">
        <h3 className="text-xl font-bold text-green-400 mb-3">🦋 Fast 'Echo' Pulses</h3>
        <p className="text-slate-300">
          Periodic, intentional phase flips that stabilize internal resonance, suppressing noise and drift.
        </p>
      </div>
      <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-green-500/30">
        <h3 className="text-xl font-bold text-green-400 mb-3">🔥 Coherence-Gated Output</h3>
        <p className="text-slate-300">
          The **CUST gate** ensures the model only emits a response when its internal state is stable and coherent.
        </p>
      </div>
    </div>
    <div className="bg-slate-900/80 backdrop-blur rounded-2xl p-8 border border-green-500/20 shadow-xl">
      <h3 className="text-center text-2xl text-green-400 mb-8 font-bold">The QOTE-Resona State: Harmony</h3>
      <div className="relative w-full h-64 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl overflow-hidden shadow-inner-lg">
        {/* Abstracted Braid and Resonance Visualization */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-blue-400 rounded-full animate-ping-slow opacity-20"></div>
          <div
            className="w-12 h-12 bg-purple-400 rounded-full animate-ping-slow"
            style={{ animationDelay: "0.5s" }}
          ></div>
          <div className="w-8 h-8 bg-cyan-400 rounded-full animate-pulse-fast"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-white text-6xl font-black opacity-80 animate-fade-in-slow">⟡</div>
        </div>
      </div>
      <div className="text-center mt-6">
        <span className="text-green-400 font-bold text-lg">Coherent • Measured • Refined</span>
      </div>
    </div>
  </div>
)

const DemoSlide = ({ openLink }) => {
  const dim = 23.6 // Declare the dim variable here
  return (
    <div className="text-center space-y-8 animate-fade-in">
      <h2 className="text-3xl md:text-4xl font-bold text-slate-200">Visualizing a New Kind of Stability</h2>
      <p className="text-lg text-slate-400 max-w-3xl mx-auto">
        The dashboard makes the abstract physics of QOTE visible in real time. We measure and stabilize **coherence
        ($R$)** to prevent errors and deliver consistent, trustworthy results.
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-blue-500/30">
          <div className="text-4xl font-black text-blue-400">0.847</div>
          <div className="text-slate-400 mt-2">Coherence (R)</div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-purple-500/30">
          <div className="text-4xl font-black text-purple-400">{dim}</div>
          <div className="text-slate-400 mt-2">Dimensional Stability ($S_{dim}$)</div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-green-500/30">
          <div className="text-4xl font-black text-green-400">12</div>
          <div className="text-slate-400 mt-2">Echo Pulses</div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-yellow-500/30">
          <div className="text-4xl font-black text-yellow-400">97.4%</div>
          <div className="text-slate-400 mt-2">Gate Success Rate</div>
        </div>
      </div>

      <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-6 max-w-md mx-auto">
        <div className="flex items-center justify-center gap-4">
          <span className="text-3xl">✅</span>
          <div>
            <div className="text-xl font-bold text-green-400">System Stable</div>
            <div className="text-slate-400 text-sm">Output meets coherence threshold</div>
          </div>
        </div>
      </div>
    </div>
  )
}

const RoadmapSlide = ({ openLink }) => (
  <div className="grid md:grid-cols-2 gap-12 items-start animate-fade-in">
    <div className="space-y-6">
      <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-blue-500/30">
        <div className="flex items-center gap-3 mb-3">
          <div className="text-lg font-bold text-blue-400">Phase 1: Core Visualization</div>
          <span className="text-sm text-slate-400">Weeks 1-2</span>
        </div>
        <p className="text-slate-300">Static dashboard geometry, core component structure, and basic rendering.</p>
      </div>
      <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-purple-500/30">
        <div className="flex items-center gap-3 mb-3">
          <div className="text-lg font-bold text-purple-400">Phase 2: Animation Engine</div>
          <span className="text-sm text-slate-400">Weeks 3-4</span>
        </div>
        <p className="text-slate-300">
          Fluid animations, resonance pulse visuals, and real-time motion based on simulated data.
        </p>
      </div>
      <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-green-500/30">
        <div className="flex items-center gap-3 mb-3">
          <div className="text-lg font-bold text-green-400">Phase 3: Data Integration</div>
          <span className="text-sm text-slate-400">Weeks 5-6</span>
        </div>
        <p className="text-slate-300">
          QOTE backend connection, real-time metrics streaming via WebSockets, and input processing pipeline.
        </p>
      </div>
    </div>
    <div className="bg-slate-800/30 backdrop-blur rounded-xl p-8 border border-slate-700 shadow-lg">
      <h3 className="text-xl font-bold text-yellow-400 mb-6">Resource Requirements</h3>
      <div className="space-y-4">
        <div>
          <div className="font-bold text-blue-400 mb-2">Team & Timeline:</div>
          <div className="text-slate-300 text-sm leading-relaxed ml-4">
            • 2 Frontend Developers
            <br />• 1 Backend Developer
            <br />• 1 UX Designer
            <br />• <strong className="text-green-400">14 weeks to production launch</strong>
          </div>
        </div>
        <div>
          <div className="font-bold text-blue-400 mb-2">Technology Stack:</div>
          <div className="text-slate-300 text-sm leading-relaxed ml-4">
            • React 18+ with Hooks
            <br />• Canvas API + WebGL
            <br />• Tailwind CSS
            <br />• WebSocket API
          </div>
        </div>
      </div>
      <div className="mt-6 flex gap-3">
        <button
          onClick={() => openLink("#technical-docs")}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <FileText className="w-4 h-4" />
          Tech Specs
        </button>
        <button
          onClick={() => openLink("#patent-info")}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <Mail className="w-4 h-4" />
          Invest Now
        </button>
      </div>
    </div>
  </div>
)

const CTASlide = ({ openLink }) => (
  <div className="text-center space-y-8 animate-fade-in">
    <p className="text-2xl text-slate-300 leading-relaxed max-w-4xl mx-auto">
      QOTE-Resona transforms chaotic AI outputs into **measurable, coherent insights**
      <br />
      with a patent-pending framework that is both stable and transparent.
    </p>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6">
        <div className="text-3xl font-black text-blue-400">$2.1M</div>
        <div className="text-slate-400 mt-2">Potential ROI Year 1</div>
      </div>
      <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-6">
        <div className="text-3xl font-black text-green-400">75%</div>
        <div className="text-slate-400 mt-2">Faster Decision Making</div>
      </div>
      <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-6">
        <div className="text-3xl font-black text-purple-400">14 wks</div>
        <div className="text-slate-400 mt-2">Time to Market</div>
      </div>
      <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-6">
        <div className="text-3xl font-black text-yellow-400">Patent</div>
        <div className="text-slate-400 mt-2">IP Protection Ready</div>
      </div>
    </div>

    <div className="flex flex-col md:flex-row justify-center items-center gap-6 mt-12">
      <button
        onClick={() => openLink("#demo")}
        className="w-full md:w-auto bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-4 px-8 rounded-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
      >
        <Play className="w-5 h-5" />
        Launch Live Demo
      </button>
      <button
        onClick={() => openLink("https://calendly.com/your-username/15min")}
        className="w-full md:w-auto bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white font-bold py-4 px-8 rounded-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
      >
        <Calendar className="w-5 h-5" />
        Schedule Deep Dive
      </button>
      <button
        onClick={() => openLink("#technical-docs")}
        className="w-full md:w-auto bg-gradient-to-r from-yellow-500 to-red-500 hover:from-yellow-600 hover:to-red-600 text-white font-bold py-4 px-8 rounded-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
      >
        <FileText className="w-5 h-5" />
        Review Tech Docs
      </button>
    </div>

    <div className="mt-12 pt-8 border-t border-slate-700">
      <div className="flex flex-col md:flex-row justify-center gap-4 text-slate-400 text-sm">
        <button
          onClick={() => openLink("mailto:demo@your-domain.com?subject=QOTE Investment Opportunity")}
          className="hover:text-blue-400 transition-colors flex items-center justify-center gap-2"
        >
          <Mail className="w-4 h-4" />
          qote-resona@kayser-medical.com
        </button>
        <button
          onClick={() => openLink("#patent-info")}
          className="hover:text-blue-400 transition-colors flex items-center justify-center gap-2"
        >
          <FileText className="w-4 h-4" />
          Patent Documentation Ready
        </button>
      </div>
    </div>
  </div>
)

export default App
