"use client"

import { cn } from "@/lib/utils"
import { Hammer, FlaskConical, RefreshCw, FileText, Shield, ArrowRight, CheckCircle2 } from "lucide-react"

const PIPELINE_STAGES = [
  { icon: Hammer, label: "Builder", sublabel: "Feature code", active: true, complete: false },
  { icon: FlaskConical, label: "Tester", sublabel: "Test suite", active: false, complete: true },
  { icon: RefreshCw, label: "Refactorer", sublabel: "Architecture", active: false, complete: false },
  { icon: FileText, label: "Clinician", sublabel: "Documentation", active: false, complete: false },
  { icon: Shield, label: "Guardian", sublabel: "Merge gate", active: false, complete: false },
]

export function PipelineVisualization() {
  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-center justify-between gap-2 min-w-[600px] px-2 py-4">
        {PIPELINE_STAGES.map((stage, i) => (
          <div key={stage.label} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "relative flex h-12 w-12 items-center justify-center rounded-xl border-2 transition-all",
                  stage.active
                    ? "border-primary bg-primary/15 shadow-[0_0_20px_rgba(0,200,200,0.15)]"
                    : stage.complete
                    ? "border-success/50 bg-success/10"
                    : "border-border bg-secondary"
                )}
              >
                {stage.complete ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : (
                  <stage.icon className={cn("h-5 w-5", stage.active ? "text-primary" : "text-muted-foreground")} />
                )}
                {stage.active && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary animate-pulse" />
                )}
              </div>
              <span className={cn("text-xs font-medium", stage.active ? "text-foreground" : "text-muted-foreground")}>
                {stage.label}
              </span>
              <span className="text-[10px] text-muted-foreground">{stage.sublabel}</span>
            </div>
            {i < PIPELINE_STAGES.length - 1 && (
              <ArrowRight className={cn(
                "h-4 w-4 shrink-0",
                stage.complete ? "text-success/50" : "text-border"
              )} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
