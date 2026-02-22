"use client"
import { useEffect, useRef } from "react"

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

interface DashboardProps {
  ticks: RifTick[]
  maxHistory?: number
}

const PHI_GOLDEN = 1.618

function crossedPhi(cust: number): boolean {
  return cust >= PHI_GOLDEN
}

export default function HealthDashboard({ ticks, maxHistory = 240 }: DashboardProps) {
  const recent = ticks.slice(-maxHistory)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <CustTrendCard ticks={recent} />
      <WobbleSpikesCard ticks={recent} />
      <BetaRepairCard ticks={recent} />
      <ContradictionCard ticks={recent} />
    </div>
  )
}

function CustTrendCard({ ticks }: { ticks: RifTick[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const latest = ticks.at(-1)
  const custValues = ticks.map((t) => t.CUST_roll)
  const phiCrossings = ticks.filter((t) => crossedPhi(t.CUST_roll)).length

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !custValues.length) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const { width: w, height: h } = canvas
    ctx.clearRect(0, 0, w, h)

    const min = Math.min(...custValues)
    const max = Math.max(PHI_GOLDEN + 0.2, Math.max(...custValues))
    const xStep = w / Math.max(1, custValues.length - 1)

    // Draw φ threshold line
    const phiY = h - ((PHI_GOLDEN - min) / (max - min)) * h
    ctx.strokeStyle = "#10b981"
    ctx.setLineDash([5, 5])
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, phiY)
    ctx.lineTo(w, phiY)
    ctx.stroke()
    ctx.setLineDash([])

    // Draw CUST trend
    ctx.strokeStyle = latest && crossedPhi(latest.CUST_roll) ? "#10b981" : "#f59e0b"
    ctx.lineWidth = 2
    ctx.beginPath()
    custValues.forEach((cust, i) => {
      const x = i * xStep
      const y = h - ((cust - min) / (max - min)) * h
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.stroke()
  }, [custValues, latest])

  return (
    <div className="rounded-xl border p-4 bg-white/70 dark:bg-neutral-900/60 border-neutral-200 dark:border-neutral-800">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">CUST Trajectory</h3>
        {latest && (
          <div
            className={`px-2 py-1 rounded text-xs font-medium ${
              crossedPhi(latest.CUST_roll)
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                : "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
            }`}
          >
            {crossedPhi(latest.CUST_roll) ? "EMERGENT" : "STABILIZING"}
          </div>
        )}
      </div>
      <div className="h-24 mb-3">
        <canvas ref={canvasRef} width={280} height={96} className="w-full h-full" />
      </div>
      <div className="text-xs text-neutral-600 dark:text-neutral-400">
        φ crossings: <span className="font-semibold text-emerald-600">{phiCrossings}</span>
        {latest && (
          <span className="float-right">
            Current: <span className="font-semibold">{latest.CUST_roll.toFixed(3)}</span>
          </span>
        )}
      </div>
    </div>
  )
}

function WobbleSpikesCard({ ticks }: { ticks: RifTick[] }) {
  const wobbleThreshold = 0.6
  const spikes = ticks.filter((t) => t.W > wobbleThreshold)
  const avgWobble = ticks.length ? ticks.reduce((sum, t) => sum + t.W, 0) / ticks.length : 0

  return (
    <div className="rounded-xl border p-4 bg-white/70 dark:bg-neutral-900/60 border-neutral-200 dark:border-neutral-800">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">Wobble Monitor</h3>
        <div
          className={`px-2 py-1 rounded text-xs font-medium ${
            spikes.length > 5
              ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
              : spikes.length > 2
                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
          }`}
        >
          {spikes.length > 5 ? "HIGH" : spikes.length > 2 ? "MEDIUM" : "STABLE"}
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Spikes (W &gt; {wobbleThreshold})</span>
          <span className="font-semibold tabular-nums">{spikes.length}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Avg wobble</span>
          <span className="font-semibold tabular-nums">{avgWobble.toFixed(3)}</span>
        </div>
        <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-red-500 transition-all"
            style={{ width: `${Math.min(100, (avgWobble / 1) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}

function BetaRepairCard({ ticks }: { ticks: RifTick[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const repairEvents = ticks.filter((t) => t.events?.some((e) => e.type === "repair")).length
  const avgBeta = ticks.length ? ticks.reduce((sum, t) => sum + t.beta, 0) / ticks.length : 0
  const ctValues = ticks.map((t) => t.C_t)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !ctValues.length) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const { width: w, height: h } = canvas
    ctx.clearRect(0, 0, w, h)

    const min = Math.min(...ctValues)
    const max = Math.max(...ctValues)
    const range = max - min || 1
    const xStep = w / Math.max(1, ctValues.length - 1)

    ctx.strokeStyle = "#10b981"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctValues.forEach((ct, i) => {
      const x = i * xStep
      const y = h - ((ct - min) / range) * h
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.stroke()
  }, [ctValues])

  return (
    <div className="rounded-xl border p-4 bg-white/70 dark:bg-neutral-900/60 border-neutral-200 dark:border-neutral-800">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">Grace & Repair</h3>
        <div className="text-xs font-medium bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded">
          β={avgBeta.toFixed(2)}
        </div>
      </div>
      <div className="h-16 mb-3">
        <canvas ref={canvasRef} width={280} height={64} className="w-full h-full" />
      </div>
      <div className="text-xs text-neutral-600 dark:text-neutral-400">
        Repair events: <span className="font-semibold">{repairEvents}</span>
        <span className="float-right opacity-60">Coherence accumulator Cₜ</span>
      </div>
    </div>
  )
}

function ContradictionCard({ ticks }: { ticks: RifTick[] }) {
  const contradictions = ticks.filter((t) => t.events?.some((e) => e.type === "contradiction")).length
  const safeguards = ticks.filter((t) => t.events?.some((e) => e.type === "safeguard")).length
  const resolutionRate = contradictions > 0 ? safeguards / contradictions : 1

  return (
    <div className="rounded-xl border p-4 bg-white/70 dark:bg-neutral-900/60 border-neutral-200 dark:border-neutral-800">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">Contradiction Flow</h3>
        <div
          className={`text-xs font-medium px-2 py-1 rounded ${
            resolutionRate > 0.8
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
              : resolutionRate > 0.5
                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
          }`}
        >
          {(resolutionRate * 100).toFixed(0)}%
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span>Contradictions</span>
          <span className="font-semibold text-red-600 dark:text-red-400">{contradictions}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span>Safeguards</span>
          <span className="font-semibold text-emerald-600">{safeguards}</span>
        </div>
        <div className="text-xs opacity-60">
          Resolution rate: {contradictions > 0 ? `${safeguards}/${contradictions}` : "N/A"}
        </div>
      </div>
    </div>
  )
}
