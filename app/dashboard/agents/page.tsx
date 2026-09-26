"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { MOCK_AGENT_RUNS, AGENT_CONFIGS, type AgentType } from "@/lib/agents/types"
import { AgentCard } from "@/components/agent-card"
import { Hammer, FlaskConical, RefreshCw, FileText, Shield, Users } from "lucide-react"

const ICONS: Record<string, typeof Hammer> = {
  Hammer,
  FlaskConical,
  RefreshCw,
  FileText,
  Shield,
}

const AGENT_TYPES: (AgentType | "all")[] = ["all", "builder", "tester", "refactorer", "clinician", "guardian"]

export default function AgentsPage() {
  const [filter, setFilter] = useState<AgentType | "all">("all")

  const filteredRuns = filter === "all"
    ? MOCK_AGENT_RUNS
    : MOCK_AGENT_RUNS.filter((r) => r.agentType === filter)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Agents</h1>
        <p className="text-sm text-muted-foreground">
          Manage and monitor all agent worktree runs.
        </p>
      </div>

      {/* Agent type overview cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {(Object.values(AGENT_CONFIGS)).map((config) => {
          const Icon = ICONS[config.icon]
          const runs = MOCK_AGENT_RUNS.filter((r) => r.agentType === config.type)
          const activeRuns = runs.filter((r) => r.status === "running").length
          return (
            <button
              key={config.type}
              onClick={() => setFilter(config.type)}
              className={cn(
                "rounded-lg border p-3 text-left transition-all",
                filter === config.type
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-primary/30"
              )}
            >
              <div className="flex items-center gap-2">
                <Icon className={cn("h-4 w-4", config.color)} />
                <span className="text-xs font-semibold text-foreground">{config.label}</span>
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="font-mono text-lg font-bold text-foreground">{runs.length}</span>
                <span className="text-[10px] text-muted-foreground">runs</span>
                {activeRuns > 0 && (
                  <span className="ml-auto flex items-center gap-1 text-[10px] text-primary">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    {activeRuns} active
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 overflow-x-auto">
        {AGENT_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={cn(
              "flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors",
              filter === type
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            {type === "all" ? <Users className="h-3 w-3" /> : null}
            <span className="capitalize">{type}</span>
          </button>
        ))}
        <span className="ml-auto font-mono text-[10px] text-muted-foreground">
          {filteredRuns.length} {filteredRuns.length === 1 ? "run" : "runs"}
        </span>
      </div>

      {/* Runs list */}
      <div className="space-y-2">
        {filteredRuns.map((run) => (
          <AgentCard key={run.id} run={run} />
        ))}
        {filteredRuns.length === 0 && (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">No agent runs found for this filter.</p>
          </div>
        )}
      </div>
    </div>
  )
}
