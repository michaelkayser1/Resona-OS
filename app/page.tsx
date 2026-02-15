"use client"

import { useState, useEffect, useRef } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import MemoryPalace from "@/components/MemoryPalace" // Declare the MemoryPalace variable

class CosmicAudioAnalyzer {
  constructor() {
    this.audioContext = null
    this.analyser = null
    this.microphone = null
    this.dataArray = null
    this.isActive = false
    this.onsetDetector = new AdvancedOnsetDetector()
    this.pitchDetector = new CosmicPitchDetector()
    this.secretFrequencies = [432, 528, 369] // Hz
    this.secretProgress = [0, 0, 0]
    this.binaural = null
    this.schumannResonator = null
  }

  async initialize() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 44100,
        },
      })

      this.microphone = this.audioContext.createMediaStreamSource(stream)
      this.analyser = this.audioContext.createAnalyser()
      this.analyser.fftSize = 4096
      this.analyser.smoothingTimeConstant = 0.2

      this.microphone.connect(this.analyser)
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount)
      this.isActive = true

      this.initializeBinauralBeats()
      this.initializeSchumannResonance()

      return true
    } catch (error) {
      console.error("Audio initialization failed:", error)
      return false
    }
  }

  initializeBinauralBeats() {
    this.binaural = {
      left: this.audioContext.createOscillator(),
      right: this.audioContext.createOscillator(),
      leftGain: this.audioContext.createGain(),
      rightGain: this.audioContext.createGain(),
      merger: this.audioContext.createChannelMerger(2),
    }

    this.binaural.left.frequency.value = 440
    this.binaural.right.frequency.value = 446 // 6Hz binaural beat
    this.binaural.leftGain.gain.value = 0
    this.binaural.rightGain.gain.value = 0

    this.binaural.left.connect(this.binaural.leftGain)
    this.binaural.right.connect(this.binaural.rightGain)
    this.binaural.leftGain.connect(this.binaural.merger, 0, 0)
    this.binaural.rightGain.connect(this.binaural.merger, 0, 1)
    this.binaural.merger.connect(this.audioContext.destination)

    this.binaural.left.start()
    this.binaural.right.start()
  }

  initializeSchumannResonance() {
    this.schumannResonator = {
      oscillator: this.audioContext.createOscillator(),
      gain: this.audioContext.createGain(),
      filter: this.audioContext.createBiquadFilter(),
    }

    this.schumannResonator.oscillator.frequency.value = 7.83
    this.schumannResonator.oscillator.type = "sine"
    this.schumannResonator.gain.gain.value = 0
    this.schumannResonator.filter.type = "lowpass"
    this.schumannResonator.filter.frequency.value = 100

    this.schumannResonator.oscillator.connect(this.schumannResonator.filter)
    this.schumannResonator.filter.connect(this.schumannResonator.gain)
    this.schumannResonator.gain.connect(this.audioContext.destination)

    this.schumannResonator.oscillator.start()
  }

  getCosmicAnalysis() {
    if (!this.isActive || !this.analyser) return null

    this.analyser.getByteFrequencyData(this.dataArray)

    const amplitude = this.calculateAmplitude()
    const pitch = this.pitchDetector.detectAdvancedPitch(this.dataArray, this.audioContext.sampleRate)
    const onset = this.onsetDetector.detectAdvancedOnset(this.dataArray)
    const peaks = this.detectMultiplePeaks(this.dataArray)
    const harmonics = this.analyzeHarmonics(this.dataArray)

    this.checkSecretFrequencies(pitch)

    const beatboxing = this.detectBeatboxing(this.dataArray)
    const whisper = this.detectWhisper(this.dataArray)

    return {
      amplitude,
      pitch,
      onset,
      peaks,
      harmonics,
      beatboxing,
      whisper,
      spectrum: Array.from(this.dataArray.slice(0, 128)),
      secretProgress: [...this.secretProgress],
    }
  }

  calculateAmplitude() {
    let sum = 0
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i] * this.dataArray[i]
    }
    return Math.sqrt(sum / this.dataArray.length) / 255
  }

  detectMultiplePeaks(spectrum) {
    const peaks = []
    const threshold = 120
    const minDistance = 15

    for (let i = minDistance; i < spectrum.length - minDistance; i++) {
      if (spectrum[i] > threshold) {
        let isPeak = true
        for (let j = -minDistance; j <= minDistance; j++) {
          if (j !== 0 && spectrum[i + j] >= spectrum[i]) {
            isPeak = false
            break
          }
        }
        if (isPeak) {
          const frequency = (i * this.audioContext.sampleRate) / (spectrum.length * 2)
          peaks.push({ frequency, amplitude: spectrum[i] / 255 })
        }
      }
    }

    return peaks.sort((a, b) => b.amplitude - a.amplitude).slice(0, 5)
  }

  checkSecretFrequencies(detectedPitch) {
    this.secretFrequencies.forEach((targetFreq, index) => {
      const tolerance = 15
      if (Math.abs(detectedPitch - targetFreq) < tolerance) {
        this.secretProgress[index] = Math.min(this.secretProgress[index] + 1, 180)
      } else {
        this.secretProgress[index] = Math.max(this.secretProgress[index] - 2, 0)
      }
    })
  }

  analyzeHarmonics(spectrum) {
    const fundamentalBin = Math.floor((200 * spectrum.length * 2) / this.audioContext.sampleRate)
    const harmonics = []

    for (let h = 1; h <= 8; h++) {
      const harmonicBin = fundamentalBin * h
      if (harmonicBin < spectrum.length) {
        harmonics.push(spectrum[harmonicBin] / 255)
      }
    }

    return harmonics
  }

  detectBeatboxing(spectrum) {
    const highFreqEnergy = spectrum.slice(spectrum.length * 0.7).reduce((a, b) => a + b, 0)
    const totalEnergy = spectrum.reduce((a, b) => a + b, 0)
    return highFreqEnergy / totalEnergy > 0.3
  }

  detectWhisper(spectrum) {
    const highFreqNoise = spectrum.slice(spectrum.length * 0.5).reduce((a, b) => a + b, 0)
    const lowFreqContent = spectrum.slice(0, spectrum.length * 0.3).reduce((a, b) => a + b, 0)
    return highFreqNoise > lowFreqContent * 2 && highFreqNoise / 255 < 0.3
  }

  activateBinauralBeats(intensity = 0.05) {
    if (this.binaural) {
      this.binaural.leftGain.gain.setTargetAtTime(intensity, this.audioContext.currentTime, 0.1)
      this.binaural.rightGain.gain.setTargetAtTime(intensity, this.audioContext.currentTime, 0.1)
    }
  }

  activateSchumannResonance(intensity = 0.02) {
    if (this.schumannResonator) {
      this.schumannResonator.gain.gain.setTargetAtTime(intensity, this.audioContext.currentTime, 0.1)
    }
  }

  dispose() {
    if (this.binaural) {
      try {
        this.binaural.left.stop()
        this.binaural.right.stop()
      } catch (e) {}
    }

    if (this.schumannResonator) {
      try {
        this.schumannResonator.oscillator.stop()
      } catch (e) {}
    }

    if (this.microphone) this.microphone.disconnect()
    if (this.audioContext) this.audioContext.close()
    this.isActive = false
  }
}

class AdvancedOnsetDetector {
  constructor() {
    this.previousSpectrum = null
    this.onsetThreshold = 0.25
    this.onsetHistory = []
    this.maxHistoryLength = 20
  }

  detectAdvancedOnset(spectrum) {
    if (!this.previousSpectrum) {
      this.previousSpectrum = [...spectrum]
      return { onset: false, strength: 0, beat: false }
    }

    let flux = 0
    let complexityFlux = 0

    for (let i = 1; i < spectrum.length; i++) {
      const diff = spectrum[i] - this.previousSpectrum[i]
      flux += Math.max(0, diff)

      const prevGradient = this.previousSpectrum[i] - this.previousSpectrum[i - 1]
      const currGradient = spectrum[i] - spectrum[i - 1]
      complexityFlux += Math.abs(currGradient - prevGradient)
    }

    flux /= spectrum.length
    complexityFlux /= spectrum.length

    this.previousSpectrum = [...spectrum]

    const timestamp = Date.now()
    this.onsetHistory.push({ flux, complexityFlux, timestamp })

    if (this.onsetHistory.length > this.maxHistoryLength) {
      this.onsetHistory.shift()
    }

    const isOnset = flux > this.onsetThreshold && this.isLocalMaximum(flux)

    return {
      onset: isOnset,
      strength: flux,
      complexity: complexityFlux,
    }
  }

  isLocalMaximum(currentValue) {
    if (this.onsetHistory.length < 5) return false

    const recent = this.onsetHistory.slice(-5).map((h) => h.flux)
    return currentValue === Math.max(...recent)
  }
}

class CosmicPitchDetector {
  constructor() {
    this.previousPitch = 0
    this.confidence = 0
  }

  detectAdvancedPitch(spectrum, sampleRate) {
    const nyquist = sampleRate / 2
    const binSize = nyquist / spectrum.length
    let maxAmplitude = 0
    let maxIndex = 0

    for (let i = 0; i < spectrum.length; i++) {
      if (spectrum[i] > maxAmplitude) {
        maxAmplitude = spectrum[i]
        maxIndex = i
      }
    }

    if (maxAmplitude < 50) {
      this.confidence = Math.max(this.confidence - 0.1, 0)
      return this.previousPitch
    }

    const pitch = maxIndex * binSize
    if (pitch > 50 && pitch < 2000) {
      this.confidence = Math.min(this.confidence + 0.1, 1.0)
      this.previousPitch = pitch
      return pitch
    }
    this.confidence = Math.max(this.confidence - 0.05, 0)
    return this.previousPitch
  }
}

class CosmicSpiral {
  constructor(x, y, color, id, weather) {
    this.centerX = x
    this.centerY = y
    this.color = color
    this.id = id
    this.points = []
    this.angle = 0
    this.radius = 20 + Math.random() * 40
    this.age = 0
    this.isDead = false
    this.children = []
    this.frequency = 200 + Math.random() * 400
    this.resonanceMode = false
    this.weather = weather
    this.phase = Math.random() * Math.PI * 2
    this.glowIntensity = 0
    this.wiggleAmount = 0
    this.dustParticles = []
    this.interferencePhase = 0
    this.splitAnimationProgress = 0
    this.isSplitting = false

    this.createDustParticles()
  }

  createDustParticles() {
    for (let i = 0; i < 15; i++) {
      this.dustParticles.push({
        x: this.centerX + (Math.random() - 0.5) * 100,
        y: this.centerY + (Math.random() - 0.5) * 100,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        life: 1,
        decay: 0.02,
      })
    }
  }

  update(audioAnalysis, spirals) {
    this.age++

    // Update based on audio
    if (audioAnalysis) {
      if (audioAnalysis.amplitude > 0.1) {
        this.glowIntensity = Math.min(audioAnalysis.amplitude * 2, 1)
        this.wiggleAmount = audioAnalysis.amplitude * 20
        this.phase += 0.1 + audioAnalysis.pitch * 0.0001
      } else {
        this.glowIntensity = Math.max(0, this.glowIntensity - 0.02)
        this.wiggleAmount *= 0.95
      }

      if (audioAnalysis.onset?.onset) {
        this.radius += audioAnalysis.onset.strength * 5
        this.resonanceMode = true
      }

      // Check for resonance with other spirals
      this.checkResonance(audioAnalysis, spirals)
    }

    // Weather effects
    if (this.weather?.condition === "windy") {
      this.centerX += Math.sin(this.age * 0.1) * 0.5
      this.centerY += Math.cos(this.age * 0.1) * 0.5
    }

    // Update dust particles
    this.dustParticles.forEach((particle) => {
      particle.x += particle.vx
      particle.y += particle.vy
      particle.life -= particle.decay
      particle.vx *= 0.98
      particle.vy *= 0.98
    })

    this.dustParticles = this.dustParticles.filter((p) => p.life > 0)

    // Update split animation
    if (this.isSplitting) {
      this.splitAnimationProgress += 0.05
      if (this.splitAnimationProgress >= 1) {
        this.isSplitting = false
        this.splitAnimationProgress = 0
      }
    }

    // Update interference pattern if in resonance mode
    if (this.resonanceMode) {
      this.interferencePhase += 0.05
    }

    // Generate spiral points
    const newPoint = {
      x: this.centerX + Math.cos(this.angle) * this.radius,
      y: this.centerY + Math.sin(this.angle) * this.radius,
    }
    this.points.push(newPoint)
    if (this.points.length > 200) {
      this.points.shift()
    }

    this.angle += 0.05
    this.radius += 0.1

    if (this.age > 3600) {
      this.isDead = true
    }
  }

  checkResonance(audioAnalysis, allSpirals) {
    if (!audioAnalysis || audioAnalysis.peaks.length < 2) {
      this.resonanceMode = false
      return
    }

    const tolerance = 20
    const matchingPeaks = audioAnalysis.peaks.filter((peak) => Math.abs(peak.frequency - this.frequency) < tolerance)

    if (matchingPeaks.length > 0 && audioAnalysis.peaks.length >= 2) {
      this.resonanceMode = true
    }
  }

  split() {
    if (this.children.length > 0) return null

    this.isSplitting = true

    const childSpiral = new CosmicSpiral(
      this.centerX + 40 + Math.random() * 20,
      this.centerY + 40 + Math.random() * 20,
      this.color,
      this.id + "_child_" + Date.now(),
      this.weather,
    )

    childSpiral.phase = this.phase + Math.PI * 0.5
    childSpiral.frequency = this.frequency * (1 + (Math.random() - 0.5) * 0.1)

    this.children.push(childSpiral)
    return childSpiral
  }

  draw(ctx) {
    // Draw dust particles first
    this.drawDustParticles(ctx)

    ctx.save()
    ctx.globalAlpha = Math.max(0.1, 1 - this.age / 3600)
    ctx.strokeStyle = this.color
    ctx.lineWidth = 2 + this.glowIntensity * 3

    // Add glow effect
    if (this.glowIntensity > 0) {
      ctx.shadowColor = this.color
      ctx.shadowBlur = 15 * this.glowIntensity
    }

    // Draw the spiral with wiggle and interference
    ctx.beginPath()
    for (let i = 0; i < this.points.length - 1; i++) {
      const point = this.points[i]
      let x = point.x
      let y = point.y

      // Apply wiggle
      if (this.wiggleAmount > 0) {
        const wigglePhase = this.phase + i * 0.1
        x += Math.sin(wigglePhase) * this.wiggleAmount * (i / this.points.length)
        y += Math.cos(wigglePhase) * this.wiggleAmount * (i / this.points.length)
      }

      // Apply interference pattern if in resonance mode
      if (this.resonanceMode) {
        const interferenceWave = Math.sin(this.interferencePhase + i * 0.2) * 5
        x += interferenceWave
        y += interferenceWave * 0.7
      }

      // Apply split animation
      if (this.isSplitting) {
        const splitOffset = Math.sin(this.splitAnimationProgress * Math.PI) * 10
        x += splitOffset * Math.sin(i * 0.1)
        y += splitOffset * Math.cos(i * 0.1)
      }

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.stroke()

    ctx.restore()

    // Draw children
    this.children.forEach((child) => child.draw(ctx))
  }

  drawDustParticles(ctx) {
    ctx.save()
    ctx.strokeStyle = this.color
    ctx.lineWidth = 1

    this.dustParticles.forEach((particle) => {
      ctx.globalAlpha = particle.life * 0.3
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, 1, 0, Math.PI * 2)
      ctx.stroke()
    })

    ctx.restore()
  }

  isNear(x, y, radius = 50) {
    const dx = x - this.centerX
    const dy = y - this.centerY
    return Math.sqrt(dx * dx + dy * dy) < radius
  }
}

function useCosmicAudioAnalysis() {
  const [isActive, setIsActive] = useState(false)
  const [audioData, setAudioData] = useState({
    amplitude: 0,
    pitch: 0,
    onset: null,
    peaks: [],
    harmonics: [],
    beatboxing: false,
    whisper: false,
    spectrum: new Array(128).fill(0),
    secretProgress: [0, 0, 0],
    isListening: false,
  })

  const analyzerRef = useRef(null)
  const animationRef = useRef()

  const startAudio = async () => {
    try {
      analyzerRef.current = new CosmicAudioAnalyzer()
      const success = await analyzerRef.current.initialize()

      if (success) {
        setIsActive(true)
        analyzeAudio()
      }
    } catch (error) {
      console.error("Audio access denied:", error)
    }
  }

  const analyzeAudio = () => {
    if (!analyzerRef.current) return

    const analysis = analyzerRef.current.getCosmicAnalysis()

    if (analysis) {
      setAudioData({
        ...analysis,
        isListening: analysis.amplitude > 0.01,
      })

      // Activate binaural beats on high amplitude
      if (analysis.amplitude > 0.3) {
        analyzerRef.current.activateBinauralBeats(0.03)
      }

      // Activate Schumann resonance on whisper detection
      if (analysis.whisper) {
        analyzerRef.current.activateSchumannResonance(0.01)
      }
    }

    animationRef.current = requestAnimationFrame(analyzeAudio)
  }

  const stopAudio = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    if (analyzerRef.current) {
      analyzerRef.current.dispose()
    }
    setIsActive(false)
    setAudioData({
      amplitude: 0,
      pitch: 0,
      onset: null,
      peaks: [],
      harmonics: [],
      beatboxing: false,
      whisper: false,
      spectrum: new Array(128).fill(0),
      secretProgress: [0, 0, 0],
      isListening: false,
    })
  }

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (analyzerRef.current) {
        analyzerRef.current.dispose()
      }
    }
  }, [])

  return { audioData, isActive, startAudio, stopAudio }
}

function CosmicSpiralCanvas({ audioData, weather }) {
  const canvasRef = useRef(null)
  const spiralsRef = useRef([])
  const animationRef = useRef()
  const lastActivityRef = useRef(Date.now())
  const onsetCountRef = useRef(0)
  const doubleHumTimerRef = useRef(0)
  const [showHiddenMessage, setShowHiddenMessage] = useState(false)
  const [secretUnlocked, setSecretUnlocked] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    const animate = () => {
      // Create asphalt-like background with weather effects
      let baseColor = [45, 45, 50]

      if (weather?.condition === "sunny") {
        baseColor = [55, 50, 60]
      } else if (weather?.condition === "rainy") {
        baseColor = [35, 40, 45]
      } else if (weather?.condition === "stormy") {
        baseColor = [25, 25, 30]
      }

      ctx.fillStyle = `rgb(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]})`
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Add texture
      for (let i = 0; i < 200; i++) {
        const x = Math.random() * canvas.width
        const y = Math.random() * canvas.height
        const brightness = baseColor[0] + (Math.random() - 0.5) * 20
        ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`
        ctx.fillRect(x, y, 1, 1)
      }

      // Update activity timer
      if (audioData.amplitude > 0.1) {
        lastActivityRef.current = Date.now()
      }

      // Check for hidden message
      const timeSinceActivity = Date.now() - lastActivityRef.current
      if (timeSinceActivity > 10000 && !showHiddenMessage) {
        setShowHiddenMessage(true)
      } else if (timeSinceActivity <= 10000 && showHiddenMessage) {
        setShowHiddenMessage(false)
      }

      // Check for secret frequency unlock
      const secretSum = audioData.secretProgress.reduce((a, b) => a + b, 0)
      if (secretSum > 400 && !secretUnlocked) {
        setSecretUnlocked(true)
        // Flash effect
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      // Check for double hum (onset detection)
      if (audioData.onset?.onset) {
        onsetCountRef.current++
        doubleHumTimerRef.current = 60 // Reset timer (1 second)

        if (onsetCountRef.current >= 2) {
          // Find nearest spiral and split it
          const nearestSpiral = findNearestSpiral(canvas.width / 2, canvas.height / 2)
          if (nearestSpiral) {
            const newSpiral = nearestSpiral.split()
            if (newSpiral) {
              spiralsRef.current.push(newSpiral)
            }
          }
          onsetCountRef.current = 0
        }
      }

      // Decay double hum timer
      if (doubleHumTimerRef.current > 0) {
        doubleHumTimerRef.current--
        if (doubleHumTimerRef.current === 0) {
          onsetCountRef.current = 0
        }
      }

      // Update and draw spirals
      spiralsRef.current.forEach((spiral, index) => {
        spiral.update(audioData, spiralsRef.current)
        spiral.draw(ctx)

        // Remove dead spirals
        if (spiral.isDead && spiral.age > 3600) {
          spiralsRef.current.splice(index, 1)
        }
      })

      // Draw hidden message
      if (showHiddenMessage) {
        ctx.fillStyle = "rgba(100, 200, 255, 0.7)"
        ctx.font = "24px monospace"
        ctx.textAlign = "center"
        ctx.fillText("Children answered first.", canvas.width / 2, canvas.height / 2)
      }

      // Draw secret progress
      if (audioData.secretProgress.some((p) => p > 0)) {
        ctx.fillStyle = "rgba(255, 215, 0, 0.8)"
        ctx.font = "12px monospace"
        ctx.textAlign = "left"
        audioData.secretProgress.forEach((progress, i) => {
          const freq = [432, 528, 369][i]
          const percentage = ((progress / 180) * 100).toFixed(0)
          ctx.fillText(`${freq}Hz: ${percentage}%`, 10, 20 + i * 20)
        })
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    const findNearestSpiral = (x, y) => {
      let nearest = null
      let minDistance = Number.POSITIVE_INFINITY

      spiralsRef.current.forEach((spiral) => {
        const distance = Math.sqrt(Math.pow(spiral.centerX - x, 2) + Math.pow(spiral.centerY - y, 2))
        if (distance < minDistance) {
          minDistance = distance
          nearest = spiral
        }
      })

      return nearest
    }

    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      createSpiral(x, y)
      lastActivityRef.current = Date.now()
    }

    const createSpiral = (x, y) => {
      // Weather-adaptive colors
      const colors = ["#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8"]

      if (weather?.condition === "sunny") {
        colors.push("#FFD93D", "#FF6B6B", "#4ECDC4")
      } else if (weather?.condition === "stormy") {
        colors.push("#6C5CE7", "#A29BFE", "#74B9FF")
      }

      const color = colors[Math.floor(Math.random() * colors.length)]
      const spiral = new CosmicSpiral(x, y, color, Date.now().toString(), weather)
      spiralsRef.current.push(spiral)
    }

    canvas.addEventListener("click", handleClick)

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      canvas.removeEventListener("click", handleClick)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [audioData, weather, showHiddenMessage, secretUnlocked])

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg cursor-crosshair"
        style={{ minHeight: "500px" }}
      />
      {secretUnlocked && (
        <div className="absolute top-4 right-4 cosmic-glow">
          <Badge variant="secondary" className="animate-pulse">
            🌀 Quantum Tunnel Unlocked
          </Badge>
        </div>
      )}
    </div>
  )
}

// Audio Visualizer Component
function AudioVisualizer({ audioData }: { audioData: any }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const draw = () => {
      ctx.fillStyle = "rgba(10, 10, 15, 0.3)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const barWidth = canvas.width / audioData.spectrum.length

      audioData.spectrum.forEach((value: number, index: number) => {
        const barHeight = (value / 255) * canvas.height * 0.8
        const hue = 180 + (index / audioData.spectrum.length) * 60

        ctx.fillStyle = `hsl(${hue}, 70%, ${50 + (value / 255) * 30}%)`
        ctx.fillRect(index * barWidth, canvas.height - barHeight, barWidth - 1, barHeight)
      })

      requestAnimationFrame(draw)
    }

    draw()
  }, [audioData])

  return <canvas ref={canvasRef} className="w-full h-32 bg-slate-900 rounded-lg" />
}

function WeatherDisplay() {
  const [weather, setWeather] = useState({
    condition: "clear",
    temperature: 22,
    humidity: 45,
    windSpeed: 5,
    description: "Clear skies",
  })

  useEffect(() => {
    const conditions = [
      { condition: "sunny", description: "Sunny skies", temp: 25, wind: 3 },
      { condition: "cloudy", description: "Partly cloudy", temp: 20, wind: 8 },
      { condition: "rainy", description: "Light rain", temp: 18, wind: 12 },
      { condition: "stormy", description: "Thunderstorms", temp: 16, wind: 20 },
      { condition: "windy", description: "Windy conditions", temp: 22, wind: 25 },
    ]

    const randomWeather = conditions[Math.floor(Math.random() * conditions.length)]
    setWeather({
      ...randomWeather,
      temperature: randomWeather.temp + Math.random() * 10 - 5,
      humidity: 30 + Math.random() * 40,
      windSpeed: randomWeather.wind + Math.random() * 5,
    })

    // Update weather every 5 minutes
    const interval = setInterval(() => {
      const newWeather = conditions[Math.floor(Math.random() * conditions.length)]
      setWeather({
        ...newWeather,
        temperature: newWeather.temp + Math.random() * 10 - 5,
        humidity: 30 + Math.random() * 40,
        windSpeed: newWeather.wind + Math.random() * 5,
      })
    }, 300000)

    return () => clearInterval(interval)
  }, [])

  const getWeatherIcon = (condition) => {
    switch (condition) {
      case "sunny":
        return "☀️"
      case "cloudy":
        return "⛅"
      case "rainy":
        return "🌧️"
      case "stormy":
        return "⛈️"
      case "windy":
        return "💨"
      default:
        return "🌤️"
    }
  }

  return (
    <Card className="cosmic-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          {getWeatherIcon(weather.condition)}
          Weather Ambience
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-2xl font-bold text-cyan-400">{Math.round(weather.temperature)}°C</div>
        <div className="text-sm text-slate-400">{weather.description}</div>
        <div className="flex justify-between text-xs text-slate-500">
          <span>Humidity: {Math.round(weather.humidity)}%</span>
          <span>Wind: {Math.round(weather.windSpeed)} km/h</span>
        </div>
      </CardContent>
    </Card>
  )
}

export default function CosmicCreativePlayground() {
  const { audioData, isActive, startAudio, stopAudio } = useCosmicAudioAnalysis()
  const [activeTab, setActiveTab] = useState("spiral")
  const [weather, setWeather] = useState(null)

  // Get weather data for spiral effects
  useEffect(() => {
    const updateWeather = () => {
      const conditions = ["sunny", "cloudy", "rainy", "stormy", "windy"]
      const condition = conditions[Math.floor(Math.random() * conditions.length)]
      setWeather({
        condition,
        temperature: 15 + Math.random() * 20,
        humidity: 30 + Math.random() * 50,
        windSpeed: Math.random() * 20,
      })
    }

    updateWeather()
    const interval = setInterval(updateWeather, 300000) // 5 minutes

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-amber-400 bg-clip-text text-transparent">
                Cosmic Creative Playground
              </h1>
              <p className="text-slate-400 text-sm">Ultimate Edition - An interactive audio-visual experience</p>
            </div>

            <div className="flex items-center gap-4">
              <WeatherDisplay />

              <div className="flex items-center gap-2">
                {audioData.isListening && (
                  <Badge variant="secondary" className="cosmic-glow animate-pulse">
                    🎵 Listening
                  </Badge>
                )}

                {audioData.beatboxing && (
                  <Badge variant="secondary" className="cosmic-glow animate-pulse">
                    🥁 Beatboxing
                  </Badge>
                )}

                {audioData.whisper && (
                  <Badge variant="secondary" className="cosmic-glow animate-pulse">
                    🤫 Whisper
                  </Badge>
                )}

                <Button
                  onClick={isActive ? stopAudio : startAudio}
                  className={isActive ? "cosmic-button-active" : "cosmic-button"}
                >
                  {isActive ? "Stop Audio" : "Start Audio"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Audio Status Bar */}
      {isActive && (
        <div className="bg-slate-800/50 border-b border-slate-700">
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-slate-400">Amplitude:</span>
              <Progress value={audioData.amplitude * 100} className="w-24" />
              <span className="text-slate-400">Pitch:</span>
              <span className="text-cyan-400 font-mono">{Math.round(audioData.pitch)} Hz</span>
              <span className="text-slate-400">Peaks:</span>
              <span className="text-amber-400">{audioData.peaks.length}</span>
              {audioData.onset?.onset && (
                <Badge variant="secondary" className="animate-pulse">
                  Onset!
                </Badge>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50">
            <TabsTrigger value="spiral" className="cosmic-tab">
              🌀 Spiral Canvas
            </TabsTrigger>
            <TabsTrigger value="audio" className="cosmic-tab">
              🎵 Audio Lab
            </TabsTrigger>
            <TabsTrigger value="memory" className="cosmic-tab">
              🧠 Memory Palace
            </TabsTrigger>
            <TabsTrigger value="about" className="cosmic-tab">
              ℹ️ About
            </TabsTrigger>
          </TabsList>

          <TabsContent value="spiral" className="space-y-4">
            <Card className="cosmic-card">
              <CardHeader>
                <CardTitle className="text-cyan-400">🌀 Interactive Cosmic Spiral Canvas</CardTitle>
                <CardDescription>
                  Click to create spirals • Hum to make them glow • Double-hum to split • Hold 432Hz/528Hz/369Hz for
                  secrets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CosmicSpiralCanvas audioData={audioData} weather={weather} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audio" className="space-y-4">
            <Card className="cosmic-card">
              <CardHeader>
                <CardTitle className="text-cyan-400">🎵 Cosmic Audio Analysis Laboratory</CardTitle>
                <CardDescription>
                  Advanced real-time frequency analysis with binaural beats and Schumann resonance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <AudioVisualizer audioData={audioData} />

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400">Amplitude</label>
                    <div className="text-2xl font-mono text-cyan-400">{(audioData.amplitude * 100).toFixed(1)}%</div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400">Dominant Pitch</label>
                    <div className="text-2xl font-mono text-amber-400">{Math.round(audioData.pitch)} Hz</div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400">Harmonics</label>
                    <div className="text-2xl font-mono text-purple-400">{audioData.harmonics.length}</div>
                  </div>
                </div>

                {audioData.peaks.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400">Frequency Peaks</label>
                    <div className="flex flex-wrap gap-2">
                      {audioData.peaks.slice(0, 5).map((peak, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {Math.round(peak.frequency)}Hz
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="memory" className="space-y-4">
            <Card className="cosmic-card">
              <CardHeader>
                <CardTitle className="text-cyan-400">🧠 Memory Palace</CardTitle>
                <CardDescription>Visualize and explore your creative memories in 3D space</CardDescription>
              </CardHeader>
              <CardContent>
                <MemoryPalace />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="about" className="space-y-4">
            <Card className="cosmic-card">
              <CardHeader>
                <CardTitle className="text-cyan-400">🌌 About the Cosmic Playground</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-300">
                  Welcome to the Ultimate Cosmic Creative Playground - a sentient audio-visual experience that responds
                  to your voice, creates spirals that develop memories, and unlocks hidden dimensions through sound.
                </p>

                <div className="space-y-3">
                  <h4 className="font-semibold text-amber-400">🔥 Advanced Features:</h4>
                  <ul className="space-y-2 text-slate-300">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                      Cosmic spirals with memory, resonance, and splitting capabilities
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                      Advanced audio analysis with onset detection and pitch tracking
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                      Binaural beats and Schumann resonance activation
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                      Secret frequency detection (432Hz, 528Hz, 369Hz)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                      Weather-reactive environmental effects
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                      Hidden messages and quantum tunnel effects
                    </li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-amber-400">🎮 How to Play:</h4>
                  <ul className="space-y-2 text-slate-300 text-sm">
                    <li>• Click anywhere on the spiral canvas to create new spirals</li>
                    <li>• Hum or make sounds to make spirals glow and wiggle</li>
                    <li>• Make two quick sounds to split the nearest spiral</li>
                    <li>• Hold specific frequencies (432Hz, 528Hz, 369Hz) to unlock secrets</li>
                    <li>• Stay quiet for 10 seconds to see a hidden message</li>
                    <li>• Try beatboxing or whispering for special effects</li>
                  </ul>
                </div>

                <p className="text-sm text-slate-400">
                  🎤 Grant microphone access to unlock the full cosmic experience!
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
