import { GitBranch, Activity, Shield, Rocket, CheckCircle2 } from "lucide-react"
import { MOCK_AGENT_RUNS } from "@/lib/agents/types"
import { StatCard } from "@/components/stat-card"
import { AgentCard } from "@/components/agent-card"
import { PipelineVisualization } from "@/components/pipeline-visualization"
import { ActivityChart } from "@/components/activity-chart"
import { DeployStatus } from "@/components/deploy-status"
import { WobbleGauge } from "@/components/wobble-gauge"

const activeAgents = MOCK_AGENT_RUNS.filter((r) => r.status === "running").length
const totalRuns = MOCK_AGENT_RUNS.length
const mergedRuns = MOCK_AGENT_RUNS.filter((r) => r.status === "merged").length
const avgScore = MOCK_AGENT_RUNS.filter((r) => r.guardianScore !== null)
  .reduce((sum, r) => sum + (r.guardianScore || 0), 0) /
  MOCK_AGENT_RUNS.filter((r) => r.guardianScore !== null).length

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mission Control</h1>
        <p className="text-sm text-muted-foreground">
          Real-time visibility into agent runs, merge gates, and deployments.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active Agents"
          value={activeAgents}
          subtitle="running now"
          icon={Activity}
          trend={{ value: 15, label: "vs last hour" }}
        />
        <StatCard
          label="Total Runs"
          value={totalRuns}
          subtitle="today"
          icon={GitBranch}
          trend={{ value: 23, label: "vs yesterday" }}
        />
        <StatCard
          label="Merged"
          value={mergedRuns}
          subtitle={`of ${totalRuns} runs`}
          icon={CheckCircle2}
          trend={{ value: 8, label: "merge rate" }}
        />
        <StatCard
          label="Avg Guardian Score"
          value={(avgScore * 100).toFixed(0)}
          subtitle="/ 100"
          icon={Shield}
          trend={{ value: 4, label: "improvement" }}
        />
      </div>

      {/* Pipeline */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-2 flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Agent Pipeline</h2>
          <span className="ml-auto font-mono text-[10px] text-muted-foreground">LIVE</span>
        </div>
        <PipelineVisualization />
      </div>

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          {/* Activity chart */}
          <ActivityChart />

          {/* Agent runs */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Recent Agent Runs</h2>
              <span className="font-mono text-[10px] text-muted-foreground">{totalRuns} total</span>
            </div>
            <div className="space-y-2">
              {MOCK_AGENT_RUNS.map((run) => (
                <AgentCard key={run.id} run={run} />
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <DeployStatus />

          {/* Guardian score widget */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Overall Stability</h3>
            <div className="flex justify-center">
              <WobbleGauge score={avgScore} size="md" />
            </div>
          </div>

          {/* Quick actions */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: "Spawn Builder Agent", action: "spawn" },
                { label: "Run All Tests", action: "test" },
                { label: "Force Guardian Scan", action: "scan" },
                { label: "Export Audit Log", action: "export" },
              ].map((item) => (
                <button
                  key={item.action}
                  className="flex h-9 w-full items-center justify-center rounded-md border border-border bg-secondary text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
