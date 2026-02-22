"use client"

import { useRef, useEffect } from "react"
import type { RuntimeState } from "@/lib/simulation/types"

interface CoherenceChartProps {
  state: RuntimeState
}

export function CoherenceChart({ state }: CoherenceChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dataRef = useRef<{ time: number; coherence: number }[]>([])
  const animationRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")!
    const dpr = Math.min(window.devicePixelRatio, 2)

    const width = 400
    const height = 200
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx.scale(dpr, dpr)

    // Add new data point
    const now = performance.now()
    dataRef.current.push({ time: now, coherence: state.C })

    // Keep only last 10 seconds of data
    const cutoff = now - 10000
    dataRef.current = dataRef.current.filter((d) => d.time > cutoff)

    const animate = () => {
      // Clear canvas
      ctx.fillStyle = "rgba(15, 23, 42, 0.05)"
      ctx.fillRect(0, 0, width, height)

      // Draw grid
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
      ctx.lineWidth = 1

      // Horizontal grid lines
      for (let i = 0; i <= 4; i++) {
        const y = (height / 4) * i
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      // Vertical grid lines
      for (let i = 0; i <= 10; i++) {
        const x = (width / 10) * i
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }

      // Draw coherence line
      if (dataRef.current.length > 1) {
        const timeRange = 10000 // 10 seconds
        const currentTime = performance.now()

        ctx.beginPath()
        ctx.strokeStyle = "#3b82f6"
        ctx.lineWidth = 3

        let firstPoint = true
        for (const point of dataRef.current) {
          const x = width - ((currentTime - point.time) / timeRange) * width
          const y = height - point.coherence * height

          if (firstPoint) {
            ctx.moveTo(x, y)
            firstPoint = false
          } else {
            ctx.lineTo(x, y)
          }
        }

        ctx.stroke()

        // Add glow effect
        ctx.shadowColor = "#3b82f6"
        ctx.shadowBlur = 10
        ctx.stroke()
        ctx.shadowBlur = 0
      }

      // Draw current value indicator
      const currentY = height - state.C * height
      ctx.beginPath()
      ctx.arc(width - 10, currentY, 4, 0, 2 * Math.PI)
      ctx.fillStyle = "#06b6d4"
      ctx.fill()

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [state.C])

  return (
    <div className="glass p-6">
      <h2 className="heading-display text-xl mb-4 text-center">Coherence C(t)</h2>
      <div className="flex justify-center">
        <canvas ref={canvasRef} className="rounded-lg border border-border" aria-label="Coherence over time chart" />
      </div>
      <div className="mt-4 flex justify-between text-xs text-muted-foreground">
        <span>10s ago</span>
        <span className="data-display">C = {state.C.toFixed(3)}</span>
        <span>now</span>
      </div>
    </div>
  )
}
