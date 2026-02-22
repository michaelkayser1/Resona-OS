"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Play, Pause, RotateCcw, Zap, Brain, Target, BarChart3 } from "lucide-react"
import Link from "next/link"
import { QOTEEngine } from "@/lib/qote-engine"
import { ResonanceVisualizer } from "@/components/resonance-visualizer"
import { PhaseChart } from "@/components/phase-chart"
import { ButterflyWings } from "@/components/butterfly-wings"
import { ContentLadder } from "@/components/content-ladder"
import { QOTE3DVisualizer } from "@/components/qote-3d-visualizer"
import AdvancedQOTEFeatures from "@/components/advanced-qote-features"

export default function DemoPage() {
  const [prompt, setPrompt] = useState("")
  const [response, setResponse] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [qoteData, setQoteData] = useState(null)
  const [resonanceLevel, setResonanceLevel] = useState(0)
  const [phaseCoherence, setPhaseCoherence] = useState(0)
  const [contentLevel, setContentLevel] = useState(1)

  // QOTE Parameters
  const [coupling, setCoupling] = useState([0.5])
  const [threshold, setThreshold] = useState([0.618]) // Golden ratio
  const [personalization, setPersonalization] = useState([0.3])

  const qoteEngine = useRef(new QOTEEngine())

  const handleSubmit = async () => {
    if (!prompt.trim()) return

    setIsProcessing(true)
    setResponse("")

    try {
      const apiResponse = await fetch("/api/qote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          parameters: {
            coupling: coupling[0],
            threshold: threshold[0],
            personalization: personalization[0],
          },
          provider: "openai", // Use OpenAI by default
        }),
      })

      if (!apiResponse.ok) {
        throw new Error("API request failed")
      }

      const data = await apiResponse.json()

      if (data.success) {
        const result = data.result
        setQoteData(result)
        setResonanceLevel(result.resonance)
        setPhaseCoherence(result.coherence)
        setResponse(result.response)

        if (result.resonance > 0.8) setContentLevel(Math.min(contentLevel + 1, 5))
      } else {
        throw new Error(data.error || "Unknown error")
      }
    } catch (error) {
      console.error("[v0] QOTE processing error:", error)
      setResponse(
        `Error processing request: ${error instanceof Error ? error.message : "Please check your API keys in environment variables and try again."}`,
      )
    } finally {
      setIsProcessing(false)
    }
  }

  const resetDemo = () => {
    setPrompt("")
    setResponse("")
    setQoteData(null)
    setResonanceLevel(0)
    setPhaseCoherence(0)
    qoteEngine.current.reset()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">QOTE Demo</h1>
                <p className="text-xs text-muted-foreground">Live Quantum Oscillatory Processing</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              {phaseCoherence > 0.618 ? "Coherent" : "Synchronizing"}
            </Badge>
            <Badge variant="outline">Level {contentLevel}</Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Interface */}
          <div className="lg:col-span-2 space-y-6">
            {/* Input Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="w-5 h-5 mr-2" />
                  Prompt Input
                </CardTitle>
                <CardDescription>Enter your prompt to experience QOTE's quantum-inspired processing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Ask anything... QOTE will synchronize token phases for optimal coherence"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[120px] resize-none"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={handleSubmit}
                      disabled={isProcessing || !prompt.trim()}
                      className="flex items-center"
                    >
                      {isProcessing ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                      {isProcessing ? "Processing..." : "Process with QOTE"}
                    </Button>
                    <Button variant="outline" onClick={resetDemo}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">{prompt.length} characters</div>
                </div>
              </CardContent>
            </Card>

            {/* Response Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    QOTE Response
                  </div>
                  {resonanceLevel > 0 && (
                    <Badge variant="secondary">Resonance: {(resonanceLevel * 100).toFixed(1)}%</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  AI response optimized through phase synchronization and coherence gating
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isProcessing ? (
                  <div className="space-y-4">
                    <div className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                      <div className="h-4 bg-muted rounded w-5/6"></div>
                    </div>
                    <Progress value={phaseCoherence * 100} className="w-full" />
                    <p className="text-sm text-muted-foreground">
                      Synchronizing token phases... Current coherence: {(phaseCoherence * 100).toFixed(1)}%
                    </p>
                  </div>
                ) : response ? (
                  <div className="space-y-4">
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <p className="whitespace-pre-wrap">{response}</p>
                    </div>
                    {qoteData && (
                      <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {(qoteData.coherence * 100).toFixed(1)}%
                          </div>
                          <div className="text-xs text-muted-foreground">Coherence</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {(qoteData.resonance * 100).toFixed(1)}%
                          </div>
                          <div className="text-xs text-muted-foreground">Resonance</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">{qoteData.entropy.toFixed(3)}</div>
                          <div className="text-xs text-muted-foreground">Entropy</div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Enter a prompt above to see QOTE in action</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Controls & Visualizations */}
          <div className="space-y-6">
            {/* QOTE Parameters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">QOTE Parameters</CardTitle>
                <CardDescription>Fine-tune the quantum oscillatory processing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Coupling Strength: {coupling[0].toFixed(2)}</label>
                  <Slider value={coupling} onValueChange={setCoupling} max={1} min={0} step={0.01} className="w-full" />
                  <p className="text-xs text-muted-foreground mt-1">Controls phase synchronization intensity</p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">CUST Threshold: {threshold[0].toFixed(3)}</label>
                  <Slider
                    value={threshold}
                    onValueChange={setThreshold}
                    max={1}
                    min={0.1}
                    step={0.001}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Golden ratio coherence gate (φ ≈ 0.618)</p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Δθ Personalization: {personalization[0].toFixed(2)}
                  </label>
                  <Slider
                    value={personalization}
                    onValueChange={setPersonalization}
                    max={1}
                    min={0}
                    step={0.01}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Adaptive phase adjustment strength</p>
                </div>
              </CardContent>
            </Card>

            {/* Visualizations */}
            <Tabs defaultValue="3d" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="3d">3D</TabsTrigger>
                <TabsTrigger value="butterfly">Butterfly</TabsTrigger>
                <TabsTrigger value="resonance">Resonance</TabsTrigger>
                <TabsTrigger value="phases">Phases</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>
              <TabsContent value="3d">
                <QOTE3DVisualizer data={qoteData} />
              </TabsContent>
              <TabsContent value="butterfly">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Butterfly Wings Attractor</CardTitle>
                    <CardDescription>Strange attractor visualization that tightens as R increases</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ButterflyWings data={qoteData} />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="resonance">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Resonance Map</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResonanceVisualizer data={qoteData} />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="phases">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Phase Dynamics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PhaseChart data={qoteData} />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="advanced">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Advanced QOTE Features</CardTitle>
                    <CardDescription>Enhanced 3D visualization with audio feedback and data export</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <AdvancedQOTEFeatures />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Content Ladder */}
            <ContentLadder level={contentLevel} resonance={resonanceLevel} />
          </div>
        </div>
      </div>
    </div>
  )
}
