import { AuditTable } from "@/components/audit-table"
import { Shield, Lock, CheckCircle2, Hash } from "lucide-react"

export default function AuditPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Audit Log</h1>
        <p className="text-sm text-muted-foreground">
          Immutable, hash-chained event log. Every action recorded with full traceability.
        </p>
      </div>

      {/* Audit stats */}
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Events</span>
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-foreground">10</div>
          <div className="text-xs text-muted-foreground">total logged</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Chain</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="font-mono text-2xl font-bold text-success">Valid</span>
          </div>
          <div className="text-xs text-muted-foreground">integrity verified</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Redactions</span>
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-foreground">1</div>
          <div className="text-xs text-muted-foreground">PHI patterns caught</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Compliant</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="font-mono text-2xl font-bold text-success">Yes</span>
          </div>
          <div className="text-xs text-muted-foreground">zero violations</div>
        </div>
      </div>

      {/* Chain integrity visualization */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-3 flex items-center gap-2">
          <Lock className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Hash Chain Integrity</h3>
          <span className="ml-auto flex items-center gap-1.5 rounded-full bg-success/15 px-2.5 py-1 text-[10px] font-medium text-success">
            <CheckCircle2 className="h-3 w-3" />
            All blocks verified
          </span>
        </div>
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex shrink-0 items-center gap-1">
              <div className="flex h-8 w-16 items-center justify-center rounded border border-success/30 bg-success/5 font-mono text-[9px] text-success">
                #{i + 1}
              </div>
              {i < 9 && (
                <div className="h-px w-3 bg-success/30" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Compliance modules */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground">PHI Redaction Engine</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Automatically scans all log entries for sensitive patterns including SSN, MRN, DOB, email, and phone numbers.
          </p>
          <div className="mt-3 space-y-1.5">
            {["SSN Pattern", "MRN Pattern", "DOB Pattern", "Email Pattern", "Phone Pattern"].map((pattern) => (
              <div key={pattern} className="flex items-center justify-between rounded-md bg-secondary/50 px-2.5 py-1.5">
                <span className="font-mono text-[10px] text-foreground">{pattern}</span>
                <span className="flex items-center gap-1 text-[10px] text-success">
                  <CheckCircle2 className="h-3 w-3" />
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground">RBAC Access Matrix</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Role-based permissions enforce who can view, export, or modify audit data.
          </p>
          <div className="mt-3 space-y-1.5">
            {[
              { role: "Admin", perms: "Full access" },
              { role: "Guardian", perms: "View + Score" },
              { role: "Developer", perms: "View only" },
              { role: "Clinician", perms: "Compliance view" },
              { role: "Read Only", perms: "No access" },
            ].map((item) => (
              <div key={item.role} className="flex items-center justify-between rounded-md bg-secondary/50 px-2.5 py-1.5">
                <span className="text-[10px] font-medium text-foreground">{item.role}</span>
                <span className="font-mono text-[10px] text-muted-foreground">{item.perms}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Event table */}
      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Hash className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Event Timeline</h3>
          <span className="ml-auto font-mono text-[10px] text-muted-foreground">APPEND-ONLY</span>
        </div>
        <AuditTable />
      </div>
    </div>
  )
}
