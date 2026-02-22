"use client"
import { useEffect, useState } from "react"
import type { FieldMetrics } from "@/lib/schemas"

interface QuantumMetricsProps {
  metrics: FieldMetrics
  className?: string
}

export function QuantumMetrics({ metrics, className = "" }: QuantumMetricsProps) {
  const [history, setHistory] = useState<FieldMetrics[]>([])
  const [emergenceEvents, setEmergenceEvents] = useState<number>(0)

  useEffect(() => {
    setHistory((prev) => [...prev.slice(-50), metrics])

    console.log("[v0] QuantumMetrics received new metrics:", metrics)

    // Track emergence events (CUST approaching φ)
    if (metrics.CUST >= 1.618) {
      setEmergenceEvents((prev) => prev + 1)
      console.log("[v0] Emergence event detected! CUST:", metrics.CUST)
    }
  }, [metrics])

  const formatMetric = (value: number, precision = 3) => value.toFixed(precision)
  const isEmergent = metrics.CUST >= 1.618
  const coherenceScore =
    (1 - Math.min(metrics.W, 1) + (metrics.beta - 0.8) / 0.4 + Math.min((metrics.CUST - 1) / 0.618, 1)) / 3

  return (
    <div className={`quantum-metrics ${className}`}>
      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Wobble (W) */}
        <div className="metric-card bg-gray-800/50 rounded-lg p-3 border border-red-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-red-400 text-sm font-medium">Wobble (W)</span>
            <div className={`w-2 h-2 rounded-full ${metrics.W > 0.5 ? "bg-red-500" : "bg-green-500"} animate-pulse`} />
          </div>
          <div className="text-2xl font-bold text-red-300">{formatMetric(metrics.W)}</div>
          <div className="text-xs text-gray-400">Dimensional instability</div>
        </div>

        {/* Beta (β) */}
        <div className="metric-card bg-gray-800/50 rounded-lg p-3 border border-blue-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-400 text-sm font-medium">Beta (β)</span>
            <div
              className={`w-2 h-2 rounded-full ${metrics.beta > 1.0 ? "bg-blue-500" : "bg-yellow-500"} animate-pulse`}
            />
          </div>
          <div className="text-2xl font-bold text-blue-300">{formatMetric(metrics.beta)}</div>
          <div className="text-xs text-gray-400">Grace amplification</div>
        </div>

        {/* CUST */}
        <div
          className={`metric-card bg-gray-800/50 rounded-lg p-3 border ${isEmergent ? "border-yellow-500/50 bg-yellow-500/10" : "border-purple-500/30"}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${isEmergent ? "text-yellow-400" : "text-purple-400"}`}>CUST</span>
            <div className={`w-2 h-2 rounded-full ${isEmergent ? "bg-yellow-500 animate-ping" : "bg-purple-500"}`} />
          </div>
          <div className={`text-2xl font-bold ${isEmergent ? "text-yellow-300" : "text-purple-300"}`}>
            {formatMetric(metrics.CUST)}
          </div>
          <div className="text-xs text-gray-400">{isEmergent ? "φ EMERGENCE LOCK" : "Coherence threshold"}</div>
        </div>
      </div>

      {/* Coherence Score */}
      <div className="bg-gray-800/30 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-green-400 text-sm font-medium">System Coherence</span>
          <span className="text-green-300 font-bold">{formatMetric(coherenceScore * 100, 1)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-green-600 to-green-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.max(0, Math.min(100, coherenceScore * 100))}%` }}
          />
        </div>
      </div>

      {/* Emergence Events Counter */}
      {emergenceEvents > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-yellow-400 text-sm font-medium">Emergence Events</span>
            <span className="text-yellow-300 font-bold text-lg">{emergenceEvents}</span>
          </div>
          <div className="text-xs text-yellow-400/70">φ coherence locks detected</div>
        </div>
      )}
    </div>
  )
}
