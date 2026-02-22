"use client"
import { useState, useEffect } from "react"

interface AgentState {
  id: string
  position: { empathy: number; evidence: number }
  recent_actions: string[]
  confidence: number
}

interface Contradiction {
  improves: string
  worsens: string
  context?: any
}

interface DetectedContradiction extends Contradiction {
  id: string
  severity: number
  agents_involved: string[]
  detected_at: number
}

export default function ContradictionDetector({
  agents,
  onContradictionResolved,
}: {
  agents: AgentState[]
  onContradictionResolved?: (contradiction: DetectedContradiction, resolution: any) => void
}) {
  const [detectedContradictions, setDetectedContradictions] = useState<DetectedContradiction[]>([])

  useEffect(() => {
    const interval = setInterval(() => {
      const newContradictions = detectContradictions(agents)
      setDetectedContradictions((prev) => {
        const existing = new Set(prev.map((c) => c.id))
        const fresh = newContradictions.filter((c) => !existing.has(c.id))
        return [...prev, ...fresh].slice(-10)
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [agents])

  const resolveContradiction = (contradictionId: string, resolution: any) => {
    const contradiction = detectedContradictions.find((c) => c.id === contradictionId)
    if (contradiction) {
      onContradictionResolved?.(contradiction, resolution)
      setDetectedContradictions((prev) => prev.filter((c) => c.id !== contradictionId))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Active Contradictions</h3>
        <div className="text-sm opacity-60">{detectedContradictions.length} detected</div>
      </div>

      {detectedContradictions.length === 0 ? (
        <div className="text-sm opacity-60 text-center py-4 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-lg">
          No contradictions detected
        </div>
      ) : (
        <div className="space-y-3">
          {detectedContradictions.map((contradiction) => (
            <div key={contradiction.id} className="border rounded-lg p-3 bg-white/50 dark:bg-neutral-900/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      contradiction.severity > 0.7
                        ? "bg-red-500"
                        : contradiction.severity > 0.4
                          ? "bg-amber-500"
                          : "bg-blue-500"
                    }`}
                  />
                  <span className="text-sm font-medium">
                    {contradiction.improves} vs {contradiction.worsens}
                  </span>
                </div>
                <span className="text-xs opacity-60">{new Date(contradiction.detected_at).toLocaleTimeString()}</span>
              </div>

              <div className="text-xs text-neutral-600 dark:text-neutral-400">
                Agents: {contradiction.agents_involved.join(", ")} • Severity:{" "}
                {(contradiction.severity * 100).toFixed(0)}%
              </div>

              <button
                onClick={() => resolveContradiction(contradiction.id, { resolved: true })}
                className="mt-2 px-3 py-1 text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 rounded hover:bg-emerald-200 dark:hover:bg-emerald-900/40 transition-colors"
              >
                Mark Resolved
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function detectContradictions(agents: AgentState[]): DetectedContradiction[] {
  const contradictions: DetectedContradiction[] = []

  for (let i = 0; i < agents.length; i++) {
    for (let j = i + 1; j < agents.length; j++) {
      const a1 = agents[i],
        a2 = agents[j]
      const empathyGap = Math.abs(a1.position.empathy - a2.position.empathy)
      const evidenceGap = Math.abs(a1.position.evidence - a2.position.evidence)

      if (empathyGap > 0.4 && evidenceGap > 0.4) {
        const severity = (empathyGap + evidenceGap) / 2
        const id = `empathy-evidence-${a1.id}-${a2.id}-${Date.now()}`

        contradictions.push({
          id,
          improves: a1.position.empathy > a2.position.empathy ? "Empathy" : "Evidence strictness",
          worsens: a1.position.empathy > a2.position.empathy ? "Evidence strictness" : "Empathy",
          severity,
          agents_involved: [a1.id, a2.id],
          detected_at: Date.now(),
          context: {
            agent_positions: { [a1.id]: a1.position, [a2.id]: a2.position },
            confidence_delta: Math.abs(a1.confidence - a2.confidence),
          },
        })
      }
    }
  }

  return contradictions
}
