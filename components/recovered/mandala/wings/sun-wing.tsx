"use client"

import { useMandalaState } from "../resonance-mandala"

export function SunWing() {
  const { state } = useMandalaState()

  const scale = 1 + state.beta * 0.2
  const flareIntensity = state.CUST >= 1.618 ? 1 : 0.6

  return (
    <div
      className="relative w-32 h-32 md:w-40 md:h-40"
      style={{
        transform: `scale(${scale})`,
        transition: "transform 0.3s ease-out",
      }}
    >
      {/* Wing glyph */}
      <svg viewBox="0 0 100 100" className="w-full h-full animate-oscillate-sun">
        <defs>
          <radialGradient id="sunGradient">
            <stop offset="0%" stopColor="rgb(255, 215, 0)" stopOpacity={flareIntensity} />
            <stop offset="50%" stopColor="rgb(255, 180, 50)" stopOpacity={flareIntensity * 0.6} />
            <stop offset="100%" stopColor="rgb(255, 140, 0)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Radiant glow */}
        <circle cx="50" cy="50" r="40" fill="url(#sunGradient)" opacity="0.6" />

        {/* Wing shape - expansion pattern */}
        <path
          d="M 50 50 Q 70 30, 85 30 Q 70 50, 85 70 Q 70 70, 50 50 Z"
          fill="rgba(255, 200, 100, 0.4)"
          stroke="rgb(255, 215, 0)"
          strokeWidth="1"
          style={{
            filter: `drop-shadow(0 0 ${flareIntensity * 15}px rgba(255, 215, 0, 0.8))`,
          }}
        />

        {/* Inner rays */}
        {Array.from({ length: 6 }).map((_, i) => {
          const angle = (i / 6) * 360
          return (
            <line
              key={i}
              x1="50"
              y1="50"
              x2="50"
              y2="25"
              stroke="rgb(255, 230, 100)"
              strokeWidth="0.5"
              opacity={flareIntensity * 0.6}
              transform={`rotate(${angle} 50 50)`}
            />
          )
        })}

        {/* Core symbol */}
        <circle cx="50" cy="50" r="8" fill="rgb(255, 215, 0)" opacity={flareIntensity} />
      </svg>

      {/* Light cast effect */}
      <div
        className="absolute -inset-8 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, rgba(255, 215, 0, ${state.beta * 0.15}) 0%, transparent 70%)`,
          filter: "blur(20px)",
        }}
      />
    </div>
  )
}
