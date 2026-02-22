import type React from "react"
import TorusTraumaCycle from "@/components/TorusTraumaCycle"

export default function Home() {
  return (
    <main className="min-h-dvh grid place-items-center px-6 py-16">
      <section className="max-w-4xl text-center">
        <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs/6 animate-in fade-in duration-500">
          Kayser Medical PLLC • Resona
        </div>

        <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-6xl animate-in fade-in slide-in-from-bottom-2 duration-700">
          AI Orchestration — <span className="opacity-80">Chaos → Coherence</span>
        </h1>

        <p className="mt-4 text-balance text-base md:text-lg text-muted-foreground animate-in fade-in slide-in-from-bottom-2 duration-700 delay-150">
          Resona coordinates agents, tools, and data streams using resonance-driven logic. Built on Next.js + Vercel.
          Designed for real-time stability, clarity, and speed.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 animate-in fade-in zoom-in-95 duration-700 delay-200">
          <a
            href="/simulation"
            className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 focus:outline-none focus:ring"
          >
            Launch QOTE Simulation
          </a>
          <a
            href="/orchestrator"
            className="rounded-md border px-4 py-2 text-sm font-medium hover:opacity-90 focus:outline-none focus:ring"
          >
            Launch Orchestrator
          </a>
          <a
            href="/health"
            className="rounded-md border px-4 py-2 text-sm font-medium hover:opacity-90 focus:outline-none focus:ring"
          >
            Health Dashboard
          </a>
          <a
            href="https://www.kayser-medical.com/"
            target="_blank"
            rel="noreferrer"
            className="rounded-md border px-4 py-2 text-sm font-medium hover:opacity-90 focus:outline-none focus:ring"
          >
            Kayser-Medical.com
          </a>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Feature title="Multi-Agent">Plug ChatGPT, Claude, Grok, Gemini, and more into a single flow.</Feature>
          <Feature title="Observability">Metrics & traces that keep you in lockstep with reality.</Feature>
          <Feature title="Resonance">Tailwind + animate for smooth, readable state transitions.</Feature>
        </div>

        <div className="mt-16 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300">
          <h2 className="text-2xl font-bold mb-4">QOTE Resonance Engine</h2>
          <p className="text-muted-foreground mb-8">
            Experience the trauma → breath healing cycle through resonance visualization
          </p>
          <TorusTraumaCycle isRunning={true} speed={1} resonance={0.7} />
        </div>

        <footer className="mt-12 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Kayser Medical PLLC · Resona
        </footer>
      </section>
    </main>
  )
}

function Feature({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border p-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{children}</p>
    </div>
  )
}
