"use client"

import { useMandalaState } from "../resonance-mandala"

export function MatterRing() {
  const { state } = useMandalaState()

  const sides = Math.floor(3 + state.Sdim * 8) // 3 to 11 sides based on clarity
  const rotation = state.phi * 20

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Geometric polygon */}
      <div
        className="absolute w-[80%] h-[80%]"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: "transform 0.1s ease-out",
        }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient id="matterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgb(100, 200, 255)" stopOpacity={0.4} />
              <stop offset="100%" stopColor="rgb(150, 100, 255)" stopOpacity={0.6} />
            </linearGradient>
          </defs>
          <polygon
            points={generatePolygonPoints(sides)}
            fill="url(#matterGradient)"
            stroke="rgb(150, 200, 255)"
            strokeWidth={0.5 + state.Sdim}
            style={{
              filter: `drop-shadow(0 0 ${state.Sdim * 10}px rgba(150, 200, 255, 0.6))`,
            }}
          />
        </svg>
      </div>

      {/* Crystalline inner structure */}
      <div
        className="absolute w-[60%] h-[60%] opacity-40"
        style={{
          transform: `rotate(${-rotation * 0.5}deg)`,
        }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {Array.from({ length: sides }).map((_, i) => {
            const angle = (i / sides) * Math.PI * 2
            const x1 = 50 + Math.cos(angle) * 40
            const y1 = 50 + Math.sin(angle) * 40
            return (
              <line
                key={i}
                x1="50"
                y1="50"
                x2={x1}
                y2={y1}
                stroke="rgb(180, 220, 255)"
                strokeWidth={0.3}
                opacity={state.Sdim * 0.6}
              />
            )
          })}
        </svg>
      </div>
    </div>
  )
}

function generatePolygonPoints(sides: number): string {
  const points: string[] = []
  const centerX = 50
  const centerY = 50
  const radius = 40

  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2 - Math.PI / 2
    const x = centerX + Math.cos(angle) * radius
    const y = centerY + Math.sin(angle) * radius
    points.push(`${x},${y}`)
  }

  return points.join(" ")
}
