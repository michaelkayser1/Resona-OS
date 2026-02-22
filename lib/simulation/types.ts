export interface SimParams {
  N: number // Number of oscillators
  K: number // Coupling strength
  sigma: number // Frequency spread
  omega0: number // Base frequency
  D: number // Noise intensity
  beta: number // Driving amplitude
  fv: number // Driving frequency
  rhoqp: number // Zero-point density
  dt: number // Time step
}

export interface RuntimeState {
  theta: Float64Array // Oscillator phases
  r: number // Order parameter magnitude
  psi: number // Order parameter phase
  C: number // Coherence
  R: number // Resonance
  W: number // Wobble
  time: number // Current time
}

export interface Preset {
  name: string
  params: SimParams
}
