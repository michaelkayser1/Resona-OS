"use client"

import { useEffect, useRef } from "react"
import type { QOTEResult } from "@/lib/qote-engine"

interface PhaseChartProps {
  data: QOTEResult | null
}

export function PhaseChart({ data }: PhaseChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!data || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    // Clear canvas
    ctx.fillStyle = "#0f0f0f"
    ctx.fillRect(0, 0, rect.width, rect.height)

    drawPhaseChart(ctx, data, rect.width, rect.height)
  }, [data])

  const drawPhaseChart = (ctx: CanvasRenderingContext2D, qoteData: QOTEResult, width: number, height: number) => {
    if (!qoteData.phases || qoteData.phases.length === 0) return

    const padding = 40
    const chartWidth = width - 2 * padding
    const chartHeight = height - 2 * padding

    // Draw axes
    ctx.strokeStyle = "#666"
    ctx.lineWidth = 1

    // X-axis
    ctx.beginPath()
    ctx.moveTo(padding, height - padding)
    ctx.lineTo(width - padding, height - padding)
    ctx.stroke()

    // Y-axis
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, height - padding)
    ctx.stroke()

    // Draw grid lines
    ctx.strokeStyle = "#333"
    ctx.lineWidth = 0.5

    // Horizontal grid lines
    for (let i = 1; i < 4; i++) {
      const y = padding + (chartHeight * i) / 4
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()
    }

    // Vertical grid lines
    const tokenCount = qoteData.phases.length
    for (let i = 1; i < tokenCount; i++) {
      const x = padding + (chartWidth * i) / tokenCount
      ctx.beginPath()
      ctx.moveTo(x, padding)
      ctx.lineTo(x, height - padding)
      ctx.stroke()
    }

    // Draw phase values as bars
    const barWidth = (chartWidth / tokenCount) * 0.8
    const maxPhase = 2 * Math.PI

    qoteData.phases.forEach((phase, index) => {
      const x = padding + (chartWidth * index) / tokenCount + (chartWidth / tokenCount - barWidth) / 2
      const barHeight = (phase / maxPhase) * chartHeight
      const y = height - padding - barHeight

      // Color based on phase value
      const hue = (phase / maxPhase) * 360
      ctx.fillStyle = `hsl(${hue}, 70%, 60%)`

      ctx.fillRect(x, y, barWidth, barHeight)

      // Draw phase value text
      ctx.fillStyle = "#fff"
      ctx.font = "10px monospace"
      ctx.textAlign = "center"
      ctx.fillText(phase.toFixed(2), x + barWidth / 2, height - padding + 15)
    })

    // Draw labels
    ctx.fillStyle = "#fff"
    ctx.font = "12px sans-serif"
    ctx.textAlign = "left"

    // Y-axis label
    ctx.save()
    ctx.translate(15, height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText("Phase (radians)", 0, 0)
    ctx.restore()

    // X-axis label
    ctx.textAlign = "center"
    ctx.fillText("Token Index", width / 2, height - 10)

    // Title
    ctx.font = "14px sans-serif"
    ctx.fillText("Token Phase Distribution", padding, 20)

    // Statistics
    ctx.font = "10px monospace"
    ctx.textAlign = "left"
    ctx.fillText(`Variance: ${qoteData.phaseVariance.toFixed(3)}`, width - 120, 20)
    ctx.fillText(`Tokens: ${tokenCount}`, width - 120, 35)
  }

  return (
    <div className="w-full h-64 bg-black rounded-lg overflow-hidden">
      {data ? (
        <canvas ref={canvasRef} className="w-full h-full" />
      ) : (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
              <div className="w-2 h-8 bg-muted-foreground/20 rounded mr-1"></div>
              <div className="w-2 h-6 bg-muted-foreground/20 rounded mr-1"></div>
              <div className="w-2 h-10 bg-muted-foreground/20 rounded"></div>
            </div>
            <p className="text-sm">Process a prompt to see phase dynamics</p>
          </div>
        </div>
      )}
    </div>
  )
}
