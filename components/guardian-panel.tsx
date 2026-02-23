"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { computeWobbleScore, type DiffMetrics } from "@/lib/guardian/wobble"
import { WobbleGauge } from "./wobble-gauge"
import { Shield, Play, RotateCcw } from "lucide-react"

const DEFAULT_METRICS: DiffMetrics = {
  filesChanged: 7,
  linesAdded: 342,
  linesDeleted: 28,
  testCoverageDelta: 3,
  dependencyRiskScore: 0.1,
  commitMessageClarity: 0.9,
}

export function GuardianPanel() {
  const [metrics, setMetrics] = useState<DiffMetrics>(DEFAULT_METRICS)
  const [score, setScore] = useState(() => computeWobbleScore(DEFAULT_METRICS))
  const [isAnimating, setIsAnimating] = useState(false)

  function runScoring() {
    setIsAnimating(true)
    setTimeout(() => {
      setScore(computeWobbleScore(metrics))
      setIsAnimating(false)
    }, 800)
  }

  function reset() {
    setMetrics(DEFAULT_METRICS)
    setScore(computeWobbleScore(DEFAULT_METRICS))
  }

  function updateMetric(key: keyof DiffMetrics, value: number) {
    const updated = { ...metrics, [key]: value }
    setMetrics(updated)
  }

  const sliders: { key: keyof DiffMetrics; label: string; min: number; max: number; step: number }[] = [
    { key: "filesChanged", label: "Files Changed", min: 1, max: 50, step: 1 },
    { key: "linesAdded", label: "Lines Added", min: 0, max: 2000, step: 10 },
    { key: "linesDeleted", label: "Lines Deleted", min: 0, max: 2000, step: 10 },
    { key: "testCoverageDelta", label: "Test Coverage Delta", min: -20, max: 20, step: 1 },
    { key: "dependencyRiskScore", label: "Dependency Risk", min: 0, max: 1, step: 0.05 },
    { key: "commitMessageClarity", label: "Commit Clarity", min: 0, max: 1, step: 0.05 },
  ]

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Shield className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Guardian Merge Gate</h3>
        <span className="ml-auto font-mono text-[10px] text-muted-foreground">INTERACTIVE SCORING</span>
      </div>

      <div className="grid gap-6 p-4 lg:grid-cols-[1fr_auto]">
        <div className="space-y-4">
          {sliders.map((slider) => (
            <div key={slider.key} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">{slider.label}</label>
                <span className="font-mono text-xs text-foreground">{metrics[slider.key]}</span>
              </div>
              <input
                type="range"
                min={slider.min}
                max={slider.max}
                step={slider.step}
                value={metrics[slider.key]}
                onChange={(e) => updateMetric(slider.key, parseFloat(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-primary"
              />
            </div>
          ))}

          <div className="flex gap-2 pt-2">
            <button
              onClick={runScoring}
              disabled={isAnimating}
              className="flex h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              <Play className="h-3.5 w-3.5" />
              {isAnimating ? "Scoring..." : "Run Guardian"}
            </button>
            <button
              onClick={reset}
              className="flex h-11 items-center gap-2 rounded-md border border-border bg-secondary px-4 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-border bg-background p-6">
          <div className={cn("transition-all duration-300", isAnimating && "opacity-30 blur-sm")}>
            <WobbleGauge score={score.stabilityScore} size="lg" />
          </div>
          <div className="grid w-full grid-cols-2 gap-2 text-center">
            {Object.entries(score.breakdown).map(([key, value]) => (
              <div key={key} className="rounded-md bg-secondary/50 px-2 py-1.5">
                <div className="font-mono text-xs font-bold text-foreground">{(value * 100).toFixed(0)}%</div>
                <div className="text-[9px] text-muted-foreground capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</div>
              </div>
            ))}
          </div>
          <div className={cn(
            "rounded-full px-3 py-1 font-mono text-xs font-medium uppercase",
            score.regulatoryRisk === "low" ? "bg-success/15 text-success" :
            score.regulatoryRisk === "moderate" ? "bg-warning/15 text-warning" :
            "bg-destructive/15 text-destructive"
          )}>
            Risk: {score.regulatoryRisk}
          </div>
        </div>
      </div>
    </div>
  )
}
