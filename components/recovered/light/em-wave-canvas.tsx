"use client"

import { useEffect, useRef } from "react"

interface EMWaveCanvasProps {
  deltaTheta: number
  time: number
  wavelength: number
}

export function EMWaveCanvas({ deltaTheta, time, wavelength }: EMWaveCanvasProps) {
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
    const centerY = height / 2

    const bgGradient = ctx.createLinearGradient(0, 0, 0, height)
    bgGradient.addColorStop(0, "rgba(0, 0, 0, 0.15)")
    bgGradient.addColorStop(0.5, "rgba(0, 0, 0, 0.05)")
    bgGradient.addColorStop(1, "rgba(0, 0, 0, 0.15)")
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, width, height)

    // Grid
    ctx.strokeStyle = "rgba(100, 100, 120, 0.1)"
    ctx.lineWidth = 1
    for (let y = 0; y <= height; y += height / 8) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    const k = (2 * Math.PI) / (wavelength / 2) // wave number (visual scale)
    const amplitude = height / 4

    ctx.shadowBlur = 15
    ctx.shadowColor = "#60a5fa"
    ctx.beginPath()
    ctx.strokeStyle = "#60a5fa"
    ctx.lineWidth = 3
    for (let x = 0; x < width; x++) {
      const y = centerY - amplitude * Math.sin(k * x - time * 2)
      if (x === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.stroke()

    ctx.shadowBlur = 15
    ctx.shadowColor = "#ef4444"
    ctx.beginPath()
    ctx.strokeStyle = "#ef4444"
    ctx.lineWidth = 3
    for (let x = 0; x < width; x++) {
      const spiralWobble = Math.sin(x * 0.05 + time) * deltaTheta * amplitude * 0.3
      const helixWobble = Math.cos(x * 0.08 + time * 1.5) * deltaTheta * amplitude * 0.2
      const y = centerY + amplitude * 0.6 * Math.sin(k * x - time * 2 + deltaTheta * 10) + spiralWobble + helixWobble
      if (x === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.stroke()
    ctx.shadowBlur = 0

    // Labels
    ctx.font = "14px monospace"
    ctx.fillStyle = "#60a5fa"
    ctx.fillText("E", 10, 30)
    ctx.fillStyle = "#ef4444"
    ctx.fillText("B", 10, height - 20)
  }, [deltaTheta, time, wavelength])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-[300px] rounded-lg bg-black/20"
      style={{ width: "100%", height: "300px" }}
    />
  )
}
