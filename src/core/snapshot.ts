/**
 * Core coherence snapshot module
 * Provides canonical schema and validation for system state snapshots
 */

export interface CoherenceSnapshot {
  timestamp: string;
  app: {
    version: string;
    environment: string;
    uptime: number;
  };
  context: {
    R: number; // Coherence measure
    beta: number; // Coupling strength
    deltaTheta: number; // Phase difference
    tauRecoveryMs: number; // Recovery time constant
  };
  metrics: {
    requestCount: number | null;
    errorRate: number | null;
    avgLatencyMs: number | null;
    qoteProcessingCount: number | null;
  };
  flags: string[];
  notes: string;
}

/**
 * Creates a coherence snapshot with defaults
 */
export function makeSnapshot(
  partial: Partial<CoherenceSnapshot> = {}
): CoherenceSnapshot {
  const now = new Date().toISOString();

  return {
    timestamp: partial.timestamp ?? now,
    app: {
      version: partial.app?.version ?? "1.0.0",
      environment: partial.app?.environment ?? process.env.NODE_ENV ?? "development",
      uptime: partial.app?.uptime ?? process.uptime?.() ?? 0,
    },
    context: {
      R: partial.context?.R ?? 0.0,
      beta: partial.context?.beta ?? 1.0,
      deltaTheta: partial.context?.deltaTheta ?? 0.0,
      tauRecoveryMs: partial.context?.tauRecoveryMs ?? 1000,
    },
    metrics: {
      requestCount: partial.metrics?.requestCount ?? null,
      errorRate: partial.metrics?.errorRate ?? null,
      avgLatencyMs: partial.metrics?.avgLatencyMs ?? null,
      qoteProcessingCount: partial.metrics?.qoteProcessingCount ?? null,
    },
    flags: partial.flags ?? [],
    notes: partial.notes ?? "",
  };
}

/**
 * Validates a coherence snapshot
 * Returns validation result with any errors found
 */
export function validateSnapshot(
  x: unknown
): { ok: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!x || typeof x !== "object") {
    return { ok: false, errors: ["Snapshot must be an object"] };
  }

  const snapshot = x as any;

  // Validate timestamp
  if (!snapshot.timestamp || typeof snapshot.timestamp !== "string") {
    errors.push("timestamp must be a string");
  } else {
    const date = new Date(snapshot.timestamp);
    if (isNaN(date.getTime())) {
      errors.push("timestamp must be a valid ISO date string");
    }
  }

  // Validate app
  if (!snapshot.app || typeof snapshot.app !== "object") {
    errors.push("app must be an object");
  } else {
    if (typeof snapshot.app.version !== "string") {
      errors.push("app.version must be a string");
    }
    if (typeof snapshot.app.environment !== "string") {
      errors.push("app.environment must be a string");
    }
    if (typeof snapshot.app.uptime !== "number" || snapshot.app.uptime < 0) {
      errors.push("app.uptime must be a non-negative number");
    }
  }

  // Validate context
  if (!snapshot.context || typeof snapshot.context !== "object") {
    errors.push("context must be an object");
  } else {
    if (typeof snapshot.context.R !== "number") {
      errors.push("context.R must be a number");
    }
    if (typeof snapshot.context.beta !== "number") {
      errors.push("context.beta must be a number");
    }
    if (typeof snapshot.context.deltaTheta !== "number") {
      errors.push("context.deltaTheta must be a number");
    }
    if (
      typeof snapshot.context.tauRecoveryMs !== "number" ||
      snapshot.context.tauRecoveryMs < 0
    ) {
      errors.push("context.tauRecoveryMs must be a non-negative number");
    }
  }

  // Validate metrics
  if (!snapshot.metrics || typeof snapshot.metrics !== "object") {
    errors.push("metrics must be an object");
  } else {
    const metricsFields = [
      "requestCount",
      "errorRate",
      "avgLatencyMs",
      "qoteProcessingCount",
    ];
    for (const field of metricsFields) {
      const value = snapshot.metrics[field];
      if (value !== null && typeof value !== "number") {
        errors.push(`metrics.${field} must be a number or null`);
      }
    }
  }

  // Validate flags
  if (!Array.isArray(snapshot.flags)) {
    errors.push("flags must be an array");
  } else {
    for (let i = 0; i < snapshot.flags.length; i++) {
      if (typeof snapshot.flags[i] !== "string") {
        errors.push(`flags[${i}] must be a string`);
      }
    }
  }

  // Validate notes
  if (typeof snapshot.notes !== "string") {
    errors.push("notes must be a string");
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}
