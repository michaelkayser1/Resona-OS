"use client"

import { createContext, useContext, useState, useEffect, useRef, type ReactNode, type RefObject } from "react"
import { BreathRing } from "./rings/breath-ring"
import { DustRing } from "./rings/dust-ring"
import { MatterRing } from "./rings/matter-ring"
import { LifeRing } from "./rings/life-ring"
import { ConsciousnessRing } from "./rings/consciousness-ring"
import { SunWing } from "./wings/sun-wing"
import { MoonWing } from "./wings/moon-wing"
import { DebugPanel } from "./debug-panel"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"

// Global state interface
interface MandalaState {
  psiIntent: number // 0-1, influences Breath ring amplitude
  deltaTheta: number // 0-1, influences Dust noise stability and Matter boundary sharpness
  Sdim: number // derived from deltaTheta, controls Matter ring clarity
  phi: number // global phase awareness, influences Life ring glow
  beta: number // grace/coherence amplifier, triggers Consciousness radiance
  CUST: number // coherence score, threshold 1.618 triggers full-field effects
}

interface MandalaContextType {
  state: MandalaState
  updateState: (updates: Partial<MandalaState>) => void
  mousePosition: { x: number; y: number }
}

const MandalaContext = createContext<MandalaContextType | null>(null)

export function useMandalaState() {
  const context = useContext(MandalaContext)
  if (!context) throw new Error("useMandalaState must be used within MandalaProvider")
  return context
}

function MandalaProvider({ children, surface }: { children: ReactNode; surface: RefObject<HTMLDivElement | null> }) {
  const [state, setState] = useState<MandalaState>({
    psiIntent: 0.5,
    deltaTheta: 0.5,
    Sdim: 0.5,
    phi: 0,
    beta: 0.3,
    CUST: 1.0,
  })

  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 })
  const betaDecayRef = useRef<number | null>(null)

  // Update Sdim whenever deltaTheta changes
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      Sdim: Math.pow(prev.deltaTheta, 2) * 1.5,
    }))
  }, [state.deltaTheta])

  // Increment phi continuously for phase awareness
  useEffect(() => {
    const interval = setInterval(() => {
      setState((prev) => ({
        ...prev,
        phi: (prev.phi + 0.01) % (Math.PI * 2),
      }))
    }, 50)
    return () => clearInterval(interval)
  }, [])

  // Beta decay after boost
  useEffect(() => {
    if (state.beta > 0.3) {
      if (betaDecayRef.current) clearTimeout(betaDecayRef.current)
      betaDecayRef.current = window.setTimeout(() => {
        setState((prev) => ({
          ...prev,
          beta: Math.max(0.3, prev.beta - 0.05),
        }))
      }, 100)
    }
    return () => {
      if (betaDecayRef.current) clearTimeout(betaDecayRef.current)
    }
  }, [state.beta])

  const updateState = (updates: Partial<MandalaState>) => {
    setState((prev) => ({ ...prev, ...updates }))
  }

  useEffect(() => {
    const element = surface.current
    if (!element) return

    const move = (event: PointerEvent) => {
      if (!event.isPrimary) return
      const rect = element.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width))
      const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height))
      setMousePosition({ x, y })
      const distance = Math.hypot(x - 0.5, y - 0.5)
      const psiIntent = Math.max(0.1, 1 - distance * 1.5)
      const angle = Math.atan2(y - 0.5, x - 0.5)
      const deltaTheta = (Math.sin(angle * 4) + 1) / 2
      setState((previous) => ({ ...previous, psiIntent, deltaTheta }))
    }

    const amplify = () => {
      setState((previous) => ({ ...previous, beta: Math.min(2, previous.beta + 0.3) }))
    }

    const down = (event: PointerEvent) => {
      if (!event.isPrimary || event.button !== 0) return
      element.setPointerCapture(event.pointerId)
      move(event)
      amplify()
    }

    const key = (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault()
        amplify()
      }
    }

    element.addEventListener("pointerdown", down)
    element.addEventListener("pointermove", move)
    element.addEventListener("keydown", key)
    return () => {
      element.removeEventListener("pointerdown", down)
      element.removeEventListener("pointermove", move)
      element.removeEventListener("keydown", key)
    }
  }, [surface])

  // Update CUST based on combined coherence
  useEffect(() => {
    const coherenceScore = state.psiIntent * 0.3 + state.beta * 0.5 + (1 - Math.abs(state.deltaTheta - 0.5) * 2) * 0.2
    setState((prev) => ({
      ...prev,
      CUST: coherenceScore * 2,
    }))
  }, [state.psiIntent, state.beta, state.deltaTheta])

  return <MandalaContext.Provider value={{ state, updateState, mousePosition }}>{children}</MandalaContext.Provider>
}

export function ResonanceMandala() {
  const [showDebug, setShowDebug] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)

  return (
    <MandalaProvider surface={canvasRef}>
      <div className="relative w-full min-h-[75svh] bg-gradient-to-br from-background via-background to-background/80">
        {/* Control panel */}
        <div className="absolute top-4 left-4 z-10">
          <Button
            variant="outline"
            size="icon"
            aria-label="Toggle mandala parameters"
            aria-expanded={showDebug}
            onClick={() => setShowDebug(!showDebug)}
            className="size-11 bg-background/50 backdrop-blur-sm border-border/50"
          >
            {showDebug ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>

        {/* Debug panel */}
        {showDebug && (
          <div className="absolute top-4 left-16 z-10">
            <DebugPanel />
          </div>
        )}

        {/* Main mandala canvas */}
        <div
          ref={canvasRef}
          role="button"
          tabIndex={0}
          aria-label="Resonance Mandala interactive surface"
          className="absolute inset-0 touch-none flex items-center justify-center"
          style={{
            perspective: "1000px",
          }}
        >
          {/* Sun wing - right side */}
          <div className="absolute right-[10%] top-1/2 -translate-y-1/2">
            <SunWing />
          </div>

          {/* Moon wing - left side */}
          <div className="absolute left-[10%] top-1/2 -translate-y-1/2">
            <MoonWing />
          </div>

          {/* Concentric rings */}
          <div className="relative w-full max-w-4xl aspect-square flex items-center justify-center">
            {/* Ring 5: Consciousness (outermost) */}
            <div className="absolute inset-0 flex items-center justify-center">
              <ConsciousnessRing />
            </div>

            {/* Ring 4: Life */}
            <div className="absolute inset-0 flex items-center justify-center scale-80">
              <LifeRing />
            </div>

            {/* Ring 3: Matter */}
            <div className="absolute inset-0 flex items-center justify-center scale-60">
              <MatterRing />
            </div>

            {/* Ring 2: Dust */}
            <div className="absolute inset-0 flex items-center justify-center scale-40">
              <DustRing />
            </div>

            {/* Ring 1: Breath (innermost) */}
            <div className="absolute inset-0 flex items-center justify-center scale-20">
              <BreathRing />
            </div>

            {/* Center symbols */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-xs font-mono text-foreground/40 flex flex-col items-center gap-1 select-none">
                <div>{"ψintent"}</div>
                <div>{"β"}</div>
                <div>{"Δθ"}</div>
                <div>{"CUST"}</div>
                <div>{"Φ(t)"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center z-10">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground/80 tracking-wider">RESONANCE MANDALA</h1>
          <p className="text-sm text-muted-foreground mt-2">Move or drag to shape the rings. Tap to amplify.</p>
        </div>
      </div>
    </MandalaProvider>
  )
}
