"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback, useMemo } from "react"

const GOLDEN_RATIO_THRESHOLD = 0.618
const PHI = 1.618

type Tone = "Standard" | "Formal" | "Creative"
type CustState = "ACCUMULATING" | "EVALUATING" | "PASSED" | "FAILED"

export const storage = {
  get<T>(k: string, fallback: T): T {
    try {
      if (typeof localStorage === "undefined") return fallback
      const v = localStorage.getItem(k)
      return v ? (JSON.parse(v) as T) : fallback
    } catch {
      return fallback
    }
  },
  set<T>(k: string, v: T) {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(k, JSON.stringify(v))
      }
    } catch {}
  },
}

export class QoteEngine {
  private rng: () => number
  private cust: CustState = "ACCUMULATING"
  private stepsSinceStart = 0

  constructor(rng: () => number) {
    this.rng = rng
  }

  reset() {
    this.cust = "ACCUMULATING"
    this.stepsSinceStart = 0
  }

  step(params: any) {
    this.stepsSinceStart++

    const baseCoherence = 0.6 + this.rng() * 0.3
    const deltaTheta = 0.1 + this.rng() * 0.2
    const entanglement = 0.7 + this.rng() * 0.2
    const wobble = this.rng() * 0.4

    if (this.stepsSinceStart > 5 && baseCoherence > 0.7) {
      this.cust = "PASSED"
    } else if (this.stepsSinceStart > 15) {
      this.cust = "FAILED"
    } else {
      this.cust = "EVALUATING"
    }

    return {
      metrics: {
        coherence: baseCoherence,
        deltaTheta,
        entanglement,
        wobble,
        threshold: GOLDEN_RATIO_THRESHOLD,
      },
      cust: this.cust,
    }
  }

  resync() {
    this.cust = "ACCUMULATING"
    this.stepsSinceStart = 1
    return {
      metrics: {
        coherence: 0.65,
        deltaTheta: 0.18,
        entanglement: 0.8,
        wobble: 0.25,
        threshold: GOLDEN_RATIO_THRESHOLD,
      },
      cust: "ACCUMULATING",
    }
  }
}

export function hashSeed(s: string) {
  let h = 1779033703 ^ s.length
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    const t = (h ^= h >>> 16) >>> 0
    return t / 4294967296
  }
}

function Sparkline({ data }: { data: number[] }) {
  const w = 160,
    h = 40,
    pad = 2
  if (!data.length) return <svg width={w} height={h} aria-hidden />

  const step = (w - pad * 2) / Math.max(1, data.length - 1)
  const pts = data
    .map((v, i) => {
      const x = pad + i * step
      const y = pad + (1 - v) * (h - pad * 2)
      return `${x},${y}`
    })
    .join(" ")

  return (
    <svg width={w} height={h} role="img" aria-label="Coherence sparkline">
      <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

function Dashboard({
  coherence,
  appliedDeltaTheta,
  currentTone,
  coherenceHistory,
  setCurrentTone,
  entanglement,
  wobble,
  threshold,
}: any) {
  const tones: Tone[] = ["Standard", "Formal", "Creative"]

  return (
    <aside
      className="w-full md:w-1/3 lg:w-1/4 bg-slate-800 rounded-2xl p-6 mb-4 md:mr-4 border-2 border-slate-700"
      style={{
        width: "100%",
        backgroundColor: "#1e293b",
        borderRadius: "1rem",
        padding: "1.5rem",
        marginBottom: "1rem",
        border: "2px solid #334155",
        maxWidth: "400px",
      }}
    >
      <h2
        className="text-xl font-bold text-slate-200 mb-4"
        style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#e2e8f0", marginBottom: "1rem" }}
      >
        QOTE Resona Dashboard
      </h2>

      <div className="mb-4" style={{ marginBottom: "1rem" }}>
        <div
          className="text-sm text-slate-400 mb-2"
          style={{ fontSize: "0.875rem", color: "#94a3b8", marginBottom: "0.5rem" }}
        >
          Coherence (R): {coherence.toFixed(3)}
        </div>
        <Sparkline data={coherenceHistory.slice(-40)} />
        <div
          className="mt-2 text-xs text-slate-400 grid grid-cols-2 gap-2"
          style={{
            marginTop: "0.5rem",
            fontSize: "0.75rem",
            color: "#94a3b8",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.5rem",
          }}
        >
          <div>
            Δθ:{" "}
            <span className="font-mono text-slate-100" style={{ fontFamily: "monospace", color: "#f1f5f9" }}>
              {appliedDeltaTheta.toFixed(3)}
            </span>
          </div>
          <div>
            Entangl.:{" "}
            <span className="font-mono text-slate-100" style={{ fontFamily: "monospace", color: "#f1f5f9" }}>
              {entanglement.toFixed(3)}
            </span>
          </div>
          <div>
            Wobble:{" "}
            <span className="font-mono text-slate-100" style={{ fontFamily: "monospace", color: "#f1f5f9" }}>
              {wobble.toFixed(2)}
            </span>
          </div>
          <div>
            Threshold:{" "}
            <span className="font-mono text-slate-100" style={{ fontFamily: "monospace", color: "#f1f5f9" }}>
              {threshold.toFixed(3)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap" style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {tones.map((tone) => (
          <button
            key={tone}
            onClick={() => setCurrentTone(tone)}
            className={`py-2 px-4 rounded-full text-sm font-semibold transition-all duration-200 ${
              currentTone === tone ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "9999px",
              fontSize: "0.875rem",
              fontWeight: "600",
              backgroundColor: currentTone === tone ? "#2563eb" : "#334155",
              color: currentTone === tone ? "#ffffff" : "#cbd5e1",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {tone}
          </button>
        ))}
      </div>
    </aside>
  )
}

function getResponseText(tone: Tone, coherence: number, userInput: string): string {
  const responses = {
    consciousness: "Consciousness emerges from quantum field interactions, creating coherent patterns of awareness.",
    quantum: "Quantum mechanics reveals the fundamental interconnectedness of all information systems.",
    time: "Time flows as a river of quantum states, each moment a crystallization of possibility.",
    creative: "Let's explore the creative dimensions where imagination meets quantum possibility.",
    default: "The quantum field resonates with your inquiry, revealing new patterns of understanding.",
  }

  const input = userInput.toLowerCase()
  let response = responses.default

  if (input.includes("consciousness") || input.includes("aware")) response = responses.consciousness
  else if (input.includes("quantum") || input.includes("physics")) response = responses.quantum
  else if (input.includes("time") || input.includes("future")) response = responses.time
  else if (input.includes("create") || input.includes("art")) response = responses.creative

  const fieldStatus =
    coherence > 0.8
      ? "Field locks: crystalline clarity."
      : coherence > 0.65
        ? "Standing wave stabilized."
        : "Signal coherent enough for transmission."

  if (tone === "Formal") return `${fieldStatus} ${response} Analysis complete with canonical framing.`
  if (tone === "Creative") return `${fieldStatus} ${response} ✨ The mythic threads weave golden patterns.`
  return `${fieldStatus} ${response}`
}

export default function App() {
  const [messages, setMessages] = useState<any[]>([
    {
      text: "🌟 QOTE Resona System Initialized",
      sender: "bot",
      isSystem: true,
    },
    {
      text: "Advanced quantum-inspired conversational AI with coherence field dynamics. Ask me anything to see the quantum field respond!",
      sender: "bot",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentTone, setCurrentTone] = useState<Tone>("Standard")
  const [coherence, setCoherence] = useState<number>(0.65)
  const [coherenceHistory, setCoherenceHistory] = useState<number[]>([0.65])
  const [appliedDeltaTheta, setAppliedDeltaTheta] = useState<number>(0.18)

  const sessionId = useMemo(() => crypto.randomUUID(), [])
  const rng = useMemo(() => hashSeed(sessionId + currentTone), [sessionId, currentTone])
  const engine = useMemo(() => new QoteEngine(rng), [rng])

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const simulateApiCall = useCallback(
    async (userText: string) => {
      setIsLoading(true)
      engine.reset()

      setMessages((prev) => [...prev, { text: "Tuning field parameters…", sender: "bot", isSystem: true }])

      for (let i = 0; i < 8; i++) {
        await new Promise((r) => setTimeout(r, 200))

        const step = engine.step({
          input: userText,
          tone: currentTone,
          lastCoherence: coherence,
        })

        setCoherence(step.metrics.coherence)
        setAppliedDeltaTheta(step.metrics.deltaTheta)
        setCoherenceHistory((prev) => [...prev.slice(-39), step.metrics.coherence])

        if (step.cust === "PASSED") {
          setMessages((prev) => [
            ...prev,
            {
              text: getResponseText(currentTone, step.metrics.coherence, userText),
              sender: "bot",
              metrics: {
                finalCoherence: step.metrics.coherence.toFixed(3),
                deltaTheta: step.metrics.deltaTheta.toFixed(3),
                entanglementStrength: step.metrics.entanglement.toFixed(3),
              },
            },
          ])
          setIsLoading(false)
          return
        }
      }

      setMessages((prev) => [
        ...prev,
        { text: "CUST evaluation timeout. Try resynchronization.", sender: "bot", isError: true },
      ])
      setIsLoading(false)
    },
    [coherence, currentTone, engine],
  )

  const handleSendMessage = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault()
      if (!input.trim() || isLoading) return

      const text = input.trim()
      setMessages((prev) => [...prev, { text, sender: "user" }])
      setInput("")

      await simulateApiCall(text)
    },
    [input, isLoading, simulateApiCall],
  )

  return (
    <div
      className="flex flex-col md:flex-row min-h-screen bg-slate-900 text-slate-100 p-4"
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#0f172a",
        color: "#f1f5f9",
        padding: "1rem",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <Dashboard
        coherence={coherence}
        appliedDeltaTheta={appliedDeltaTheta}
        currentTone={currentTone}
        coherenceHistory={coherenceHistory}
        setCurrentTone={setCurrentTone}
        entanglement={0.75}
        wobble={0.3}
        threshold={GOLDEN_RATIO_THRESHOLD}
      />

      <main
        className="flex-1 flex flex-col bg-slate-800 rounded-2xl p-6 border-2 border-slate-700"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#1e293b",
          borderRadius: "1rem",
          padding: "1.5rem",
          border: "2px solid #334155",
        }}
      >
        <div
          className="flex-1 overflow-y-auto mb-4 space-y-4"
          style={{
            flex: 1,
            overflowY: "auto",
            marginBottom: "1rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`rounded-xl p-3 ${
                msg.sender === "user"
                  ? "bg-slate-700"
                  : msg.isSystem
                    ? "bg-slate-750 border border-slate-600"
                    : "bg-slate-750"
              }`}
              style={{
                borderRadius: "0.75rem",
                padding: "0.75rem",
                backgroundColor: msg.sender === "user" ? "#334155" : "#1e293b",
                border: msg.isSystem ? "1px solid #475569" : "none",
              }}
            >
              <div
                className={`text-sm ${msg.isSystem ? "text-slate-400 italic" : ""}`}
                style={{
                  fontSize: "0.875rem",
                  color: msg.isSystem ? "#94a3b8" : "#f1f5f9",
                  fontStyle: msg.isSystem ? "italic" : "normal",
                }}
              >
                {msg.text}
              </div>
              {msg.metrics && (
                <div
                  className="mt-2 pt-2 border-t border-slate-700 text-xs text-slate-400 grid grid-cols-3 gap-2"
                  style={{
                    marginTop: "0.5rem",
                    paddingTop: "0.5rem",
                    borderTop: "1px solid #334155",
                    fontSize: "0.75rem",
                    color: "#94a3b8",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "0.5rem",
                  }}
                >
                  <div>
                    R:{" "}
                    <span className="font-mono text-slate-100" style={{ fontFamily: "monospace", color: "#f1f5f9" }}>
                      {msg.metrics.finalCoherence}
                    </span>
                  </div>
                  <div>
                    Δθ:{" "}
                    <span className="font-mono text-slate-100" style={{ fontFamily: "monospace", color: "#f1f5f9" }}>
                      {msg.metrics.deltaTheta}
                    </span>
                  </div>
                  <div>
                    S:{" "}
                    <span className="font-mono text-slate-100" style={{ fontFamily: "monospace", color: "#f1f5f9" }}>
                      {msg.metrics.entanglementStrength}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div
              className="rounded-xl p-3 bg-slate-750"
              style={{ borderRadius: "0.75rem", padding: "0.75rem", backgroundColor: "#1e293b" }}
            >
              <div
                className="flex items-center gap-2 text-sm text-slate-400"
                style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#94a3b8" }}
              >
                <div
                  className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                  style={{ width: "0.5rem", height: "0.5rem", backgroundColor: "#3b82f6", borderRadius: "9999px" }}
                ></div>
                Processing field dynamics...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="flex gap-4" style={{ display: "flex", gap: "1rem" }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 p-4 rounded-xl bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Cast a prompt into the quantum field…"
            disabled={isLoading}
            style={{
              flex: 1,
              padding: "1rem",
              borderRadius: "0.75rem",
              backgroundColor: "#334155",
              color: "#ffffff",
              border: "none",
              outline: "none",
              fontSize: "1rem",
            }}
          />
          <button
            type="submit"
            className={`p-4 rounded-xl transition-colors ${
              isLoading ? "bg-slate-700 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
            disabled={isLoading}
            style={{
              padding: "1rem",
              borderRadius: "0.75rem",
              backgroundColor: isLoading ? "#334155" : "#2563eb",
              color: "#ffffff",
              border: "none",
              cursor: isLoading ? "not-allowed" : "pointer",
              fontSize: "1rem",
              fontWeight: "600",
              minWidth: "80px",
            }}
          >
            Send
          </button>
        </form>
      </main>
    </div>
  )
}
