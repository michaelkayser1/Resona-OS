import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Zap, Brain, Target, BarChart3, Lock, Sparkles, Volume2, Download, RotateCcw } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">QOTE</h1>
              <p className="text-xs text-muted-foreground">by Kayser-Medical × Resona</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
            Patent Pending
          </Badge>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge className="mb-4 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            Quantum Oscillatory Token Embedding
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
            The Future of
            <span className="text-primary"> Coherent AI</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
            Revolutionary patent-pending technology that synchronizes AI responses through quantum-inspired oscillatory
            embeddings and personalized coherence gating.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/demo">
              <Button size="lg" className="text-lg px-8">
                Try Live Demo
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/docs">
              <Button variant="outline" size="lg" className="text-lg px-8 bg-transparent">
                View Technical Specs
              </Button>
            </Link>
          </div>
          <div className="mt-8 p-4 bg-gradient-to-r from-purple-100 to-cyan-100 dark:from-purple-900/20 dark:to-cyan-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Badge
                variant="secondary"
                className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
              >
                NEW
              </Badge>
              <span className="font-semibold text-purple-800 dark:text-purple-200">Advanced Features Available</span>
            </div>
            <p className="text-sm text-purple-700 dark:text-purple-300 mb-3">
              Experience 3D visualization, real-time audio sonification, and data export capabilities
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-purple-600 dark:text-purple-400">
              <div className="flex items-center gap-1">
                <Volume2 className="w-3 h-3" />
                Audio Feedback
              </div>
              <div className="flex items-center gap-1">
                <RotateCcw className="w-3 h-3" />
                3D Interaction
              </div>
              <div className="flex items-center gap-1">
                <Download className="w-3 h-3" />
                Data Export
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Revolutionary Technology Stack</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            QOTE combines cutting-edge physics principles with advanced AI to deliver unprecedented coherence and
            personalization.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle>Kuramoto Phase Sync</CardTitle>
              <CardDescription>
                Synchronizes prompt tokens using oscillatory dynamics for coherent AI responses
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle>∆θ Personalization</CardTitle>
              <CardDescription>
                Adaptive phase adjustments based on user cadence, tone, register, and archetype
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle>CUST Coherence Gate</CardTitle>
              <CardDescription>Golden ratio threshold (φ ≈ 0.618) ensures optimal response quality</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <CardTitle>Resonance Mapping</CardTitle>
              <CardDescription>
                Real-time visualization of phase coherence, entropy, and timing dynamics
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle>Content Ladder</CardTitle>
              <CardDescription>Progressive content unlocking based on achieved resonance levels</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors relative overflow-hidden">
            <div className="absolute top-2 right-2">
              <Badge
                variant="secondary"
                className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-xs"
              >
                Enhanced
              </Badge>
            </div>
            <CardHeader>
              <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              </div>
              <CardTitle>Multi-Sensory Experience</CardTitle>
              <CardDescription>
                3D visualization, audio sonification, and interactive controls with data export capabilities
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Technical Innovation */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Patent-Pending Innovation</h2>
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div>
                <h3 className="text-xl font-semibold mb-4">Oscillatory Embeddings</h3>
                <p className="text-muted-foreground mb-4">
                  Our breakthrough approach treats token embeddings as oscillators, enabling natural synchronization
                  patterns that mirror biological neural networks.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                    Order parameter R calculation
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                    Phase variance optimization
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                    Iterative convergence control
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">Coherence Intelligence</h3>
                <p className="text-muted-foreground mb-4">
                  QOTE's CUST gate ensures responses only generate when coherence thresholds are met, preventing
                  low-quality outputs and maintaining consistency.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                    Golden ratio threshold optimization
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                    Attention-entropy proxy metrics
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                    Multi-agent coherence voting
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Experience QOTE Today</h2>
          <p className="text-muted-foreground mb-8">
            Ready to deploy? This demo includes everything you need to showcase revolutionary AI coherence technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/demo">
              <Button size="lg" className="text-lg px-8">
                Launch Demo
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="https://github.com/kayser-medical/qote-demo" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg" className="text-lg px-8 bg-transparent">
                Download Source
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">QOTE by Kayser-Medical × Resona</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Patent Pending • Quantum Oscillatory Token Embedding Technology
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
