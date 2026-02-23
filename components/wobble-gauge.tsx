"use client"

import { cn } from "@/lib/utils"

interface WobbleGaugeProps {
  score: number
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
}

export function WobbleGauge({ score, size = "md", showLabel = true }: WobbleGaugeProps) {
  const percentage = Math.round(score * 100)
  const circumference = 2 * Math.PI * 40
  const offset = circumference - (score * circumference)

  const getColor = (s: number) => {
    if (s >= 0.75) return "text-success"
    if (s >= 0.6) return "text-warning"
    return "text-destructive"
  }

  const getRecommendation = (s: number) => {
    if (s >= 0.75) return "Merge"
    if (s >= 0.6) return "Revise"
    return "Reject"
  }

  const sizeMap = {
    sm: { svgSize: 64, fontSize: "text-sm", labelSize: "text-[8px]" },
    md: { svgSize: 96, fontSize: "text-xl", labelSize: "text-[10px]" },
    lg: { svgSize: 128, fontSize: "text-3xl", labelSize: "text-xs" },
  }

  const { svgSize, fontSize, labelSize } = sizeMap[size]

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: svgSize, height: svgSize }}>
        <svg
          width={svgSize}
          height={svgSize}
          viewBox="0 0 96 96"
          className="-rotate-90"
        >
          <circle
            cx="48"
            cy="48"
            r="40"
            fill="none"
            strokeWidth="6"
            className="stroke-secondary"
          />
          <circle
            cx="48"
            cy="48"
            r="40"
            fill="none"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cn("transition-all duration-1000", getColor(score).replace("text-", "stroke-"))}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-mono font-bold", fontSize, getColor(score))}>
            {percentage}
          </span>
        </div>
      </div>
      {showLabel && (
        <span className={cn("font-mono font-medium uppercase tracking-wider", labelSize, getColor(score))}>
          {getRecommendation(score)}
        </span>
      )}
    </div>
  )
}
