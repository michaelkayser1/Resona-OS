"use client"

import { cn } from "@/lib/utils"
import { Shield, GitBranch, Rocket, User, AlertTriangle, Lock } from "lucide-react"

interface AuditEntry {
  id: string
  timestamp: string
  actor: string
  action: string
  resource: string
  hash: string
}

const ICON_MAP: Record<string, typeof Shield> = {
  "agent.": GitBranch,
  "guardian.": Shield,
  "deploy.": Rocket,
  "auth.": User,
  "compliance.": Lock,
}

function getIcon(action: string) {
  for (const [prefix, Icon] of Object.entries(ICON_MAP)) {
    if (action.startsWith(prefix)) return Icon
  }
  return AlertTriangle
}

const MOCK_AUDIT: AuditEntry[] = [
  { id: "1", timestamp: "2026-02-20T09:20:00Z", actor: "system", action: "deploy.complete", resource: "production", hash: "a3f7c2d" },
  { id: "2", timestamp: "2026-02-20T09:14:00Z", actor: "guardian", action: "guardian.approve", resource: "PR #42", hash: "b8e1f4a" },
  { id: "3", timestamp: "2026-02-20T09:10:00Z", actor: "guardian-agent", action: "guardian.score", resource: "PR #42", hash: "c9d3e5b" },
  { id: "4", timestamp: "2026-02-20T08:41:00Z", actor: "clinician-agent", action: "agent.commit", resource: "agent/clinician", hash: "d1a8b7c" },
  { id: "5", timestamp: "2026-02-20T08:30:00Z", actor: "refactorer-agent", action: "agent.spawn", resource: "agent/refactorer", hash: "e2b9c8d" },
  { id: "6", timestamp: "2026-02-20T08:22:00Z", actor: "tester-agent", action: "agent.complete", resource: "agent/tester", hash: "f3c0d9e" },
  { id: "7", timestamp: "2026-02-20T08:15:00Z", actor: "tester-agent", action: "agent.spawn", resource: "agent/tester", hash: "0a1b2c3" },
  { id: "8", timestamp: "2026-02-20T08:12:00Z", actor: "builder-agent", action: "agent.complete", resource: "agent/builder", hash: "1b2c3d4" },
  { id: "9", timestamp: "2026-02-20T08:00:00Z", actor: "builder-agent", action: "agent.spawn", resource: "agent/builder", hash: "2c3d4e5" },
  { id: "10", timestamp: "2026-02-20T07:55:00Z", actor: "system", action: "compliance.redaction", resource: "log-sanitizer", hash: "3d4e5f6" },
]

function formatTime(ts: string) {
  return new Date(ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
}

export function AuditTable() {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[640px]">
        <thead>
          <tr className="border-b border-border">
            <th className="px-3 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Time</th>
            <th className="px-3 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Actor</th>
            <th className="px-3 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Action</th>
            <th className="px-3 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Resource</th>
            <th className="px-3 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Hash</th>
          </tr>
        </thead>
        <tbody>
          {MOCK_AUDIT.map((entry, i) => {
            const Icon = getIcon(entry.action)
            return (
              <tr
                key={entry.id}
                className={cn(
                  "border-b border-border/50 transition-colors hover:bg-secondary/30",
                  i === 0 && "bg-primary/5"
                )}
              >
                <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">
                  {formatTime(entry.timestamp)}
                </td>
                <td className="px-3 py-2.5 text-xs text-foreground">
                  {entry.actor}
                </td>
                <td className="px-3 py-2.5">
                  <span className="flex items-center gap-1.5 text-xs">
                    <Icon className="h-3 w-3 text-muted-foreground" />
                    <span className="font-mono text-foreground">{entry.action}</span>
                  </span>
                </td>
                <td className="px-3 py-2.5 font-mono text-xs text-primary/80">
                  {entry.resource}
                </td>
                <td className="px-3 py-2.5 font-mono text-[10px] text-muted-foreground">
                  {entry.hash}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
