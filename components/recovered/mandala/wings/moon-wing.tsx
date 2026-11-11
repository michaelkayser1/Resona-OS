"use client"

import { useMandalaState } from "../resonance-mandala"

export function MoonWing() {
  const { state } = useMandalaState()

  const scale = 1 + state.psiIntent * 0.2
  const coherenceIntensity = Math.min(1, state.CUST / 1.618)

  return (
    <div
      className="relative w-32 h-32 md:w-40 md:h-40"
      style={{
        transform: `scale(${scale})`,
        transition: "transform 0.3s ease-out",
      }}
    >
      {/* Wing glyph */}
      <svg viewBox="0 0 100 100" className="w-full h-full animate-oscillate-moon">
        <defs>
          <radialGradient id="moonGradient">
            <stop offset="0%" stopColor="rgb(200, 230, 255)" stopOpacity={coherenceIntensity} />
            <stop offset="50%" stopColor="rgb(150, 200, 255)" stopOpacity={coherenceIntensity * 0.6} />
            <stop offset="100%" stopColor="rgb(100, 150, 255)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Soft glow */}
        <circle cx="50" cy="50" r="40" fill="url(#moonGradient)" opacity="0.5" />

        {/* Wing shape - coherence pattern */}
        <path
          d="M 50 50 Q 30 30, 15 30 Q 30 50, 15 70 Q 30 70, 50 50 Z"
          fill="rgba(180, 220, 255, 0.3)"
          stroke="rgb(200, 230, 255)"
          strokeWidth="1"
          style={{
            filter: `drop-shadow(0 0 ${coherenceIntensity * 15}px rgba(200, 230, 255, 0.8))`,
          }}
        />

        {/* Inner waves - coherence ripples */}
        {Array.from({ length: 4 }).map((_, i) => (
          <circle
            key={i}
            cx="50"
            cy="50"
            r={12 + i * 8}
            fill="none"
            stroke="rgb(200, 230, 255)"
            strokeWidth="0.3"
            opacity={coherenceIntensity * (0.6 - i * 0.12)}
          />
        ))}

        {/* Core symbol */}
        <path
          d="M 50 42 A 8 8 0 1 1 50 58 A 6 6 0 1 0 50 42 Z"
          fill="rgb(220, 240, 255)"
          opacity={coherenceIntensity}
        />
      </svg>

      {/* Coherence field effect */}
      <div
        className="absolute -inset-8 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, rgba(200, 230, 255, ${state.psiIntent * 0.12}) 0%, transparent 70%)`,
          filter: "blur(20px)",
        }}
      />
    </div>
  )
}
