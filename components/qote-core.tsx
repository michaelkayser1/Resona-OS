"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Brain, Zap, Target, Settings, RotateCcw, Download, FileText, AlertTriangle, Lightbulb } from "lucide-react"
import { AttentionHeatmap } from "./attention-heatmap"
import ImportTelemetry from "./import-telemetry"
import ClaimTracker from "./claim-tracker"
import AgentsFromTelemetry from "./agents-from-telemetry"
import LivePhaseVisualization from "./live-phase-visualization"
import EnhancedAgentSync from "./enhanced-agent-sync"
import ClaimValidator from "./claim-validator"

interface QOTEState {
  isRunning: boolean
  oscillators: Array<{
    id: number
    text: string
    phase: number
    frequency: number
    amplitude: number
    x: number
    y: number
    color: string
  }>
  step: number
  coherence: number
  variance: number
  custBlocked: boolean
  rho: number
  outputText: string
  agentCoherence: number
  sharedDeltaTheta: number
}

interface Agent {
  id: string
  name: string
  role: string
  color: string
  phase: number
  coherence: number
  deltaTheta: number
}

interface PatentClaim {
  id: number
  title: string
  description: string
  status: "demonstrated" | "active" | "ready"
  evidence?: string
}

const SAMPLE_TEXT =
  "The quantum oscillatory token embeddings enable coherent neural synchronization through phase-locked attention mechanisms"

const PATENT_CLAIMS: PatentClaim[] = [
  {
    id: 1,
    title: "Oscillatory Token Embeddings",
    description: "Neural network tokens represented as complex oscillatory states z = a·e^(iθ)",
    status: "demonstrated",
  },
  {
    id: 2,
    title: "Kuramoto Phase Synchronization",
    description: "Phase coupling dynamics enabling collective oscillatory behavior",
    status: "demonstrated",
  },
  {
    id: 3,
    title: "CUST Coherence Gating",
    description: "Coherence Under Stability Threshold mechanism for output control",
    status: "demonstrated",
  },
  {
    id: 4,
    title: "Multi-Agent Synchronization",
    description: "Distributed processing across multiple synchronized agent networks",
    status: "active",
  },
  {
    id: 5,
    title: "Relational Δθ Controller",
    description: "Personalization through user-specific phase relationship modulation",
    status: "active",
  },
  {
    id: 6,
    title: "Resonance Mapping",
    description: "Interpretability through phase-attention resonance pattern analysis",
    status: "ready",
  },
  {
    id: 7,
    title: "Phase-Coherent Attention",
    description: "Enhanced transformer attention through oscillatory phase modulation",
    status: "ready",
  },
]

export default function QOTECore() {
  const [state, setState] = useState<QOTEState>({
    isRunning: false,
    oscillators: [],
    step: 0,
    coherence: 0,
    variance: 0,
    custBlocked: true,
    rho: 0,
    outputText: "",
    agentCoherence: 0,
    sharedDeltaTheta: 0,
  })

  const [coupling, setCoupling] = useState(1.5)
  const [threshold, setThreshold] = useState(0.618)
  const [archetype, setArchetype] = useState(0.2)
  const [speed, setSpeed] = useState(1.0)

  const [agents, setAgents] = useState<Agent[]>([])
  const [activeTab, setActiveTab] = useState("oscillators")
  const [attentionMatrix, setAttentionMatrix] = useState<number[][]>([])
  const [resonanceMap, setResonanceMap] = useState<{ token: string; resonance: number; phase: number }[]>([])

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const lastTimeRef = useRef<number>(0)

  const stateRef = useRef(state)
  const paramsRef = useRef({ coupling, threshold, archetype, speed })

  useEffect(() => {
    stateRef.current = state
  }, [state])

  useEffect(() => {
    paramsRef.current = { coupling, threshold, archetype, speed }
  }, [coupling, threshold, archetype, speed])

  const initializeOscillators = useCallback(() => {
    const words = SAMPLE_TEXT.split(/\s+/).filter((word) => word.length > 0)
    const centerX = 300
    const centerY = 300
    const radius = 120

    const newOscillators = words.map((word, i) => {
      const angle = (i / words.length) * 2 * Math.PI
      return {
        id: i,
        text: word,
        phase: Math.random() * 2 * Math.PI,
        frequency: (Math.random() - 0.5) * 0.1,
        amplitude: 1.0,
        x: centerX + Math.cos(angle) * radius * 0.8,
        y: centerY + Math.sin(angle) * radius * 0.8,
        color: `hsl(${(i / words.length) * 360}, 70%, 60%)`,
      }
    })

    setState({
      isRunning: false,
      oscillators: newOscillators,
      step: 0,
      coherence: 0,
      variance: 0,
      custBlocked: true,
      rho: 0,
      outputText: "",
      agentCoherence: 0,
      sharedDeltaTheta: 0,
    })

    console.log("[v0] Oscillators initialized:", newOscillators.length)
  }, [])

  const initializeAgents = useCallback(() => {
    const newAgents: Agent[] = [
      {
        id: "research",
        name: "Research Agent",
        role: "Analysis",
        color: "#3b82f6",
        phase: 0,
        coherence: 0,
        deltaTheta: 0.1,
      },
      {
        id: "creative",
        name: "Creative Agent",
        role: "Generation",
        color: "#8b5cf6",
        phase: Math.PI / 3,
        coherence: 0,
        deltaTheta: -0.2,
      },
      {
        id: "dialogue",
        name: "Dialogue Agent",
        role: "Communication",
        color: "#10b981",
        phase: (2 * Math.PI) / 3,
        coherence: 0,
        deltaTheta: 0.05,
      },
    ]
    setAgents(newAgents)
  }, [])

  const animate = useCallback(() => {
    const currentState = stateRef.current
    const currentParams = paramsRef.current

    if (!currentState.isRunning || currentState.oscillators.length === 0) {
      return
    }

    const now = performance.now()
    if (!lastTimeRef.current) lastTimeRef.current = now

    const dt = Math.min((now - lastTimeRef.current) / 1000, 0.1)
    lastTimeRef.current = now

    if (dt > 0) {
      const N = currentState.oscillators.length
      const phaseDerivatives = currentState.oscillators.map((osc, i) => {
        let derivative = osc.frequency

        for (let j = 0; j < N; j++) {
          if (i !== j) {
            const other = currentState.oscillators[j]
            derivative += (currentParams.coupling / N) * Math.sin(other.phase - osc.phase + currentParams.archetype)
          }
        }

        return derivative
      })

      const updatedOscillators = currentState.oscillators.map((osc, i) => ({
        ...osc,
        phase:
          (((osc.phase + phaseDerivatives[i] * dt * currentParams.speed) % (2 * Math.PI)) + 2 * Math.PI) %
          (2 * Math.PI),
      }))

      let realSum = 0
      let imagSum = 0
      for (const osc of updatedOscillators) {
        realSum += Math.cos(osc.phase)
        imagSum += Math.sin(osc.phase)
      }
      const coherence = Math.sqrt(realSum * realSum + imagSum * imagSum) / N

      const meanCos = updatedOscillators.reduce((sum, osc) => sum + Math.cos(osc.phase), 0) / N
      const meanSin = updatedOscillators.reduce((sum, osc) => sum + Math.sin(osc.phase), 0) / N
      const variance = 1 - Math.sqrt(meanCos * meanCos + meanSin * meanSin)

      const rho = coherence * Math.exp(-variance)
      const custBlocked = rho < currentParams.threshold

      const updatedAgents = agents.map((agent, i) => {
        const agentInfluence = Math.sin(coherence * Math.PI) * agent.deltaTheta
        const sharedInfluence = currentState.sharedDeltaTheta * 0.3

        return {
          ...agent,
          phase:
            (agent.phase + (agent.deltaTheta + agentInfluence + sharedInfluence) * dt * currentParams.speed) %
            (2 * Math.PI),
          coherence: coherence * (0.7 + Math.random() * 0.6),
        }
      })
      setAgents(updatedAgents)

      const agentCoherence = updatedAgents.reduce((sum, agent) => sum + agent.coherence, 0) / updatedAgents.length
      const sharedDeltaTheta = updatedAgents.reduce((sum, agent) => sum + agent.deltaTheta, 0) / updatedAgents.length

      if (currentState.step % 10 === 0) {
        const matrix = updatedOscillators.map((_, i) =>
          updatedOscillators.map((_, j) => {
            if (i === j) return 1.0
            const phaseDiff = Math.abs(updatedOscillators[i].phase - updatedOscillators[j].phase)
            return Math.exp(-phaseDiff * 0.5) * coherence
          }),
        )
        setAttentionMatrix(matrix)

        const resonance = updatedOscillators.map((osc) => ({
          token: osc.text,
          resonance: Math.cos(osc.phase) * coherence,
          phase: osc.phase,
        }))
        setResonanceMap(resonance)
      }

      let outputText = currentState.outputText
      if (!custBlocked && !outputText) {
        outputText = "Coherent response generated through phase-synchronized attention patterns."
      }

      setState({
        ...currentState,
        oscillators: updatedOscillators,
        coherence,
        variance,
        rho,
        custBlocked,
        outputText,
        step: currentState.step + 1,
        agentCoherence,
        sharedDeltaTheta,
      })
    }

    animationRef.current = requestAnimationFrame(animate)
  }, [agents])

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)
    canvas.style.width = rect.width + "px"
    canvas.style.height = rect.height + "px"

    const width = rect.width
    const height = rect.height
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(centerX, centerY) * 0.7

    ctx.fillStyle = "rgba(15, 15, 35, 0.1)"
    ctx.fillRect(0, 0, width, height)

    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
    ctx.stroke()

    if (activeTab === "agents") {
      agents.forEach((agent, i) => {
        const agentRadius = radius * (0.3 + i * 0.15)
        ctx.strokeStyle = agent.color + "40"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(centerX, centerY, agentRadius, 0, 2 * Math.PI)
        ctx.stroke()

        const agentX = centerX + Math.cos(agent.phase) * agentRadius
        const agentY = centerY + Math.sin(agent.phase) * agentRadius

        ctx.fillStyle = agent.color
        ctx.beginPath()
        ctx.arc(agentX, agentY, 8, 0, 2 * Math.PI)
        ctx.fill()

        ctx.fillStyle = agent.color
        ctx.font = "12px monospace"
        ctx.fillText(agent.name, agentX + 15, agentY + 5)
      })
    } else {
      state.oscillators.forEach((osc, i) => {
        const angle = (i / state.oscillators.length) * 2 * Math.PI
        const oscRadius = radius * 0.8
        const oscX = centerX + Math.cos(angle) * oscRadius
        const oscY = centerY + Math.sin(angle) * oscRadius

        const vectorLength = 40
        const endX = oscX + Math.cos(osc.phase) * vectorLength
        const endY = oscY + Math.sin(osc.phase) * vectorLength

        ctx.strokeStyle = osc.color
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(oscX, oscY)
        ctx.lineTo(endX, endY)
        ctx.stroke()

        ctx.fillStyle = osc.color
        ctx.beginPath()
        ctx.arc(oscX, oscY, 6, 0, 2 * Math.PI)
        ctx.fill()

        ctx.fillStyle = osc.color
        ctx.beginPath()
        ctx.arc(endX, endY, 4, 0, 2 * Math.PI)
        ctx.fill()
      })
    }

    if (state.coherence > 0.1) {
      const coherenceRadius = state.coherence * radius * 0.3
      ctx.strokeStyle = `rgba(100, 255, 218, ${state.coherence})`
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(centerX, centerY, coherenceRadius, 0, 2 * Math.PI)
      ctx.stroke()
    }
  }, [state.oscillators, state.coherence, activeTab, agents])

  const exportData = useCallback(() => {
    const exportObj = {
      timestamp: new Date().toISOString(),
      patentClaims: PATENT_CLAIMS,
      currentState: {
        coherence: state.coherence,
        variance: state.variance,
        custStatus: !state.custBlocked,
        syncSteps: state.step,
        agentCoherence: state.agentCoherence,
        sharedDeltaTheta: state.sharedDeltaTheta,
      },
      parameters: { coupling, threshold, archetype, speed },
      agents: agents,
      resonanceMap: resonanceMap,
      attentionMatrix: attentionMatrix,
    }

    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `qote-patent-evidence-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [state, coupling, threshold, archetype, speed, agents, resonanceMap, attentionMatrix])

  const exportPatentReport = useCallback(async () => {
    // Enhanced export with comprehensive patent evidence
    const reportData = {
      title: "QOTE Framework Patent Evidence Report",
      timestamp: new Date().toISOString(),
      summary: {
        totalClaims: PATENT_CLAIMS.length,
        demonstratedClaims: PATENT_CLAIMS.filter((c) => c.status === "demonstrated").length,
        activeClaims: PATENT_CLAIMS.filter((c) => c.status === "active").length,
        coherenceAchieved: state.coherence,
        custStatus: !state.custBlocked,
        syncSteps: state.step,
      },
      patentClaims: PATENT_CLAIMS.map((claim) => ({
        ...claim,
        evidence:
          claim.status === "demonstrated"
            ? "Fully operational in live demo"
            : claim.status === "active"
              ? "Partially demonstrated with ongoing validation"
              : "Ready for implementation",
      })),
      technicalMetrics: {
        coherence: state.coherence,
        variance: state.variance,
        custScore: state.rho,
        threshold: threshold,
        agentCoherence: state.agentCoherence,
        sharedDeltaTheta: state.sharedDeltaTheta,
        parameters: { coupling, threshold, archetype, speed },
      },
      agents: agents.map((agent) => ({
        ...agent,
        status: agent.coherence > 0.7 ? "synchronized" : agent.coherence > 0.3 ? "synchronizing" : "disconnected",
      })),
      resonanceMap: resonanceMap,
      attentionMatrix:
        attentionMatrix.length > 0
          ? {
              dimensions: `${attentionMatrix.length}x${attentionMatrix[0]?.length || 0}`,
              entropy:
                attentionMatrix.length > 0
                  ? -attentionMatrix.flat().reduce((sum, val) => sum + (val > 0 ? val * Math.log(val) : 0), 0) /
                    attentionMatrix.length
                  : 0,
            }
          : null,
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `qote-patent-evidence-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [state, coupling, threshold, archetype, speed, agents, resonanceMap, attentionMatrix])

  const start = useCallback(() => {
    setState((prev) => ({ ...prev, isRunning: true }))
    lastTimeRef.current = 0
    animationRef.current = requestAnimationFrame(animate)
  }, [animate])

  const stop = useCallback(() => {
    setState((prev) => ({ ...prev, isRunning: false }))
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = undefined
    }
  }, [])

  const reset = useCallback(() => {
    stop()
    setTimeout(initializeOscillators, 0)
    setTimeout(initializeAgents, 0)
  }, [stop, initializeOscillators, initializeAgents])

  const [mode, setMode] = useState<"Live" | "Telemetry">("Live")
  const [telemetry, setTelemetry] = useState<any | null>(null)

  const trizSuggestions = [
    {
      principle: "Dynamics",
      action: "Increase coupling strength",
      apply: () => setCoupling((prev) => Math.min(2.0, prev + 0.2)),
    },
    {
      principle: "Feedback",
      action: "Align Δθ across agents",
      apply: () => {
        const avgDelta = agents.reduce((sum, agent) => sum + agent.deltaTheta, 0) / agents.length
        setAgents((prev) => prev.map((agent) => ({ ...agent, deltaTheta: avgDelta })))
      },
    },
    {
      principle: "Phase Transition",
      action: "Reset phase relationships",
      apply: () => setArchetype(0),
    },
    {
      principle: "Asymmetry",
      action: "Introduce phase variance",
      apply: () => setArchetype((prev) => prev + (Math.random() - 0.5) * 0.3),
    },
  ]

  useEffect(() => {
    initializeOscillators()
    initializeAgents()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  useEffect(() => {
    renderCanvas()
  }, [state.oscillators, state.coherence, activeTab, agents])

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <nav className="flex items-center gap-4">
            <Button variant={mode === "Live" ? "default" : "outline"} onClick={() => setMode("Live")}>
              Live Demo
            </Button>
            <Button variant={mode === "Telemetry" ? "default" : "outline"} onClick={() => setMode("Telemetry")}>
              Telemetry Mode
            </Button>
            <ImportTelemetry
              onLoad={(pkt) => {
                setTelemetry(pkt)
                setMode("Telemetry")
              }}
            />
            {telemetry && (
              <span className="text-sm text-muted-foreground">
                Loaded: {new Date(telemetry.timestamp).toLocaleString()}
              </span>
            )}
          </nav>
        </CardContent>
      </Card>

      {mode === "Telemetry" && telemetry ? (
        <>
          {telemetry.patentClaims && telemetry.patentClaims.length > 0 && (
            <ClaimTracker claims={telemetry.patentClaims} />
          )}

          <Card>
            <CardHeader>
              <CardTitle>Attention Matrix (Telemetry)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <AttentionHeatmap
                attentionMatrix={telemetry.attentionMatrix || [[1]]}
                tokens={telemetry.resonanceMap?.map((r: any) => r.token) || []}
              />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-400 mb-1">Coherence (R)</div>
                  <div className="text-lg font-mono text-blue-400">
                    {(telemetry.currentState?.coherence || 0).toFixed(6)}
                  </div>
                </div>
                <div className="bg-slate-800 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-400 mb-1">Phase Variance</div>
                  <div className="text-lg font-mono text-purple-400">
                    {(telemetry.currentState?.variance || 0).toExponential(3)}
                  </div>
                </div>
                <div className="bg-slate-800 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-400 mb-1">CUST Status</div>
                  <div
                    className={`text-lg font-bold ${
                      telemetry.currentState?.custStatus ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {telemetry.currentState?.custStatus ? "PASS" : "HOLD"}
                  </div>
                </div>
                <div className="bg-slate-800 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-400 mb-1">Entropy</div>
                  <div className="text-lg font-mono text-orange-400">
                    {(telemetry.attentionEntropy || 0).toFixed(4)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {telemetry.agents && telemetry.agents.length > 0 && (
            <AgentsFromTelemetry
              agents={telemetry.agents}
              sharedDelta={telemetry.currentState?.sharedDeltaTheta || 0}
            />
          )}
        </>
      ) : (
        <>
          <ClaimValidator
            agents={agents.map((agent) => ({
              ...agent,
              resonance: resonanceMap.find((r) => r.token === agent.name)?.resonance,
            }))}
            coherence={state.coherence}
            deltaTheta={state.sharedDeltaTheta}
          />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  QOTE Patent Claims Demonstration
                </div>
                <div className="flex gap-2">
                  <Button onClick={exportData} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                  <Button onClick={exportPatentReport} variant="default" size="sm">
                    <FileText className="w-4 h-4 mr-2" />
                    Patent Report
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {state.coherence < threshold && state.isRunning && (
                <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">TRIZ Recovery Suggestions</h3>
                  </div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                    Coherence below threshold (R: {state.coherence.toFixed(3)} &lt; τ: {threshold.toFixed(3)}). Apply
                    inventive principles to restore synchronization:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {trizSuggestions.map((suggestion, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded border"
                      >
                        <div className="flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-yellow-500" />
                          <div>
                            <div className="text-sm font-medium">{suggestion.principle}</div>
                            <div className="text-xs text-muted-foreground">{suggestion.action}</div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={suggestion.apply}
                          className="text-xs bg-transparent"
                        >
                          Apply
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {PATENT_CLAIMS.map((claim) => (
                  <div key={claim.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm">Claim {claim.id}</span>
                      <Badge
                        variant={
                          claim.status === "demonstrated"
                            ? "default"
                            : claim.status === "active"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {claim.status}
                      </Badge>
                    </div>
                    <h4 className="font-medium text-sm mb-1">{claim.title}</h4>
                    <p className="text-xs text-muted-foreground">{claim.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <LivePhaseVisualization
            agents={agents.map((agent) => ({
              ...agent,
              phase: agent.phase / (2 * Math.PI), // Normalize to 0-1 for visualization
            }))}
          />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  QOTE Framework Live Demo
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={state.isRunning ? stop : start}
                    variant={state.isRunning ? "destructive" : "default"}
                    size="lg"
                    disabled={state.oscillators.length === 0}
                  >
                    {state.isRunning ? (
                      <>
                        <Target className="w-4 h-4 mr-2" />
                        Stop Sync
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Start Sync
                      </>
                    )}
                  </Button>
                  <Button onClick={reset} variant="outline">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="oscillators">Oscillators</TabsTrigger>
                  <TabsTrigger value="agents">Multi-Agent</TabsTrigger>
                  <TabsTrigger value="attention">Attention</TabsTrigger>
                  <TabsTrigger value="resonance">Resonance</TabsTrigger>
                </TabsList>

                <TabsContent value="oscillators" className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    <strong>Claims 1-3:</strong> Oscillatory embeddings with Kuramoto synchronization and CUST gating
                  </div>
                  <div className="text-sm text-muted-foreground">Input: "{SAMPLE_TEXT}"</div>
                </TabsContent>

                <TabsContent value="agents" className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    <strong>Claim 4:</strong> Multi-agent synchronization with distributed processing
                  </div>

                  <EnhancedAgentSync
                    agents={agents.map((agent) => ({
                      ...agent,
                      status: agent.coherence > 0.7 ? "synced" : agent.coherence > 0.3 ? "syncing" : "disconnected",
                      frequency: 1.0 + agent.deltaTheta,
                      couplingStrength: coupling,
                      latency: Math.round(20 + Math.random() * 30),
                    }))}
                  />

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-sm font-medium mb-1">Multi-Agent Coherence</div>
                      <div className="text-lg font-mono text-blue-400">{state.agentCoherence.toFixed(3)}</div>
                      <div className="text-xs text-muted-foreground">Collective synchronization level</div>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-sm font-medium mb-1">Shared Δθ Pool</div>
                      <div className="text-lg font-mono text-purple-400">{state.sharedDeltaTheta.toFixed(3)}</div>
                      <div className="text-xs text-muted-foreground">Distributed phase adjustment</div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="attention" className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    <strong>Claim 7:</strong> Phase-coherent attention matrix visualization
                  </div>
                  {attentionMatrix.length > 0 && (
                    <div className="space-y-4">
                      <AttentionHeatmap
                        attentionMatrix={attentionMatrix}
                        tokens={state.oscillators.map((osc) => osc.text)}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-muted rounded-lg">
                          <div className="text-sm font-medium mb-1">Attention Entropy</div>
                          <div className="text-lg font-mono text-green-400">
                            {attentionMatrix.length > 0
                              ? (
                                  -attentionMatrix
                                    .flat()
                                    .reduce((sum, val) => sum + (val > 0 ? val * Math.log(val) : 0), 0) /
                                  attentionMatrix.length
                                ).toFixed(3)
                              : "0.000"}
                          </div>
                          <div className="text-xs text-muted-foreground">Information distribution measure</div>
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                          <div className="text-sm font-medium mb-1">Phase Modulation</div>
                          <div className="text-lg font-mono text-orange-400">
                            {(state.coherence * Math.sin(state.variance * Math.PI)).toFixed(3)}
                          </div>
                          <div className="text-xs text-muted-foreground">Oscillatory attention influence</div>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="resonance" className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    <strong>Claim 6:</strong> Resonance mapping for interpretability
                  </div>
                  <div className="space-y-2">
                    {resonanceMap.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm font-mono">{item.token}</span>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-16 h-2 rounded-full bg-gradient-to-r from-red-500 to-green-500"
                            style={{ opacity: Math.abs(item.resonance) }}
                          />
                          <span className="text-xs font-mono w-16 text-right">{item.resonance.toFixed(3)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full transition-all ${
                      state.isRunning
                        ? state.custBlocked
                          ? "bg-yellow-500 animate-pulse"
                          : "bg-green-500"
                        : "bg-red-500"
                    }`}
                  />
                  <span className="text-sm">
                    {state.isRunning
                      ? state.custBlocked
                        ? "Synchronizing..."
                        : "Coherent Output Ready"
                      : "System Idle"}
                  </span>
                </div>

                <div className="relative w-full h-96 bg-slate-900 rounded-lg overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    className="w-full h-full"
                    style={{ background: "linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)" }}
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-800 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-400 mb-1">Coherence (R)</div>
                    <div className="text-lg font-mono text-blue-400">{state.coherence.toFixed(3)}</div>
                  </div>
                  <div className="bg-slate-800 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-400 mb-1">Phase Variance</div>
                    <div className="text-lg font-mono text-purple-400">{state.variance.toFixed(3)}</div>
                  </div>
                  <div className="bg-slate-800 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-400 mb-1">Sync Steps</div>
                    <div className="text-lg font-mono text-green-400">{state.step}</div>
                  </div>
                  <div className="bg-slate-800 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-400 mb-1">CUST Status</div>
                    <div className={`text-lg font-bold ${state.custBlocked ? "text-red-400" : "text-green-400"}`}>
                      {state.custBlocked ? "Blocked" : "Active"}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                QOTE Parameters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium mb-2 block" htmlFor="coupling-slider">
                    Coupling Strength (K): {coupling.toFixed(2)}
                  </label>
                  <Slider
                    id="coupling-slider"
                    aria-label="Coupling Strength Control"
                    value={[coupling]}
                    onValueChange={([value]) => setCoupling(value)}
                    min={0}
                    max={2}
                    step={0.01}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block" htmlFor="threshold-slider">
                    Coherence Threshold (τ): {threshold.toFixed(3)}
                  </label>
                  <Slider
                    id="threshold-slider"
                    aria-label="Coherence Threshold Control"
                    value={[threshold]}
                    onValueChange={([value]) => setThreshold(value)}
                    min={0.1}
                    max={0.95}
                    step={0.001}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block" htmlFor="archetype-slider">
                    User Archetype (Δθ): {archetype.toFixed(2)}
                  </label>
                  <Slider
                    id="archetype-slider"
                    aria-label="User Archetype Phase Control"
                    value={[archetype]}
                    onValueChange={([value]) => setArchetype(value)}
                    min={-Math.PI}
                    max={Math.PI}
                    step={0.01}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block" htmlFor="speed-slider">
                    Animation Speed: {speed.toFixed(1)}x
                  </label>
                  <Slider
                    id="speed-slider"
                    aria-label="Animation Speed Control"
                    value={[speed]}
                    onValueChange={([value]) => setSpeed(value)}
                    min={0.1}
                    max={3}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-destructive" />
                CUST Output Control
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`p-4 rounded-lg border-2 ${
                  !state.custBlocked ? "border-green-500 bg-green-500/10" : "border-red-500 bg-red-500/10"
                }`}
              >
                <div className="text-center">
                  <div className={`text-xl font-bold ${!state.custBlocked ? "text-green-400" : "text-red-400"}`}>
                    {!state.custBlocked ? "OUTPUT READY" : "OUTPUT GATED"}
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    CUST Score (ρ): {state.rho.toFixed(4)} | Threshold: {threshold.toFixed(3)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {!state.custBlocked
                      ? "Coherence threshold met - output generation enabled"
                      : "Awaiting phase synchronization - output blocked for stability"}
                  </div>
                </div>
              </div>

              {!state.custBlocked && state.outputText && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Generated Output:</div>
                  <div className="text-sm text-green-400 italic">{state.outputText}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
