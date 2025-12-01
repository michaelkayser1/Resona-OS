import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Zap, Target, Users, FileText } from "lucide-react"
import QOTECore from "@/components/qote-core"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-chart-1 bg-clip-text text-transparent mb-2">
              QOTE Framework Demo
            </h1>
            <p className="text-xl text-muted-foreground mb-2">
              Oscillatory Neural Framework for Resonant Coherence and Relational Adaptation
            </p>
            <p className="text-sm text-muted-foreground">
              Patent Application by <strong>Dr. Michael A. Kayser, DO, FACMG</strong> • Filed August 27, 2025
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Introduction */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-primary" />
              Revolutionary AI Architecture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              The QOTE framework introduces <strong>oscillatory dynamics</strong> into transformer architectures,
              enabling unprecedented coherence control, personalization, and interpretability. This interactive demo
              showcases the core innovations: <strong>Kuramoto synchronization</strong>,{" "}
              <strong>phase-coherent attention</strong>,<strong>relational Δθ adaptation</strong>, and{" "}
              <strong>coherence-gated outputs</strong>.
            </p>
          </CardContent>
        </Card>

        {/* Key Innovations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-5 h-5 text-chart-1" />
                <h3 className="font-semibold text-sm">Oscillatory Embeddings</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Tokens as complex oscillators z = a·e^(iθ) enabling natural synchronization dynamics
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-chart-2" />
                <h3 className="font-semibold text-sm">Kuramoto Sync</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Phase alignment through coupled oscillator dynamics with relational offsets
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-chart-3" />
                <h3 className="font-semibold text-sm">CUST Gating</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Output blocked until coherence R ≥ τ preventing unstable generation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-chart-4" />
                <h3 className="font-semibold text-sm">Relational Δθ</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                User archetype controls phase offset for personalized processing
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Demo */}
        <QOTECore />

        {/* Technical Details */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              Key Equations & Claims
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Core Mathematical Framework</h4>
                <div className="font-mono text-sm space-y-2 text-muted-foreground bg-muted p-4 rounded-lg">
                  <div>
                    • Oscillatory Embedding: <strong>z = a·e^(iθ)</strong>
                  </div>
                  <div>
                    • Phase Synchronization: <strong>dθᵢ/dt = ωᵢ + (K/N) Σⱼ sin(θⱼ - θᵢ + Δθ)</strong>
                  </div>
                  <div>
                    • Order Parameter: <strong>R = |1/N Σⱼ e^(iθⱼ)|</strong>
                  </div>
                  <div>
                    • CUST Condition: <strong>R ≥ τ</strong> (coherence gate)
                  </div>
                  <div>
                    • Phase-Coherent Attention: <strong>softmax(QK^T/√d + λ·cos(θᵢ - θⱼ - Δθ))</strong>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Patent Claims Demonstrated</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <strong>Claim 1:</strong> Oscillatory token embeddings with Kuramoto synchronization
                  </li>
                  <li>
                    <strong>Claim 2:</strong> Phase-coherent attention with relational Δθ modulation
                  </li>
                  <li>
                    <strong>Claim 3:</strong> CUST coherence gating for output stability
                  </li>
                  <li>
                    <strong>Claim 4:</strong> Resonance mapping for interpretability
                  </li>
                  <li>
                    <strong>Claim 5:</strong> Multi-agent synchronization architecture
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mt-6 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-primary">How to Use This Demo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p>
                  <strong>1. Start Synchronization:</strong> Click "Start Sync" to begin Kuramoto phase alignment
                </p>
                <p>
                  <strong>2. Watch Phase Vectors:</strong> Colored vectors show token phases synchronizing over time
                </p>
                <p>
                  <strong>3. Monitor Coherence:</strong> Order parameter R tracks global phase alignment
                </p>
              </div>
              <div className="space-y-2">
                <p>
                  <strong>4. Adjust Parameters:</strong> Modify user archetype, coupling strength, and thresholds
                </p>
                <p>
                  <strong>5. CUST Gating:</strong> Output generation only proceeds when coherence exceeds threshold
                </p>
                <p>
                  <strong>6. Resonance Map:</strong> View interpretability metrics and system diagnostics
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/50 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2025 Dr. Michael A. Kayser, DO, FACMG • Kayser Medical PLLC</p>
            <p className="mt-1">
              Patent Application Filed: August 27, 2025 • Technology Classification: Neural Networks, Machine Learning,
              Conversational AI
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
