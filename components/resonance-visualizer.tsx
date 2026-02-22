"use client"

import { useEffect, useRef } from "react"
import type { QOTEResult } from "@/lib/qote-engine"

interface ResonanceVisualizerProps {
  data: QOTEResult | null
}

export function ResonanceVisualizer({ data }: ResonanceVisualizerProps) {
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

    drawResonanceMap(ctx, data, rect.width, rect.height)
  }, [data])

  const drawResonanceMap = (ctx: CanvasRenderingContext2D, qoteData: QOTEResult, width: number, height: number) => {
    const centerX = width / 2
    const centerY = height / 2
    const maxRadius = Math.min(width, height) / 2 - 20

    // Draw background grid
    ctx.strokeStyle = "#333"
    ctx.lineWidth = 0.5
    for (let i = 1; i <= 3; i++) {
      const radius = (maxRadius * i) / 3
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
      ctx.stroke()
    }

    // Draw radial lines
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(centerX + Math.cos(angle) * maxRadius, centerY + Math.sin(angle) * maxRadius)
      ctx.stroke()
    }

    // Draw resonance field
    const resonanceRadius = maxRadius * qoteData.resonance
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, resonanceRadius)
    gradient.addColorStop(0, `rgba(59, 130, 246, ${qoteData.coherence * 0.8})`)
    gradient.addColorStop(0.5, `rgba(147, 51, 234, ${qoteData.coherence * 0.4})`)
    gradient.addColorStop(1, "rgba(59, 130, 246, 0)")

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(centerX, centerY, resonanceRadius, 0, 2 * Math.PI)
    ctx.fill()

    // Draw token oscillators as points
    if (qoteData.phases && qoteData.phases.length > 0) {
      qoteData.phases.forEach((phase, index) => {
        const oscillatorRadius = (maxRadius * 0.8 * (index + 1)) / qoteData.phases.length
        const x = centerX + Math.cos(phase) * oscillatorRadius
        const y = centerY + Math.sin(phase) * oscillatorRadius

        // Oscillator point
        ctx.fillStyle = `hsl(${(phase * 180) / Math.PI}, 70%, 60%)`
        ctx.beginPath()
        ctx.arc(x, y, 3, 0, 2 * Math.PI)
        ctx.fill()

        // Connection to center
        ctx.strokeStyle = `hsla(${(phase * 180) / Math.PI}, 70%, 60%, 0.3)`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.lineTo(x, y)
        ctx.stroke()
      })
    }

    // Draw coherence indicator
    ctx.fillStyle = "#fff"
    ctx.font = "12px monospace"
    ctx.fillText(`Coherence: ${(qoteData.coherence * 100).toFixed(1)}%`, 10, 20)
    ctx.fillText(`Resonance: ${(qoteData.resonance * 100).toFixed(1)}%`, 10, 35)
    ctx.fillText(`Order Parameter: ${qoteData.orderParameter.toFixed(3)}`, 10, 50)
    ctx.fillText(`Entropy: ${qoteData.entropy.toFixed(3)}`, 10, 65)
  }

  return (
    <div className="w-full h-64 bg-black rounded-lg overflow-hidden">
      {data ? (
        <canvas ref={canvasRef} className="w-full h-full" />
      ) : (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-muted-foreground/20"></div>
            </div>
            <p className="text-sm">Process a prompt to see resonance visualization</p>
          </div>
        </div>
      )}
    </div>
  )
}
