"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"

interface Particle {
  x: number
  y: number
  size: number
  color: string
  vx: number
  vy: number
  type: "stabilizer" | "orb" | "wing" | "refiner"
  angle?: number
  radius?: number
}

interface QOTEMetrics {
  coherence: number
  stability: number
  entropy: number
}

export default function QOTEBraidMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const particlesRef = useRef<Particle[]>([])

  const [metrics, setMetrics] = useState<QOTEMetrics>({
    coherence: 0.87,
    stability: 0.92,
    entropy: 0.34,
  })

  const [parameters, setParameters] = useState({
    sensitivity: 0.75,
    coherenceThreshold: 0.618,
    complexity: 0.42,
  })

  const [inputText, setInputText] = useState(
    "The patient presents with symptoms of fatigue and shortness of breath. Lab results show elevated white blood cell count. Differential diagnosis includes infection, inflammatory conditions, or early-stage hematologic malignancy. Further testing recommended.",
  )

  const [isAnimating, setIsAnimating] = useState(false)

  const initializeParticles = useCallback((width: number, height: number) => {
    const particles: Particle[] = []

    for (let i = 0; i < 20; i++) {
      particles.push({
        x: width / 2,
        y: i * (height / 20),
        size: 2 + Math.random() * 3,
        color: "#3b82f6",
        vx: 0,
        vy: 0,
        type: "stabilizer",
      })
    }

    for (let i = 0; i < 50; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = 30 + Math.random() * 40
      particles.push({
        x: width / 2 + Math.cos(angle) * radius,
        y: height / 2 + Math.sin(angle) * radius,
        size: 2 + Math.random() * 4,
        color: "#10b981",
        vx: 0,
        vy: 0,
        type: "orb",
        angle,
        radius,
      })
    }

    for (let i = 0; i < 80; i++) {
      const side = i % 2 === 0 ? 1 : -1
      particles.push({
        x: width / 2 + side * (100 + Math.random() * 150),
        y: height / 2 - 100 + Math.random() * 200,
        size: 1 + Math.random() * 3,
        color: "#8b5cf6",
        vx: 0,
        vy: 0,
        type: "wing",
      })
    }

    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 1 + Math.random() * 2,
        color: "#f59e0b",
        vx: 0,
        vy: 0,
        type: "refiner",
      })
    }

    particlesRef.current = particles
  }, [])

  const animate = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const { width, height } = canvas

    ctx.fillStyle = "rgba(15, 23, 42, 0.1)"
    ctx.fillRect(0, 0, width, height)

    const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width * 0.7)
    gradient.addColorStop(0, "rgba(30, 41, 59, 0.8)")
    gradient.addColorStop(1, "rgba(15, 23, 42, 0.3)")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    particlesRef.current.forEach((particle) => {
      switch (particle.type) {
        case "stabilizer":
          particle.x = width / 2 + Math.sin(Date.now() * 0.001 + particle.y * 0.01) * 5
          break

        case "orb":
          if (particle.angle !== undefined && particle.radius !== undefined) {
            const targetRadius = 30 + (1 - metrics.coherence) * 40
            particle.angle += 0.02 * metrics.coherence
            particle.radius += (targetRadius - particle.radius) * 0.1
            particle.x = width / 2 + Math.cos(particle.angle) * particle.radius
            particle.y = height / 2 + Math.sin(particle.angle) * particle.radius
          }
          break

        case "wing":
          particle.x += (Math.random() - 0.5) * 2 * (1 - metrics.stability)
          particle.y += (Math.random() - 0.5) * 2 * (1 - metrics.stability)

          const side = particle.x > width / 2 ? 1 : -1
          const centerX = width / 2 + side * 150
          const dx = particle.x - centerX
          const dy = particle.y - height / 2

          if (Math.abs(dx) > 100 || Math.abs(dy) > 120) {
            particle.vx -= dx * 0.02
            particle.vy -= dy * 0.02
          }

          particle.x += particle.vx
          particle.y += particle.vy
          particle.vx *= 0.95
          particle.vy *= 0.95
          break

        case "refiner":
          particle.x += 1 + (1 - metrics.coherence) * 2
          particle.y += 0.5 + (1 - metrics.coherence) * 1

          if (particle.x > width || particle.y > height) {
            particle.x = Math.random() * 100
            particle.y = Math.random() * 100
          }
          break
      }

      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      ctx.fillStyle = particle.color
      ctx.fill()
    })

    ctx.beginPath()
    ctx.strokeStyle = "rgba(59, 130, 246, 0.3)"
    ctx.lineWidth = 1
    const stabilizers = particlesRef.current.filter((p) => p.type === "stabilizer")
    for (let i = 0; i < stabilizers.length - 1; i++) {
      ctx.moveTo(stabilizers[i].x, stabilizers[i].y)
      ctx.lineTo(stabilizers[i + 1].x, stabilizers[i + 1].y)
    }
    ctx.stroke()

    const glowRadius = 50 + metrics.coherence * 30
    const glowGradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, glowRadius)
    glowGradient.addColorStop(0, "rgba(16, 185, 129, 0.3)")
    glowGradient.addColorStop(1, "rgba(16, 185, 129, 0)")
    ctx.beginPath()
    ctx.arc(width / 2, height / 2, glowRadius, 0, Math.PI * 2)
    ctx.fillStyle = glowGradient
    ctx.fill()

    if (isAnimating) {
      animationRef.current = requestAnimationFrame(animate)
    }
  }, [metrics, isAnimating])

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const container = canvas.parentElement
    if (!container) return

    canvas.width = container.clientWidth
    canvas.height = container.clientHeight

    initializeParticles(canvas.width, canvas.height)
  }, [initializeParticles])

  useEffect(() => {
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)
    return () => window.removeEventListener("resize", resizeCanvas)
  }, [resizeCanvas])

  useEffect(() => {
    if (isAnimating) {
      animate()
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [animate, isAnimating])

  const analyzeCoherence = () => {
    const { sensitivity, coherenceThreshold, complexity } = parameters

    const baseCoherence = 0.7 + sensitivity * 0.3
    const baseStability = 0.8 + (1 - complexity) * 0.2
    const baseEntropy = complexity * 0.5

    const coherence = Math.min(0.99, baseCoherence + (Math.random() * 0.1 - 0.05))
    const stability = Math.min(0.99, baseStability + (Math.random() * 0.1 - 0.05))
    const entropy = Math.max(0.01, baseEntropy + (Math.random() * 0.1 - 0.05))

    setMetrics({ coherence, stability, entropy })
    setIsAnimating(true)
  }

  const toggleAnimation = () => {
    setIsAnimating(!isAnimating)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
      <div className="container mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent mb-4">
            QOTE-Resona Braid-Map
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            The first quantum resonance interface for AI coherence measurement
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-blue-400">Input & Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">AI Output Text</label>
                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="bg-slate-900/50 border-slate-600 text-white min-h-[120px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Resonance Sensitivity: {parameters.sensitivity.toFixed(2)}
                </label>
                <Slider
                  value={[parameters.sensitivity]}
                  onValueChange={([value]) => setParameters((prev) => ({ ...prev, sensitivity: value }))}
                  max={1}
                  step={0.01}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Coherence Threshold: {parameters.coherenceThreshold.toFixed(3)}
                </label>
                <Slider
                  value={[parameters.coherenceThreshold]}
                  onValueChange={([value]) => setParameters((prev) => ({ ...prev, coherenceThreshold: value }))}
                  max={1}
                  step={0.001}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Pattern Complexity: {parameters.complexity.toFixed(2)}
                </label>
                <Slider
                  value={[parameters.complexity]}
                  onValueChange={([value]) => setParameters((prev) => ({ ...prev, complexity: value }))}
                  max={1}
                  step={0.01}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Button onClick={analyzeCoherence} className="w-full bg-blue-600 hover:bg-blue-700">
                  Analyze Coherence
                </Button>
                <Button onClick={toggleAnimation} variant="outline" className="w-full bg-transparent">
                  {isAnimating ? "Pause Animation" : "Start Animation"}
                </Button>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-emerald-400">Status Indicators</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      Stable Output
                    </span>
                    <span>Confidence: {Math.round(metrics.coherence * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${metrics.entropy > 0.4 ? "bg-yellow-500" : "bg-emerald-500"}`}
                      ></div>
                      Context Awareness
                    </span>
                    <span>{metrics.entropy > 0.4 ? "Limited" : "Moderate"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${parameters.complexity > 0.7 ? "bg-red-500" : "bg-emerald-500"}`}
                      ></div>
                      Bias Detection
                    </span>
                    <span>{parameters.complexity > 0.7 ? "Moderate Risk" : "Low Risk"}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-emerald-400">Braid-Map Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative h-[600px] bg-slate-900/50 rounded-lg overflow-hidden">
                <canvas ref={canvasRef} className="w-full h-full" />
              </div>

              <div className="flex flex-wrap gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-blue-500"></div>
                  <span>Stabilizer Line</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-emerald-500"></div>
                  <span>Central Resonance Orb</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-purple-500"></div>
                  <span>Butterfly Wings (RBFR)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-amber-500"></div>
                  <span>Dante's Refiner</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <Card className="bg-slate-800/50 border-slate-700 text-center">
            <CardContent className="pt-6">
              <div className="text-sm text-slate-400 mb-2">Quantum Coherence Score</div>
              <div className="text-3xl font-bold text-emerald-400 mb-1">{metrics.coherence.toFixed(2)}</div>
              <div className="text-xs text-slate-500">Higher is better</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 text-center">
            <CardContent className="pt-6">
              <div className="text-sm text-slate-400 mb-2">Resonance Stability</div>
              <div className="text-3xl font-bold text-blue-400 mb-1">{Math.round(metrics.stability * 100)}%</div>
              <div className="text-xs text-slate-500">Output reliability</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 text-center">
            <CardContent className="pt-6">
              <div className="text-sm text-slate-400 mb-2">Pattern Entropy</div>
              <div className="text-3xl font-bold text-purple-400 mb-1">{metrics.entropy.toFixed(2)}</div>
              <div className="text-xs text-slate-500">Lower is more structured</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
