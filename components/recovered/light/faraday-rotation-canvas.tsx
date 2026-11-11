"use client"

import { useEffect, useRef } from "react"

interface FaradayRotationCanvasProps {
  deltaTheta: number
  time: number
  rotationAngle: number
}

export function FaradayRotationCanvas({ deltaTheta, time, rotationAngle }: FaradayRotationCanvasProps) {
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
    const centerX = width / 2
    const centerY = height / 2

    // Clear
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)"
    ctx.fillRect(0, 0, width, height)

    // Rotation angle based on time and deltaTheta
    const rotation = time * deltaTheta * 0.5

    // Draw polarization plane
    const radius = Math.min(width, height) * 0.35

    // Background circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
    ctx.lineWidth = 2
    ctx.stroke()

    // Rotating polarization vector
    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate(rotation)

    // Main vector
    ctx.beginPath()
    ctx.moveTo(-radius, 0)
    ctx.lineTo(radius, 0)
    ctx.strokeStyle = "#ef4444"
    ctx.lineWidth = 4
    ctx.stroke()

    // Arrow heads
    const arrowSize = 15
    ctx.beginPath()
    ctx.moveTo(radius, 0)
    ctx.lineTo(radius - arrowSize, -arrowSize / 2)
    ctx.lineTo(radius - arrowSize, arrowSize / 2)
    ctx.closePath()
    ctx.fillStyle = "#ef4444"
    ctx.fill()

    ctx.restore()

    // Trail effect
    ctx.save()
    ctx.translate(centerX, centerY)
    for (let i = 0; i < 8; i++) {
      const pastRotation = rotation - i * 0.3
      const alpha = (8 - i) / 8
      ctx.rotate(pastRotation - (i > 0 ? rotation - (i - 1) * 0.3 : 0))

      ctx.beginPath()
      ctx.moveTo(radius * 0.9, 0)
      ctx.lineTo(radius * 1.1, 0)
      ctx.strokeStyle = `rgba(239, 68, 68, ${alpha * 0.3})`
      ctx.lineWidth = 2
      ctx.stroke()

      if (i > 0) ctx.rotate(-(pastRotation - rotation + (i - 1) * 0.3))
    }
    ctx.restore()

    // Rotation angle display
    ctx.font = "bold 24px monospace"
    ctx.fillStyle = "#ef4444"
    ctx.textAlign = "center"
    ctx.fillText(`${(((rotation % (2 * Math.PI)) * 180) / Math.PI).toFixed(1)}°`, centerX, centerY + radius + 40)
  }, [deltaTheta, time, rotationAngle])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-[300px] rounded-lg bg-black/20"
      style={{ width: "100%", height: "300px" }}
    />
  )
}
