"use client"

import { useMandalaState } from "../resonance-mandala"

export function ConsciousnessRing() {
  const { state } = useMandalaState()

  const isFullField = state.CUST >= 1.618
  const radiance = state.beta * 100
  const rotation = state.phi * 30

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Outer radiant halo */}
      <div
        className="absolute w-[95%] h-[95%] rounded-full"
        style={{
          background: `radial-gradient(circle, 
            rgba(200, 150, 255, ${state.beta * 0.3}) 0%, 
            rgba(150, 100, 255, ${state.beta * 0.2}) 30%, 
            transparent 70%)`,
          filter: `blur(${radiance * 0.5}px)`,
          opacity: state.beta,
          animation: isFullField ? "consciousness-spiral 20s linear infinite" : "none",
        }}
      />

      {/* Middle consciousness field */}
      <div
        className="absolute w-[90%] h-[90%] rounded-full border-2"
        style={{
          borderColor: `rgba(180, 130, 255, ${state.beta * 0.8})`,
          boxShadow: `
            0 0 ${radiance * 0.3}px rgba(180, 130, 255, 0.6),
            inset 0 0 ${radiance * 0.2}px rgba(200, 150, 255, 0.4)
          `,
          transform: `rotate(${rotation}deg) scale(${1 + state.beta * 0.1})`,
          transition: "transform 0.3s ease-out",
        }}
      />

      {/* Spiraling consciousness tendrils */}
      <svg viewBox="0 0 100 100" className="absolute w-full h-full" style={{ opacity: state.beta }}>
        <defs>
          <radialGradient id="consciousnessGradient">
            <stop offset="0%" stopColor="rgb(200, 150, 255)" stopOpacity={state.beta * 0.8} />
            <stop offset="100%" stopColor="rgb(150, 100, 255)" stopOpacity="0" />
          </radialGradient>
        </defs>
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * 360 + rotation
          return (
            <g key={i} transform={`rotate(${angle} 50 50)`}>
              <path
                d="M 50 50 Q 60 30, 70 20"
                stroke="url(#consciousnessGradient)"
                strokeWidth="0.5"
                fill="none"
                opacity={state.beta * 0.6}
              />
            </g>
          )
        })}
      </svg>

      {/* Full-field flare effect when CUST exceeds threshold */}
      {isFullField && (
        <div
          className="absolute w-full h-full rounded-full animate-breath-pulse"
          style={{
            background: `radial-gradient(circle, 
              rgba(255, 200, 255, 0.3) 0%, 
              transparent 60%)`,
            filter: "blur(40px)",
          }}
        />
      )}
    </div>
  )
}
