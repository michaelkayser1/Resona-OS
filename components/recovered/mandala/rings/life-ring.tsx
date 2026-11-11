"use client"

import { useMandalaState } from "../resonance-mandala"
import { useEffect, useRef } from "react"

export function LifeRing() {
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
    const baseRadius = size * 0.35

    let animationFrame: number

    const drawLife = () => {
      ctx.clearRect(0, 0, size, size)

      const glowIntensity = Math.sin(state.phi) * 0.3 + 0.7

      // Draw organic branching patterns
      const branchCount = 12
      for (let i = 0; i < branchCount; i++) {
        const angle = (i / branchCount) * Math.PI * 2
        const branchLength = baseRadius * (0.8 + Math.sin(state.phi * 2 + i) * 0.2)

        ctx.beginPath()
        ctx.moveTo(centerX, centerY)

        for (let j = 0; j < 10; j++) {
          const t = j / 10
          const r = branchLength * t
          const wobble = Math.sin(state.phi * 3 + i + j) * 5
          const x = centerX + Math.cos(angle) * r + Math.cos(angle + Math.PI / 2) * wobble
          const y = centerY + Math.sin(angle) * r + Math.sin(angle + Math.PI / 2) * wobble

          if (j === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }

        const opacity = glowIntensity * 0.6
        ctx.strokeStyle = `rgba(100, 255, 200, ${opacity})`
        ctx.lineWidth = 2
        ctx.shadowBlur = 20 * glowIntensity
        ctx.shadowColor = "rgba(100, 255, 200, 0.8)"
        ctx.stroke()
      }

      // Draw pulsing neurons
      const neuronCount = 8
      for (let i = 0; i < neuronCount; i++) {
        const angle = (i / neuronCount) * Math.PI * 2 + state.phi
        const r = baseRadius * 0.7
        const x = centerX + Math.cos(angle) * r
        const y = centerY + Math.sin(angle) * r

        const pulseSize = 3 + Math.sin(state.phi * 4 + i) * 2

        ctx.beginPath()
        ctx.arc(x, y, pulseSize, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(100, 255, 200, ${glowIntensity})`
        ctx.shadowBlur = 15
        ctx.shadowColor = "rgba(100, 255, 200, 1)"
        ctx.fill()
      }

      animationFrame = requestAnimationFrame(drawLife)
    }

    drawLife()

    return () => {
      cancelAnimationFrame(animationFrame)
    }
  }, [state.phi])

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <canvas ref={canvasRef} width={800} height={800} className="w-full h-full" />
    </div>
  )
}
