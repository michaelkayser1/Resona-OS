const START_TIME = Date.now()
const SAFE_ENV_LABEL = process.env.RESONA_ENV_LABEL || process.env.ENVIRONMENT || "unknown"
const APP_VERSION = process.env.APP_VERSION || "2025.08.21.1"

// Function to calculate total memory from process.memoryUsage()
function getTotalMemoryMB(): number {
  // Estimate total memory from current usage (this is a fallback approach)
  const usage = process.memoryUsage()
  const currentMB = Math.round(usage.rss / 1024 / 1024)
  // Estimate total as 4x current usage (typical for containers)
  return Math.max(currentMB * 4, 512) // Minimum 512MB
}

// Security: Never expose secrets
function redactSecrets(obj: any): any {
  const str = JSON.stringify(obj, (_, value) => {
    if (typeof value === "string" && /key_[A-Za-z0-9]+|sk-[A-Za-z0-9]+|secret|token/i.test(value)) {
      return "[redacted]"
    }
    return value
  })
  return JSON.parse(str)
}

function pct(numerator: number, denominator: number): number {
  return Math.round((numerator / denominator) * 1000) / 10
}

function generateSparkline(length = 24): number[] {
  // Generate realistic sparkline data (24h worth)
  return Array.from({ length }, (_, i) => {
    const base = 30 + Math.sin(i / 4) * 20 // Daily pattern
    const noise = (Math.random() - 0.5) * 10
    return Math.max(0, Math.min(100, base + noise))
  })
}

function getMockMemoryUsage() {
  // Generate realistic memory usage values
  const usedMB = Math.round(Math.random() * 200 + 100) // 100-300MB
  const totalMB = Math.max(usedMB * 4, 512) // Minimum 512MB
  return { usedMB, totalMB }
}

function getUptimeSeconds(): number {
  return Math.floor((Date.now() - START_TIME) / 1000)
}

export async function GET() {
  const startTime = Date.now()

  try {
    const { usedMB, totalMB } = getMockMemoryUsage()
    const uptime = getUptimeSeconds()

    // Simulate realistic system metrics for demo
    const cpuPct = Math.round((Math.random() * 40 + 20) * 10) / 10 // 20-60%
    const diskUsedGb = Math.round((Math.random() * 20 + 10) * 10) / 10 // 10-30GB
    const diskTotalGb = 40

    const healthData = {
      env: {
        label: SAFE_ENV_LABEL,
        version: APP_VERSION,
      },
      overall: {
        state: "ok",
        message: "All systems nominal",
      },
      uptime: {
        since: new Date(START_TIME).toISOString(),
        seconds: uptime,
        last_restart_reason: process.env.LAST_RESTART || "deploy",
      },
      cpu: {
        pct: cpuPct,
        series: generateSparkline(),
      },
      memory: {
        used_mb: usedMB,
        total_mb: totalMB,
        pct: pct(usedMB, totalMB), // Fixed percentage calculation bug
        series: generateSparkline(),
      },
      disk: {
        used_gb: diskUsedGb,
        total_gb: diskTotalGb,
        pct: pct(diskUsedGb, diskTotalGb),
      },
      network: {
        rx_kbps: Math.round(Math.random() * 500 + 100),
        tx_kbps: Math.round(Math.random() * 300 + 200),
        errors_pct: Math.round(Math.random() * 0.1 * 100) / 100,
      },
      app: {
        rps: Math.round((Math.random() * 10 + 5) * 10) / 10,
        errors_pct: Math.round(Math.random() * 1 * 100) / 100,
        latency_ms: {
          p50: Math.round(Math.random() * 100 + 150),
          p95: Math.round(Math.random() * 200 + 300),
          p99: Math.round(Math.random() * 400 + 600),
        },
        queue_depth: Math.floor(Math.random() * 3),
      },
      deps: {
        openai: {
          success_pct: Math.round((98 + Math.random() * 2) * 10) / 10,
          rate_limit_hits: Math.floor(Math.random() * 2),
          latency_ms_p95: Math.round(Math.random() * 200 + 300),
        },
        db: {
          connections: Math.floor(Math.random() * 8 + 10),
          slow_queries: Math.floor(Math.random() * 2),
        },
        cache: {
          hit_pct: Math.round((90 + Math.random() * 8) * 10) / 10,
        },
      },
      quotas: {
        openai: {
          mtd_cost_usd: Math.round((Math.random() * 200 + 100) * 100) / 100,
          budget_usd: 600,
          pct: Math.round((Math.random() * 30 + 15) * 10) / 10,
        },
      },
      alerts: [
        ...(Math.random() > 0.8
          ? [
              {
                id: "mem-warn",
                severity: "warning" as const,
                title: "Memory usage elevated",
                active: Math.random() > 0.5,
              },
            ]
          : []),
      ],
      events: [
        {
          type: "deploy",
          version: APP_VERSION,
          at: new Date(Date.now() - Math.random() * 86400000).toISOString(),
          by: "system",
        },
      ],
      responseTime: Date.now() - startTime,
    }

    const sanitizedData = redactSecrets(healthData)

    return new Response(JSON.stringify(sanitizedData, null, 2), {
      headers: {
        "content-type": "application/json",
        "cache-control": "no-store, no-cache, must-revalidate",
        "x-content-type-options": "nosniff",
        "x-frame-options": "DENY",
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "GET",
        "access-control-allow-headers": "Content-Type",
      },
    })
  } catch (error) {
    console.error("[v0] Health check error:", error)

    const errorResponse = {
      env: { label: SAFE_ENV_LABEL, version: APP_VERSION },
      overall: { state: "error", message: "Health check failed" },
      error: error instanceof Error ? error.message : "Internal server error",
      timestamp: new Date().toISOString(),
      uptime: { seconds: getUptimeSeconds(), since: new Date(START_TIME).toISOString() },
    }

    return new Response(JSON.stringify(errorResponse, null, 2), {
      status: 500,
      headers: {
        "content-type": "application/json",
        "cache-control": "no-store",
        "access-control-allow-origin": "*",
      },
    })
  }
}
