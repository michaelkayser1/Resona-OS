import { cn } from "@/lib/utils"
import { MOCK_DEPLOY_STATUS } from "@/lib/agents/types"
import { Rocket, ExternalLink, GitBranch } from "lucide-react"

export function DeployStatus() {
  const deploy = MOCK_DEPLOY_STATUS

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <Rocket className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Deployment</h3>
        <span className={cn(
          "ml-auto flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium",
          deploy.status === "ready" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"
        )}>
          <span className={cn(
            "h-1.5 w-1.5 rounded-full",
            deploy.status === "ready" ? "bg-success" : "bg-warning"
          )} />
          {deploy.status === "ready" ? "Live" : "Deploying"}
        </span>
      </div>

      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Environment</span>
          <span className="font-medium capitalize text-foreground">{deploy.environment}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Branch</span>
          <span className="flex items-center gap-1 font-mono text-foreground">
            <GitBranch className="h-3 w-3" />
            {deploy.branch}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Commit</span>
          <span className="font-mono text-primary">{deploy.commitHash}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Last deployed</span>
          <span className="text-foreground">
            {new Date(deploy.lastDeployed).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>

      <a
        href={deploy.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex h-9 items-center justify-center gap-1.5 rounded-md border border-border bg-secondary text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
      >
        <ExternalLink className="h-3 w-3" />
        Visit Production
      </a>
    </div>
  )
}
