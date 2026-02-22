"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Canvas } from "@/components/Canvas"
import { QuantumMetrics } from "@/components/QuantumMetrics"
import { MetricsOverlay } from "@/components/MetricsOverlay"
import { ModelDock } from "@/components/ModelDock"
import { RBFRPanel } from "@/components/RBFRPanel"
import { TutorialPanel } from "@/components/TutorialPanel"
import { TRIZHelper } from "@/components/TRIZHelper"
import { ConsensusNet } from "@/components/ConsensusNet"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { measureConsensus, uniformsFrom, PHI } from "@/lib/qote"
import { idbGet, idbSet, idbDel } from "@/lib/idb"
import type { RBFRDesign, FieldMetrics, ArtUniforms, ProviderId } from "@/lib/schemas"
import { Play, Pause, Settings, HelpCircle, Zap, Target, Activity, Share2, Save, Upload, Trash2 } from "lucide-react"

type Snapshot = {
  problem: string
  constraints: string
  goal: RBFRDesign["goal"]
  field: RBFRDesign["field"]
  guards: RBFRDesign["guards"]
  notes: string[]
  designs: Record<ProviderId, RBFRDesign | null>
  period: number
  demoMode: boolean
  demoSeed: string
  resonanceLog: { time: number; CUST: number; snapshot: RBFRDesign[] }[]
}

const COACH_CARD = `You are a scientific co-creator for Resonance-Based Fuel Refinement (RBFR).
Given the current state, output a JSON RBFRDesign tuned for coil configuration and waveform modulation
that improves efficiency WITHOUT increasing heat. (TRIZ-style contradiction resolution.)
Return ONLY valid JSON in this schema: RBFRDesign.`

export default function RBFRPage() {
  const [demoMode, setDemoMode] = useState(true)
  const [demoSeed, setDemoSeed] = useState("demo-101")
  const [sessionId, setSessionId] = useState("default")
  const [period, setPeriod] = useState(6)

  const [isRunning, setIsRunning] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const [showTRIZHelper, setShowTRIZHelper] = useState(false)

  const [problem, setProblem] = useState("Stabilize combustion while reducing peak temperature.")
  const [constraints, setConstraints] = useState("MaxTemp ≤ 180C; Field ≤ 2.0T; avoid cavitation; budget power draw.")

  const [designs, setDesigns] = useState<Record<ProviderId, RBFRDesign | null>>({
    openai: null,
    anthropic: null,
    mistral: null,
    xai: null,
    deepseek: null,
  })
  const [errors, setErrors] = useState<Record<ProviderId, string | null>>({
    openai: null,
    anthropic: null,
    mistral: null,
    xai: null,
    deepseek: null,
  })
  const [raws, setRaws] = useState<Record<ProviderId, any | null>>({
    openai: null,
    anthropic: null,
    mistral: null,
    xai: null,
    deepseek: null,
  })

  const [goal, setGoal] = useState<RBFRDesign["goal"]>("stabilize_structure")
  const [carrierHz, setCarrierHz] = useState<number>(37)
  const [waveform, setWaveform] = useState<RBFRDesign["field"]["waveform"]>("sine")
  const [modulationIndex, setModulationIndex] = useState<number>(0.3)
  const [coilConfig, setCoilConfig] = useState<RBFRDesign["field"]["coilConfig"]>("helmholtz")
  const [maxTempC, setMaxTempC] = useState<number>(180)
  const [maxFieldTesla, setMaxFieldTesla] = useState<number>(2.0)
  const [notes, setNotes] = useState<string[]>([])

  const [resonanceLog, setResonanceLog] = useState<{ time: number; CUST: number; snapshot: RBFRDesign[] }[]>([])
  const [custHistory, setCustHistory] = useState<number[]>([])
  const [startTime] = useState<number>(() => performance.now())
  const phiLockRef = useRef<boolean>(false)

  const validDesigns = useMemo(() => Object.values(designs).filter(Boolean) as RBFRDesign[], [designs])

  const metrics: FieldMetrics = useMemo(() => {
    if (validDesigns.length === 0) {
      // Return realistic uninitialized state instead of all 1.000
      const fallbackMetrics = {
        W: 0.8 + Math.random() * 0.2, // High wobble when no consensus
        beta: 0.7 + Math.random() * 0.2, // Low grace when uninitialized
        CUST: 0.9 + Math.random() * 0.3, // Below emergence threshold
      }
      console.log("[v0] No valid designs, using fallback metrics:", fallbackMetrics)
      return fallbackMetrics
    }

    const calculatedMetrics = measureConsensus(validDesigns)
    console.log("[v0] Calculated metrics from", validDesigns.length, "designs:", calculatedMetrics)
    return calculatedMetrics
  }, [validDesigns])

  async function runFanout(useDemo = demoMode) {
    const state = {
      problem,
      constraints,
      goal,
      field: { carrierHz, waveform, modulationIndex, coilConfig },
      guards: { maxTempC, maxFieldTesla },
      notes,
    }

    const userMsg = `Current RBFR state:
${JSON.stringify(state, null, 2)}

Return ONLY valid JSON matching the RBFRDesign schema.`

    const messages = [
      { role: "system", content: COACH_CARD },
      { role: "user", content: userMsg },
    ]

    const seedQuery = useDemo && demoSeed ? `?seed=${encodeURIComponent(demoSeed)}` : ""
    const url = useDemo ? `/api/mock${seedQuery}` : "/api/fanout"

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      })

      const data: { results?: { id: ProviderId; out: any }[]; error?: string } = await res.json()

      if (data.error) {
        setErrors({
          openai: data.error,
          anthropic: data.error,
          mistral: data.error,
          xai: data.error,
          deepseek: data.error,
        })
        return
      }

      const nextD: Record<ProviderId, RBFRDesign | null> = {
        openai: null,
        anthropic: null,
        mistral: null,
        xai: null,
        deepseek: null,
      }
      const nextE: Record<ProviderId, string | null> = {
        openai: null,
        anthropic: null,
        mistral: null,
        xai: null,
        deepseek: null,
      }
      const nextR: Record<ProviderId, any | null> = {
        openai: null,
        anthropic: null,
        mistral: null,
        xai: null,
        deepseek: null,
      }
      ;(data.results ?? []).forEach(({ id, out }) => {
        nextR[id] = out
        const { parsed, err } = extractRBFRDesign(out)
        nextD[id] = parsed
        nextE[id] = err
      })

      setDesigns(nextD)
      setErrors(nextE)
      setRaws(nextR)
    } catch (e: any) {
      const msg = e?.message ?? "fanout_failed"
      setErrors({
        openai: msg,
        anthropic: msg,
        mistral: msg,
        xai: msg,
        deepseek: msg,
      })
    }
  }

  function extractRBFRDesign(out: any): { parsed: RBFRDesign | null; err: string | null } {
    try {
      const content =
        out?.choices?.[0]?.message?.content ??
        out?.choices?.[0]?.text ??
        out?.output_text ??
        (typeof out === "string" ? out : "")

      const txt = typeof content === "string" ? content : JSON.stringify(out)
      const jsonText = stripCodeFences(txt).trim()

      console.log("[v0] Attempting to parse RBFR design:", jsonText.substring(0, 200) + "...")

      const parsed = JSON.parse(jsonText)
      if (isRBFRDesign(parsed)) {
        console.log("[v0] Successfully parsed RBFR design:", parsed)
        return { parsed, err: null }
      }
      console.log("[v0] Parsed JSON but invalid RBFR schema:", parsed)
      return { parsed: null, err: "invalid_schema" }
    } catch (e) {
      console.log("[v0] Failed to parse RBFR design:", e)
      return { parsed: null, err: out?.error ? String(out.error) : "parse_error" }
    }
  }

  function stripCodeFences(s: string) {
    return s
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim()
  }

  function isRBFRDesign(x: any): x is RBFRDesign {
    return (
      x &&
      typeof x === "object" &&
      ["maximize_yield", "reduce_heat", "stabilize_structure"].includes(x.goal) &&
      x.field &&
      ["sine", "pulse", "fm", "am"].includes(x.field.waveform) &&
      ["helmholtz", "solenoid", "multi-turn"].includes(x.field.coilConfig) &&
      typeof x.field.modulationIndex === "number" &&
      x.guards &&
      typeof x.guards.maxTempC === "number"
    )
  }

  function snapshot(): Snapshot {
    return {
      problem,
      constraints,
      goal,
      field: { carrierHz, waveform, modulationIndex, coilConfig },
      guards: { maxTempC, maxFieldTesla },
      notes,
      designs,
      period,
      demoMode,
      demoSeed,
      resonanceLog,
    }
  }

  async function applySnapshot(s: Snapshot) {
    setProblem(s.problem)
    setConstraints(s.constraints)
    setGoal(s.goal)
    setCarrierHz(s.field.carrierHz)
    setWaveform(s.field.waveform)
    setModulationIndex(s.field.modulationIndex)
    setCoilConfig(s.field.coilConfig)
    setMaxTempC(s.guards.maxTempC)
    setMaxFieldTesla(s.guards.maxFieldTesla)
    setNotes(s.notes)
    setDesigns(s.designs)
    setPeriod(s.period)
    setDemoMode(s.demoMode)
    setDemoSeed(s.demoSeed)
    setResonanceLog(s.resonanceLog)
  }

  async function saveSession() {
    await idbSet(`rbfr-session:${sessionId}`, snapshot())
  }
  async function loadSession() {
    const s = await idbGet<Snapshot>(`rbfr-session:${sessionId}`)
    if (s) await applySnapshot(s)
  }
  async function clearSession() {
    await idbDel(`rbfr-session:${sessionId}`)
  }

  function encodeStateToURL() {
    const params = new URLSearchParams({
      g: goal,
      hz: String(carrierHz),
      wf: waveform,
      mi: String(modulationIndex),
      coil: coilConfig,
      mt: String(maxTempC),
      ft: String(maxFieldTesla),
      prob: problem,
      cons: constraints,
    })
    history.replaceState(null, "", `/rbfr?${params.toString()}`)
  }

  function loadStateFromURL() {
    const q = new URLSearchParams(location.search)
    const getN = (k: string, d: number) => Number(q.get(k) ?? d)
    setGoal((q.get("g") as any) ?? "stabilize_structure")
    setCarrierHz(getN("hz", 37))
    setWaveform((q.get("wf") as any) ?? "sine")
    setModulationIndex(getN("mi", 0.3))
    setCoilConfig((q.get("coil") as any) ?? "helmholtz")
    setMaxTempC(getN("mt", 180))
    setMaxFieldTesla(getN("ft", 2.0))
    setProblem(q.get("prob") ?? "Stabilize combustion while reducing peak temperature.")
    setConstraints(q.get("cons") ?? "MaxTemp ≤ 180C; Field ≤ 2.0T;")
  }

  useEffect(() => {
    loadStateFromURL()
    ;(async () => {
      const s = await idbGet<Snapshot>(`rbfr-session:${sessionId}`)
      if (s) await applySnapshot(s)
    })()
  }, [])

  useEffect(() => {
    encodeStateToURL()
    const handle = requestAnimationFrame(() => {
      idbSet(`rbfr-session:${sessionId}`, snapshot()).catch(() => {})
    })
    return () => cancelAnimationFrame(handle)
  }, [
    problem,
    constraints,
    goal,
    carrierHz,
    waveform,
    modulationIndex,
    coilConfig,
    maxTempC,
    maxFieldTesla,
    notes,
    designs,
    period,
    demoMode,
    demoSeed,
    resonanceLog,
    sessionId,
  ])

  useEffect(() => {
    if (!isRunning) return
    let stop = false
    const tick = async () => {
      if (stop) return
      await runFanout()
      setTimeout(tick, Math.max(2, period) * 1000)
    }
    tick()
    return () => {
      stop = true
    }
  }, [
    isRunning,
    period,
    demoMode,
    demoSeed,
    problem,
    constraints,
    goal,
    carrierHz,
    waveform,
    modulationIndex,
    coilConfig,
    maxTempC,
    maxFieldTesla,
    notes,
  ])

  const uniforms: ArtUniforms = useMemo(
    () => uniformsFrom(metrics, (performance.now() - startTime) / 1000),
    [metrics, startTime],
  )

  const isEmergent = metrics.CUST >= PHI
  const coherenceScore =
    (1 - Math.min(metrics.W, 1) + (metrics.beta - 0.8) / 0.4 + Math.min((metrics.CUST - 1) / 0.618, 1)) / 3

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-900 text-white font-mono overflow-hidden">
        <header className="border-b border-cyan-500/30 bg-gray-900/95 backdrop-blur-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Zap className="w-8 h-8 text-cyan-400 animate-pulse" />
                <div className="absolute inset-0 w-8 h-8 bg-cyan-400/20 rounded-full animate-ping" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  RBFR Quantum Cockpit
                </h1>
                <p className="text-sm text-gray-400">Multi-AI Resonance Field Synthesis</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-300 ${
                  isRunning
                    ? "bg-red-600/20 border-red-500/50 text-red-300 hover:bg-red-600/30 shadow-lg shadow-red-500/20"
                    : "bg-green-600/20 border-green-500/50 text-green-300 hover:bg-green-600/30 shadow-lg shadow-green-500/20"
                }`}
              >
                {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isRunning ? "Deactivate Field" : "Activate Field"}</span>
              </button>

              <button
                onClick={() => setShowTutorial(!showTutorial)}
                className="p-2 rounded-lg bg-blue-600/20 border border-blue-500/50 text-blue-300 hover:bg-blue-600/30 transition-all duration-300 shadow-lg shadow-blue-500/20"
              >
                <HelpCircle className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-lg bg-purple-600/20 border border-purple-500/50 text-purple-300 hover:bg-purple-600/30 transition-all duration-300 shadow-lg shadow-purple-500/20"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="border-t border-cyan-500/20 px-4 py-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-red-400" />
                  <span className="text-gray-400">Wobble:</span>
                  <span className="font-bold text-red-300">{metrics.W.toFixed(3)}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-400">Beta:</span>
                  <span className="font-bold text-blue-300">{metrics.beta.toFixed(3)}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Target className={`w-4 h-4 ${isEmergent ? "text-yellow-400 animate-pulse" : "text-purple-400"}`} />
                  <span className="text-gray-400">CUST:</span>
                  <span className={`font-bold ${isEmergent ? "text-yellow-300" : "text-purple-300"}`}>
                    {metrics.CUST.toFixed(3)}
                  </span>
                  {isEmergent && <span className="text-xs bg-yellow-600 px-2 py-1 rounded animate-pulse">φ LOCK</span>}
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-xs">
                  <span className="text-gray-400">Coherence:</span>
                  <span className="ml-2 font-bold text-green-300">{(coherenceScore * 100).toFixed(1)}%</span>
                </div>

                <div className="text-xs">
                  <span className="text-gray-400">Models:</span>
                  <span className="ml-2 font-bold text-cyan-300">{validDesigns.length}/5</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex h-[calc(100vh-8rem)]">
          <div className="w-96 border-r border-cyan-500/30 bg-gray-900/50 backdrop-blur-sm overflow-y-auto">
            <div className="p-4 space-y-4">
              {/* Session Controls */}
              <div className="bg-gray-800/50 rounded-lg p-4 border border-cyan-500/20">
                <h3 className="text-sm font-semibold mb-3 text-cyan-400 flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  Session Control
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <label className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={demoMode}
                        onChange={(e) => setDemoMode(e.target.checked)}
                        className="rounded border-gray-600 bg-gray-700 text-cyan-500 focus:ring-cyan-500"
                      />
                      <span>Demo Mode</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={demoSeed}
                      onChange={(e) => setDemoSeed(e.target.value)}
                      placeholder="Demo seed"
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                    />
                    <input
                      type="number"
                      min={2}
                      max={60}
                      value={period}
                      onChange={(e) => setPeriod(Number(e.target.value))}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      value={sessionId}
                      onChange={(e) => setSessionId(e.target.value)}
                      placeholder="Session ID"
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                    />
                    <button
                      onClick={saveSession}
                      className="p-2 bg-green-600/20 border border-green-500/50 rounded text-green-300 hover:bg-green-600/30 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={loadSession}
                      className="p-2 bg-blue-600/20 border border-blue-500/50 rounded text-blue-300 hover:bg-blue-600/30 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                    </button>
                    <button
                      onClick={clearSession}
                      className="p-2 bg-red-600/20 border border-red-500/50 rounded text-red-300 hover:bg-red-600/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Field Challenge Input */}
              <div className="bg-gray-800/50 rounded-lg p-4 border border-cyan-500/20">
                <h3 className="text-sm font-semibold mb-3 text-cyan-400">Field Challenge</h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Problem Statement</label>
                    <textarea
                      value={problem}
                      onChange={(e) => setProblem(e.target.value)}
                      className="w-full h-20 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm resize-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                      placeholder="Describe the RBFR challenge..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Constraints</label>
                    <textarea
                      value={constraints}
                      onChange={(e) => setConstraints(e.target.value)}
                      className="w-full h-16 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm resize-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                      placeholder="System limitations and requirements..."
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => runFanout(false)}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-cyan-600/20 border border-cyan-500/50 rounded text-cyan-300 hover:bg-cyan-600/30 transition-all duration-300"
                >
                  <Zap className="w-4 h-4" />
                  <span>Fan-out Now</span>
                </button>

                <button
                  onClick={() => navigator.clipboard.writeText(location.href)}
                  className="px-4 py-2 bg-purple-600/20 border border-purple-500/50 rounded text-purple-300 hover:bg-purple-600/30 transition-all duration-300"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              {/* RBFR Control Panel */}
              <RBFRPanel
                goal={goal}
                setGoal={setGoal}
                carrierHz={carrierHz}
                setCarrierHz={setCarrierHz}
                waveform={waveform}
                setWaveform={setWaveform}
                modulationIndex={modulationIndex}
                setModulationIndex={setModulationIndex}
                coilConfig={coilConfig}
                setCoilConfig={setCoilConfig}
                maxTempC={maxTempC}
                setMaxTempC={setMaxTempC}
                maxFieldTesla={maxFieldTesla}
                setMaxFieldTesla={setMaxFieldTesla}
                notes={notes}
                setNotes={setNotes}
              />

              {/* Consensus Network Visualization */}
              <ConsensusNet designs={designs} />

              {/* AI Model Status */}
              <ModelDock designs={designs} errors={errors} raws={raws} />
            </div>
          </div>

          <div className="flex-1 relative bg-gray-950">
            <Canvas uniforms={uniforms} />

            {/* Quantum Metrics Overlay */}
            <div className="absolute top-4 right-4 w-80">
              <QuantumMetrics metrics={metrics} />
            </div>

            {/* Status Indicators */}
            {!isRunning && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
                <div className="text-center">
                  <Zap className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">Quantum Field Inactive</p>
                  <p className="text-gray-500 text-sm">Activate field to begin synthesis</p>
                </div>
              </div>
            )}

            {isEmergent && (
              <div className="absolute top-4 left-4 bg-yellow-600/90 text-black px-4 py-2 rounded-lg font-bold animate-pulse border border-yellow-400">
                φ COHERENCE LOCK ACHIEVED
              </div>
            )}

            <MetricsOverlay metrics={metrics} custHistory={custHistory} resonanceLog={resonanceLog} />
          </div>
        </div>

        {/* Tutorial Panel */}
        <TutorialPanel isOpen={showTutorial} onClose={() => setShowTutorial(false)} />

        {/* TRIZ Helper */}
        <TRIZHelper isOpen={showTRIZHelper} onClose={() => setShowTRIZHelper(false)} />

        {/* Settings Panel */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto border border-cyan-500/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-cyan-400">System Configuration</h3>
                <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-white text-xl">
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Resonance Log</h4>
                  <div className="bg-gray-900 rounded p-3 max-h-40 overflow-y-auto">
                    {resonanceLog.length === 0 ? (
                      <p className="text-gray-500 text-sm">No resonance events recorded</p>
                    ) : (
                      resonanceLog.map((event, idx) => (
                        <div key={idx} className="text-xs text-gray-400 mb-1">
                          <span className="text-cyan-400">{new Date(event.time).toLocaleTimeString()}</span>
                          {" - CUST: "}
                          <span className="text-yellow-400">{event.CUST.toFixed(3)}</span>
                          {" - Models: "}
                          <span className="text-green-400">{event.snapshot.length}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}
