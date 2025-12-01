"use client"

import { useEffect, useRef } from "react"
import type { QOTEResult } from "@/lib/qote-engine"

interface ButterflyWingsProps {
  data: QOTEResult | null
}

export function ButterflyWings({ data }: ButterflyWingsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

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

    let time = 0
    const animate = () => {
      // Clear canvas
      ctx.fillStyle = "#0a0a0a"
      ctx.fillRect(0, 0, rect.width, rect.height)

      drawButterflyAttractor(ctx, data, rect.width, rect.height, time)
      time += 0.02

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [data])

  const drawButterflyAttractor = (
    ctx: CanvasRenderingContext2D,
    qoteData: QOTEResult,
    width: number,
    height: number,
    time: number,
  ) => {
    const centerX = width / 2
    const centerY = height / 2
    const scale = Math.min(width, height) / 8

    const R = qoteData.orderParameter
    const coherence = qoteData.coherence

    // Create multiple interweaving braids that tighten with R
    const braidCount = 3
    const braidRadius = 60 * (1 - R * 0.7) // Tightens as R increases
    const braidHeight = 40 * (1 - R * 0.5)

    for (let braid = 0; braid < braidCount; braid++) {
      const braidOffset = (braid * Math.PI * 2) / braidCount
      const points: { x: number; y: number; z: number }[] = []

      // Generate braided helix trajectory
      for (let i = 0; i < 200; i++) {
        const t = (i / 200) * Math.PI * 4 + time * 0.5 // Multiple rotations
        const phase = braidOffset + t

        // Braided helix equations with QOTE influence
        const helixX = braidRadius * Math.cos(phase + time * (1 + R))
        const helixY = ((i - 100) * braidHeight) / 100 // Vertical progression
        const helixZ = braidRadius * Math.sin(phase + time * (1 + R)) * Math.sin(t * 2) // Braiding oscillation

        // Add QOTE phase influence for realistic quantum oscillation
        const qotePhase = qoteData.phases?.[braid] || 0
        const oscillation = Math.sin(t * 3 + qotePhase) * coherence * 10

        points.push({
          x: centerX + helixX + oscillation,
          y: centerY + helixY,
          z: helixZ,
        })
      }

      // Draw braided trajectory with depth-based opacity
      const hue = (braid * 120 + time * 20) % 360

      ctx.beginPath()
      points.forEach((point, i) => {
        // Calculate opacity based on Z-depth and coherence
        const depth = (point.z + braidRadius) / (braidRadius * 2)
        const alpha = (0.3 + depth * 0.7) * coherence

        ctx.strokeStyle = `hsla(${hue}, 70%, ${50 + depth * 30}%, ${alpha})`
        ctx.lineWidth = 1 + R * 2 + depth * 1.5

        if (i === 0) {
          ctx.moveTo(point.x, point.y)
        } else {
          // Create smooth curves between points
          const prevPoint = points[i - 1]
          const cpX = (prevPoint.x + point.x) / 2
          const cpY = (prevPoint.y + point.y) / 2
          ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, cpX, cpY)
        }

        // Draw individual segments for proper color transitions
        if (i > 0) {
          ctx.stroke()
          ctx.beginPath()
          ctx.moveTo(point.x, point.y)
        }
      })
      ctx.stroke()

      for (let i = 0; i < points.length - 1; i++) {
        const point = points[i]
        // Check for intersections with other braids
        if (Math.abs(point.z) < 5 && i % 10 === 0) {
          // Intersection points
          ctx.fillStyle = `hsl(${hue}, 90%, 80%)`
          ctx.beginPath()
          ctx.arc(point.x, point.y, 2 + R * 2, 0, 2 * Math.PI)
          ctx.fill()

          // Add glow effect at intersections
          ctx.shadowColor = `hsl(${hue}, 90%, 70%)`
          ctx.shadowBlur = 8 * coherence
          ctx.fill()
          ctx.shadowBlur = 0
        }
      }
    }

    if (qoteData.phases && qoteData.phases.length > 0) {
      qoteData.phases.forEach((phase, index) => {
        const orbitRadius = 20 + index * 5
        const orbitSpeed = 0.5 + R * 2 // Faster orbit with higher R
        const angle = phase + time * orbitSpeed

        const orbX = centerX + Math.cos(angle) * orbitRadius * (1 + R)
        const orbY = centerY + Math.sin(angle) * orbitRadius * (1 + R)

        // Draw orbiting oscillator
        const oscHue = (phase * 180) / Math.PI
        ctx.fillStyle = `hsl(${oscHue}, 80%, 70%)`
        ctx.beginPath()
        ctx.arc(orbX, orbY, 2 + R * 3, 0, 2 * Math.PI)
        ctx.fill()

        // Draw connection to center (braid effect)
        ctx.strokeStyle = `hsla(${oscHue}, 60%, 50%, ${0.3 + R * 0.4})`
        ctx.lineWidth = 0.5 + R
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.lineTo(orbX, orbY)
        ctx.stroke()
      })
    }

    const orbSize = 8 + coherence * 20 + Math.sin(time * 3) * 4
    const orbGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, orbSize)

    // Pulsing colors based on braid convergence
    const convergence = R * coherence
    orbGradient.addColorStop(0, `rgba(255, 255, 255, ${convergence})`)
    orbGradient.addColorStop(0.3, `rgba(147, 51, 234, ${convergence * 0.9})`)
    orbGradient.addColorStop(0.7, `rgba(59, 130, 246, ${convergence * 0.6})`)
    orbGradient.addColorStop(1, `rgba(16, 185, 129, ${convergence * 0.3})`)

    ctx.fillStyle = orbGradient
    ctx.beginPath()
    ctx.arc(centerX, centerY, orbSize, 0, 2 * Math.PI)
    ctx.fill()

    // Add energy rings around central orb when highly coherent
    if (coherence > 0.6) {
      for (let ring = 1; ring <= 3; ring++) {
        const ringRadius = orbSize + ring * 8
        const ringAlpha = ((coherence - 0.6) * 0.5) / ring
        ctx.strokeStyle = `rgba(147, 51, 234, ${ringAlpha})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(centerX, centerY, ringRadius, 0, 2 * Math.PI)
        ctx.stroke()
      }
    }

    // Display metrics
    ctx.fillStyle = "#fff"
    ctx.font = "10px monospace"
    ctx.fillText(`R: ${R.toFixed(3)} (${R > 0.8 ? "TIGHT" : "LOOSE"})`, 10, 15)
    ctx.fillText(`Coherence: ${(coherence * 100).toFixed(1)}%`, 10, 28)
    ctx.fillText(`Entropy: ${qoteData.entropy.toFixed(2)}`, 10, 41)
  }

  return (
    <div className="w-full h-64 bg-black rounded-lg overflow-hidden">
      {data ? (
        <canvas ref={canvasRef} className="w-full h-full" />
      ) : (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
              <div className="w-8 h-1 bg-muted-foreground/20 rounded transform rotate-45"></div>
              <div className="w-8 h-1 bg-muted-foreground/20 rounded transform -rotate-45"></div>
            </div>
            <p className="text-sm">Process a prompt to see butterfly wings attractor</p>
          </div>
        </div>
      )}
    </div>
  )
}
