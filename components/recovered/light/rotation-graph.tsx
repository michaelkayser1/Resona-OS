"use client"

import { useEffect, useRef } from "react"

interface RotationGraphProps {
  deltaTheta: number
}

export function RotationGraph({ deltaTheta }: RotationGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const width = rect.width
    const height = rect.height
    const padding = 40

    // Clear
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)"
    ctx.fillRect(0, 0, width, height)

    // Axes
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(padding, height - padding)
    ctx.lineTo(width - padding, height - padding)
    ctx.moveTo(padding, height - padding)
    ctx.lineTo(padding, padding)
    ctx.stroke()

    // Labels
    ctx.font = "12px monospace"
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)"
    ctx.textAlign = "center"
    ctx.fillText("Δθ", width / 2, height - 10)
    ctx.save()
    ctx.translate(15, height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText("Rotation (°)", 0, 0)
    ctx.restore()

    // Plot curve
    ctx.beginPath()
    ctx.strokeStyle = "#8b5cf6"
    ctx.lineWidth = 3

    const points = 100
    for (let i = 0; i <= points; i++) {
      const t = i / points
      const x = padding + (width - 2 * padding) * t
      const theta = t * 1
      const rotation = theta * 100 // simplified model
      const y = height - padding - (rotation / 100) * (height - 2 * padding)

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.stroke()

    // Current position marker
    const currentX = padding + (width - 2 * padding) * deltaTheta
    const currentRotation = deltaTheta * 100
    const currentY = height - padding - (currentRotation / 100) * (height - 2 * padding)

    ctx.beginPath()
    ctx.arc(currentX, currentY, 6, 0, Math.PI * 2)
    ctx.fillStyle = "#8b5cf6"
    ctx.fill()
    ctx.strokeStyle = "#fff"
    ctx.lineWidth = 2
    ctx.stroke()

    // Dashed line to current value
    ctx.setLineDash([5, 5])
    ctx.strokeStyle = "rgba(139, 92, 246, 0.5)"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(currentX, currentY)
    ctx.lineTo(currentX, height - padding)
    ctx.stroke()
    ctx.setLineDash([])
  }, [deltaTheta])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-[200px] rounded-lg bg-black/20"
      style={{ width: "100%", height: "200px" }}
    />
  )
}
