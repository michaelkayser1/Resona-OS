"use client"
import { useState } from "react"
import { X, Zap, Target, Gauge, ChevronLeft, ChevronRight, Play, Users, BarChart3, Settings } from "lucide-react"

interface TutorialPanelProps {
  isOpen: boolean
  onClose: () => void
}

const TUTORIAL_STEPS = [
  {
    id: "welcome",
    title: "Welcome to RBFR Quantum Cockpit",
    icon: <Zap className="w-6 h-6 text-cyan-400" />,
    content: (
      <div className="space-y-4">
        <p className="text-gray-300">
          This platform uses multiple AI models to collaboratively solve RBFR (Resonance-Based Fuel Refinement)
          challenges using TRIZ principles and quantum field visualization.
        </p>
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
          <h5 className="font-semibold text-cyan-400 mb-2">What makes this unique?</h5>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• 5 AI models working as collaborative co-pilots</li>
            <li>• Real-time consensus measurement and visualization</li>
            <li>• TRIZ-based contradiction resolution</li>
            <li>• Quantum field emergence detection</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "getting-started",
    title: "Getting Started",
    icon: <Play className="w-6 h-6 text-green-400" />,
    content: (
      <div className="space-y-4">
        <h5 className="font-semibold text-green-400 mb-2">Step-by-Step Process</h5>
        <ol className="list-decimal list-inside space-y-3 text-gray-300">
          <li>
            <strong>Define your challenge:</strong> Enter your RBFR problem in the "Field Challenge" section
          </li>
          <li>
            <strong>Set constraints:</strong> Specify system limitations and requirements
          </li>
          <li>
            <strong>Configure RBFR parameters:</strong> Adjust carrier frequency, waveform, and coil settings
          </li>
          <li>
            <strong>Activate the field:</strong> Click "Activate Field" to begin multi-AI analysis
          </li>
          <li>
            <strong>Monitor consensus:</strong> Watch the quantum visualization respond to AI agreement
          </li>
        </ol>
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
          <p className="text-sm text-green-300">
            <strong>Pro tip:</strong> Start with demo mode to see how the system works with predictable responses.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "ai-copilots",
    title: "AI Co-pilot Wall",
    icon: <Users className="w-6 h-6 text-blue-400" />,
    content: (
      <div className="space-y-4">
        <p className="text-gray-300">
          Five specialized AI models work together to provide diverse perspectives on your RBFR challenges:
        </p>
        <div className="grid grid-cols-1 gap-3">
          <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600/50">
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <strong className="text-blue-300">OpenAI GPT</strong>
            </div>
            <p className="text-sm text-gray-400">
              Analytical powerhouse for structured reasoning and systematic problem-solving
            </p>
          </div>
          <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600/50">
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <strong className="text-orange-300">Anthropic Claude</strong>
            </div>
            <p className="text-sm text-gray-400">Ethical considerations, safety analysis, and balanced perspectives</p>
          </div>
          <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600/50">
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <strong className="text-purple-300">Mistral</strong>
            </div>
            <p className="text-sm text-gray-400">Practical implementation focus and real-world applicability</p>
          </div>
          <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600/50">
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <strong className="text-green-300">xAI Grok</strong>
            </div>
            <p className="text-sm text-gray-400">
              Creative disruption, unconventional thinking, and innovative approaches
            </p>
          </div>
          <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600/50">
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
              <strong className="text-cyan-300">DeepSeek</strong>
            </div>
            <p className="text-sm text-gray-400">Mathematical optimization, algorithmic solutions, and deep analysis</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "metrics",
    title: "Understanding QOTE Metrics",
    icon: <BarChart3 className="w-6 h-6 text-yellow-400" />,
    content: (
      <div className="space-y-4">
        <p className="text-gray-300">
          The QOTE (Quantum Oscillation Tensor Evaluation) algorithm measures AI consensus through three key metrics:
        </p>
        <div className="space-y-4">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              <Gauge className="w-5 h-5 text-red-400" />
              <strong className="text-red-300">Wobble (W)</strong>
            </div>
            <p className="text-sm text-gray-300 mb-2">
              Dimensional instability from AI disagreement. Measures how much the models diverge in their responses.
            </p>
            <div className="text-xs text-gray-400">
              <strong>Range:</strong> 0 (perfect consensus) → 1 (complete chaos)
              <br />
              <strong>Formula:</strong> W = 1 - Jaccard(top-n ngrams across models)
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              <Zap className="w-5 h-5 text-blue-400" />
              <strong className="text-blue-300">Beta (β)</strong>
            </div>
            <p className="text-sm text-gray-300 mb-2">
              Grace amplification factor. Measures ethical considerations and solution refinement across models.
            </p>
            <div className="text-xs text-gray-400">
              <strong>Range:</strong> 0.8 (basic) → 1.2 (highly refined)
              <br />
              <strong>Formula:</strong> β = avg(self-repair score from safety/ethics cues)
            </div>
          </div>

          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              <Target className="w-5 h-5 text-purple-400" />
              <strong className="text-purple-300">CUST</strong>
            </div>
            <p className="text-sm text-gray-300 mb-2">
              Coherence-Unity Stability Threshold. When CUST approaches φ (≈1.618), emergence occurs.
            </p>
            <div className="text-xs text-gray-400">
              <strong>Range:</strong> 0 → φ (golden ratio)
              <br />
              <strong>Formula:</strong> CUST = φ × (1-W) × (0.6 + 0.4β)
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "quantum-field",
    title: "Quantum Field Visualization",
    icon: <Target className="w-6 h-6 text-cyan-400" />,
    content: (
      <div className="space-y-4">
        <p className="text-gray-300">The quantum field visualization responds in real-time to AI consensus levels:</p>
        <div className="space-y-3">
          <div className="bg-gray-700/50 p-3 rounded-lg">
            <strong className="text-cyan-300">Interference Patterns:</strong>
            <p className="text-sm text-gray-400 mt-1">
              Multiple wave sources create complex interference based on AI model responses
            </p>
          </div>
          <div className="bg-gray-700/50 p-3 rounded-lg">
            <strong className="text-green-300">Coherence Envelope:</strong>
            <p className="text-sm text-gray-400 mt-1">
              Visual stability increases as wobble decreases (better AI consensus)
            </p>
          </div>
          <div className="bg-gray-700/50 p-3 rounded-lg">
            <strong className="text-yellow-300">Emergence Glow:</strong>
            <p className="text-sm text-gray-400 mt-1">
              Golden halo appears when CUST approaches φ, indicating breakthrough moments
            </p>
          </div>
          <div className="bg-gray-700/50 p-3 rounded-lg">
            <strong className="text-red-300">Camera Shake:</strong>
            <p className="text-sm text-gray-400 mt-1">
              Field instability visualized through subtle camera movement during high wobble
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "advanced-features",
    title: "Advanced Features",
    icon: <Settings className="w-6 h-6 text-purple-400" />,
    content: (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-700/50 p-4 rounded-lg">
            <h5 className="font-semibold text-purple-300 mb-2">Session Management</h5>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Save and load configurations</li>
              <li>• Export sessions as JSON</li>
              <li>• Share via compressed URLs</li>
              <li>• Import from files or data</li>
            </ul>
          </div>
          <div className="bg-gray-700/50 p-4 rounded-lg">
            <h5 className="font-semibold text-blue-300 mb-2">Demo Mode</h5>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Deterministic responses</li>
              <li>• Seeded random generation</li>
              <li>• Reproducible results</li>
              <li>• Perfect for learning</li>
            </ul>
          </div>
          <div className="bg-gray-700/50 p-4 rounded-lg">
            <h5 className="font-semibold text-green-300 mb-2">Real-time Analytics</h5>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Consensus tracking</li>
              <li>• Emergence event logging</li>
              <li>• Performance metrics</li>
              <li>• Historical analysis</li>
            </ul>
          </div>
          <div className="bg-gray-700/50 p-4 rounded-lg">
            <h5 className="font-semibold text-cyan-300 mb-2">RBFR Parameters</h5>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Carrier frequency control</li>
              <li>• Waveform modulation</li>
              <li>• Coil configuration</li>
              <li>• Safety constraints</li>
            </ul>
          </div>
        </div>
      </div>
    ),
  },
]

export function TutorialPanel({ isOpen, onClose }: TutorialPanelProps) {
  const [currentStep, setCurrentStep] = useState(0)

  if (!isOpen) return null

  const step = TUTORIAL_STEPS[currentStep]
  const isFirst = currentStep === 0
  const isLast = currentStep === TUTORIAL_STEPS.length - 1

  const nextStep = () => {
    if (!isLast) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (!isFirst) setCurrentStep(currentStep - 1)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden border border-cyan-500/30">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            {step.icon}
            <div>
              <h3 className="text-xl font-semibold text-white">{step.title}</h3>
              <p className="text-sm text-gray-400">
                Step {currentStep + 1} of {TUTORIAL_STEPS.length}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-3 bg-gray-900/50">
          <div className="flex space-x-1">
            {TUTORIAL_STEPS.map((_, index) => (
              <div
                key={index}
                className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                  index <= currentStep ? "bg-cyan-500" : "bg-gray-700"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">{step.content}</div>

        {/* Navigation */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700 bg-gray-900/30">
          <button
            onClick={prevStep}
            disabled={isFirst}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex space-x-2">
            {TUTORIAL_STEPS.map((tutorialStep, index) => (
              <button
                key={tutorialStep.id}
                onClick={() => setCurrentStep(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentStep ? "bg-cyan-500" : "bg-gray-600 hover:bg-gray-500"
                }`}
              />
            ))}
          </div>

          {isLast ? (
            <button
              onClick={onClose}
              className="flex items-center space-x-2 px-6 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors font-medium"
            >
              <span>Start Exploring</span>
            </button>
          ) : (
            <button
              onClick={nextStep}
              className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
