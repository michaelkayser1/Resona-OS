"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Volume2, VolumeX, RotateCcw } from "lucide-react"

interface QOTE3DVisualizerProps {
  data: any
}

export function QOTE3DVisualizer({ data }: QOTE3DVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const audioContextRef = useRef<AudioContext>()
  const oscillatorsRef = useRef<OscillatorNode[]>([])
  const [isAudioEnabled, setIsAudioEnabled] = useState(false)
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const mouseRef = useRef({ x: 0, y: 0, isDown: false })

  // 3D Scene state
  const sceneRef = useRef({
    camera: { x: 0, y: 0, z: 5 },
    particles: [] as Array<{ x: number; y: number; z: number; phase: number; color: string }>,
    connections: [] as Array<{ from: number; to: number; strength: number }>,
  })

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Initialize 3D scene
    initializeScene()

    // Start animation loop
    animate()

    // Setup mouse interaction
    const handleMouseDown = (e: MouseEvent) => {
      mouseRef.current.isDown = true
      mouseRef.current.x = e.clientX
      mouseRef.current.y = e.clientY
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!mouseRef.current.isDown) return

      const deltaX = e.clientX - mouseRef.current.x
      const deltaY = e.clientY - mouseRef.current.y

      setRotation((prev) => ({
        x: prev.x + deltaY * 0.01,
        y: prev.y + deltaX * 0.01,
      }))

      mouseRef.current.x = e.clientX
      mouseRef.current.y = e.clientY
    }

    const handleMouseUp = () => {
      mouseRef.current.isDown = false
    }

    canvas.addEventListener("mousedown", handleMouseDown)
    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("mouseup", handleMouseUp)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      canvas.removeEventListener("mousedown", handleMouseDown)
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("mouseup", handleMouseUp)
      stopAudio()
    }
  }, [])

  useEffect(() => {
    if (data) {
      updateSceneFromData()
      if (isAudioEnabled) {
        updateAudioFromData()
      }
    }
  }, [data, isAudioEnabled])

  const initializeScene = () => {
    const scene = sceneRef.current
    scene.particles = []
    scene.connections = []

    // Create initial particle system
    for (let i = 0; i < 20; i++) {
      scene.particles.push({
        x: (Math.random() - 0.5) * 4,
        y: (Math.random() - 0.5) * 4,
        z: (Math.random() - 0.5) * 4,
        phase: Math.random() * Math.PI * 2,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`,
      })
    }

    // Create connections between nearby particles
    for (let i = 0; i < scene.particles.length; i++) {
      for (let j = i + 1; j < scene.particles.length; j++) {
        const p1 = scene.particles[i]
        const p2 = scene.particles[j]
        const distance = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2) + Math.pow(p1.z - p2.z, 2))

        if (distance < 2.5) {
          scene.connections.push({
            from: i,
            to: j,
            strength: 1 - distance / 2.5,
          })
        }
      }
    }
  }

  const updateSceneFromData = () => {
    if (!data || !data.phases) return

    const scene = sceneRef.current
    const phases = data.phases
    const coherence = data.coherence || 0

    // Update particle positions based on QOTE data
    phases.forEach((phase: number, index: number) => {
      if (scene.particles[index]) {
        const particle = scene.particles[index]

        const radius = 2 - coherence * 1.5 // Tighter clustering with higher coherence
        particle.x = Math.cos(phase) * radius + Math.sin(Date.now() * 0.001 + index) * 0.1
        particle.y = Math.sin(phase) * radius + Math.cos(Date.now() * 0.001 + index) * 0.1
        particle.z = Math.sin(phase * 2) * 0.5
        particle.phase = phase

        // Color based on phase coherence
        const hue = (phase / (Math.PI * 2)) * 360
        const saturation = 50 + coherence * 50
        const lightness = 40 + coherence * 30
        particle.color = `hsl(${hue}, ${saturation}%, ${lightness}%)`
      }
    })

    // Update connection strengths based on phase differences
    scene.connections.forEach((connection) => {
      const p1 = scene.particles[connection.from]
      const p2 = scene.particles[connection.to]
      if (p1 && p2) {
        const phaseDiff = Math.abs(p1.phase - p2.phase)
        const normalizedDiff = Math.min(phaseDiff, Math.PI * 2 - phaseDiff)
        connection.strength = 1 - normalizedDiff / Math.PI
      }
    })
  }

  const project3D = (x: number, y: number, z: number) => {
    // Apply rotation
    const cosX = Math.cos(rotation.x)
    const sinX = Math.sin(rotation.x)
    const cosY = Math.cos(rotation.y)
    const sinY = Math.sin(rotation.y)

    // Rotate around Y axis
    const x1 = x * cosY - z * sinY
    const z1 = x * sinY + z * cosY

    // Rotate around X axis
    const y1 = y * cosX - z1 * sinX
    const z2 = y * sinX + z1 * cosX

    // Project to 2D
    const camera = sceneRef.current.camera
    const scale = 200 / (z2 + camera.z)

    return {
      x: x1 * scale + 200,
      y: y1 * scale + 150,
      scale: scale / 40,
    }
  }

  const animate = () => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const scene = sceneRef.current

    // Draw connections first (behind particles)
    ctx.strokeStyle = "rgba(100, 150, 255, 0.3)"
    scene.connections.forEach((connection) => {
      const p1 = scene.particles[connection.from]
      const p2 = scene.particles[connection.to]
      if (!p1 || !p2) return

      const proj1 = project3D(p1.x, p1.y, p1.z)
      const proj2 = project3D(p2.x, p2.y, p2.z)

      ctx.globalAlpha = connection.strength * 0.5
      ctx.lineWidth = connection.strength * 3
      ctx.beginPath()
      ctx.moveTo(proj1.x, proj1.y)
      ctx.lineTo(proj2.x, proj2.y)
      ctx.stroke()
    })

    // Draw particles
    scene.particles.forEach((particle, index) => {
      const projected = project3D(particle.x, particle.y, particle.z)

      ctx.globalAlpha = 0.8
      ctx.fillStyle = particle.color
      ctx.beginPath()
      ctx.arc(projected.x, projected.y, 3 + projected.scale * 2, 0, Math.PI * 2)
      ctx.fill()

      // Add glow effect for high coherence
      if (data && data.coherence > 0.7) {
        ctx.globalAlpha = 0.3
        ctx.beginPath()
        ctx.arc(projected.x, projected.y, 8 + projected.scale * 4, 0, Math.PI * 2)
        ctx.fill()
      }
    })

    ctx.globalAlpha = 1

    animationRef.current = requestAnimationFrame(animate)
  }

  const toggleAudio = async () => {
    if (isAudioEnabled) {
      stopAudio()
      setIsAudioEnabled(false)
    } else {
      await startAudio()
      setIsAudioEnabled(true)
    }
  }

  const startAudio = async () => {
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()

      if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume()
      }

      updateAudioFromData()
    } catch (error) {
      console.error("[v0] Audio initialization failed:", error)
    }
  }

  const stopAudio = () => {
    oscillatorsRef.current.forEach((osc) => {
      try {
        osc.stop()
        osc.disconnect()
      } catch (e) {
        // Oscillator might already be stopped
      }
    })
    oscillatorsRef.current = []

    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = undefined
    }
  }

  const updateAudioFromData = () => {
    if (!audioContextRef.current || !data || !data.phases) return

    // Stop existing oscillators
    oscillatorsRef.current.forEach((osc) => {
      try {
        osc.stop()
        osc.disconnect()
      } catch (e) {
        // Oscillator might already be stopped
      }
    })
    oscillatorsRef.current = []

    const audioContext = audioContextRef.current
    const phases = data.phases
    const coherence = data.coherence || 0

    // Create oscillators for each phase
    phases.slice(0, 8).forEach((phase: number, index: number) => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      const baseFreq = 220 // A3
      const frequency = baseFreq * (1 + Math.sin(phase) * 0.5) * (1 + index * 0.1)

      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
      oscillator.type = "sine"

      // Volume based on coherence and position
      const volume = coherence * 0.1 * (1 / (index + 1)) * 0.5
      gainNode.gain.setValueAtTime(volume, audioContext.currentTime)

      // Connect audio graph
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      // Start oscillator
      oscillator.start()

      oscillatorsRef.current.push(oscillator)
    })
  }

  const resetView = () => {
    setRotation({ x: 0, y: 0 })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">3D Phase Space</CardTitle>
            <CardDescription>Interactive quantum oscillator visualization with audio feedback</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={toggleAudio}>
              {isAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={resetView}>
              <RotateCcw className="w-4 h-4" />
            </Button>
            {data && <Badge variant="secondary">{data.phases?.length || 0} Oscillators</Badge>}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={400}
            height={300}
            className="w-full h-[300px] bg-black rounded-lg cursor-grab active:cursor-grabbing"
            style={{ imageRendering: "pixelated" }}
          />
          {!data && (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 opacity-50">
                  <div className="w-full h-full border-2 border-current rounded-full animate-spin border-t-transparent"></div>
                </div>
                <p>Process a prompt to see 3D visualization</p>
              </div>
            </div>
          )}
          <div className="absolute bottom-2 left-2 text-xs text-muted-foreground bg-black/50 px-2 py-1 rounded">
            Drag to rotate • Click audio to hear phases
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
