"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import type { RuntimeState } from "@/lib/simulation/types"

interface PhaseRingProps {
  state: RuntimeState
}

export function PhaseRing({ state }: PhaseRingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const [smoothR, setSmoothR] = useState(0)
  const [smoothPsi, setSmoothPsi] = useState(0)

  const animate = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")!

    // Smooth interpolation for visual stability using functional updates
    setSmoothR((prev) => prev + (state.r - prev) * 0.1)
    setSmoothPsi((prev) => {
      let diff = state.psi - prev
      // Handle angle wrapping
      if (diff > Math.PI) diff -= 2 * Math.PI
      if (diff < -Math.PI) diff += 2 * Math.PI
      return prev + diff * 0.1
    })

    // Clear canvas with subtle glow effect
    const size = 400
    ctx.fillStyle = "rgba(15, 23, 42, 0.1)"
    ctx.fillRect(0, 0, size, size)

    const centerX = size / 2
    const centerY = size / 2
    const radius = 180

    // Draw unit circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw oscillators as particles
    if (state.theta && state.theta.length > 0) {
      const particleSize = Math.max(1, 4 - state.theta.length / 200)

      for (let i = 0; i < state.theta.length; i++) {
        const angle = state.theta[i]
        const x = centerX + radius * Math.cos(angle)
        const y = centerY + radius * Math.sin(angle)

        // Color based on phase relative to mean
        const phaseDiff = Math.abs(angle - state.psi)
        const normalizedDiff = Math.min(phaseDiff, 2 * Math.PI - phaseDiff) / Math.PI
        const hue = 200 + normalizedDiff * 60 // Blue to cyan gradient

        ctx.beginPath()
        ctx.arc(x, y, particleSize, 0, 2 * Math.PI)
        ctx.fillStyle = `hsl(${hue}, 70%, 60%)`
        ctx.fill()

        // Add glow for coherent particles
        if (normalizedDiff < 0.2) {
          ctx.shadowColor = `hsl(${hue}, 70%, 60%)`
          ctx.shadowBlur = 8
          ctx.fill()
          ctx.shadowBlur = 0
        }
      }
    }

    // Draw mean vector (order parameter) using current state values
    if (state.r > 0.01) {
      const meanX = centerX + radius * state.r * Math.cos(state.psi)
      const meanY = centerY + radius * state.r * Math.sin(state.psi)

      // Vector line
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(meanX, meanY)
      ctx.strokeStyle = "#f87171"
      ctx.lineWidth = 4
      ctx.stroke()

      // Vector head
      ctx.beginPath()
      ctx.arc(meanX, meanY, 6, 0, 2 * Math.PI)
      ctx.fillStyle = "#f87171"
      ctx.fill()

      // Glow effect
      ctx.shadowColor = "#f87171"
      ctx.shadowBlur = 15
      ctx.fill()
      ctx.shadowBlur = 0
    }

    // Draw coherence ring
    if (state.C > 0.1) {
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius * state.C, 0, 2 * Math.PI)
      ctx.strokeStyle = `rgba(59, 130, 246, ${state.C * 0.3})`
      ctx.lineWidth = 2
      ctx.stroke()
    }

    animationRef.current = requestAnimationFrame(animate)
  }, [state])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")!
    const dpr = Math.min(window.devicePixelRatio, 2)

    // Set canvas size
    const size = 400
    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
    ctx.scale(dpr, dpr)

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [animate]) // Only depend on the memoized animate function

  return (
    <div className="glass p-6">
      <h2 className="heading-display text-xl mb-4 text-center">Phase Ring</h2>
      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          className="rounded-lg border border-border"
          aria-label="Phase ring visualization showing oscillator positions and coherence"
        />
      </div>
      <div className="mt-4 text-center">
        <div className="data-display text-sm text-muted-foreground">
          C(t) = {state.C.toFixed(3)} | N = {state.theta?.length || 0}
        </div>
      </div>
    </div>
  )
}
