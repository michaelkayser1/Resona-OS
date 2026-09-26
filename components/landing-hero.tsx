"use client"

import Link from "next/link"
import { ResonaLogo } from "./resona-logo"
import { ArrowRight, Shield, GitBranch, Activity, Lock, Cpu, FileText } from "lucide-react"

const FEATURES = [
  {
    icon: GitBranch,
    title: "Parallel Agent Worktrees",
    description: "Explore isolated git worktrees as a proposed boundary for agent development.",
  },
  {
    icon: Shield,
    title: "Guardian Merge Gate",
    description: "Prototype scoring and review controls for proposed code changes.",
  },
  {
    icon: Activity,
    title: "Live Agent Dashboard",
    description: "Dashboard views for examining agent activity and review status.",
  },
  {
    icon: Lock,
    title: "Immutable Audit Chain",
    description: "Explore hash-chained receipts; external completeness and custody still require validation.",
  },
  {
    icon: Cpu,
    title: "Enterprise RBAC",
    description: "Prototype roles for studying who may propose, review, and approve an action.",
  },
  {
    icon: FileText,
    title: "Validation Required",
    description: "No clinical or compliance approval is implied. Do not enter patient information.",
  },
]

export function LandingHero() {
  return (
    <div className="relative">
      {/* Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />

      {/* Hero section */}
      <section className="relative px-4 pb-16 pt-20 md:pb-24 md:pt-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="font-mono text-xs text-muted-foreground">Research prototype · agent governance</span>
          </div>

          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Explore controls for
            <span className="text-primary"> AI-assisted work</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
            Examine proposed boundaries for agent activity, review, and audit.
            This interface is experimental; its controls require independent validation
            before real-world deployment.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/dashboard"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
            >
              Open Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard/guardian"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-border bg-secondary px-6 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80 sm:w-auto"
            >
              <Shield className="h-4 w-4" />
              Try Guardian
            </Link>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="relative border-t border-border px-4 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">
              Questions to validate before deployment
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              The dashboard illustrates controls; it does not establish regulatory or clinical readiness.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-lg border border-border bg-card p-5 transition-all hover:border-primary/30 hover:bg-card/80"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture overview */}
      <section className="relative border-t border-border px-4 py-16 md:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">
              How it works
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              An illustrative agent workflow to inspect and test.
            </p>
          </div>
          <div className="space-y-3">
            {[
              { step: "01", title: "Spawn", desc: "Assign a scoped worktree and proposed capabilities to an agent." },
              { step: "02", title: "Build", desc: "Generate a change and gather test and review evidence." },
              { step: "03", title: "Score", desc: "Inspect changes against an explicit review policy and record uncertainty." },
              { step: "04", title: "Gate", desc: "Require an authorized reviewer before a consequential transition." },
              { step: "05", title: "Observe", desc: "Record what actually happened after an authorized action." },
            ].map((item) => (
              <div
                key={item.step}
                className="flex gap-4 rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/30"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-mono text-sm font-bold text-primary">
                  {item.step}
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative border-t border-border px-4 py-16 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <ResonaLogo className="mx-auto mb-4 h-12 w-12" />
          <h2 className="text-2xl font-bold text-foreground md:text-3xl">
            Explore the prototype
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Inspect the dashboard and test the proposed controls. Do not enter patient information.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex h-12 items-center gap-2 rounded-lg bg-primary px-8 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Launch Dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
