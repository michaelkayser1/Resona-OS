import { GuardianPanel } from "@/components/guardian-panel"
import { MOCK_AGENT_RUNS } from "@/lib/agents/types"
import { WobbleGauge } from "@/components/wobble-gauge"
import { Shield, CheckCircle2, XCircle, AlertTriangle } from "lucide-react"

const scoredRuns = MOCK_AGENT_RUNS.filter((r) => r.guardianScore !== null)
const mergedCount = scoredRuns.filter((r) => r.guardianScore! >= 0.75).length
const revisedCount = scoredRuns.filter((r) => r.guardianScore! >= 0.6 && r.guardianScore! < 0.75).length
const rejectedCount = scoredRuns.filter((r) => r.guardianScore! < 0.6).length

export default function GuardianPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Guardian Merge Gate</h1>
        <p className="text-sm text-muted-foreground">
          Deterministic scoring engine for PR quality enforcement.
        </p>
      </div>

      {/* Score summary cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/15">
            <CheckCircle2 className="h-5 w-5 text-success" />
          </div>
          <div>
            <div className="font-mono text-2xl font-bold text-foreground">{mergedCount}</div>
            <div className="text-xs text-muted-foreground">Approved to merge</div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/15">
            <AlertTriangle className="h-5 w-5 text-warning" />
          </div>
          <div>
            <div className="font-mono text-2xl font-bold text-foreground">{revisedCount}</div>
            <div className="text-xs text-muted-foreground">Needs revision</div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/15">
            <XCircle className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <div className="font-mono text-2xl font-bold text-foreground">{rejectedCount}</div>
            <div className="text-xs text-muted-foreground">Rejected</div>
          </div>
        </div>
      </div>

      {/* Interactive scoring panel */}
      <GuardianPanel />

      {/* Score history */}
      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Shield className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Score History</h3>
          <span className="ml-auto font-mono text-[10px] text-muted-foreground">{scoredRuns.length} scored</span>
        </div>
        <div className="divide-y divide-border/50">
          {scoredRuns.map((run) => (
            <div key={run.id} className="flex items-center gap-4 px-4 py-3">
              <WobbleGauge score={run.guardianScore!} size="sm" showLabel={false} />
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground">{run.summary}</div>
                <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="font-mono">{run.branch}</span>
                  <span>{run.filesChanged} files</span>
                  <span className="text-success">+{run.linesAdded}</span>
                  <span className="text-destructive">-{run.linesDeleted}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-sm font-bold text-foreground">
                  {(run.guardianScore! * 100).toFixed(0)}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {run.guardianScore! >= 0.75 ? "merge" : run.guardianScore! >= 0.6 ? "revise" : "reject"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
