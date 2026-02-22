"use client"

import { useState, useEffect } from "react"
import HealthDashboard from "@/components/HealthDashboard"
import ContradictionDetector from "@/components/ContradictionDetector"

const PlayIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
      clipRule="evenodd"
    />
  </svg>
)

const PauseIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
      clipRule="evenodd"
    />
  </svg>
)

const ResetIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
      clipRule="evenodd"
    />
  </svg>
)

const ActivityIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
)

const CpuIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
    />
  </svg>
)

const NetworkIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
    />
  </svg>
)

const SettingsIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const BrainIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
    />
  </svg>
)

const HeartIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
      clipRule="evenodd"
    />
  </svg>
)

const DatabaseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
    />
  </svg>
)

const ChartIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
)

const TargetIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13M3 6.253C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    />
  </svg>
)

const MessageIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    />
  </svg>
)

const ZapIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
      clipRule="evenodd"
    />
  </svg>
)

const ShieldIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414l-.707.707a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
      clipRule="evenodd"
    />
  </svg>
)

const LightbulbIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 00-1.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.477.859h4z" />
  </svg>
)

const SparklesIcon = () => (
  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M5 2a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 010-2h1v-1a1 1 0 011-1zM12 1a1 1 0 01.967.744L14.146 7.2 17.5 8.134a1 1 0 010 1.732L14.146 10.8l-1.179 5.456a1 1 0 01-1.934 0L9.854 10.8 6.5 9.866a1 1 0 010-1.732L9.854 7.2l1.179-5.456A1 1 0 0112 1z"
      clipRule="evenodd"
    />
  </svg>
)

interface RifTick {
  timestamp: number
  session_id: string
  agent_ids: string[]
  phases: number[]
  phase_mean: number
  phase_var: number
  R: number
  W: number
  beta: number
  C_t: number
  CUST_roll: number
  events?: Array<{ type: string; data?: any }>
}

interface AgentState {
  id: string
  position: { empathy: number; evidence: number }
  recent_actions: string[]
  confidence: number
}

interface RealTimeDataPoint {
  time: number
  coherence: number
  resonance: number
}

type AgentType = "therapist" | "researcher" | "analyst" | "coach"

export default function Orchestrator() {
  const [activeAgents, setActiveAgents] = useState({
    therapist: true,
    researcher: false,
    analyst: true,
    coach: false,
  })

  const [systemMetrics, setSystemMetrics] = useState({
    coherence: 85,
    resonance: 72,
    processing: 91,
    engagement: 88,
  })

  const [realTimeData, setRealTimeData] = useState<RealTimeDataPoint[]>([])
  const [selectedModel, setSelectedModel] = useState("claude-4-sonnet")
  const [sessionActive, setSessionActive] = useState(false)

  const [rifTicks, setRifTicks] = useState<RifTick[]>([])
  const [agentStates, setAgentStates] = useState<AgentState[]>([
    { id: "therapist", position: { empathy: 0.8, evidence: 0.6 }, recent_actions: [], confidence: 0.9 },
    { id: "researcher", position: { empathy: 0.4, evidence: 0.9 }, recent_actions: [], confidence: 0.8 },
    { id: "analyst", position: { empathy: 0.6, evidence: 0.8 }, recent_actions: [], confidence: 0.85 },
    { id: "coach", position: { empathy: 0.9, evidence: 0.5 }, recent_actions: [], confidence: 0.75 },
  ])

  useEffect(() => {
    if (typeof window === "undefined") return // Only run in browser

    const interval = setInterval(() => {
      setSystemMetrics((prev) => ({
        coherence: Math.max(0, Math.min(100, prev.coherence + (Math.random() - 0.5) * 5)),
        resonance: Math.max(0, Math.min(100, prev.resonance + (Math.random() - 0.5) * 4)),
        processing: Math.max(0, Math.min(100, prev.processing + (Math.random() - 0.5) * 3)),
        engagement: Math.max(0, Math.min(100, prev.engagement + (Math.random() - 0.5) * 6)),
      }))

      setRealTimeData((prev) => [
        ...prev.slice(-29),
        {
          time: Date.now(),
          coherence: systemMetrics.coherence,
          resonance: systemMetrics.resonance,
        },
      ])

      if (sessionActive) {
        const activeAgentIds = Object.entries(activeAgents)
          .filter(([_, active]) => active)
          .map(([id, _]) => id)

        const newTick: RifTick = {
          timestamp: Date.now(),
          session_id: "orchestrator-session",
          agent_ids: activeAgentIds,
          phases: [0, 1.57, 3.14, 4.71], // Simplified phases
          phase_mean: 1.57,
          phase_var: 0.5,
          R: Math.random() * 0.5 + 0.5,
          W: Math.random() * 0.3,
          beta: 0.7,
          C_t: Math.random() * 50 + 50,
          CUST_roll: Math.random() + 1,
          events: [{ type: "processing", data: { active_agents: activeAgentIds.length } }],
        }

        setRifTicks((prev) => [...prev.slice(-50), newTick]) // Keep fewer ticks
      }

      setAgentStates((prev) =>
        prev.map((agent) => ({
          ...agent,
          position: {
            empathy: Math.max(0, Math.min(1, agent.position.empathy + (Math.random() - 0.5) * 0.05)),
            evidence: Math.max(0, Math.min(1, agent.position.evidence + (Math.random() - 0.5) * 0.05)),
          },
          confidence: Math.max(0, Math.min(1, agent.confidence + (Math.random() - 0.5) * 0.02)),
        })),
      )
    }, 2000) // Increased interval to 2 seconds to reduce computation load

    return () => clearInterval(interval)
  }, [activeAgents, sessionActive]) // Removed systemMetrics dependency to prevent excessive re-renders

  const aiModels = [
    { id: "claude-4-sonnet", name: "Claude 4 Sonnet", specialty: "Therapeutic Dialogue", status: "active" },
    { id: "gpt-4-turbo", name: "GPT-4 Turbo", specialty: "Pattern Analysis", status: "standby" },
    { id: "gemini-pro", name: "Gemini Pro", specialty: "Emotional Intelligence", status: "active" },
    { id: "custom-qote", name: "QOTE Therapeutic", specialty: "Trauma Processing", status: "active" },
  ]

  const agentConfigs = [
    {
      id: "therapist",
      name: "Therapeutic Agent",
      icon: HeartIcon,
      color: "bg-rose-500",
      description: "Provides trauma-informed therapeutic guidance",
      metrics: { empathy: 94, safety: 98, insight: 87 },
    },
    {
      id: "researcher",
      name: "Research Agent",
      icon: DatabaseIcon,
      color: "bg-blue-500",
      description: "Analyzes latest trauma research and evidence",
      metrics: { accuracy: 96, synthesis: 89, depth: 92 },
    },
    {
      id: "analyst",
      name: "Pattern Analyst",
      icon: ChartIcon,
      color: "bg-green-500",
      description: "Identifies coherence patterns and insights",
      metrics: { detection: 91, prediction: 84, clarity: 88 },
    },
    {
      id: "coach",
      name: "Integration Coach",
      icon: TargetIcon,
      color: "bg-purple-500",
      description: "Guides practical application and integration",
      metrics: { guidance: 93, motivation: 87, results: 90 },
    },
  ]

  const toggleAgent = (agentId: AgentType) => {
    setActiveAgents((prev) => ({
      ...prev,
      [agentId]: !prev[agentId],
    }))
  }

  const startSession = () => {
    setSessionActive(true)
  }

  const stopSession = () => {
    setSessionActive(false)
  }

  const resetSystem = () => {
    setActiveAgents({ therapist: true, researcher: false, analyst: true, coach: false })
    setSystemMetrics({ coherence: 85, resonance: 72, processing: 91, engagement: 88 })
    setSessionActive(false)
  }

  const handleContradictionResolved = (contradiction: any, resolution: any) => {
    console.log("[v0] Contradiction resolved:", contradiction.id, "with resolution:", resolution)
    setRifTicks((prev) => {
      const latest = prev[prev.length - 1]
      if (latest) {
        latest.events = [...(latest.events || []), { type: "safeguard", data: { contradiction_id: contradiction.id } }]
      }
      return [...prev]
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              AI Orchestrator Control Room
            </h1>
            <p className="text-slate-300 mt-2">Multi-agent therapeutic AI coordination system</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={sessionActive ? stopSession : startSession}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                sessionActive ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {sessionActive ? <PauseIcon /> : <PlayIcon />}
              {sessionActive ? "Stop Session" : "Start Session"}
            </button>
            <button
              onClick={resetSystem}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-slate-600 hover:bg-slate-700 transition-all"
            >
              <ResetIcon />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Coherence Monitoring Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-slate-200">System Coherence Monitoring</h2>
        <HealthDashboard ticks={rifTicks} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column - System Metrics & Models */}
        <div className="space-y-6">
          {/* System Health */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
              <ActivityIcon />
              System Health
            </h3>
            <div className="space-y-4">
              {Object.entries(systemMetrics).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="capitalize text-slate-300">{key}</span>
                    <span className="text-white font-semibold">{Math.round(value)}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-1000 ${
                        value > 80 ? "bg-green-400" : value > 60 ? "bg-yellow-400" : "bg-red-400"
                      }`}
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contradiction Detection Panel */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
            <ContradictionDetector agents={agentStates} onContradictionResolved={handleContradictionResolved} />
          </div>

          {/* AI Models */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
              <CpuIcon />
              AI Models
            </h3>
            <div className="space-y-4">
              {aiModels.map((model) => (
                <div
                  key={model.id}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedModel === model.id
                      ? "border-blue-400 bg-blue-400/10"
                      : "border-slate-600 hover:border-slate-500"
                  }`}
                  onClick={() => setSelectedModel(model.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{model.name}</span>
                    <div
                      className={`w-3 h-3 rounded-full ${model.status === "active" ? "bg-green-400" : "bg-yellow-400"}`}
                    />
                  </div>
                  <p className="text-sm text-slate-400">{model.specialty}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Column - Agent Control */}
        <div className="space-y-6">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
              <NetworkIcon />
              AI Agent Network
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {agentConfigs.map((agent) => {
                const IconComponent = agent.icon
                const isActive = activeAgents[agent.id as keyof typeof activeAgents]
                const agentState = agentStates.find((s) => s.id === agent.id)

                return (
                  <div
                    key={agent.id}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isActive ? "border-purple-400 bg-purple-400/10" : "border-slate-600 hover:border-slate-500"
                    }`}
                    onClick={() => toggleAgent(agent.id as AgentType)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${agent.color}`}>
                        <IconComponent className="w-5 h-5 text-white" {...({} as any)} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{agent.name}</h4>
                        <div className={`w-2 h-2 rounded-full ${isActive ? "bg-green-400" : "bg-slate-500"}`} />
                      </div>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">{agent.description}</p>
                    {isActive && (
                      <div className="space-y-2">
                        {Object.entries(agent.metrics).map(([metric, value]) => (
                          <div key={metric} className="flex justify-between text-sm">
                            <span className="text-slate-400 capitalize">{metric}</span>
                            <span className="text-white font-medium">{value}%</span>
                          </div>
                        ))}
                        {agentState && (
                          <div className="mt-2 pt-2 border-t border-slate-600">
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-400">Empathy</span>
                              <span className="text-white">{(agentState.position.empathy * 100).toFixed(0)}%</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-400">Evidence</span>
                              <span className="text-white">{(agentState.position.evidence * 100).toFixed(0)}%</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Session Controls */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
              <SettingsIcon />
              Session Configuration
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Therapeutic Mode</label>
                <select className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white">
                  <option>Trauma-Informed</option>
                  <option>Somatic Experiencing</option>
                  <option>EMDR Integration</option>
                  <option>Polyvagal Theory</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Safety Protocol</label>
                <select className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white">
                  <option>High Sensitivity</option>
                  <option>Standard</option>
                  <option>Research Mode</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <ShieldIcon />
                <span className="text-sm text-slate-300">Ethical safeguards active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Real-time Activity */}
        <div className="space-y-6">
          {/* Activity Feed */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
              <MessageIcon />
              Real-time Activity
            </h3>
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {sessionActive ? (
                <>
                  <div className="flex items-start gap-3 p-3 bg-slate-700/50 rounded-lg">
                    <HeartIcon />
                    <div>
                      <p className="text-sm text-white">Therapeutic Agent initialized</p>
                      <p className="text-xs text-slate-400">Establishing safe therapeutic container</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-slate-700/50 rounded-lg">
                    <ChartIcon />
                    <div>
                      <p className="text-sm text-white">Pattern analysis active</p>
                      <p className="text-xs text-slate-400">Detecting coherence fluctuations</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-slate-700/50 rounded-lg">
                    <LightbulbIcon />
                    <div>
                      <p className="text-sm text-white">Insight generated</p>
                      <p className="text-xs text-slate-400">Resonance pattern suggests integration phase</p>
                    </div>
                  </div>
                  {rifTicks.length > 0 && (
                    <div className="flex items-start gap-3 p-3 bg-slate-700/50 rounded-lg">
                      <SparklesIcon />
                      <div>
                        <p className="text-sm text-white">CUST: {rifTicks[rifTicks.length - 1].CUST_roll.toFixed(3)}</p>
                        <p className="text-xs text-slate-400">
                          {rifTicks[rifTicks.length - 1].CUST_roll >= 1.618 ? "Emergent state detected" : "Stabilizing"}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center text-slate-400 py-8">
                  <SparklesIcon />
                  <p>Start a session to view real-time AI activity</p>
                </div>
              )}
            </div>
          </div>

          {/* Network Visualization */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
              <ZapIcon />
              Network Activity
            </h3>
            <div className="relative h-48 bg-slate-900/50 rounded-xl overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* Central hub */}
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                    <BrainIcon />
                  </div>

                  {/* Agent nodes */}
                  {agentConfigs.map((agent, index) => {
                    const angle = index * 90 * (Math.PI / 180)
                    const radius = 80
                    const x = Math.cos(angle) * radius
                    const y = Math.sin(angle) * radius
                    const IconComponent = agent.icon
                    const isActive = activeAgents[agent.id as keyof typeof activeAgents]

                    return (
                      <div key={agent.id}>
                        {/* Connection line */}
                        {isActive && (
                          <div
                            className="absolute w-px bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-60"
                            style={{
                              height: `${radius}px`,
                              left: "24px",
                              top: "24px",
                              transformOrigin: "bottom center",
                              transform: `rotate(${angle}rad)`,
                            }}
                          />
                        )}

                        {/* Agent node */}
                        <div
                          className={`absolute w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                            isActive ? `${agent.color} opacity-100 scale-100` : "bg-slate-600 opacity-50 scale-75"
                          }`}
                          style={{
                            left: `${24 + x}px`,
                            top: `${24 + y}px`,
                          }}
                        >
                          <IconComponent />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-between text-sm text-slate-400">
              <span>Active Agents: {Object.values(activeAgents).filter(Boolean).length}</span>
              <span>Network Load: {sessionActive ? "74%" : "12%"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
