import type { SimParams } from "./types"

export const presets: Record<string, { name: string; params: SimParams }> = {
  chaos: {
    name: "Chaos",
    params: {
      N: 100,
      K: 0.1,
      sigma: 0.5,
      omega0: 1.0,
      D: 0.5,
      beta: 0.0,
      fv: 0.1,
      rhoqp: 1.0,
      dt: 0.01,
    },
  },
  edge: {
    name: "Edge of Chaos",
    params: {
      N: 100,
      K: 1.0,
      sigma: 0.2,
      omega0: 1.0,
      D: 0.1,
      beta: 0.0,
      fv: 0.1,
      rhoqp: 1.0,
      dt: 0.01,
    },
  },
  coherent: {
    name: "Coherent",
    params: {
      N: 100,
      K: 2.0,
      sigma: 0.1,
      omega0: 1.0,
      D: 0.01,
      beta: 0.0,
      fv: 0.1,
      rhoqp: 1.0,
      dt: 0.01,
    },
  },
  pulse: {
    name: "Pulse",
    params: {
      N: 100,
      K: 1.0,
      sigma: 0.1,
      omega0: 1.0,
      D: 0.05,
      beta: 0.5,
      fv: 0.1,
      rhoqp: 1.0,
      dt: 0.01,
    },
  },
}
