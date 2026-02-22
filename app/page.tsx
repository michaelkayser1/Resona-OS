import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-emerald-400 bg-clip-text text-transparent mb-6">
            QOTE Living Donut
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Visualize quantum oscillator thermodynamics and entanglement with our advanced QOTE engine simulation.
            Experience real-time parameter control and resonance mapping in an intuitive interface.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-emerald-400 flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                Interactive Controls
              </CardTitle>
              <CardDescription className="text-slate-300">
                Real-time parameter adjustment with immediate visual feedback
              </CardDescription>
            </CardHeader>
            <CardContent className="text-slate-300">
              <ul className="space-y-2">
                <li>• CUST Gating control (0-100%)</li>
                <li>• Delta Theta (Δθ) visualization</li>
                <li>• Quantum entanglement toggle</li>
                <li>• Parameter optimization</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-blue-400 flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                Advanced Visualization
              </CardTitle>
              <CardDescription className="text-slate-300">
                Sophisticated charts and animations for complex data
              </CardDescription>
            </CardHeader>
            <CardContent className="text-slate-300">
              <ul className="space-y-2">
                <li>• Animated donut visualization</li>
                <li>• Resonance frequency mapping</li>
                <li>• Entanglement coefficient tracking</li>
                <li>• Export capabilities for presentations</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Link href="/living-donut.html" target="_blank">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold"
            >
              Launch QOTE Simulation
            </Button>
          </Link>
          <p className="text-slate-400 mt-4">Opens in a new tab for optimal performance</p>
        </div>

        <footer className="mt-20 text-center text-slate-500">
          <p>QOTE Living Donut Simulation | Quantum Oscillator Thermodynamic Engine</p>
        </footer>
      </div>
    </div>
  )
}
