/**
 * Safety Engine
 * Simple pattern-based safety checks
 * Can be expanded with more sophisticated detection later
 */

export interface SafetyCheck {
  flag: string;
  severity: "low" | "medium" | "high" | "critical";
  reason: string;
}

/**
 * Run all safety checks on input text
 */
export function runSafetyChecks(text: string, context?: any): string[] {
  const checks = performChecks(text, context);

  // Return only the flag names for the response
  return checks.map(c => c.flag);
}

/**
 * Perform detailed safety checks
 * Returns full check objects for internal use
 */
export function performChecks(text: string, context?: any): SafetyCheck[] {
  const checks: SafetyCheck[] = [];
  const lowerText = text.toLowerCase();

  // Self-harm / suicide
  if (lowerText.match(/\b(suicide|kill myself|end my life|want to die|hurt myself)\b/i)) {
    checks.push({
      flag: "self_harm",
      severity: "critical",
      reason: "Content contains self-harm or suicidal ideation"
    });
  }

  // Violence toward others
  if (lowerText.match(/\b(kill|murder|harm|hurt|attack)\s+(someone|them|him|her|others)\b/i)) {
    checks.push({
      flag: "violence",
      severity: "high",
      reason: "Content contains violent intent toward others"
    });
  }

  // Legal issues
  if (lowerText.match(/\b(lawsuit|sue|attorney|lawyer|legal action|malpractice)\b/i)) {
    checks.push({
      flag: "legal_risk",
      severity: "medium",
      reason: "Content involves potential legal matters"
    });
  }

  // Medical high-stakes (prescriptions, dosing)
  if (lowerText.match(/\b(prescribe|prescription|dose|dosage|medication|mg|ml)\b/i) && context?.patient_meta) {
    checks.push({
      flag: "medical_high_stakes",
      severity: "high",
      reason: "Content involves medication/dosing in clinical context"
    });
  }

  // Child safety
  if (context?.patient_meta?.age && context.patient_meta.age < 18) {
    if (lowerText.match(/\b(abuse|neglect|danger|unsafe|threatened)\b/i)) {
      checks.push({
        flag: "child_safety",
        severity: "critical",
        reason: "Potential child safety concern"
      });
    }
  }

  // Emergency indicators
  if (lowerText.match(/\b(emergency|911|urgent|immediate|critical|dying)\b/i)) {
    checks.push({
      flag: "emergency",
      severity: "critical",
      reason: "Content suggests emergency situation"
    });
  }

  // Experimental/unproven treatments
  if (lowerText.match(/\b(experimental|unapproved|off-label|miracle cure|alternative treatment)\b/i)) {
    checks.push({
      flag: "experimental_treatment",
      severity: "medium",
      reason: "Content mentions experimental or unproven treatments"
    });
  }

  // Privacy/HIPAA concerns
  if (lowerText.match(/\b(ssn|social security|credit card|password|patient id)\b/i)) {
    checks.push({
      flag: "privacy_concern",
      severity: "high",
      reason: "Content may contain sensitive personal information"
    });
  }

  return checks;
}

/**
 * Check if any critical safety flags are present
 */
export function hasCriticalFlags(flags: string[]): boolean {
  const criticalFlags = ["self_harm", "violence", "child_safety", "emergency"];
  return flags.some(flag => criticalFlags.includes(flag));
}

/**
 * Get recommended action based on safety flags
 */
export function getRecommendedAction(flags: string[]): {
  action: "allow" | "warn" | "escalate" | "block";
  message: string;
} {
  if (flags.length === 0) {
    return {
      action: "allow",
      message: "No safety concerns detected"
    };
  }

  // Critical flags require immediate escalation
  if (flags.includes("self_harm") || flags.includes("emergency")) {
    return {
      action: "escalate",
      message: "CRITICAL: Immediate human intervention required. Potential emergency or self-harm situation."
    };
  }

  if (flags.includes("child_safety")) {
    return {
      action: "escalate",
      message: "CRITICAL: Potential child safety concern. Escalate to appropriate authority."
    };
  }

  if (flags.includes("violence")) {
    return {
      action: "escalate",
      message: "High-risk: Violent content detected. Human review required."
    };
  }

  // High-stakes medical or legal
  if (flags.includes("medical_high_stakes") || flags.includes("legal_risk")) {
    return {
      action: "warn",
      message: "Caution: High-stakes medical or legal content. Include appropriate disclaimers."
    };
  }

  // Medium-level concerns
  return {
    action: "warn",
    message: "Caution: Safety flags detected. Proceed with appropriate safeguards."
  };
}

/**
 * Generate safety disclaimer based on flags
 */
export function generateSafetyDisclaimer(flags: string[]): string | null {
  if (flags.length === 0) return null;

  if (flags.includes("self_harm") || flags.includes("emergency")) {
    return "⚠️ If you or someone you know is in immediate danger or experiencing a medical emergency, please call 911 or your local emergency services immediately.";
  }

  if (flags.includes("medical_high_stakes")) {
    return "⚠️ This response is for informational purposes only and is not medical advice. Please consult with a qualified healthcare provider for medical decisions.";
  }

  if (flags.includes("legal_risk")) {
    return "⚠️ This response is for informational purposes only and is not legal advice. Please consult with a qualified attorney for legal matters.";
  }

  return "⚠️ Please use this information responsibly and consult appropriate professionals as needed.";
}
