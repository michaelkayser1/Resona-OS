import type { SimParams, RuntimeState } from "./types"

export class KuramotoEngine {
  private params: SimParams
  private theta: Float64Array
  private omega: Float64Array
  private state: RuntimeState
  private time = 0

  constructor(params: SimParams) {
    this.params = { ...params }
    this.theta = new Float64Array(params.N)
    this.omega = new Float64Array(params.N)
    this.state = {
      theta: this.theta,
      r: 0,
      psi: 0,
      C: 0,
      R: 0,
      W: 0,
      time: 0,
    }
    this.initialize()
  }

  private initialize() {
    // Initialize phases randomly
    for (let i = 0; i < this.params.N; i++) {
      this.theta[i] = Math.random() * 2 * Math.PI
      this.omega[i] = (Math.random() - 0.5) * this.params.sigma
    }
    this.updateOrderParameter()
  }

  private updateOrderParameter() {
    let sumCos = 0
    let sumSin = 0

    for (let i = 0; i < this.params.N; i++) {
      sumCos += Math.cos(this.theta[i])
      sumSin += Math.sin(this.theta[i])
    }

    sumCos /= this.params.N
    sumSin /= this.params.N

    this.state.r = Math.sqrt(sumCos * sumCos + sumSin * sumSin)
    this.state.psi = Math.atan2(sumSin, sumCos)
    this.state.C = this.state.r

    // Calculate resonance: R = (K * N / 2) * C^2
    this.state.R = ((this.params.K * this.params.N) / 2) * this.state.C * this.state.C

    // Calculate wobble: W = ω₀ * ρ_qp * σ_θ
    const sigmaTheta = Math.sqrt(Math.max(0, -2 * Math.log(Math.max(1e-6, this.state.C))))
    this.state.W = this.params.omega0 * this.params.rhoqp * sigmaTheta

    this.state.time = this.time
  }

  step() {
    const { K, D, beta, fv, dt } = this.params
    const { r, psi } = this.state

    // Update phases using Kuramoto equation
    for (let i = 0; i < this.params.N; i++) {
      const noise = Math.sqrt(2 * D) * (Math.random() - 0.5)
      const driving = beta * Math.sin(2 * Math.PI * fv * this.time + i)

      this.theta[i] += dt * (this.omega[i] + K * r * Math.sin(psi - this.theta[i]) + driving + noise)

      // Wrap phase to [0, 2π]
      this.theta[i] = ((this.theta[i] % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
    }

    this.time += dt
    this.updateOrderParameter()
  }

  updateParams(newParams: SimParams) {
    const oldN = this.params.N
    this.params = { ...newParams }

    // Resize arrays if N changed
    if (newParams.N !== oldN) {
      const newTheta = new Float64Array(newParams.N)
      const newOmega = new Float64Array(newParams.N)

      // Copy existing data
      const copyLength = Math.min(oldN, newParams.N)
      for (let i = 0; i < copyLength; i++) {
        newTheta[i] = this.theta[i]
        newOmega[i] = this.omega[i]
      }

      // Initialize new oscillators
      for (let i = copyLength; i < newParams.N; i++) {
        newTheta[i] = Math.random() * 2 * Math.PI
        newOmega[i] = (Math.random() - 0.5) * newParams.sigma
      }

      this.theta = newTheta
      this.omega = newOmega
      this.state.theta = this.theta
    }

    // Update frequency distribution
    for (let i = 0; i < newParams.N; i++) {
      this.omega[i] = (Math.random() - 0.5) * newParams.sigma
    }

    this.updateOrderParameter()
  }

  reset() {
    this.time = 0
    this.initialize()
  }

  randomizePhases() {
    for (let i = 0; i < this.params.N; i++) {
      this.theta[i] = Math.random() * 2 * Math.PI
    }
    this.updateOrderParameter()
  }

  getState(): RuntimeState {
    return { ...this.state }
  }
}
