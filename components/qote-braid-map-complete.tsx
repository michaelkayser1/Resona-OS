"use client"

import { useEffect, useRef, useState } from "react"

export default function QoteBraidMapComplete() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [sensitivity, setSensitivity] = useState(0.75)
  const [coherenceThreshold, setCoherenceThreshold] = useState(0.618)
  const [complexity, setComplexity] = useState(0.42)
  const [coherence, setCoherence] = useState(0.87)
  const [stability, setStability] = useState(0.92)
  const [entropy, setEntropy] = useState(0.34)
  const [textInput, setTextInput] = useState(
    "The patient presents with symptoms of fatigue and shortness of breath. Lab results show elevated white blood cell count. Differential diagnosis includes infection, inflammatory conditions, or early-stage hematologic malignancy. Further testing recommended.",
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId: number
    const particles: any[] = []

    const resizeCanvas = () => {
      const container = canvas.parentElement
      if (container) {
        canvas.width = container.clientWidth
        canvas.height = container.clientHeight
        initParticles()
      }
    }

    const initParticles = () => {
      particles.length = 0
      const width = canvas.width
      const height = canvas.height

      // Create stabilizer line particles
      for (let i = 0; i < 20; i++) {
        particles.push({
          x: width / 2,
          y: i * (height / 20),
          size: 2 + Math.random() * 3,
          color: "#3e92cc",
          vx: 0,
          vy: 0,
          type: "stabilizer",
        })
      }

      // Create central orb particles
      for (let i = 0; i < 50; i++) {
        const angle = Math.random() * Math.PI * 2
        const radius = 30 + Math.random() * 40
        particles.push({
          x: width / 2 + Math.cos(angle) * radius,
          y: height / 2 + Math.sin(angle) * radius,
          size: 2 + Math.random() * 4,
          color: "#2ecc71",
          vx: 0,
          vy: 0,
          type: "orb",
        })
      }

      // Create butterfly wing particles
      for (let i = 0; i < 80; i++) {
        const side = i % 2 === 0 ? 1 : -1
        particles.push({
          x: width / 2 + side * (100 + Math.random() * 150),
          y: height / 2 - 100 + Math.random() * 200,
          size: 1 + Math.random() * 3,
          color: "#9b59b6",
          vx: 0,
          vy: 0,
          type: "wing",
        })
      }

      // Create refiner particles
      for (let i = 0; i < 40; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: 1 + Math.random() * 2,
          color: "#e67e22",
          vx: 0,
          vy: 0,
          type: "refiner",
        })
      }
    }

    const animate = () => {
      const width = canvas.width
      const height = canvas.height

      ctx.clearRect(0, 0, width, height)

      // Draw background gradient
      const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width * 0.7)
      gradient.addColorStop(0, "rgba(15, 32, 39, 0.8)")
      gradient.addColorStop(1, "rgba(15, 32, 39, 0.3)")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      // Update and draw particles
      particles.forEach((particle) => {
        switch (particle.type) {
          case "stabilizer":
            particle.x = width / 2 + Math.sin(Date.now() * 0.001 + particle.y * 0.01) * 5
            break
          case "orb":
            const angle = Math.atan2(particle.y - height / 2, particle.x - width / 2)
            const distance = Math.sqrt(Math.pow(particle.x - width / 2, 2) + Math.pow(particle.y - height / 2, 2))
            const targetRadius = 30 + (1 - coherence) * 40

            if (distance > targetRadius) {
              particle.vx -= (particle.x - width / 2) * 0.01
              particle.vy -= (particle.y - height / 2) * 0.01
            }

            particle.vx += (Math.random() - 0.5) * 0.2 * entropy
            particle.vy += (Math.random() - 0.5) * 0.2 * entropy
            particle.vx *= 0.95
            particle.vy *= 0.95
            particle.x += particle.vx
            particle.y += particle.vy
            break
          case "wing":
            particle.x += (Math.random() - 0.5) * 2 * (1 - stability)
            particle.y += (Math.random() - 0.5) * 2 * (1 - stability)

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
            break
          case "refiner":
            particle.x += 1 + (1 - coherence) * 2
            particle.y += 0.5 + (1 - coherence) * 1

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

      // Draw connecting lines for stabilizer
      ctx.beginPath()
      ctx.strokeStyle = "rgba(62, 146, 204, 0.3)"
      ctx.lineWidth = 1
      const stabilizers = particles.filter((p) => p.type === "stabilizer")
      for (let i = 0; i < stabilizers.length - 1; i++) {
        ctx.moveTo(stabilizers[i].x, stabilizers[i].y)
        ctx.lineTo(stabilizers[i + 1].x, stabilizers[i + 1].y)
      }
      ctx.stroke()

      // Draw central orb glow
      const glowRadius = 50 + coherence * 30
      const gradient2 = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, glowRadius)
      gradient2.addColorStop(0, "rgba(46, 204, 113, 0.3)")
      gradient2.addColorStop(1, "rgba(46, 204, 113, 0)")
      ctx.beginPath()
      ctx.arc(width / 2, height / 2, glowRadius, 0, Math.PI * 2)
      ctx.fillStyle = gradient2
      ctx.fill()

      animationId = requestAnimationFrame(animate)
    }

    resizeCanvas()
    animate()

    window.addEventListener("resize", resizeCanvas)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [coherence, stability, entropy])

  const handleAnalyze = () => {
    const baseCoherence = 0.7 + sensitivity * 0.3
    const baseStability = 0.8 + (1 - complexity) * 0.2
    const baseEntropy = complexity * 0.5

    const newCoherence = Math.min(0.99, baseCoherence + (Math.random() * 0.1 - 0.05))
    const newStability = Math.min(0.99, baseStability + (Math.random() * 0.1 - 0.05))
    const newEntropy = Math.max(0.01, baseEntropy + (Math.random() * 0.1 - 0.05))

    setCoherence(newCoherence)
    setStability(newStability)
    setEntropy(newEntropy)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
      <div className="max-w-7xl mx-auto p-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Header */}
        <div className="lg:col-span-3 text-center p-6 bg-white/5 rounded-lg backdrop-blur-sm">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
            QOTE-Resona v0
          </h1>
          <p className="text-lg text-gray-300 mb-4">
            The first quantum resonance interface for AI coherence measurement
          </p>
          <div className="flex justify-center gap-6 text-sm">
            <a href="#" className="text-blue-400 hover:text-green-400 transition-colors">
              Live Dashboard
            </a>
            <a href="#" className="text-blue-400 hover:text-green-400 transition-colors">
              Documentation
            </a>
            <a href="#" className="text-blue-400 hover:text-green-400 transition-colors">
              Schedule Demo
            </a>
            <a href="#" className="text-blue-400 hover:text-green-400 transition-colors">
              Contact
            </a>
          </div>
        </div>

        {/* Controls Panel */}
        <div className="bg-slate-800/80 rounded-lg p-6 backdrop-blur-sm">
          <h2 className="text-xl font-semibold mb-4 text-blue-400 border-b border-white/10 pb-2">Input & Parameters</h2>

          <div className="mb-4">
            <label className="block mb-2 font-medium">AI Output Text</label>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="w-full p-3 bg-black/20 border border-white/10 rounded text-white resize-vertical min-h-[120px]"
            />
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span>Resonance Sensitivity</span>
                <span>{sensitivity}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={sensitivity}
                onChange={(e) => setSensitivity(Number.parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span>Coherence Threshold</span>
                <span>{coherenceThreshold}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={coherenceThreshold}
                onChange={(e) => setCoherenceThreshold(Number.parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span>Pattern Complexity</span>
                <span>{complexity}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={complexity}
                onChange={(e) => setComplexity(Number.parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            className="w-full mt-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded transition-all duration-200 transform hover:-translate-y-1"
          >
            Analyze Coherence
          </button>

          <div className="mt-6">
            <h3 className="font-semibold mb-3">Status Indicators</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Stable Output
                </span>
                <span>Confidence: {Math.round(coherence * 100)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <span
                    className={`w-2 h-2 rounded-full mr-2 ${entropy > 0.4 ? "bg-yellow-400" : "bg-green-400"}`}
                  ></span>
                  Context Awareness
                </span>
                <span>{entropy > 0.4 ? "Limited" : "Moderate"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <span
                    className={`w-2 h-2 rounded-full mr-2 ${complexity > 0.7 ? "bg-red-400" : "bg-green-400"}`}
                  ></span>
                  Bias Detection
                </span>
                <span>{complexity > 0.7 ? "Moderate Risk" : "Low Risk"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Visualization Panel */}
        <div className="lg:col-span-2 bg-slate-800/80 rounded-lg p-6 backdrop-blur-sm">
          <h2 className="text-xl font-semibold mb-4 text-blue-400 border-b border-white/10 pb-2">
            Braid-Map Visualization
          </h2>

          <div className="relative h-96 bg-black/20 rounded-lg overflow-hidden">
            <canvas ref={canvasRef} className="w-full h-full" />
          </div>

          <div className="flex flex-wrap gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-400 rounded"></div>
              <span>Stabilizer Line</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded"></div>
              <span>Central Resonance Orb</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-400 rounded"></div>
              <span>Butterfly Wings (RBFR)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-400 rounded"></div>
              <span>Dante's Refiner</span>
            </div>
          </div>
        </div>

        {/* Metrics Panel */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-black/20 rounded-lg p-6 text-center">
            <div className="text-sm text-gray-400 mb-2">Quantum Coherence Score</div>
            <div className="text-3xl font-bold text-green-400 mb-1">{coherence.toFixed(2)}</div>
            <div className="text-xs text-gray-500">Higher is better</div>
          </div>

          <div className="bg-black/20 rounded-lg p-6 text-center">
            <div className="text-sm text-gray-400 mb-2">Resonance Stability</div>
            <div className="text-3xl font-bold text-green-400 mb-1">{Math.round(stability * 100)}%</div>
            <div className="text-xs text-gray-500">Output reliability</div>
          </div>

          <div className="bg-black/20 rounded-lg p-6 text-center">
            <div className="text-sm text-gray-400 mb-2">Pattern Entropy</div>
            <div className="text-3xl font-bold text-green-400 mb-1">{entropy.toFixed(2)}</div>
            <div className="text-xs text-gray-500">Lower is more structured</div>
          </div>
        </div>

        {/* Footer */}
        <div className="lg:col-span-3 text-center text-sm text-gray-400 mt-6">
          <p>QOTE-Resona v0 • First AI Coherence Operating System</p>
          <p>
            © 2023 Kayser Medical • Patent Pending •{" "}
            <a href="#" className="text-blue-400 hover:text-green-400">
              Schedule Demo
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
