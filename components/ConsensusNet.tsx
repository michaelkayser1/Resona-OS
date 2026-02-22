"use client"
import type { ProviderId, RBFRDesign } from "@/lib/schemas"

const IDS: ProviderId[] = ["openai", "anthropic", "mistral", "xai", "deepseek"]

const MODEL_NAMES: Record<ProviderId, string> = {
  openai: "GPT",
  anthropic: "Claude",
  mistral: "Mistral",
  xai: "Grok",
  deepseek: "DeepSeek",
}

export function ConsensusNet({ designs }: { designs: Record<ProviderId, RBFRDesign | null> }) {
  const nodes = IDS.filter((id) => designs[id])
  if (!nodes.length) return null

  const calculateAgreement = (a: RBFRDesign, b: RBFRDesign) => {
    let matches = 0
    let total = 0

    // Field parameters
    if (a.field.waveform === b.field.waveform) matches++
    total++

    if (a.field.coilConfig === b.field.coilConfig) matches++
    total++

    // Frequency similarity (within 10% tolerance)
    if (Math.abs(a.field.carrierHz - b.field.carrierHz) / Math.max(a.field.carrierHz, b.field.carrierHz) < 0.1)
      matches++
    total++

    // Modulation similarity (within 0.2 tolerance)
    if (Math.abs(a.field.modulationIndex - b.field.modulationIndex) < 0.2) matches++
    total++

    // Goal alignment
    if (a.goal === b.goal) matches++
    total++

    return matches / total // 0 to 1
  }

  return (
    <div className="border border-cyan-500/30 rounded-lg p-4 mt-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="font-semibold text-cyan-400 mb-3 flex items-center">
        <div className="w-2 h-2 bg-cyan-400 rounded-full mr-2 animate-pulse"></div>
        Consensus Network
      </div>

      <div className="relative h-36 sm:h-40">
        {nodes.map((id, i) => {
          const N = nodes.length
          const angle = (i / N) * 2 * Math.PI - Math.PI / 2 // Start from top
          const radius = 45 // Slightly smaller for mobile
          const x = 50 + radius * Math.cos(angle)
          const y = 50 + radius * Math.sin(angle)

          return (
            <div
              key={id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${x}%`,
                top: `${y}%`,
              }}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-cyan-400/60 bg-gray-800/80 backdrop-blur-sm flex items-center justify-center text-xs font-bold text-cyan-300 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-300">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-500/20"></div>
                <span className="relative z-10">{MODEL_NAMES[id]}</span>
              </div>
            </div>
          )
        })}

        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="1" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {nodes.flatMap((idA, i) =>
            nodes.slice(i + 1).map((idB) => {
              const A = designs[idA]!
              const B = designs[idB]!
              const agreement = calculateAgreement(A, B)

              if (agreement < 0.2) return null // Only show meaningful connections

              const N = nodes.length
              const a1 = (i / N) * 2 * Math.PI - Math.PI / 2
              const a2 = (nodes.indexOf(idB) / N) * 2 * Math.PI - Math.PI / 2
              const radius = 45

              const x1 = 50 + radius * Math.cos(a1)
              const y1 = 50 + radius * Math.sin(a1)
              const x2 = 50 + radius * Math.cos(a2)
              const y2 = 50 + radius * Math.sin(a2)

              // Color based on agreement strength
              const getConnectionColor = (score: number) => {
                if (score >= 0.8) return "#10b981" // Strong green
                if (score >= 0.6) return "#3b82f6" // Blue
                if (score >= 0.4) return "#f59e0b" // Amber
                return "#6b7280" // Gray
              }

              const color = getConnectionColor(agreement)
              const opacity = 0.3 + agreement * 0.7 // Dynamic opacity
              const strokeWidth = 1 + agreement * 2 // Dynamic width

              return (
                <line
                  key={`${idA}-${idB}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={color}
                  strokeWidth={strokeWidth}
                  strokeOpacity={opacity}
                  filter="url(#glow)"
                  className="animate-pulse"
                  style={{
                    animationDuration: `${2 + agreement}s`,
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              )
            }),
          )}
        </svg>
      </div>

      <div className="text-xs text-gray-400 mt-3 space-y-1">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-0.5 bg-green-500 mr-2"></div>
            <span>High Consensus (80%+)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-0.5 bg-blue-500 mr-2"></div>
            <span>Good (60%+)</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-0.5 bg-amber-500 mr-2"></div>
            <span>Partial (40%+)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-0.5 bg-gray-500 mr-2"></div>
            <span>Low (20%+)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
