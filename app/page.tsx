import { NavHeader } from "@/components/nav-header"
import { LandingHero } from "@/components/landing-hero"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <NavHeader />
      <LandingHero />
      <footer className="border-t border-border px-4 py-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <span className="font-mono text-xs text-muted-foreground">Resona v0</span>
          <span className="font-mono text-xs text-muted-foreground">Enterprise Multi-Agent Platform</span>
        </div>
      </footer>
    </main>
  )
}
