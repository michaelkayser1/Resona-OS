"use client"

import { useMandalaState } from "../resonance-mandala"
import { useEffect, useRef } from "react"

export function DustRing() {
  const { state } = useMandalaState()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const size = canvas.width
    const centerX = size / 2
    const centerY = size / 2
    const radius = size * 0.4

    let animationFrame: number

    const drawDust = () => {
      ctx.clearRect(0, 0, size, size)

      // Draw grainy dust particles
      const particleCount = Math.floor(200 * state.deltaTheta + 50)
      const stability = 1 - state.deltaTheta

      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2 + state.phi * stability
        const noise = Math.random() * 20 * (1 - state.deltaTheta)
        const r = radius + noise

        const x = centerX + Math.cos(angle) * r
        const y = centerY + Math.sin(angle) * r

        const opacity = 0.3 + Math.random() * 0.4 * state.deltaTheta
        const size = 1 + Math.random() * 2

        ctx.fillStyle = `rgba(255, 215, 100, ${opacity})`
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fill()
      }

      animationFrame = requestAnimationFrame(drawDust)
    }

    drawDust()

    return () => {
      cancelAnimationFrame(animationFrame)
    }
  }, [state.deltaTheta, state.phi])

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <canvas ref={canvasRef} width={800} height={800} className="w-full h-full" />
    </div>
  )
}
