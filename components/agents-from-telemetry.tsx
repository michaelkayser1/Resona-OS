import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AgentsFromTelemetry({
  agents,
  sharedDelta,
}: {
  agents: {
    name: string
    color: string
    phase: number
    coherence: number
    deltaTheta: number
  }[]
  sharedDelta: number
}) {
  const meanCoherence =
    agents.reduce((a, b) => a + Math.max(0, Math.min(1, b.coherence)), 0) / Math.max(1, agents.length)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Multi-Agent Telemetry</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground">Shared Δθ</div>
            <div className="text-lg font-mono">{sharedDelta.toFixed(3)}</div>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground">Mean Coherence</div>
            <div className="text-lg font-mono">{meanCoherence.toFixed(3)}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {agents.map((agent, i) => (
            <div key={i} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: agent.color }} />
                <span className="font-semibold">{agent.name}</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Phase</span>
                  <span className="font-mono">{agent.phase.toFixed(3)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Δθ</span>
                  <span className="font-mono">{agent.deltaTheta.toFixed(3)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Coherence</span>
                  <span className="font-mono">{Math.max(0, Math.min(1, agent.coherence)).toFixed(3)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
