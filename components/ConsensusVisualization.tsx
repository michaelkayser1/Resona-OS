"use client"
import { useEffect, useRef } from "react"
import type { RBFRDesign } from "@/lib/schemas"

type ProviderId = "openai" | "anthropic" | "mistral" | "xai" | "deepseek"

interface ConsensusVisualizationProps {
  designs: Record<ProviderId, RBFRDesign | null>
  metrics: { W: number; beta: number; CUST: number }
}

export function ConsensusVisualization({ designs, metrics }: ConsensusVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const modelPositions: Record<ProviderId, { x: number; y: number; color: string }> = {
    openai: { x: 0.2, y: 0.3, color: "#10b981" }, // emerald
    anthropic: { x: 0.8, y: 0.2, color: "#f59e0b" }, // amber
    mistral: { x: 0.7, y: 0.8, color: "#ef4444" }, // red
    xai: { x: 0.3, y: 0.7, color: "#8b5cf6" }, // violet
    deepseek: { x: 0.5, y: 0.5, color: "#06b6d4" }, // cyan
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const width = rect.width
    const height = rect.height

    // Clear canvas
    ctx.fillStyle = "rgba(2, 2, 8, 0.9)"
    ctx.fillRect(0, 0, width, height)

    const validDesigns = Object.entries(designs).filter(([_, design]) => design !== null) as [ProviderId, RBFRDesign][]

    // Draw consensus field
    if (validDesigns.length > 1) {
      ctx.strokeStyle = `rgba(6, 182, 212, ${0.3 * (1 - metrics.W)})`
      ctx.lineWidth = 2

      for (let i = 0; i < validDesigns.length; i++) {
        for (let j = i + 1; j < validDesigns.length; j++) {
          const [id1, design1] = validDesigns[i]
          const [id2, design2] = validDesigns[j]

          // Calculate agreement between designs
          const waveformMatch = design1.field.waveform === design2.field.waveform ? 1 : 0
          const coilMatch = design1.field.coilConfig === design2.field.coilConfig ? 1 : 0
          const agreement = (waveformMatch + coilMatch) / 2

          if (agreement > 0) {
            const pos1 = modelPositions[id1]
            const pos2 = modelPositions[id2]

            ctx.globalAlpha = agreement * (1 - metrics.W)
            ctx.beginPath()
            ctx.moveTo(pos1.x * width, pos1.y * height)
            ctx.lineTo(pos2.x * width, pos2.y * height)
            ctx.stroke()
          }
        }
      }
      ctx.globalAlpha = 1
    }

    // Draw model nodes
    Object.entries(designs).forEach(([id, design]) => {
      const pos = modelPositions[id as ProviderId]
      const x = pos.x * width
      const y = pos.y * height

      if (design) {
        // Active model with design
        ctx.fillStyle = pos.color
        ctx.beginPath()
        ctx.arc(x, y, 12, 0, Math.PI * 2)
        ctx.fill()

        // Glow effect for consensus
        const glowRadius = 20 + 10 * metrics.beta
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowRadius)
        gradient.addColorStop(0, `${pos.color}40`)
        gradient.addColorStop(1, `${pos.color}00`)
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(x, y, glowRadius, 0, Math.PI * 2)
        ctx.fill()

        // Model label
        ctx.fillStyle = "white"
        ctx.font = "10px monospace"
        ctx.textAlign = "center"
        ctx.fillText(id.toUpperCase(), x, y - 20)

        // Design info
        ctx.font = "8px monospace"
        ctx.fillText(design.field.waveform, x, y + 25)
        ctx.fillText(design.field.coilConfig, x, y + 35)
      } else {
        // Inactive model
        ctx.strokeStyle = "#4b5563"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(x, y, 8, 0, Math.PI * 2)
        ctx.stroke()

        ctx.fillStyle = "#6b7280"
        ctx.font = "8px monospace"
        ctx.textAlign = "center"
        ctx.fillText(id, x, y - 15)
      }
    })

    if (metrics.CUST >= 1.6) {
      const centerX = width / 2
      const centerY = height / 2
      const emergenceRadius = 30 + 20 * Math.sin(Date.now() * 0.005)

      const emergenceGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, emergenceRadius)
      emergenceGradient.addColorStop(0, "rgba(251, 191, 36, 0.6)")
      emergenceGradient.addColorStop(1, "rgba(251, 191, 36, 0)")

      ctx.fillStyle = emergenceGradient
      ctx.beginPath()
      ctx.arc(centerX, centerY, emergenceRadius, 0, Math.PI * 2)
      ctx.fill()

      if (metrics.CUST >= 1.618) {
        ctx.fillStyle = "#fbbf24"
        ctx.font = "12px monospace"
        ctx.textAlign = "center"
        ctx.fillText("φ", centerX, centerY + 4)
      }
    }
  }, [designs, metrics])

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="w-full h-48 border border-gray-600 rounded bg-gray-950"
        style={{ width: "100%", height: "192px" }}
      />
      <div className="absolute top-2 left-2 text-xs text-gray-400">Consensus Field</div>
    </div>
  )
}
