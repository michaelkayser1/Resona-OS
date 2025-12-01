const TAU = 2 * Math.PI
const clamp01 = (x: number) => Math.max(0, Math.min(1, x))

export function wrapAngle(x: number) {
  let y = x % TAU
  if (y <= -Math.PI) y += TAU
  if (y > Math.PI) y -= TAU
  return y
}

export function tokenizeSafe(s: string): string[] {
  const toks = s.split(/\s+/).filter(Boolean)
  // Guarantee at least one token to avoid N=0 elsewhere
  return toks.length ? toks.slice(0, 64) : ["∅"]
}

export function orderParameter(theta: number[]): { R: number; mu: number } {
  const N = Math.max(1, theta.length)
  let sx = 0,
    sy = 0
  for (const t of theta) {
    sx += Math.cos(t || 0)
    sy += Math.sin(t || 0)
  }
  sx /= N
  sy /= N
  const R = clamp01(Math.hypot(sx, sy))
  const mu = Math.atan2(sy, sx)
  return { R, mu: isFinite(mu) ? mu : 0 }
}

export function softmax(row: number[]): number[] {
  if (!row.length) return [1]
  const m = Math.max(...row.map((v) => (Number.isFinite(v) ? v : Number.NEGATIVE_INFINITY)))
  const exps = row.map((v) => Math.exp((Number.isFinite(v) ? v : Number.NEGATIVE_INFINITY) - m))
  const s = exps.reduce((a, b) => a + b, 0) || 1
  return exps.map((e) => e / s)
}

export function makeInitialPhases(N: number, jitter = 0.4): number[] {
  const n = Math.max(1, N)
  return Array.from({ length: n }, (_, i) => {
    const base = (i / n) * TAU
    const j = (Math.random() - 0.5) * (2 * jitter)
    return wrapAngle(base + j)
  })
}

export function custScore(R: number, phaseVar: number, attnEntropy: number) {
  const rTerm = R // [0,1]
  const varTerm = Math.exp(-phaseVar) // lower variance => closer to 1
  const entTerm = Math.exp(-attnEntropy) // lower entropy => closer to 1
  // weighted geo-mean: weakest link matters
  const rho = Math.pow(rTerm, 0.5) * Math.pow(varTerm, 0.3) * Math.pow(entTerm, 0.2)
  return Math.max(0, Math.min(1, rho))
}

export function checkCUST(rho: number, tau: number) {
  return rho >= tau
}

export function circularMean(angles: number[]) {
  let x = 0,
    y = 0
  for (const a of angles) {
    x += Math.cos(a)
    y += Math.sin(a)
  }
  return Math.atan2(y, x)
}

export function multiAgentVote(rhos: number[], consensus = 2 / 3) {
  const passes = rhos.filter((r) => r >= 0.618).length
  const rate = passes / Math.max(1, rhos.length)
  return { passRate: rate, passed: rate >= consensus }
}

export function downloadJSON(data: unknown, name = "resonance-map") {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${name}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function svgToPNG(svgEl: SVGSVGElement, name = "attention") {
  const xml = new XMLSerializer().serializeToString(svgEl)
  const svg64 = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(xml)))
  const img = new Image()
  img.onload = () => {
    const c = document.createElement("canvas")
    c.width = img.width
    c.height = img.height
    const g = c.getContext("2d")!
    g.drawImage(img, 0, 0)
    const a = document.createElement("a")
    a.href = c.toDataURL("image/png")
    a.download = `${name}.png`
    a.click()
  }
  img.src = svg64
}

export function generateDemoOutput() {
  return "✅ CUST passed: coherent response emitted (demo text)"
}
