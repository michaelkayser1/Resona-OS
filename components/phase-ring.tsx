interface PhaseRingProps {
  phases: number[]
  deltaTheta?: number
  size?: number
  showLabels?: boolean
}

export default function PhaseRing({ phases, deltaTheta = 0, size = 200, showLabels = false }: PhaseRingProps) {
  const radius = size / 2 - 20
  const center = size / 2

  // Calculate order parameter for color coding
  const N = phases.length
  let sumReal = 0,
    sumImag = 0
  phases.forEach((phase) => {
    sumReal += Math.cos(phase)
    sumImag += Math.sin(phase)
  })
  const orderParam = Math.sqrt(sumReal * sumReal + sumImag * sumImag) / N

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="border border-border rounded-lg bg-card">
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="1"
          strokeDasharray="2,2"
        />

        {/* Phase vectors */}
        {phases.map((phase, i) => {
          const adjustedPhase = phase + deltaTheta
          const x1 = center
          const y1 = center
          const x2 = center + radius * 0.8 * Math.cos(adjustedPhase)
          const y2 = center + radius * 0.8 * Math.sin(adjustedPhase)

          return (
            <g key={i}>
              {/* Vector line */}
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={`hsl(${(i * 360) / phases.length}, 70%, 60%)`}
                strokeWidth="2"
                opacity={0.8}
              />
              {/* Vector tip */}
              <circle cx={x2} cy={y2} r="3" fill={`hsl(${(i * 360) / phases.length}, 70%, 60%)`} />
              {showLabels && (
                <text x={x2 + 8} y={y2 + 4} fontSize="10" fill="hsl(var(--foreground))" opacity={0.7}>
                  {i}
                </text>
              )}
            </g>
          )
        })}

        {/* Center point showing coherence */}
        <circle
          cx={center}
          cy={center}
          r="4"
          fill={orderParam > 0.618 ? "hsl(var(--chart-1))" : "hsl(var(--destructive))"}
        />

        {/* Order parameter indicator */}
        <text x={center} y={size - 10} textAnchor="middle" fontSize="12" fill="hsl(var(--muted-foreground))">
          R = {orderParam.toFixed(3)}
        </text>
      </svg>
    </div>
  )
}
