"use client"

import { useMandalaState } from "./resonance-mandala"
import { Card } from "@/components/ui/card"

export function DebugPanel() {
  const { state } = useMandalaState()

  return (
    <Card className="bg-background/90 backdrop-blur-sm border-border/50 p-4 text-xs font-mono w-64">
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-foreground mb-3">State Variables</h3>

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">ψintent:</span>
          <span className="text-accent font-bold">{state.psiIntent.toFixed(3)}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Δθ:</span>
          <span className="text-primary font-bold">{state.deltaTheta.toFixed(3)}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Sdim:</span>
          <span className="text-chart-2 font-bold">{state.Sdim.toFixed(3)}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Φ(t):</span>
          <span className="text-chart-4 font-bold">{state.phi.toFixed(3)}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">β:</span>
          <span className="text-secondary font-bold">{state.beta.toFixed(3)}</span>
        </div>

        <div className="flex justify-between items-center border-t border-border/50 pt-2 mt-2">
          <span className="text-muted-foreground font-bold">CUST:</span>
          <span className={`font-bold ${state.CUST >= 1.618 ? "text-chart-5 animate-pulse" : "text-foreground"}`}>
            {state.CUST.toFixed(3)}
          </span>
        </div>

        {state.CUST >= 1.618 && (
          <div className="text-center text-chart-5 font-bold animate-pulse pt-2">{"⚡ FULL FIELD ⚡"}</div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-border/50 text-muted-foreground text-[10px] leading-relaxed">
        <p>Move mouse in circles to modulate psiIntent and deltaTheta</p>
        <p className="mt-1">Click anywhere to boost beta (grace/coherence)</p>
        <p className="mt-1">CUST threshold: 1.618</p>
      </div>
    </Card>
  )
}
