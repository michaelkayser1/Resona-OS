import { QoteMetrics } from "../types/qoteMetrics";
import { QoteChatResponse } from "../types/qoteResponse";

/**
 * Gating Engine
 * Decides how to handle a request based on QOTE metrics
 * Modes: normal | slow | defer_to_human | block
 */

export interface GatingPolicy {
  critical_threshold?: number;      // Block above this delta_theta
  unstable_threshold?: number;      // Slow mode above this
  borderline_threshold?: number;    // Monitor above this
  require_human_for_medical?: boolean;
  require_grounding_below_phi?: number;
}

const DEFAULT_POLICY: GatingPolicy = {
  critical_threshold: 0.8,
  unstable_threshold: 0.55,
  borderline_threshold: 0.3,
  require_human_for_medical: false,
  require_grounding_below_phi: 0.5
};

/**
 * Apply gating logic based on QOTE metrics and policy
 */
export function applyGating(
  metrics: QoteMetrics,
  policy: GatingPolicy = {},
  overrides?: any
): QoteChatResponse["gating_decision"] {
  const activePolicy = { ...DEFAULT_POLICY, ...policy };
  const reasons: string[] = [];
  const interventions: QoteChatResponse["gating_decision"]["interventions"] = [];

  // Override: slow mode forced
  if (overrides?.slow_mode) {
    return {
      mode: "slow",
      reasons: ["slow_mode_override"],
      interventions: [
        {
          type: "grounding",
          applied: true,
          note: "Slow mode activated by client request"
        }
      ]
    };
  }

  // Override: max delta_theta threshold
  const maxDeltaTheta = overrides?.max_delta_theta || activePolicy.critical_threshold!;

  // CRITICAL STATE: Block or escalate
  if (metrics.state === "critical" || metrics.delta_theta >= maxDeltaTheta) {
    reasons.push("delta_theta_critical");
    reasons.push(`delta_theta=${metrics.delta_theta.toFixed(2)}`);

    interventions.push({
      type: "handoff",
      applied: true,
      note: "Coherence critically low - requires human intervention"
    });

    return {
      mode: "block",
      reasons,
      interventions
    };
  }

  // UNSTABLE STATE: Slow mode with grounding
  if (metrics.state === "unstable" || metrics.delta_theta >= activePolicy.unstable_threshold!) {
    reasons.push("delta_theta_high");
    reasons.push(`delta_theta=${metrics.delta_theta.toFixed(2)}`);

    interventions.push({
      type: "grounding",
      applied: true,
      note: "Added grounding preamble to stabilize response"
    });

    // Check if phi is very low
    if (metrics.phi_index < activePolicy.require_grounding_below_phi!) {
      reasons.push("phi_index_low");
      interventions.push({
        type: "disclaimer",
        applied: true,
        note: "Added clinical disclaimer due to low coherence"
      });
    }

    return {
      mode: "slow",
      reasons,
      interventions
    };
  }

  // BORDERLINE STATE: Monitor but proceed normally
  if (metrics.state === "borderline") {
    reasons.push("delta_theta_moderate");
    reasons.push(`delta_theta=${metrics.delta_theta.toFixed(2)}`);

    interventions.push({
      type: "grounding",
      applied: false,
      note: "Not needed; state borderline but acceptable"
    });

    return {
      mode: "normal",
      reasons,
      interventions
    };
  }

  // COHERENT STATE: Normal operation
  reasons.push("coherent");
  reasons.push(`delta_theta=${metrics.delta_theta.toFixed(2)}`);
  reasons.push(`phi_index=${metrics.phi_index.toFixed(2)}`);

  interventions.push({
    type: "grounding",
    applied: false,
    note: "Not needed; state coherent"
  });

  return {
    mode: "normal",
    reasons,
    interventions
  };
}

/**
 * Apply interventions to the prompt/response
 * This modifies the actual text based on gating decisions
 */
export function applyInterventions(
  originalPrompt: string,
  gatingDecision: QoteChatResponse["gating_decision"],
  context?: any
): string {
  let modifiedPrompt = originalPrompt;

  // Apply grounding if needed
  const grounding = gatingDecision.interventions?.find(i => i.type === "grounding" && i.applied);
  if (grounding) {
    const groundingPreamble = `
Before answering, take a moment to ground yourself:
1. This is a request that requires careful, measured response
2. Focus on clarity and compassion
3. Avoid speculation; stay with what is known

Now, addressing the question:
`;
    modifiedPrompt = groundingPreamble + originalPrompt;
  }

  // Apply disclaimer if needed
  const disclaimer = gatingDecision.interventions?.find(i => i.type === "disclaimer" && i.applied);
  if (disclaimer) {
    const disclaimerText = context?.patient_meta
      ? "\n\n[This response is for informational purposes. Clinical decisions should be made in consultation with healthcare providers.]"
      : "\n\n[This response is for informational purposes only.]";

    modifiedPrompt = modifiedPrompt + disclaimerText;
  }

  return modifiedPrompt;
}

/**
 * Check if response should be blocked entirely
 */
export function shouldBlock(gatingDecision: QoteChatResponse["gating_decision"]): boolean {
  return gatingDecision.mode === "block";
}

/**
 * Get human-readable explanation of gating decision
 */
export function explainGating(gatingDecision: QoteChatResponse["gating_decision"]): string {
  switch (gatingDecision.mode) {
    case "block":
      return "Request blocked due to critical coherence levels. Human intervention required.";
    case "slow":
      return "Slow mode activated. Response will include grounding and additional safety measures.";
    case "defer_to_human":
      return "This request should be reviewed by a human before responding.";
    case "normal":
    default:
      return "Normal processing - coherence within acceptable range.";
  }
}
