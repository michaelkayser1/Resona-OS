"use client"
import { useEffect, useState } from "react"

interface Agent {
  id: string
  name: string
  phase: number
  coherence: number
  deltaTheta: number
  resonance?: number
}

interface Claim {
  id: string
  text: string
  validated: boolean
}

interface ClaimValidatorProps {
  agents: Agent[]
  coherence: number
  deltaTheta: number
}

const initialClaims: Claim[] = [
  { id: "1a", text: "Oscillatory embeddings with phase states", validated: false },
  { id: "1b", text: "Kuramoto synchronization", validated: false },
  { id: "1c", text: "Phase-coherent attention mechanism", validated: false },
  { id: "1d", text: "Relational Δθ controller", validated: false },
  { id: "1e", text: "CUST gating (R ≥ φ)", validated: false },
  { id: "1f", text: "Resonance map generation", validated: false },
  { id: "2", text: "Multi-agent synchronization system", validated: false },
]

export default function ClaimValidator({ agents, coherence, deltaTheta }: ClaimValidatorProps) {
  const [validatedClaims, setValidatedClaims] = useState<Claim[]>(initialClaims)

  useEffect(() => {
    const updated = initialClaims.map((claim) => ({
      ...claim,
      validated: checkClaimValidation(claim.id, agents, coherence, deltaTheta),
    }))
    setValidatedClaims(updated)
  }, [agents, coherence, deltaTheta])

  const checkClaimValidation = (claimId: string, agents: Agent[], coherence: number, deltaTheta: number): boolean => {
    switch (claimId) {
      case "1a":
        return agents.every((a) => a.phase !== undefined)
      case "1b":
        return coherence > 0.6 // Example threshold
      case "1c":
        return agents.length >= 2
      case "1d":
        return deltaTheta !== 0
      case "1e":
        return coherence >= 0.618 // φ approximation
      case "1f":
        return agents.some((a) => a.resonance !== undefined)
      case "2":
        return agents.length >= 3 && coherence > 0.7
      default:
        return false
    }
  }

  return (
    <div className="bg-card p-4 rounded-lg shadow border">
      <h3 className="text-lg font-semibold mb-4">Patent Claim Validation</h3>
      <div className="space-y-2">
        {validatedClaims.map((claim) => (
          <div key={claim.id} className="flex items-center">
            <div className={`w-4 h-4 rounded-full mr-3 ${claim.validated ? "bg-green-500" : "bg-muted"}`} />
            <span className={`text-sm ${claim.validated ? "text-green-700" : "text-muted-foreground"}`}>
              Claim {claim.id}: {claim.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
