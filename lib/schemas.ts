export type RBFRDesign = {
  goal: "maximize_yield" | "reduce_heat" | "stabilize_structure"
  field: {
    carrierHz: number // drive freq
    waveform: "sine" | "pulse" | "fm" | "am"
    modulationIndex: number // 0..1
    coilConfig: "helmholtz" | "solenoid" | "multi-turn"
  }
  guards: { maxTempC: number; maxFieldTesla: number }
  notes: string[]
}

export type FieldMetrics = { W: number; beta: number; CUST: number }

export type ArtUniforms = { phase: number; sep: number; width: number; wobble: number; gain: number }
