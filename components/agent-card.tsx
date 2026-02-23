"use client"

import { cn } from "@/lib/utils"
import type { AgentRun } from "@/lib/agents/types"
import { AGENT_CONFIGS } from "@/lib/agents/types"
import { Hammer, FlaskConical, RefreshCw, FileText, Shield, GitBranch, Clock } from "lucide-react"

const ICONS = {
  Hammer,
  FlaskConical,
  RefreshCw,
  FileText,
  Shield,
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  idle: { bg: "bg-muted", text: "text-muted-foreground", label: "Idle" },
  spawning: { bg: "bg-warning/15", text: "text-warning", label: "Spawning" },
  running: { bg: "bg-primary/15", text: "text-primary", label: "Running" },
  committed: { bg: "bg-chart-2/15", text: "text-chart-2", label: "Committed" },
  failed: { bg: "bg-destructive/15", text: "text-destructive", label: "Failed" },
  merged: { bg: "bg-success/15", text: "text-success", label: "Merged" },
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function AgentCard({ run }: { run: AgentRun }) {
  const config = AGENT_CONFIGS[run.agentType]
  const IconComponent = ICONS[config.icon as keyof typeof ICONS]
  const statusStyle = STATUS_STYLES[run.status] || STATUS_STYLES.idle

  return (
    <div className="group rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/30 hover:bg-card/80">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg bg-secondary", config.color)}>
            <IconComponent className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">{config.label}</h3>
              <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", statusStyle.bg, statusStyle.text)}>
                {statusStyle.label}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{run.summary}</p>
          </div>
        </div>

        {run.guardianScore !== null && (
          <div className="text-right">
            <div className={cn(
              "font-mono text-lg font-bold",
              run.guardianScore >= 0.75 ? "text-success" :
              run.guardianScore >= 0.6 ? "text-warning" : "text-destructive"
            )}>
              {(run.guardianScore * 100).toFixed(0)}
            </div>
            <div className="text-[10px] text-muted-foreground">score</div>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <GitBranch className="h-3 w-3" />
          <span className="font-mono">{run.branch}</span>
        </span>
        {run.commitHash && (
          <span className="font-mono text-primary/70">{run.commitHash}</span>
        )}
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {timeAgo(run.startedAt)}
        </span>
        <span className="ml-auto flex items-center gap-2">
          <span className="text-success">+{run.linesAdded}</span>
          <span className="text-destructive">-{run.linesDeleted}</span>
          <span>{run.filesChanged} files</span>
        </span>
      </div>
    </div>
  )
}
