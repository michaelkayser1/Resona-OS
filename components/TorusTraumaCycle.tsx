"use client"

import { useEffect, useRef } from "react"

interface TorusTraumaCycleProps {
  isRunning: boolean
  speed: number
  resonance: number
}

const TRAUMA_STAGES = [
  { name: "Collapse", color: "#ef4444", angle: 0 },
  { name: "Wobble", color: "#f97316", angle: Math.PI / 3 },
  { name: "Recognition", color: "#eab308", angle: (2 * Math.PI) / 3 },
  { name: "Release", color: "#22c55e", angle: Math.PI },
  { name: "Scaffolding", color: "#3b82f6", angle: (4 * Math.PI) / 3 },
  { name: "Next Breath", color: "#a855f7", angle: (5 * Math.PI) / 3 },
]

export function TorusTraumaCycle({ isRunning, speed, resonance }: TorusTraumaCycleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const timeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) - 40

    const animate = () => {
      if (!isRunning) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw torus segments
      TRAUMA_STAGES.forEach((stage, index) => {
        const startAngle = stage.angle - Math.PI / 6
        const endAngle = stage.angle + Math.PI / 6

        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, startAngle, endAngle)
        ctx.strokeStyle = stage.color
        ctx.lineWidth = 8
        ctx.stroke()

        // Draw stage labels
        const labelX = centerX + Math.cos(stage.angle) * (radius + 25)
        const labelY = centerY + Math.sin(stage.angle) * (radius + 25)

        ctx.fillStyle = stage.color
        ctx.font = "12px Inter, sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(stage.name, labelX, labelY)
      })

      // Draw orbiting resonance point
      timeRef.current += speed * 0.02
      const currentAngle = timeRef.current % (2 * Math.PI)

      // Calculate current stage based on angle
      const currentStageIndex = Math.floor((currentAngle / (2 * Math.PI)) * TRAUMA_STAGES.length)
      const currentStage = TRAUMA_STAGES[currentStageIndex]

      const pointX = centerX + Math.cos(currentAngle) * radius
      const pointY = centerY + Math.sin(currentAngle) * radius

      // Resonance growth scaling - point grows with resonance
      const pointSize = 4 + resonance * 6
      const glowSize = pointSize * 2

      // Draw glow effect
      const gradient = ctx.createRadialGradient(pointX, pointY, 0, pointX, pointY, glowSize)
      gradient.addColorStop(0, currentStage.color + "80")
      gradient.addColorStop(1, currentStage.color + "00")

      ctx.beginPath()
      ctx.arc(pointX, pointY, glowSize, 0, 2 * Math.PI)
      ctx.fillStyle = gradient
      ctx.fill()

      // Draw main point
      ctx.beginPath()
      ctx.arc(pointX, pointY, pointSize, 0, 2 * Math.PI)
      ctx.fillStyle = currentStage.color
      ctx.fill()

      // Draw center title
      ctx.fillStyle = "hsl(var(--foreground))"
      ctx.font = "bold 16px Inter, sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("QOTE Resonance Engine", centerX, centerY - 10)

      ctx.font = "12px Inter, sans-serif"
      ctx.fillStyle = "hsl(var(--muted-foreground))"
      ctx.fillText("Trauma → Breath Cycle", centerX, centerY + 10)

      animationRef.current = requestAnimationFrame(animate)
    }

    if (isRunning) {
      animate()
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isRunning, speed, resonance])

  return (
    <div className="flex flex-col items-center space-y-4">
      <canvas ref={canvasRef} width={400} height={400} className="border rounded-lg bg-background" />
      <div className="text-center">
        <p className="text-sm text-muted-foreground">Resonance travels through six healing stages</p>
        <p className="text-xs text-muted-foreground mt-1">
          Point size scales with resonance strength (R = {resonance.toFixed(2)})
        </p>
      </div>
    </div>
  )
}

export default TorusTraumaCycle
