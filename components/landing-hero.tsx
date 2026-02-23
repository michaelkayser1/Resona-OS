"use client"

import Link from "next/link"
import { ResonaLogo } from "./resona-logo"
import { ArrowRight, Shield, GitBranch, Activity, Lock, Cpu, FileText } from "lucide-react"

const FEATURES = [
  {
    icon: GitBranch,
    title: "Parallel Agent Worktrees",
    description: "Each AI agent operates in its own git worktree. Zero conflicts. Real isolation.",
  },
  {
    icon: Shield,
    title: "Guardian Merge Gate",
    description: "Deterministic scoring engine evaluates every PR before merge. No silent merges.",
  },
  {
    icon: Activity,
    title: "Live Agent Dashboard",
    description: "Real-time visibility into agent runs, CI status, Guardian scores, and deploy state.",
  },
  {
    icon: Lock,
    title: "Immutable Audit Chain",
    description: "SHA-256 hash-chained event log. Every action recorded. Full traceability.",
  },
  {
    icon: Cpu,
    title: "Enterprise RBAC",
    description: "Role-based access control with Admin, Developer, Clinician, Reviewer, and Guardian roles.",
  },
  {
    icon: FileText,
    title: "Compliance Ready",
    description: "HIPAA-safe architecture with PHI guardrails. Zero sensitive data in dev logs.",
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
            <span className="font-mono text-xs text-muted-foreground">Multi-Agent Development Platform</span>
          </div>

          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Ship code with
            <span className="text-primary"> autonomous agents</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
            Resona orchestrates AI coding agents through isolated git worktrees, 
            deterministic merge gating, and immutable audit logging. 
            Enterprise-grade compliance from day one.
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
              Built for regulated environments
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Every component designed with compliance, auditability, and safety in mind.
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
              Five specialized agents, one orchestrated pipeline.
            </p>
          </div>
          <div className="space-y-3">
            {[
              { step: "01", title: "Spawn", desc: "Agents spawn in isolated git worktrees. Each gets its own branch, environment, and scope." },
              { step: "02", title: "Build", desc: "Builder writes features. Tester adds coverage. Refactorer improves architecture. Clinician documents." },
              { step: "03", title: "Score", desc: "Guardian evaluates every change via the Wobble scoring engine. Diff complexity, test confidence, dependency risk." },
              { step: "04", title: "Gate", desc: "PRs below threshold are rejected automatically. No manual review bottleneck for high-confidence merges." },
              { step: "05", title: "Deploy", desc: "Approved changes merge to main. Vercel deploys. Audit event logged. Dashboard updates in real-time." },
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
            Ready to orchestrate?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Explore the live dashboard to see agents in action.
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
