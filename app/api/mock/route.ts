import type { ProviderId, RBFRDesign } from "@/lib/schemas"

export const runtime = "edge"

// --- tiny seeded RNG (sfc32) ---
function cyrb128(str: string) {
  let h1 = 1779033703,
    h2 = 3144134277,
    h3 = 1013904242,
    h4 = 2773480762
  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i)
    h1 = (h2 ^ Math.imul(h1 ^ k, 597399067)) >>> 0
    h2 = (h3 ^ Math.imul(h2 ^ k, 2869860233)) >>> 0
    h3 = (h4 ^ Math.imul(h3 ^ k, 951274213)) >>> 0
    h4 = (h1 ^ Math.imul(h4 ^ k, 2716044179)) >>> 0
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067) >>> 0
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233) >>> 0
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213) >>> 0
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179) >>> 0
  return [h1, h2, h3, h4]
}

function sfc32(a: number, b: number, c: number, d: number) {
  return () => {
    a >>>= 0
    b >>>= 0
    c >>>= 0
    d >>>= 0
    let t = (a + b) | 0
    a = b ^ (b >>> 9)
    b = (c + (c << 3)) | 0
    c = (c << 21) | (c >>> 11)
    d = (d + 1) | 0
    t = (t + d) | 0
    c = (c + t) | 0
    return (t >>> 0) / 4294967296
  }
}

function makeRng(seedStr: string) {
  const [a, b, c, d] = cyrb128(seedStr)
  return sfc32(a, b, c, d)
}

// --- helpers ---
const IDS: ProviderId[] = ["openai", "anthropic", "mistral", "xai", "deepseek"]
function pick<T>(rng: () => number, arr: T[]) {
  return arr[Math.floor(rng() * arr.length)]
}

function design(rng: () => number, base: Partial<RBFRDesign>): RBFRDesign {
  const wave: RBFRDesign["field"]["waveform"][] = ["sine", "pulse", "fm", "am"]
  const coil: RBFRDesign["field"]["coilConfig"][] = ["helmholtz", "solenoid", "multi-turn"]
  const jitter = (c: number, span: number) => c + (rng() * 2 - 1) * span

  return {
    goal: base.goal ?? "stabilize_structure",
    field: {
      carrierHz: Math.max(5, Math.min(200, Math.round(jitter((base as any)?.field?.carrierHz ?? 37, 8)))),
      waveform: (base as any)?.field?.waveform ?? pick(rng, wave),
      modulationIndex: Math.min(1, Math.max(0, (base as any)?.field?.modulationIndex ?? 0.2 + rng() * 0.6)),
      coilConfig: (base as any)?.field?.coilConfig ?? pick(rng, coil),
    },
    guards: {
      maxTempC: (base as any)?.guards?.maxTempC ?? 180,
      maxFieldTesla: (base as any)?.guards?.maxFieldTesla ?? 2.0,
    },
    notes: ["demo-proposal", "resolve: efficiency vs heat (TRIZ)"],
  }
}

export async function POST(req: Request) {
  const url = new URL(req.url)
  const seed = url.searchParams.get("seed") || "demo-seed"
  const rng = makeRng(seed)

  const { messages } = await req.json()
  const baseTxt = messages?.find((m: any) => m.role === "user")?.content ?? "{}"
  let base: any = {}
  try {
    base = JSON.parse(baseTxt.split("\n").slice(1).join("\n"))
  } catch {}

  // generate proposals; force some agreement for consensus visualization
  const results = IDS.map((id, i) => {
    const d = design(rng, base)
    if (i === 0 || i === 1) {
      d.field.waveform = "sine"
      d.field.coilConfig = "helmholtz"
    }
    const content = JSON.stringify(d)
    return { id, out: { choices: [{ message: { content } }] } }
  })

  return new Response(JSON.stringify({ results }), { headers: { "Content-Type": "application/json" } })
}
