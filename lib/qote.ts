import type { RBFRDesign, FieldMetrics, ArtUniforms } from "./schemas"

export const PHI = 1.61803398875

function agreementScore(vs: string[]): number {
  // 0 (no agree) .. 1 (full agree)
  if (!vs.length) return 0
  const uniq = new Set(vs)
  return 1 - (uniq.size - 1) / Math.max(vs.length - 1, 1)
}

export function measureConsensus(jsons: RBFRDesign[]): FieldMetrics {
  const waveforms = jsons.map((j) => j.field.waveform)
  const coils = jsons.map((j) => j.field.coilConfig)
  const aWave = agreementScore(waveforms)
  const aCoil = agreementScore(coils)

  const W = Math.max(0, 1 - 0.5 * (aWave + aCoil)) // lower is better
  const beta = 0.8 + 0.4 * aWave // 0.8..1.2
  const CUST = 1.0 + 0.6 * aCoil // 1.0..1.6 ≈ φ when fully aligned

  return { W, beta, CUST }
}

export function uniformsFrom(metrics: FieldMetrics, t: number): ArtUniforms {
  return {
    phase: Math.PI * metrics.CUST + 0.2 * t,
    sep: 0.25 + 0.4 * (metrics.CUST - 1.0),
    width: 0.15 - 0.1 * Math.min(metrics.W, 1),
    wobble: metrics.W,
    gain: Math.pow(1 + metrics.beta, 0.5),
  }
}
