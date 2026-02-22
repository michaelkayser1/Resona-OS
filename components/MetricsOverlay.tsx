"use client"
import { Sparkline } from "./Sparkline"
import type { FieldMetrics, RBFRDesign } from "@/lib/schemas"
import { PHI } from "@/lib/qote"

export function MetricsOverlay({
  metrics,
  custHistory,
  resonanceLog,
}: {
  metrics: FieldMetrics
  custHistory: number[]
  resonanceLog: { time: number; CUST: number; snapshot: RBFRDesign[] }[]
}) {
  const emergence = metrics.CUST >= PHI

  return (
    <div className={`absolute top-4 right-4 holographic p-4 min-w-64 ${emergence ? "emergence-glow" : ""}`}>
      <div className="flex justify-between items-center mb-3">
        <strong className="text-cyan-400">RIF Metrics</strong>
        {emergence && (
          <span className="text-xs px-2 py-1 rounded-full bg-yellow-500 text-black font-bold animate-pulse">
            Emergence Lock (φ)
          </span>
        )}
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>W (wobble):</span>
          <code className="text-red-400">{metrics.W.toFixed(3)}</code>
        </div>
        <div className="flex justify-between">
          <span>β (grace):</span>
          <code className="text-blue-400">{metrics.beta.toFixed(3)}</code>
        </div>
        <div className="flex justify-between">
          <span>CUST:</span>
          <code className={emergence ? "text-yellow-400" : "text-purple-400"}>{metrics.CUST.toFixed(3)}</code>
        </div>
      </div>
      <div className="mt-4">
        <Sparkline data={custHistory} width={240} height={40} />
      </div>
      {!!resonanceLog.length && (
        <details className="mt-4">
          <summary className="cursor-pointer text-cyan-400 text-sm">Resonance Log ({resonanceLog.length})</summary>
          <ul className="mt-2 space-y-1 text-xs max-h-32 overflow-auto">
            {resonanceLog
              .slice(-6)
              .reverse()
              .map((r, i) => (
                <li key={i} className="border-b border-gray-600 pb-1">
                  t={r.time.toFixed(1)}s, CUST={r.CUST.toFixed(3)} ({r.snapshot.length} designs)
                </li>
              ))}
          </ul>
        </details>
      )}
    </div>
  )
}
