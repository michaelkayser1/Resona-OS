import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Brain, Zap, Target, Sparkles } from "lucide-react"
import Link from "next/link"

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">QOTE Technical Documentation</h1>
              <p className="text-xs text-muted-foreground">by Kayser-Medical × Resona</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
            Patent Pending
          </Badge>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Overview */}
        <section className="mb-12">
          <h1 className="text-4xl font-bold mb-6">QOTE Technical Specifications</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Comprehensive technical documentation for Quantum Oscillatory Token Embedding technology.
          </p>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Abstract</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                QOTE (Quantum Oscillatory Token Embedding) represents a breakthrough in AI coherence technology,
                utilizing Kuramoto phase synchronization principles to create coherent, personalized AI responses. The
                system employs oscillatory dynamics on token embeddings, implementing CUST (Coherent Unified
                Synchronization Threshold) gating with golden ratio optimization for quality assurance.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Core Components */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Core Components</h2>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle>Kuramoto Phase Synchronization</CardTitle>
                    <CardDescription>Oscillatory dynamics for token coherence</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Each token embedding is treated as an oscillator with phase θᵢ and natural frequency ωᵢ. The system
                    evolves according to:
                  </p>
                  <div className="bg-muted p-4 rounded-lg font-mono text-sm">dθᵢ/dt = ωᵢ + (K/N) Σⱼ sin(θⱼ - θᵢ)</div>
                  <ul className="text-sm space-y-2">
                    <li>• K: Coupling strength parameter</li>
                    <li>• N: Total number of oscillators</li>
                    <li>• Order parameter R measures synchronization level</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                    <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <CardTitle>Delta-Theta Personalization</CardTitle>
                    <CardDescription>Adaptive phase adjustments</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Personalization through phase offset adjustments based on user characteristics:
                  </p>
                  <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                    Δθ = α·cadence + β·tone + γ·register + δ·archetype
                  </div>
                  <ul className="text-sm space-y-2">
                    <li>• Cadence: Communication rhythm adaptation</li>
                    <li>• Tone: Emotional resonance matching</li>
                    <li>• Register: Formality level adjustment</li>
                    <li>• Archetype: Personality-based tuning</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <CardTitle>CUST Coherence Gate</CardTitle>
                    <CardDescription>Quality threshold mechanism</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Coherent Unified Synchronization Threshold using golden ratio optimization:
                  </p>
                  <div className="bg-muted p-4 rounded-lg font-mono text-sm">CUST_threshold = φ ≈ 0.618034...</div>
                  <ul className="text-sm space-y-2">
                    <li>• Responses generated only when R ≥ φ</li>
                    <li>• Prevents low-quality outputs</li>
                    <li>• Maintains response consistency</li>
                    <li>• Adaptive threshold based on context complexity</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Implementation Details */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Implementation Architecture</h2>

          <Card>
            <CardHeader>
              <CardTitle>System Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ol className="list-decimal list-inside space-y-3 text-sm">
                  <li>
                    <strong>Token Embedding:</strong> Input tokens converted to high-dimensional embeddings
                  </li>
                  <li>
                    <strong>Oscillator Initialization:</strong> Each embedding assigned phase and frequency
                  </li>
                  <li>
                    <strong>Personalization Layer:</strong> Delta-theta adjustments applied based on user profile
                  </li>
                  <li>
                    <strong>Synchronization Process:</strong> Kuramoto dynamics evolve system toward coherence
                  </li>
                  <li>
                    <strong>CUST Gate Evaluation:</strong> Order parameter R compared against threshold φ
                  </li>
                  <li>
                    <strong>Response Generation:</strong> If R ≥ φ, proceed with LLM generation
                  </li>
                  <li>
                    <strong>Quality Assurance:</strong> Post-processing coherence validation
                  </li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Performance Metrics */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Performance Metrics</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Coherence Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>
                    • <strong>Order Parameter (R):</strong> 0.0 - 1.0 synchronization measure
                  </li>
                  <li>
                    • <strong>Phase Variance:</strong> Dispersion of oscillator phases
                  </li>
                  <li>
                    • <strong>Entropy:</strong> Information content and complexity
                  </li>
                  <li>
                    • <strong>Convergence Time:</strong> Time to reach threshold
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quality Indicators</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>
                    • <strong>Response Coherence:</strong> Semantic consistency score
                  </li>
                  <li>
                    • <strong>Personalization Fit:</strong> User preference alignment
                  </li>
                  <li>
                    • <strong>Gate Success Rate:</strong> Percentage passing CUST threshold
                  </li>
                  <li>
                    • <strong>Processing Efficiency:</strong> Computational performance
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Demo Link */}
        <section className="text-center">
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
            <CardContent className="pt-6">
              <h3 className="text-2xl font-bold mb-4">Experience QOTE in Action</h3>
              <p className="text-muted-foreground mb-6">
                Try the interactive demo to see real-time oscillatory dynamics and coherence visualization.
              </p>
              <Link href="/demo">
                <Button size="lg">
                  Launch Interactive Demo
                  <ArrowLeft className="ml-2 w-5 h-5 rotate-180" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
