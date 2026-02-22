"use client"

import { useRef, useEffect } from "react"
import type { RuntimeState } from "@/lib/simulation/types"

interface GaugesProps {
  state: RuntimeState
  t: (key: string) => string
}

function CircularGauge({
  value,
  max,
  label,
  color = "#3b82f6",
}: {
  value: number
  max: number
  label: string
  color?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")!
    const size = 120
    const dpr = Math.min(window.devicePixelRatio, 2)

    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
    ctx.scale(dpr, dpr)

    const centerX = size / 2
    const centerY = size / 2
    const radius = 45
    const lineWidth = 8

    // Clear canvas
    ctx.clearRect(0, 0, size, size)

    // Background arc
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
    ctx.lineWidth = lineWidth
    ctx.stroke()

    // Value arc
    const normalizedValue = Math.min(value / max, 1)
    const endAngle = -Math.PI / 2 + normalizedValue * 2 * Math.PI

    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, -Math.PI / 2, endAngle)
    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    ctx.lineCap = "round"
    ctx.stroke()

    // Glow effect
    ctx.shadowColor = color
    ctx.shadowBlur = 15
    ctx.stroke()
    ctx.shadowBlur = 0

    // Center value text
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 16px monospace"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(value.toFixed(2), centerX, centerY)
  }, [value, max, color])

  return (
    <div className="flex flex-col items-center">
      <canvas ref={canvasRef} />
      <span className="text-sm text-muted-foreground mt-2">{label}</span>
    </div>
  )
}

export function Gauges({ state, t }: GaugesProps) {
  return (
    <div className="glass p-6">
      <h2 className="heading-display text-xl mb-6 text-center">Metrics</h2>
      <div className="space-y-6">
        <CircularGauge value={state.R} max={10} label={t("gauges.resonance")} color="#06b6d4" />
        <CircularGauge value={state.W} max={5} label={t("gauges.wobble")} color="#fbbf24" />
      </div>
    </div>
  )
}
