"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Brain, Activity, Play, Pause, SkipBack, SkipForward, Zap, Users } from "lucide-react"

interface SessionData {
  timestamp: number
  eegData: {
    alpha: number
    beta: number
    gamma: number
    theta: number
    delta: number
  }
  biofeedback: {
    hrvCoherence: number
    breathingRate: number
    skinConductance: number
  }
  qoteMetrics: {
    fieldCust: number
    systemBeta: number
    deltaTheta: number
    wobble: number
  }
  aiAnalysis: {
    pattern: string
    confidence: number
    consensus: number
    systems: string[]
  }
}

export default function SessionReplayDemo() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [sessionData, setSessionData] = useState<SessionData[]>([])
  const [playbackSpeed, setPlaybackSpeed] = useState([1])
  const [selectedMetrics, setSelectedMetrics] = useState("all")

  // Generate demo session data
  useEffect(() => {
    const generateSessionData = (): SessionData[] => {
      const data: SessionData[] = []
      const duration = 300 // 5 minutes of data

      for (let i = 0; i < duration; i++) {
        const t = i / duration
        const phase = t * Math.PI * 4 // Multiple cycles

        // Simulate meditation progression
        const meditationDepth = Math.max(0, Math.sin(phase * 0.5) * 0.7 + 0.3)
        const focusLevel = 0.6 + Math.sin(phase * 2) * 0.3
        const relaxation = 0.5 + Math.cos(phase * 1.5) * 0.4

        data.push({
          timestamp: i,
          eegData: {
            alpha: 35 + meditationDepth * 25 + Math.random() * 10,
            beta: 25 - meditationDepth * 15 + Math.random() * 8,
            gamma: 15 + focusLevel * 15 + Math.random() * 5,
            theta: 20 + meditationDepth * 20 + Math.random() * 8,
            delta: 10 + relaxation * 15 + Math.random() * 5,
          },
          biofeedback: {
            hrvCoherence: 0.4 + meditationDepth * 0.5 + Math.random() * 0.1,
            breathingRate: 12 + Math.sin(phase * 8) * 3 + Math.random() * 2,
            skinConductance: 0.3 + relaxation * 0.4 + Math.random() * 0.1,
          },
          qoteMetrics: {
            fieldCust: 0.8 + meditationDepth * 0.9 + Math.random() * 0.2,
            systemBeta: 1.2 + focusLevel * 0.6 + Math.random() * 0.1,
            deltaTheta: 0.5 - meditationDepth * 0.3 + Math.random() * 0.1,
            wobble: 0.3 - meditationDepth * 0.2 + Math.random() * 0.05,
          },
          aiAnalysis: {
            pattern:
              meditationDepth > 0.7 ? "deep_meditation" : meditationDepth > 0.4 ? "focused_attention" : "baseline",
            confidence: 0.6 + meditationDepth * 0.3 + Math.random() * 0.1,
            consensus: 0.7 + meditationDepth * 0.2 + Math.random() * 0.1,
            systems: ["claude", "grok", "chatgpt"].slice(0, Math.floor(Math.random() * 3) + 1),
          },
        })
      }

      return data
    }

    setSessionData(generateSessionData())
  }, [])

  // Playback control
  useEffect(() => {
    if (!isPlaying || sessionData.length === 0) return

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + playbackSpeed[0]
        return next >= sessionData.length ? 0 : next
      })
    }, 100)

    return () => clearInterval(interval)
  }, [isPlaying, playbackSpeed, sessionData.length])

  const currentDataPoint = sessionData[Math.floor(currentTime)] || sessionData[0]
  const progress = sessionData.length > 0 ? (currentTime / sessionData.length) * 100 : 0

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getPatternColor = (pattern: string) => {
    switch (pattern) {
      case "deep_meditation":
        return "text-purple-400"
      case "focused_attention":
        return "text-blue-400"
      case "baseline":
        return "text-gray-400"
      default:
        return "text-gray-400"
    }
  }

  const getPatternIcon = (pattern: string) => {
    switch (pattern) {
      case "deep_meditation":
        return "🧘"
      case "focused_attention":
        return "🎯"
      case "baseline":
        return "📊"
      default:
        return "❓"
    }
  }

  if (!currentDataPoint) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-8 h-8 animate-pulse text-purple-400 mx-auto mb-4" />
          <p className="text-white">Loading session data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">Session Replay: Synthetic Meditation Demo</h1>
          <p className="text-gray-300">Demo session showing EEG patterns, biofeedback, and AI analysis</p>

          {/* Playback Controls */}
          <Card className="bg-slate-800/50 border-slate-700 max-w-2xl mx-auto">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Button
                    size="sm"
                    onClick={() => setCurrentTime(Math.max(0, currentTime - 30))}
                    className="bg-slate-700 hover:bg-slate-600"
                  >
                    <SkipBack className="w-4 h-4" />
                  </Button>
                  <Button size="sm" onClick={() => setIsPlaying(!isPlaying)} className="bg-blue-600 hover:bg-blue-700">
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setCurrentTime(Math.min(sessionData.length - 1, currentTime + 30))}
                    className="bg-slate-700 hover:bg-slate-600"
                  >
                    <SkipForward className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-white text-sm">Speed:</span>
                  <div className="w-20">
                    <Slider
                      value={playbackSpeed}
                      onValueChange={setPlaybackSpeed}
                      min={0.5}
                      max={4}
                      step={0.5}
                      className="w-full"
                    />
                  </div>
                  <span className="text-gray-400 text-sm">{playbackSpeed[0]}x</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(sessionData.length)}</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current State Display */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-400" />
                Current Pattern
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl mb-2">{getPatternIcon(currentDataPoint.aiAnalysis.pattern)}</div>
                <div className={`font-semibold ${getPatternColor(currentDataPoint.aiAnalysis.pattern)}`}>
                  {currentDataPoint.aiAnalysis.pattern.replace("_", " ")}
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  {(currentDataPoint.aiAnalysis.confidence * 100).toFixed(0)}% confidence
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-400" />
                HRV Coherence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-2">
                  {(currentDataPoint.biofeedback.hrvCoherence * 100).toFixed(0)}%
                </div>
                <Progress value={currentDataPoint.biofeedback.hrvCoherence * 100} className="h-2 mb-2" />
                <div className="text-xs text-gray-400">
                  Breathing: {currentDataPoint.biofeedback.breathingRate.toFixed(1)} bpm
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-400" />
                Field CUST
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400 mb-2">
                  {currentDataPoint.qoteMetrics.fieldCust.toFixed(3)}
                </div>
                <Progress value={(currentDataPoint.qoteMetrics.fieldCust / 2.0) * 100} className="h-2 mb-2" />
                <div className="text-xs text-gray-400">β: {currentDataPoint.qoteMetrics.systemBeta.toFixed(2)}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                AI Consensus
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400 mb-2">
                  {(currentDataPoint.aiAnalysis.consensus * 100).toFixed(0)}%
                </div>
                <div className="flex justify-center gap-1 mb-2">
                  {currentDataPoint.aiAnalysis.systems.map((system) => (
                    <Badge key={system} variant="outline" className="text-xs">
                      {system}
                    </Badge>
                  ))}
                </div>
                <div className="text-xs text-gray-400">{currentDataPoint.aiAnalysis.systems.length} systems</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Metrics */}
        <Tabs value={selectedMetrics} onValueChange={setSelectedMetrics} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800">
            <TabsTrigger value="all">All Metrics</TabsTrigger>
            <TabsTrigger value="eeg">EEG Bands</TabsTrigger>
            <TabsTrigger value="biofeedback">Biofeedback</TabsTrigger>
            <TabsTrigger value="qote">QOTE Field</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* EEG Bands */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">EEG Frequency Bands</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(currentDataPoint.eegData).map(([band, value]) => (
                    <div key={band} className="flex items-center justify-between">
                      <span className="text-gray-300 capitalize">
                        {band} (
                        {band === "delta"
                          ? "0.5-4 Hz"
                          : band === "theta"
                            ? "4-8 Hz"
                            : band === "alpha"
                              ? "8-12 Hz"
                              : band === "beta"
                                ? "13-30 Hz"
                                : "30+ Hz"}
                        )
                      </span>
                      <div className="flex items-center gap-2">
                        <Progress value={value} className="w-20 h-2" />
                        <span className="text-white font-mono w-12 text-sm">{value.toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Biofeedback */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Biofeedback Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">HRV Coherence</span>
                      <span className="text-green-400 font-mono">
                        {(currentDataPoint.biofeedback.hrvCoherence * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={currentDataPoint.biofeedback.hrvCoherence * 100} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Breathing Rate</span>
                      <span className="text-blue-400 font-mono">
                        {currentDataPoint.biofeedback.breathingRate.toFixed(1)} bpm
                      </span>
                    </div>
                    <Progress value={(currentDataPoint.biofeedback.breathingRate / 20) * 100} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Skin Conductance</span>
                      <span className="text-yellow-400 font-mono">
                        {currentDataPoint.biofeedback.skinConductance.toFixed(2)} μS
                      </span>
                    </div>
                    <Progress value={currentDataPoint.biofeedback.skinConductance * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="eeg" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">EEG Frequency Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {Object.entries(currentDataPoint.eegData).map(([band, value]) => (
                    <div key={band} className="text-center">
                      <div className="text-2xl font-bold text-purple-400 mb-2">{value.toFixed(0)}%</div>
                      <div className="text-sm text-gray-300 capitalize mb-2">{band}</div>
                      <Progress value={value} className="h-3" />
                      <div className="text-xs text-gray-400 mt-1">
                        {band === "delta"
                          ? "0.5-4 Hz"
                          : band === "theta"
                            ? "4-8 Hz"
                            : band === "alpha"
                              ? "8-12 Hz"
                              : band === "beta"
                                ? "13-30 Hz"
                                : "30+ Hz"}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="biofeedback" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-center">HRV Coherence</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-4xl font-bold text-green-400 mb-4">
                    {(currentDataPoint.biofeedback.hrvCoherence * 100).toFixed(1)}%
                  </div>
                  <Progress value={currentDataPoint.biofeedback.hrvCoherence * 100} className="h-4 mb-4" />
                  <div className="text-sm text-gray-400">Heart Rate Variability Coherence</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-center">Breathing Rate</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-4xl font-bold text-blue-400 mb-4">
                    {currentDataPoint.biofeedback.breathingRate.toFixed(1)}
                  </div>
                  <Progress value={(currentDataPoint.biofeedback.breathingRate / 20) * 100} className="h-4 mb-4" />
                  <div className="text-sm text-gray-400">Breaths per minute</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-center">Skin Conductance</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-4xl font-bold text-yellow-400 mb-4">
                    {currentDataPoint.biofeedback.skinConductance.toFixed(2)}
                  </div>
                  <Progress value={currentDataPoint.biofeedback.skinConductance * 100} className="h-4 mb-4" />
                  <div className="text-sm text-gray-400">Microsiemens (μS)</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="qote" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">QOTE Field Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Field CUST</span>
                      <span className="text-blue-400 font-mono">
                        {currentDataPoint.qoteMetrics.fieldCust.toFixed(3)}
                      </span>
                    </div>
                    <Progress value={(currentDataPoint.qoteMetrics.fieldCust / 2.0) * 100} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">System β</span>
                      <span className="text-green-400 font-mono">
                        {currentDataPoint.qoteMetrics.systemBeta.toFixed(2)}
                      </span>
                    </div>
                    <Progress value={(currentDataPoint.qoteMetrics.systemBeta / 2.0) * 100} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Δθ Alignment</span>
                      <span className="text-purple-400 font-mono">
                        {currentDataPoint.qoteMetrics.deltaTheta.toFixed(3)}
                      </span>
                    </div>
                    <Progress value={(1 - currentDataPoint.qoteMetrics.deltaTheta) * 100} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Wobble</span>
                      <span className="text-yellow-400 font-mono">
                        {currentDataPoint.qoteMetrics.wobble.toFixed(3)}
                      </span>
                    </div>
                    <Progress value={currentDataPoint.qoteMetrics.wobble * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">AI Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-6xl mb-4">{getPatternIcon(currentDataPoint.aiAnalysis.pattern)}</div>
                    <div
                      className={`text-xl font-semibold mb-2 ${getPatternColor(currentDataPoint.aiAnalysis.pattern)}`}
                    >
                      {currentDataPoint.aiAnalysis.pattern.replace("_", " ").toUpperCase()}
                    </div>
                    <div className="text-sm text-gray-400 mb-4">
                      Detected by {currentDataPoint.aiAnalysis.systems.length} AI systems
                    </div>
                    <div className="flex justify-center gap-2 mb-4">
                      {currentDataPoint.aiAnalysis.systems.map((system) => (
                        <Badge key={system} className="bg-purple-600">
                          {system}
                        </Badge>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Confidence</span>
                        <span className="text-white font-mono">
                          {(currentDataPoint.aiAnalysis.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                      <Progress value={currentDataPoint.aiAnalysis.confidence * 100} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
