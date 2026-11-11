"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EMWaveCanvas } from "@/components/recovered/light/em-wave-canvas"
import { FaradayRotationCanvas } from "@/components/recovered/light/faraday-rotation-canvas"
import { WobbleIrisCanvas } from "@/components/recovered/light/wobble-iris-canvas"
import { RotationGraph } from "@/components/recovered/light/rotation-graph"
import { SplashScreen } from "@/components/recovered/light/splash-screen"
import { LearnPanel } from "@/components/recovered/light/learn-panel"
import { Play, Pause, RotateCcw, BookOpen, Copy, Check, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function Home() {
  const [showSplash, setShowSplash] = useState(true)
  const [deltaTheta, setDeltaTheta] = useState(0.1)
  const [frequency, setFrequency] = useState(5e14)
  const [wavelength, setWavelength] = useState(600)
  const [lightRange, setLightRange] = useState<"visible" | "near-ir">("visible")
  const [isPlaying, setIsPlaying] = useState(true)
  const [time, setTime] = useState(0)
  const [mode, setMode] = useState<"physics" | "qote" | "unified">("physics")
  const [timeLapse, setTimeLapse] = useState(false)
  const [learnPanelOpen, setLearnPanelOpen] = useState(false)
  const [copiedSubstack, setCopiedSubstack] = useState(false)
  const [copiedNarration, setCopiedNarration] = useState(false)

  const c = 3e8
  const rhoZp = 1

  const omega = 2 * Math.PI * frequency
  const W = omega * rhoZp * deltaTheta
  const S = W > 0 ? 1 / W : Number.POSITIVE_INFINITY
  const rotationAngle = deltaTheta * 100

  const magneticContribution = lightRange === "visible" ? 17 : 70

  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(
      () => {
        setTime((t) => t + (timeLapse ? 0.1 : 0.01))
      },
      timeLapse ? 10 : 16,
    )

    return () => clearInterval(interval)
  }, [isPlaying, timeLapse])

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 2000) // 2 seconds guaranteed timeout
    return () => clearTimeout(timer)
  }, []) // Empty dependency array - runs once only

  const handleLightRangeChange = (range: "visible" | "near-ir") => {
    setLightRange(range)
    if (range === "visible") {
      setWavelength(600)
      setFrequency(c / (600 * 1e-9))
    } else {
      setWavelength(850)
      setFrequency(c / (850 * 1e-9))
    }
  }

  const copySubstack = async () => {
    const text = `When Light Admits Its Wobble

For 180 years we ignored the magnetic twin of the electromagnetic wave.

Then experiments showed that this 'negligible' wobble could drive up to 70% of Faraday rotation in the near-infrared.

The QOTE Light Wobble Explorer visualizes that hidden twist — and shows how a tiny angular deviation (Δθ) generates structure, rotation, and meaning across scales.

Slide Δθ. Watch the iris open.
Watch physics and QOTE converge.`

    await navigator.clipboard.writeText(text)
    setCopiedSubstack(true)
    setTimeout(() => setCopiedSubstack(false), 2000)
  }

  const copyNarration = async () => {
    const text = `For nearly two centuries we dismissed the magnetic side of light as too weak to matter.
Then a new class of experiments revealed that this quiet wobble could dominate the rotation of polarized beams.

The QOTE Light Wobble Explorer lets you see that wobble unfold — not just as a physics effect, but as a universal pattern.

As Δθ rises, light twists, stability falls, and a hidden geometry appears.

This is more than optics.
This is the template of creation.`

    await navigator.clipboard.writeText(text)
    setCopiedNarration(true)
    setTimeout(() => setCopiedNarration(false), 2000)
  }

  if (showSplash) {
    return (
      <SplashScreen
        onComplete={() => {
          setShowSplash(false)
        }}
      />
    )
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 p-4 md:p-8">
        <div className="max-w-[1800px] mx-auto space-y-6">
          <header className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-electric via-coherence to-magnetic bg-clip-text text-transparent">
                QOTE Light Wobble Explorer
              </h1>
              <p className="text-muted-foreground text-sm italic">"When light admits its wobble."</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setLearnPanelOpen(!learnPanelOpen)}
                variant={learnPanelOpen ? "default" : "outline"}
                className="min-h-11 min-w-11 border-electric/30"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Learn
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={copySubstack} variant="outline" className="border-magnetic/30 bg-transparent">
                    {copiedSubstack ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                    Substack
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy Substack intro</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={copyNarration} variant="outline" className="border-coherence/30 bg-transparent">
                    {copiedNarration ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                    Narration
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy documentary narration</TooltipContent>
              </Tooltip>
            </div>
          </header>

          <div className="grid lg:grid-cols-[1fr_400px] gap-6">
            <div className="space-y-6">
              <Card className="p-6 border-electric/20 bg-card/95 backdrop-blur">
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setIsPlaying(!isPlaying)}
                        variant="outline"
                        size="icon"
                        className="min-h-11 min-w-11 border-electric/30"
                      >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button onClick={() => setTime(0)} variant="outline" size="icon" className="min-h-11 min-w-11 border-electric/30">
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => setTimeLapse(!timeLapse)}
                        variant={timeLapse ? "default" : "outline"}
                        className="min-h-11 min-w-11 border-electric/30"
                      >
                        {timeLapse ? "⚡ Time-lapse" : "⏱ Normal"}
                      </Button>
                    </div>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Tabs value={mode} onValueChange={(v) => setMode(v as any)}>
                          <TabsList className="bg-muted/50">
                            <TabsTrigger className="min-h-11" value="physics">Physics</TabsTrigger>
                            <TabsTrigger className="min-h-11" value="qote">QOTE</TabsTrigger>
                            <TabsTrigger className="min-h-11" value="unified">Unified</TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </TooltipTrigger>
                      <TooltipContent>Switch between pure physics, QOTE interpretation, or both at once</TooltipContent>
                    </Tooltip>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <label className="text-sm font-medium flex items-center gap-2 cursor-help">
                            <span className="text-magnetic">Geometric Deviation (Δθ)</span>
                            <Info className="h-3 w-3 text-muted-foreground" />
                          </label>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          Small angular mismatch between electric and magnetic oscillations. This is the "wobble."
                        </TooltipContent>
                      </Tooltip>
                      <span className="text-lg font-mono text-magnetic">{deltaTheta.toFixed(4)}</span>
                    </div>
                    <Slider
                      value={[deltaTheta]}
                      onValueChange={([v]) => setDeltaTheta(v)}
                      min={0}
                      max={1}
                      step={0.001}
                      aria-label="Geometric deviation" className="min-h-11 [&_[role=slider]]:size-6 [&_[role=slider]]:bg-magnetic [&_[role=slider]]:border-magnetic"
                    />
                    <p className="text-xs text-muted-foreground">
                      As Δθ increases: red wobble amplitude ↑ • rotation speed ↑ • iris distortion ↑
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <span>Light Range</span>
                    </label>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleLightRangeChange("visible")}
                        variant={lightRange === "visible" ? "default" : "outline"}
                        className="min-h-11 flex-1"
                      >
                        Visible Light
                      </Button>
                      <Button
                        onClick={() => handleLightRangeChange("near-ir")}
                        variant={lightRange === "near-ir" ? "default" : "outline"}
                        className="min-h-11 flex-1"
                      >
                        Near-IR
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {lightRange === "visible"
                        ? `≈ ${magneticContribution}% rotation due to magnetic field`
                        : `≈ ${magneticContribution}% rotation due to magnetic field`}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Visualization Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* EM Wave */}
                <Card className="p-6 border-electric/20 bg-card/95 backdrop-blur">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-electric animate-pulse" />
                    Electromagnetic Wave
                  </h3>
                  <EMWaveCanvas deltaTheta={deltaTheta} time={time} wavelength={wavelength} />
                  {mode !== "qote" && (
                    <div className="mt-4 p-3 bg-muted/30 rounded-lg text-sm space-y-1 font-mono">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Electric:</span>
                        <span className="text-electric">E = E₀ sin(kx - ωt)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Magnetic:</span>
                        <span className="text-magnetic">B = B₀ sin(kx - ωt + Δθ)</span>
                      </div>
                    </div>
                  )}
                </Card>

                {/* Faraday Rotation */}
                <Card className="p-6 border-magnetic/20 bg-card/95 backdrop-blur">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-magnetic animate-pulse" />
                    Faraday Rotation
                  </h3>
                  <FaradayRotationCanvas deltaTheta={deltaTheta} time={time} rotationAngle={rotationAngle} />
                  {mode !== "qote" && (
                    <div className="mt-4 p-3 bg-muted/30 rounded-lg text-sm space-y-1 font-mono">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Rotation:</span>
                        <span className="text-magnetic">{rotationAngle.toFixed(2)}°</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Magnetic:</span>
                        <span className="text-coherence">{magneticContribution}%</span>
                      </div>
                    </div>
                  )}
                </Card>

                {/* Wobble Iris */}
                <Card className="p-6 border-coherence/20 bg-card/95 backdrop-blur">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-coherence animate-pulse" />
                    QOTE Wobble Iris
                  </h3>
                  <WobbleIrisCanvas deltaTheta={deltaTheta} time={time} W={W} />
                  {mode !== "physics" && (
                    <div className="mt-4 p-3 bg-muted/30 rounded-lg text-sm space-y-1 font-mono">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">Wobble W:</span>
                        <span className="text-coherence">{W.toExponential(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">Formula:</span>
                        <span className="text-coherence text-xs">
                          W = ω ρ<sub>zp</sub> Δθ
                        </span>
                      </div>
                    </div>
                  )}
                </Card>

                {/* Stability Metrics */}
                <Card className="p-6 border-primary/20 bg-card/95 backdrop-blur">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    Stability Metrics
                  </h3>
                  <RotationGraph deltaTheta={deltaTheta} />

                  <div className="mt-6 space-y-4">
                    <div className="space-y-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex justify-between items-center cursor-help">
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              Stability (S)
                              <Info className="h-3 w-3" />
                            </span>
                            <span className="text-2xl font-bold font-mono text-coherence">
                              {S === Number.POSITIVE_INFINITY ? "∞" : S.toExponential(2)}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>Higher is more stable. As wobble increases, stability drops.</TooltipContent>
                      </Tooltip>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            deltaTheta < 0.3 ? "bg-green-500" : deltaTheta < 0.6 ? "bg-amber-500" : "bg-red-500"
                          }`}
                          style={{ width: `${Math.min(100, Math.max(5, (1 / W) * 10))}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">S = 1/W</p>
                    </div>

                    {mode === "unified" && (
                      <div className="p-4 bg-coherence/10 border border-coherence/30 rounded-lg space-y-2">
                        <h4 className="font-semibold text-sm text-coherence">Unified View</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Classical Faraday rotation and QOTE wobble geometry exhibit identical behavior. The magnetic
                          contribution ({magneticContribution}%) maps to observer coherence in the W-field.
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>

            {learnPanelOpen && (
              <div className="lg:sticky lg:top-4 lg:self-start">
                <LearnPanel />
              </div>
            )}
          </div>

          <footer className="text-right text-xs text-muted-foreground py-4 border-t border-border/50">
            Design & QOTE framework: Michael Kayser · Visualization by QOTE Light Wobble Explorer
          </footer>
        </div>
      </div>
    </TooltipProvider>
  )
}
