"use client"

import { useMandalaState } from "../resonance-mandala"
import { useEffect, useState } from "react"

export function BreathRing() {
  const { state } = useMandalaState()
  const [ripples, setRipples] = useState<number[]>([])

  // Create ripple effect based on psiIntent
  useEffect(() => {
    const interval = setInterval(
      () => {
        setRipples((prev) => {
          const newRipples = [Date.now(), ...prev.slice(0, 2)]
          return newRipples
        })
      },
      1000 / (state.psiIntent * 2 + 0.5),
    )

    return () => clearInterval(interval)
  }, [state.psiIntent])

  const amplitude = state.psiIntent * 20 + 10

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Core breath circle */}
      <div
        className="absolute rounded-full border-2 border-accent/60 bg-accent/10"
        style={{
          width: `${amplitude * 2}%`,
          height: `${amplitude * 2}%`,
          boxShadow: `0 0 ${amplitude}px rgba(var(--color-accent), 0.6)`,
          animation: `breath-pulse ${2 / (state.psiIntent + 0.5)}s ease-in-out infinite`,
        }}
      />

      {/* Ripple waves */}
      {ripples.map((id, idx) => (
        <div
          key={id}
          className="absolute rounded-full border border-accent/20"
          style={{
            width: `${amplitude * 2 + idx * 15}%`,
            height: `${amplitude * 2 + idx * 15}%`,
            opacity: Math.max(0, 1 - idx * 0.4),
            animation: `breath-pulse ${1.5}s ease-out forwards`,
          }}
        />
      ))}
    </div>
  )
}
