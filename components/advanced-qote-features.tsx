"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Play, Pause, Volume2, VolumeX, RotateCcw, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

interface QOTEEmbedding {
  x: number
  y: number
  z: number
  phase: number
  frequency: number
  coherence: number
  oscillation: number
}

interface CoherenceData {
  averageCoherence: number
  coherenceRatio: number
  meetsThreshold: boolean
}

export default function AdvancedQOTEFeatures() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [embeddings, setEmbeddings] = useState<QOTEEmbedding[]>([])
  const [coherenceData, setCoherenceData] = useState<CoherenceData | null>(null)
  const [rotationSpeed, setRotationSpeed] = useState(0.01)
  const [coherenceThreshold, setCoherenceThreshold] = useState(0.7)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const oscillatorsRef = useRef<OscillatorNode[]>([])

  const initialize3DVisualization = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = 600
    canvas.height = 400

    // Generate QOTE embeddings with quantum properties
    const newEmbeddings: QOTEEmbedding[] = Array.from({ length: 50 }, (_, i) => ({
      x: (Math.random() - 0.5) * 200,
      y: (Math.random() - 0.5) * 200,
      z: (Math.random() - 0.5) * 200,
      phase: (2 * Math.PI * i) / 50,
      frequency: 0.5 + Math.random() * 2,
      coherence: Math.random(),
      oscillation: 0,
    }))

    setEmbeddings(newEmbeddings)

    // Calculate coherence metrics
    const totalCoherence = newEmbeddings.reduce((sum, emb) => sum + emb.coherence, 0) / newEmbeddings.length
    const coherentCount = newEmbeddings.filter((emb) => emb.coherence > coherenceThreshold).length

    setCoherenceData({
      averageCoherence: totalCoherence,
      coherenceRatio: coherentCount / newEmbeddings.length,
      meetsThreshold: coherentCount / newEmbeddings.length > 0.6,
    })
  }, [coherenceThreshold])

  const render3D = useCallback(
    (time: number) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      // Quantum-themed background gradient
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 300)
      gradient.addColorStop(0, "#0a0a1a")
      gradient.addColorStop(0.5, "#1a0a2e")
      gradient.addColorStop(1, "#16213e")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update and render oscillator particles
      embeddings.forEach((embedding, index) => {
        // Update oscillation based on time and frequency
        embedding.oscillation = Math.sin(time * 0.001 * embedding.frequency + embedding.phase)

        // Calculate 3D position with rotation
        const rotationY = time * rotationSpeed
        const rotatedX = embedding.x * Math.cos(rotationY) - embedding.z * Math.sin(rotationY)
        const rotatedZ = embedding.x * Math.sin(rotationY) + embedding.z * Math.cos(rotationY)

        // Project to 2D with perspective
        const perspective = 300
        const scale = perspective / (perspective + rotatedZ)
        const screenX = centerX + rotatedX * scale
        const screenY = centerY + embedding.y * scale

        // Color based on coherence and oscillation
        const hue = 240 + embedding.coherence * 120 // Blue to cyan
        const brightness = 0.5 + 0.5 * Math.abs(embedding.oscillation)
        const alpha = 0.3 + 0.7 * embedding.coherence

        // Draw oscillator particle
        ctx.beginPath()
        ctx.arc(screenX, screenY, 3 * scale * (1 + 0.5 * Math.abs(embedding.oscillation)), 0, 2 * Math.PI)
        ctx.fillStyle = `hsla(${hue}, 80%, ${brightness * 60}%, ${alpha})`
        ctx.fill()

        // Draw connection lines for high coherence pairs
        if (embedding.coherence > 0.8) {
          embeddings.forEach((other, otherIndex) => {
            if (otherIndex > index && other.coherence > 0.8) {
              const otherRotatedX = other.x * Math.cos(rotationY) - other.z * Math.sin(rotationY)
              const otherRotatedZ = other.x * Math.sin(rotationY) + other.z * Math.cos(rotationY)
              const otherScale = perspective / (perspective + otherRotatedZ)
              const otherScreenX = centerX + otherRotatedX * otherScale
              const otherScreenY = centerY + other.y * otherScale

              ctx.beginPath()
              ctx.moveTo(screenX, screenY)
              ctx.lineTo(otherScreenX, otherScreenY)
              ctx.strokeStyle = `hsla(${hue}, 60%, 40%, 0.2)`
              ctx.lineWidth = 1
              ctx.stroke()
            }
          })
        }
      })

      // Draw coherence threshold indicator
      const thresholdY = canvas.height - 30
      const thresholdWidth = (coherenceData?.averageCoherence || 0) * (canvas.width - 40)
      ctx.fillStyle = coherenceData?.meetsThreshold ? "#00ff88" : "#ff4444"
      ctx.fillRect(20, thresholdY, thresholdWidth, 10)
      ctx.strokeStyle = "#666"
      ctx.strokeRect(20, thresholdY, canvas.width - 40, 10)

      if (isPlaying) {
        animationRef.current = requestAnimationFrame(render3D)
      }
    },
    [embeddings, coherenceData, isPlaying, rotationSpeed],
  )

  const initializeAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
  }, [])

  const startAudioFeedback = useCallback(() => {
    if (!audioEnabled || !coherenceData) return

    initializeAudio()
    const audioContext = audioContextRef.current
    if (!audioContext) return

    // Clear existing oscillators
    oscillatorsRef.current.forEach((osc) => {
      try {
        osc.stop()
      } catch (e) {}
    })
    oscillatorsRef.current = []

    // Create oscillators for high-coherence embeddings
    embeddings.slice(0, 8).forEach((embedding) => {
      if (embedding.coherence > 0.6) {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        // Map embedding properties to audio
        const baseFreq = 220 + embedding.coherence * 440 // A3 to A5
        const phaseFreq = baseFreq * (1 + 0.1 * Math.sin(embedding.phase))

        oscillator.frequency.value = phaseFreq
        oscillator.type = "sine"

        gainNode.gain.value = 0.05 * embedding.coherence // Quiet volume

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.start()
        oscillatorsRef.current.push(oscillator)
      }
    })
  }, [audioEnabled, coherenceData, embeddings, initializeAudio])

  const stopAudioFeedback = useCallback(() => {
    oscillatorsRef.current.forEach((osc) => {
      try {
        osc.stop()
      } catch (e) {}
    })
    oscillatorsRef.current = []
  }, [])

  const exportData = useCallback(() => {
    const exportData = {
      timestamp: new Date().toISOString(),
      coherenceMetrics: coherenceData,
      embeddingCount: embeddings.length,
      custGateStatus: coherenceData?.meetsThreshold ? "OPEN" : "CLOSED",
      highCoherenceCount: embeddings.filter((e) => e.coherence > 0.8).length,
      settings: {
        rotationSpeed,
        coherenceThreshold,
      },
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "qote-session-data.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [coherenceData, embeddings, rotationSpeed, coherenceThreshold])

  // Initialize on mount
  useEffect(() => {
    initialize3DVisualization()
  }, [initialize3DVisualization])

  // Handle play/pause and audio
  useEffect(() => {
    if (isPlaying) {
      render3D(performance.now())
      if (audioEnabled) startAudioFeedback()
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      stopAudioFeedback()
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      stopAudioFeedback()
    }
  }, [isPlaying, audioEnabled, render3D, startAudioFeedback, stopAudioFeedback])

  const custGateStatus = coherenceData?.meetsThreshold ? "OPEN" : "CLOSED"

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
            QOTE Advanced Features
          </h1>
          <p className="text-slate-300 text-lg">
            Quantum Oscillatory Token Embedding with 3D Visualization & Audio Feedback
          </p>
        </div>

        {/* Control Panel */}
        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <Button
              onClick={() => setIsPlaying(!isPlaying)}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              {isPlaying ? "Pause" : "Start"} Simulation
            </Button>

            <Button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              Audio {audioEnabled ? "On" : "Off"}
            </Button>

            <Button onClick={initialize3DVisualization} variant="secondary">
              <RotateCcw size={16} />
              Reset
            </Button>

            <Button
              onClick={exportData}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              <Download size={16} />
              Export Data
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-2">Rotation Speed</label>
              <Slider
                value={[rotationSpeed]}
                onValueChange={(value) => setRotationSpeed(value[0])}
                min={0}
                max={0.05}
                step={0.001}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-2">Coherence Threshold</label>
              <Slider
                value={[coherenceThreshold]}
                onValueChange={(value) => setCoherenceThreshold(value[0])}
                min={0.1}
                max={1.0}
                step={0.01}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Main Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* 3D Phase Space Visualization */}
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-xl font-semibold mb-4 text-cyan-400">3D Phase Space Visualization</h3>
            <canvas
              ref={canvasRef}
              className="w-full border border-slate-600 rounded-lg bg-black"
              style={{ maxHeight: "400px" }}
            />
            <div className="mt-3 text-sm text-slate-400">
              Interactive 3D oscillator network showing token embedding synchronization patterns
            </div>
          </div>

          {/* Real-time Metrics Dashboard */}
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-xl font-semibold mb-4 text-purple-400">CUST Gate Metrics</h3>

            {coherenceData && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Gate Status:</span>
                  <span className={`font-bold ${custGateStatus === "OPEN" ? "text-green-400" : "text-red-400"}`}>
                    {custGateStatus}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Average Coherence:</span>
                  <span className="text-cyan-400 font-mono">{(coherenceData.averageCoherence * 100).toFixed(1)}%</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Coherence Ratio:</span>
                  <span className="text-purple-400 font-mono">{(coherenceData.coherenceRatio * 100).toFixed(1)}%</span>
                </div>

                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      coherenceData.meetsThreshold
                        ? "bg-gradient-to-r from-green-400 to-cyan-400"
                        : "bg-gradient-to-r from-red-400 to-orange-400"
                    }`}
                    style={{ width: `${coherenceData.averageCoherence * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Audio Visualization */}
            {audioEnabled && (
              <div className="mt-6 p-4 bg-slate-700 rounded-lg">
                <h4 className="text-lg font-semibold text-pink-400 mb-2">Audio Sonification</h4>
                <div className="text-sm text-slate-300">
                  🎵 Mapping token phases to frequencies: {oscillatorsRef.current.length} active oscillators
                </div>
                <div className="mt-2 flex gap-1">
                  {Array.from({ length: 20 }, (_, i) => (
                    <div
                      key={i}
                      className="w-3 bg-gradient-to-t from-pink-500 to-purple-500 rounded-t transition-all duration-100"
                      style={{
                        height: `${20 + Math.sin(Date.now() * 0.01 + i * 0.5) * 15}px`,
                        opacity: audioEnabled ? 0.8 : 0.3,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex flex-wrap gap-4 justify-center">
          <div className="flex items-center gap-2 bg-slate-800 px-3 py-2 rounded-lg">
            <div className={`w-3 h-3 rounded-full ${isPlaying ? "bg-green-400 animate-pulse" : "bg-gray-400"}`} />
            <span className="text-sm">Simulation {isPlaying ? "Active" : "Stopped"}</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-800 px-3 py-2 rounded-lg">
            <div className={`w-3 h-3 rounded-full ${audioEnabled ? "bg-purple-400 animate-pulse" : "bg-gray-400"}`} />
            <span className="text-sm">Audio {audioEnabled ? "Enabled" : "Disabled"}</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-800 px-3 py-2 rounded-lg">
            <div className={`w-3 h-3 rounded-full ${coherenceData?.meetsThreshold ? "bg-green-400" : "bg-red-400"}`} />
            <span className="text-sm">CUST Gate {custGateStatus}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
