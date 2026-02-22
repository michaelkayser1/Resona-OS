export type PatentClaim = {
  id: number
  title: string
  description: string
  status: "demonstrated" | "active" | "ready" | "blocked" | "todo"
}

export type AgentT = {
  id: string
  name: string
  role: string
  color: string
  phase: number
  coherence: number
  deltaTheta: number
}

export type Packet = {
  timestamp: string
  patentClaims: PatentClaim[]
  currentState: {
    coherence: number
    variance: number
    custStatus: boolean
    syncSteps: number
    agentCoherence: number
    sharedDeltaTheta: number
  }
  parameters: {
    coupling: number
    threshold: number
    archetype: number
    speed: number
  }
  agents: AgentT[]
  resonanceMap: {
    token: string
    resonance: number
    phase: number
  }[]
  attentionMatrix: number[][]
}

const clamp01 = (x: number) => Math.max(0, Math.min(1, x))

export function normalizeAttention(A: number[][]) {
  const rows = A && A.length ? A : [[1]]
  return rows.map((row) => {
    const r = row.map((v) => (Number.isFinite(v) && v > 0 ? v : 0))
    const s = r.reduce((a, b) => a + b, 0) || 1
    return r.map((v) => v / s)
  })
}

export function rowEntropy(row: number[]) {
  const eps = 1e-12
  return -row.reduce((acc, p) => acc + p * Math.log(p + eps), 0)
}

export function attnEntropy(A: number[][]) {
  const H = A.map(rowEntropy)
  return H.reduce((a, b) => a + b, 0) / Math.max(1, H.length)
}

export function validatePacket(raw: any) {
  const p = raw as Packet
  const fixedAgents = (p.agents || []).map((a) => ({
    ...a,
    coherence: clamp01(Number.isFinite(a.coherence) ? a.coherence : 0),
  }))
  const A = normalizeAttention(p.attentionMatrix || [])
  const entropy = attnEntropy(A)
  const coherence = clamp01(Number(p.currentState?.coherence ?? 0))
  const variance = Math.max(0, Number(p.currentState?.variance ?? 0))
  return {
    ...p,
    currentState: { ...p.currentState, coherence, variance },
    agents: fixedAgents,
    attentionMatrix: A,
    attentionEntropy: entropy,
  }
}
