import { QoteMetrics, QOTE_THRESHOLDS } from "../types/qoteMetrics";

/**
 * Coherence Engine
 * Computes QOTE metrics: Δθ (delta_theta), W (wobble), Φ (phi_index)
 *
 * This is the mathematical heart of QOTE.
 * Current implementation uses heuristic estimates - replace with your validated formulas.
 */

/**
 * Main entry point for computing QOTE metrics
 */
export function computeQoteMetrics(input: string, context: any = {}): QoteMetrics {
  // Analyze input characteristics
  const emotionalLoad = estimateEmotionalLoad(input);
  const complexity = estimateComplexity(input);
  const contextualPressure = estimateContextualPressure(context);

  // Core QOTE computations
  const delta_theta = computeDeltaTheta(emotionalLoad, complexity, contextualPressure);
  const wobble_W = computeWobble(emotionalLoad, complexity);
  const phi_index = computePhiIndex(delta_theta, wobble_W);

  // Classify state based on delta_theta
  const state = classifyState(delta_theta);

  // Determine dimension band (L1-L4)
  const dimension_band = determineDimensionBand(input, context);

  // Confidence in classification (based on data quality)
  const confidence = estimateConfidence(input, context);

  return {
    delta_theta,
    wobble_W,
    phi_index,
    state,
    dimension_band,
    confidence
  };
}

/**
 * Compute Δθ (delta theta) - misalignment / tension measure
 * Range: 0-1+ (higher = more misalignment)
 */
function computeDeltaTheta(
  emotionalLoad: number,
  complexity: number,
  contextualPressure: number
): number {
  // Weighted combination of factors
  // TODO: Replace with validated formula from research
  const raw = (emotionalLoad * 0.4) + (complexity * 0.3) + (contextualPressure * 0.3);
  return clamp(raw, 0, 1);
}

/**
 * Compute W (wobble) - oscillatory instability
 * Range: 0-1+ (higher = more instability)
 */
function computeWobble(emotionalLoad: number, complexity: number): number {
  // Wobble measures the difference/oscillation between dimensions
  // TODO: Replace with actual wobble equation from your research
  const raw = Math.abs(emotionalLoad - complexity);
  return clamp(raw, 0, 1);
}

/**
 * Compute Φ (phi index) - coherence / golden corridor proximity
 * Range: 0-1 (higher = more coherent)
 */
function computePhiIndex(delta_theta: number, wobble: number): number {
  // Phi measures alignment with the "golden corridor"
  // Inverse relationship with delta_theta and wobble
  // TODO: Refine with actual golden ratio calculations
  const raw = 1 - (delta_theta * 0.7 + wobble * 0.3);
  return clamp(raw, 0, 1);
}

/**
 * Estimate emotional load from text
 * Range: 0-1
 */
function estimateEmotionalLoad(text: string): number {
  const lowerText = text.toLowerCase();

  // High-intensity emotional markers
  const highIntensityWords = [
    "scared", "terrified", "panic", "crisis", "emergency",
    "dying", "death", "trauma", "abuse", "suicide",
    "hopeless", "desperate", "anguish", "devastated"
  ];

  // Medium-intensity emotional markers
  const mediumIntensityWords = [
    "worried", "anxious", "concerned", "upset", "sad",
    "angry", "frustrated", "confused", "hurt", "pain",
    "fear", "stress", "overwhelmed"
  ];

  // Low-intensity emotional markers
  const lowIntensityWords = [
    "concerned", "wondering", "curious", "uncertain",
    "hope", "wish", "prefer", "like", "dislike"
  ];

  let score = 0;

  highIntensityWords.forEach(word => {
    if (lowerText.includes(word)) score += 0.3;
  });

  mediumIntensityWords.forEach(word => {
    if (lowerText.includes(word)) score += 0.15;
  });

  lowIntensityWords.forEach(word => {
    if (lowerText.includes(word)) score += 0.05;
  });

  // Punctuation intensity (exclamation marks, multiple question marks)
  const exclamationCount = (text.match(/!/g) || []).length;
  const multiQuestionCount = (text.match(/\?\?+/g) || []).length;
  score += Math.min(0.2, (exclamationCount + multiQuestionCount) * 0.05);

  return clamp(score, 0, 1);
}

/**
 * Estimate cognitive complexity from text
 * Range: 0-1
 */
function estimateComplexity(text: string): number {
  // Length-based complexity
  const wordCount = text.split(/\s+/).length;
  const lengthScore = Math.min(1, wordCount / 100);

  // Medical/technical terminology
  const technicalTerms = [
    "diagnosis", "prognosis", "genetic", "mutation", "syndrome",
    "therapy", "treatment", "medication", "protocol", "clinical",
    "pathology", "symptom", "disorder", "condition", "chromosome"
  ];

  const lowerText = text.toLowerCase();
  let technicalScore = 0;
  technicalTerms.forEach(term => {
    if (lowerText.includes(term)) technicalScore += 0.1;
  });

  // Sentence structure complexity (multiple clauses, conjunctions)
  const conjunctionCount = (text.match(/\b(and|but|however|although|because|therefore|while)\b/gi) || []).length;
  const structureScore = Math.min(0.3, conjunctionCount * 0.05);

  const raw = (lengthScore * 0.4) + (Math.min(technicalScore, 0.5) * 0.4) + (structureScore * 0.2);
  return clamp(raw, 0, 1);
}

/**
 * Estimate contextual pressure from context object
 * Range: 0-1
 */
function estimateContextualPressure(context: any): number {
  let pressure = 0;

  // Medical context adds pressure
  if (context?.patient_meta) {
    pressure += 0.2;

    // Young children add pressure
    if (context.patient_meta.age && context.patient_meta.age < 5) {
      pressure += 0.1;
    }

    // Multiple diagnoses add pressure
    if (context.patient_meta.diagnoses && context.patient_meta.diagnoses.length > 2) {
      pressure += 0.1;
    }

    // Flags add pressure
    if (context.patient_meta.flags && context.patient_meta.flags.length > 0) {
      pressure += 0.15;
    }
  }

  // History length (conversation depth)
  if (context?.history && context.history.length > 5) {
    pressure += 0.1;
  }

  // Critical tags
  const criticalTags = ["emergency", "urgent", "critical", "acute", "crisis"];
  if (context?.tags) {
    criticalTags.forEach(tag => {
      if (context.tags.includes(tag)) pressure += 0.2;
    });
  }

  return clamp(pressure, 0, 1);
}

/**
 * Classify coherence state based on delta_theta
 */
function classifyState(delta_theta: number): QoteMetrics["state"] {
  if (delta_theta < QOTE_THRESHOLDS.coherent) return "coherent";
  if (delta_theta < QOTE_THRESHOLDS.borderline) return "borderline";
  if (delta_theta < QOTE_THRESHOLDS.unstable) return "unstable";
  return "critical";
}

/**
 * Determine dimension band (L1-L4)
 * L1 = body/physical
 * L2 = emotion/affect
 * L3 = meaning/cognition
 * L4 = purpose/integration
 */
function determineDimensionBand(input: string, context: any): string {
  const lowerText = input.toLowerCase();

  // L1 indicators (body/physical)
  if (lowerText.match(/\b(pain|symptom|physical|body|heart rate|hrv|sleep|fatigue|energy)\b/)) {
    return "L1";
  }

  // L2 indicators (emotion/affect)
  if (lowerText.match(/\b(feel|emotion|scared|worried|happy|sad|angry|anxious)\b/)) {
    return "L2";
  }

  // L4 indicators (purpose/integration)
  if (lowerText.match(/\b(meaning|purpose|why|understand|integrate|connect|whole)\b/)) {
    return "L4";
  }

  // Default to L3 (cognition/meaning)
  return "L3";
}

/**
 * Estimate confidence in metrics
 * Based on input quality and context richness
 */
function estimateConfidence(input: string, context: any): number {
  let confidence = 0.5; // Base confidence

  // More text = higher confidence
  if (input.length > 50) confidence += 0.1;
  if (input.length > 100) confidence += 0.1;

  // Context presence increases confidence
  if (context?.history && context.history.length > 0) confidence += 0.1;
  if (context?.patient_meta) confidence += 0.1;
  if (context?.signals) confidence += 0.1;

  return clamp(confidence, 0, 1);
}

/**
 * Utility: clamp value to range
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
