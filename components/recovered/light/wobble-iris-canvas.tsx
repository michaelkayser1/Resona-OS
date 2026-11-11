"use client"

import { useEffect, useRef } from "react"

interface WobbleIrisCanvasProps {
  deltaTheta: number
  time: number
  W: number
}

export function WobbleIrisCanvas({ deltaTheta, time, W }: WobbleIrisCanvasProps) {
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

    const maxRadius = Math.min(width, height) * 0.4
    const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius * 1.5)
    bgGradient.addColorStop(0, "rgba(5, 8, 22, 0.3)")
    bgGradient.addColorStop(1, "rgba(0, 0, 0, 0.05)")
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, width, height)

    const petals = 16
    for (let i = 0; i < petals; i++) {
      const angle = (i / petals) * Math.PI * 2
      const wobbleOffset = Math.sin(angle * 3 + time * 0.5) * deltaTheta * 20
      const secondaryWobble = Math.cos(angle * 5 - time * 0.3) * deltaTheta * 10

      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(angle + time * 0.05)

      ctx.beginPath()
      ctx.moveTo(0, 0)

      const points = 30
      for (let j = 0; j <= points; j++) {
        const t = j / points
        const r = maxRadius * (0.3 + t * 0.7) + wobbleOffset + secondaryWobble * (1 - t)
        const a = (t - 0.5) * 0.6
        const x = r * Math.cos(a)
        const y = r * Math.sin(a)
        ctx.lineTo(x, y)
      }
      ctx.closePath()

      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, maxRadius)
      const hue = 220 + (i / petals) * 140
      gradient.addColorStop(0, `hsla(${hue}, 70%, 60%, 0.4)`)
      gradient.addColorStop(0.5, `hsla(${hue}, 70%, 50%, 0.25)`)
      gradient.addColorStop(1, `hsla(${hue}, 70%, 40%, 0.1)`)
      ctx.fillStyle = gradient
      ctx.fill()

      ctx.strokeStyle = `hsla(${hue}, 70%, 50%, 0.7)`
      ctx.lineWidth = 1.5
      ctx.stroke()

      ctx.restore()
    }

    const glowRadius = maxRadius * 0.25 * (1 + Math.sin(time) * 0.15)
    const glow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, glowRadius)
    const coherence = 1 - Math.min(deltaTheta, 1)
    glow.addColorStop(0, `rgba(255, 255, 255, ${0.9 * coherence})`)
    glow.addColorStop(0.3, `rgba(96, 165, 250, ${0.6 * coherence})`)
    glow.addColorStop(0.7, `rgba(139, 92, 246, ${0.3 * coherence})`)
    glow.addColorStop(1, "rgba(139, 92, 246, 0)")
    ctx.fillStyle = glow
    ctx.beginPath()
    ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2)
    ctx.fill()

    // Wobble rings
    for (let r = 50; r < maxRadius; r += 30) {
      ctx.beginPath()
      for (let a = 0; a < Math.PI * 2; a += 0.1) {
        const wobble = Math.sin(a * 4 + time) * deltaTheta * 10
        const radius = r + wobble
        const x = centerX + radius * Math.cos(a)
        const y = centerY + radius * Math.sin(a)
        if (a === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.closePath()
      ctx.strokeStyle = `rgba(139, 92, 246, ${0.2 * (1 - r / maxRadius)})`
      ctx.lineWidth = 1
      ctx.stroke()
    }
  }, [deltaTheta, time, W])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-[300px] rounded-lg bg-black/20"
      style={{ width: "100%", height: "300px" }}
    />
  )
}
