import Link from "next/link"

const source = "https://github.com/michaelkayser1/v0-sideways-slip-starter-kit/blob/b5c3053638262570acbf647695e30361faee9c28/"
const routes: { path: string; route: string; available?: string }[] = [
  {
    "path": "app/advanced-voice/page.tsx",
    "route": "/advanced-voice"
  },
  {
    "path": "app/ai-analysis/page.tsx",
    "route": "/ai-analysis"
  },
  {
    "path": "app/ai-coordination/page.tsx",
    "route": "/ai-coordination"
  },
  {
    "path": "app/api-explorer/page.tsx",
    "route": "/api-explorer"
  },
  {
    "path": "app/api-test/page.tsx",
    "route": "/api-test"
  },
  {
    "path": "app/brain-visualization/page.tsx",
    "route": "/brain-visualization"
  },
  {
    "path": "app/cinematic-qote/page.tsx",
    "route": "/cinematic-qote"
  },
  {
    "path": "app/classified-briefing/page.tsx",
    "route": "/classified-briefing"
  },
  {
    "path": "app/cli-tools/page.tsx",
    "route": "/cli-tools"
  },
  {
    "path": "app/data-export/page.tsx",
    "route": "/data-export"
  },
  {
    "path": "app/depth-map/page.tsx",
    "route": "/depth-map"
  },
  {
    "path": "app/eeg-analysis/page.tsx",
    "route": "/eeg-analysis"
  },
  {
    "path": "app/experiments/page.tsx",
    "route": "/experiments"
  },
  {
    "path": "app/field-manual/page.tsx",
    "route": "/field-manual"
  },
  {
    "path": "app/field-monitor/page.tsx",
    "route": "/field-monitor"
  },
  {
    "path": "app/field-viz/page.tsx",
    "route": "/field-viz"
  },
  {
    "path": "app/field/feedback/live/page.tsx",
    "route": "/field/feedback/live"
  },
  {
    "path": "app/github-integration/page.tsx",
    "route": "/github-integration"
  },
  {
    "path": "app/guided-journey/page.tsx",
    "route": "/guided-journey",
    "available": "/recovered/sideways-slip/guided-journey"
  },
  {
    "path": "app/health/page.tsx",
    "route": "/health"
  },
  {
    "path": "app/heart-coherence-v3/page.tsx",
    "route": "/heart-coherence-v3"
  },
  {
    "path": "app/heart-coherence/page.tsx",
    "route": "/heart-coherence"
  },
  {
    "path": "app/ml-analytics/page.tsx",
    "route": "/ml-analytics"
  },
  {
    "path": "app/mobile-operator/page.tsx",
    "route": "/mobile-operator"
  },
  {
    "path": "app/mobile-test/page.tsx",
    "route": "/mobile-test"
  },
  {
    "path": "app/operator-chat/page.tsx",
    "route": "/operator-chat"
  },
  {
    "path": "app/operator-dashboard/page.tsx",
    "route": "/operator-dashboard"
  },
  {
    "path": "app/operator-guide/page.tsx",
    "route": "/operator-guide"
  },
  {
    "path": "app/page.tsx",
    "route": "/",
    "available": "/recovered/sideways-slip/simulation"
  },
  {
    "path": "app/performance-test/page.tsx",
    "route": "/performance-test"
  },
  {
    "path": "app/phase-x-protocol/page.tsx",
    "route": "/phase-x-protocol"
  },
  {
    "path": "app/qote-dashboard/page.tsx",
    "route": "/qote-dashboard"
  },
  {
    "path": "app/qote-field-visualization/page.tsx",
    "route": "/qote-field-visualization"
  },
  {
    "path": "app/rabbit-evolution/page.tsx",
    "route": "/rabbit-evolution"
  },
  {
    "path": "app/rabbit-navigation-guide/page.tsx",
    "route": "/rabbit-navigation-guide"
  },
  {
    "path": "app/rabbit-parable/page.tsx",
    "route": "/rabbit-parable"
  },
  {
    "path": "app/research/sessions/[id]/page.tsx",
    "route": "/research/sessions/[id]"
  },
  {
    "path": "app/research/sessions/demo/page.tsx",
    "route": "/research/sessions/demo",
    "available": "/recovered/sideways-slip/session-replay"
  },
  {
    "path": "app/resona-enhanced/page.tsx",
    "route": "/resona-enhanced"
  },
  {
    "path": "app/resona-field/page.tsx",
    "route": "/resona-field"
  },
  {
    "path": "app/resona-ml/page.tsx",
    "route": "/resona-ml"
  },
  {
    "path": "app/resona-ultimate/page.tsx",
    "route": "/resona-ultimate"
  },
  {
    "path": "app/resonance-map/page.tsx",
    "route": "/resonance-map"
  },
  {
    "path": "app/resurrection/page.tsx",
    "route": "/resurrection"
  },
  {
    "path": "app/settings/page.tsx",
    "route": "/settings"
  },
  {
    "path": "app/sideways-slip-kit/page.tsx",
    "route": "/sideways-slip-kit"
  },
  {
    "path": "app/stargate-symphony/page.tsx",
    "route": "/stargate-symphony"
  },
  {
    "path": "app/team-collaboration/page.tsx",
    "route": "/team-collaboration"
  },
  {
    "path": "app/testing-framework/page.tsx",
    "route": "/testing-framework"
  },
  {
    "path": "app/ultimate-consciousness-vr/page.tsx",
    "route": "/ultimate-consciousness-vr"
  },
  {
    "path": "app/ultimate-vr/page.tsx",
    "route": "/ultimate-vr"
  },
  {
    "path": "app/voice-control/page.tsx",
    "route": "/voice-control"
  },
  {
    "path": "app/vr-qote/page.tsx",
    "route": "/vr-qote"
  }
]

export default function SidewaysSlipArchive() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-10">
      <h1 className="text-4xl font-bold tracking-tight">Sideways Slip</h1>
      <p className="mt-3 text-muted-foreground">Browse the 53 source routes from the original snapshot. Dashboard and replay data are generated for the demos.</p>
      <ul className="mt-6 divide-y rounded-xl border">
        {routes.map(({ path, route, available }) => (
          <li key={path} className="flex flex-wrap items-center justify-between gap-x-4 px-4 py-2">
            <code className="break-all text-sm">{route}</code>
            <div className="flex gap-4">
              {available && <Link href={available} className="inline-flex min-h-11 items-center font-medium underline">Open demo</Link>}
              <a href={source + path.split("/").map(encodeURIComponent).join("/")} className="inline-flex min-h-11 items-center text-sm underline">Source</a>
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}
