/**
 * Core QOTE metrics structure
 * Used across all endpoints and engines
 */
export interface QoteMetrics {
  delta_theta: number;      // Misalignment / tension measure (0-1+)
  wobble_W: number;         // Oscillatory instability from wobble equation
  phi_index: number;        // Coherence / golden ratio proximity (0-1)
  state: "coherent" | "borderline" | "unstable" | "critical";
  dimension_band: "L1" | "L2" | "L3" | "L4" | string;  // L1=body, L2=emotion, L3=meaning, etc.
  confidence: number;       // Confidence in this classification (0-1)
}

/**
 * Internal state classification thresholds
 */
export const QOTE_THRESHOLDS = {
  coherent: 0.3,
  borderline: 0.55,
  unstable: 0.8,
  critical: 1.0
} as const;
