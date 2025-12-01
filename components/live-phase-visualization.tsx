"use client"
import { useRef, useEffect } from "react"

interface Agent {
  id: string
  name: string
  phase: number
  coherence: number
  deltaTheta: number
}

interface LivePhaseVisualizationProps {
  agents: Agent[]
}

export default function LivePhaseVisualization({ agents }: LivePhaseVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      // Draw phase circles for each agent
      agents.forEach((agent, index) => {
        const centerX = (index + 1) * (width / (agents.length + 1))
        const centerY = height / 2
        const radius = 30 + agent.coherence * 20

        // Draw oscillator circle
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
        ctx.strokeStyle = `hsl(${agent.phase * 360}, 80%, 60%)`
        ctx.lineWidth = 2
        ctx.stroke()

        // Draw phase indicator
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.lineTo(
          centerX + radius * Math.cos(agent.phase * 2 * Math.PI),
          centerY + radius * Math.sin(agent.phase * 2 * Math.PI),
        )
        ctx.strokeStyle = "#000"
        ctx.lineWidth = 2
        ctx.stroke()

        // Draw agent label
        ctx.fillStyle = "#374151"
        ctx.font = "12px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(agent.name, centerX, centerY + radius + 20)
      })

      // Draw phase relationships (cosine waves between agents)
      for (let i = 0; i < agents.length - 1; i++) {
        const agentA = agents[i]
        const agentB = agents[i + 1]

        const startX = (i + 1) * (width / (agents.length + 1)) + 30
        const endX = (i + 2) * (width / (agents.length + 1)) - 30
        const waveY = height / 3

        ctx.beginPath()
        ctx.moveTo(startX, waveY)

        for (let x = startX; x <= endX; x += 2) {
          const t = (x - startX) / (endX - startX)
          const phaseDiff = agentB.phase - agentA.phase
          const y = waveY + 20 * Math.cos(phaseDiff * 2 * Math.PI * t)
          ctx.lineTo(x, y)
        }

        const phaseDiff = agentB.phase - agentA.phase
        ctx.strokeStyle = `rgba(59, 130, 246, ${0.5 + 0.5 * Math.cos(phaseDiff)})`
        ctx.lineWidth = 2
        ctx.stroke()
      }
    }

    draw()
    const interval = setInterval(draw, 100)
    return () => clearInterval(interval)
  }, [agents])

  return (
    <div className="bg-card p-4 rounded-lg shadow border">
      <h3 className="text-lg font-semibold mb-4">Live Phase Visualization</h3>
      <canvas ref={canvasRef} width={600} height={200} className="w-full border rounded" />
      <p className="text-sm text-muted-foreground mt-2">
        Visualizing λ·cos(θ_i−θ_j−Δθ) phase relationships in real-time
      </p>
    </div>
  )
}
