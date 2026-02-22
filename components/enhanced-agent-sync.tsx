"use client"
import { useState } from "react"

interface Agent {
  id: string
  name: string
  phase: number
  coherence: number
  deltaTheta: number
  status: "synced" | "syncing" | "disconnected"
  frequency: number
  couplingStrength: number
  latency: number
}

interface EnhancedAgentSyncProps {
  agents: Agent[]
}

export default function EnhancedAgentSync({ agents }: EnhancedAgentSyncProps) {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {agents.map((agent) => (
        <div
          key={agent.id}
          className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
            selectedAgent === agent.id ? "border-primary bg-primary/5" : "border-border bg-card"
          }`}
          onClick={() => setSelectedAgent(agent.id)}
        >
          <div className="flex justify-between items-start mb-3">
            <h4 className="font-semibold text-foreground">{agent.name}</h4>
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                agent.status === "synced"
                  ? "bg-green-100 text-green-800"
                  : agent.status === "syncing"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
              }`}
            >
              {agent.status}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Phase:</span>
              <span className="font-mono">{agent.phase.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Coherence:</span>
              <span className="font-mono">{agent.coherence.toFixed(3)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Δθ:</span>
              <span className="font-mono">{agent.deltaTheta.toFixed(2)}</span>
            </div>
          </div>

          {selectedAgent === agent.id && (
            <div className="mt-3 p-2 bg-muted rounded">
              <div className="text-xs text-muted-foreground">
                <div>Frequency: {agent.frequency}Hz</div>
                <div>Coupling: {agent.couplingStrength}</div>
                <div>Latency: {agent.latency}ms</div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
