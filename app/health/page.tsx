"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

const RefreshIcon = ({ className = "h-4 w-4", spinning = false }: { className?: string; spinning?: boolean }) => (
  <svg
    className={`${className} ${spinning ? "animate-spin" : ""}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </svg>
)

const CheckCircleIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
      clipRule="evenodd"
    />
  </svg>
)

const CpuIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
    />
  </svg>
)

const DatabaseIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
    />
  </svg>
)

const HardDriveIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
)

const TrendingUpIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
)

const ZapIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
      clipRule="evenodd"
    />
  </svg>
)

const NetworkIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
    />
  </svg>
)

const AlertTriangleIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    />
  </svg>
)

const ClockIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)

interface HealthData {
  env: { label: string; version: string }
  overall: { state: string; message: string }
  uptime: { since: string; seconds: number; last_restart_reason: string }
  cpu: { pct: number; series: number[] }
  memory: { used_mb: number; total_mb: number; pct: number; series: number[] }
  disk: { used_gb: number; total_gb: number; pct: number }
  network: { rx_kbps: number; tx_kbps: number; errors_pct: number }
  app: {
    rps: number
    errors_pct: number
    latency_ms: { p50: number; p95: number; p99: number }
    queue_depth: number
  }
  deps: {
    openai: { success_pct: number; rate_limit_hits: number; latency_ms_p95: number }
    db: { connections: number; slow_queries: number }
    cache: { hit_pct: number }
  }
  quotas: {
    openai: { mtd_cost_usd: number; budget_usd: number; pct: number }
  }
  alerts: Array<{ id: string; severity: string; title: string; active: boolean }>
  events: Array<{ type: string; version?: string; at: string; by: string }>
  responseTime: number
}

function HealthCard({
  title,
  value,
  sub,
  icon,
  status = "ok",
  sparkline,
}: {
  title: string
  value: string
  sub?: string
  icon: React.ReactNode
  status?: "ok" | "warn" | "critical"
  sparkline?: number[]
}) {
  const statusColors = {
    ok: "text-green-600 bg-green-50 border-green-200",
    warn: "text-yellow-600 bg-yellow-50 border-yellow-200",
    critical: "text-red-600 bg-red-50 border-red-200",
  }

  return (
    <Card className={`${statusColors[status]} transition-colors`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        {sparkline && (
          <div className="mt-2 h-8 flex items-end space-x-0.5">
            {sparkline.slice(-12).map((point, i) => (
              <div
                key={i}
                className="bg-current opacity-60 w-1 rounded-sm"
                style={{ height: `${Math.max(2, (point / 100) * 32)}px` }}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function Header({
  env,
  version,
  state,
  stats,
}: {
  env: string
  version: string
  state: string
  stats: HealthData
}) {
  const stateColors = {
    ok: "text-green-600",
    degraded: "text-yellow-600",
    incident: "text-red-600",
  }

  return (
    <div className="bg-white border-b p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Resona Health Dashboard</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span>
                Environment: <strong>{env}</strong>
              </span>
              <span>
                Version: <strong>{version}</strong>
              </span>
              <span className={`font-semibold ${stateColors[state as keyof typeof stateColors] || "text-gray-600"}`}>
                Status: {state.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="text-right text-sm">
            <div>
              Last 24h: {stats.app.rps} RPS • {stats.app.errors_pct}% errors
            </div>
            <div>
              p95: {stats.app.latency_ms.p95}ms • OpenAI: {stats.quotas.openai.pct}% quota
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AlertsList({ alerts }: { alerts: HealthData["alerts"] }) {
  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircleIcon className="text-green-500" />
            Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No active alerts</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangleIcon className="text-yellow-500" />
          Active Alerts ({alerts.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-center justify-between p-2 rounded border">
              <span className="text-sm">{alert.title}</span>
              <Badge variant={alert.active ? "destructive" : "secondary"}>{alert.active ? "Active" : "Resolved"}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function EventsList({ events }: { events: HealthData["events"] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClockIcon />
          Recent Events
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {events.slice(0, 5).map((event, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded border">
              <div className="text-sm">
                <span className="font-medium capitalize">{event.type}</span>
                {event.version && <span className="text-muted-foreground"> v{event.version}</span>}
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(event.at).toLocaleString()} • {event.by}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function HealthDashboard() {
  const [healthData, setHealthData] = useState<HealthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchHealthData = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("[v0] Fetching health data...")

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch("/api/health", {
        signal: controller.signal,
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      clearTimeout(timeoutId)
      console.log("[v0] Health API response status:", response.status)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("[v0] Health data received:", data)

      if (!data || typeof data !== "object") {
        throw new Error("Invalid health data format")
      }

      if (data.error) {
        throw new Error(`API Error: ${data.error}`)
      }

      if (!data.uptime || typeof data.uptime.seconds !== "number") {
        console.error("[v0] Missing uptime.seconds in health data:", data)
        data.uptime = { seconds: 0, since: new Date().toISOString(), last_restart_reason: "unknown" }
      }

      setHealthData(data)
      setLastUpdated(new Date())
      setError(null)
      console.log("[v0] Health data successfully set")
    } catch (error) {
      console.error("[v0] Failed to fetch health data:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      setError(errorMessage)

      if (!healthData) {
        setHealthData({
          env: { label: "unknown", version: "unknown" },
          overall: { state: "error", message: errorMessage },
          uptime: { seconds: 0, since: new Date().toISOString(), last_restart_reason: "error" },
          cpu: { pct: 0, series: [] },
          memory: { used_mb: 0, total_mb: 0, pct: 0, series: [] },
          disk: { used_gb: 0, total_gb: 0, pct: 0 },
          network: { rx_kbps: 0, tx_kbps: 0, errors_pct: 0 },
          app: { rps: 0, errors_pct: 0, latency_ms: { p50: 0, p95: 0, p99: 0 }, queue_depth: 0 },
          deps: {
            openai: { success_pct: 0, rate_limit_hits: 0, latency_ms_p95: 0 },
            db: { connections: 0, slow_queries: 0 },
            cache: { hit_pct: 0 },
          },
          quotas: { openai: { mtd_cost_usd: 0, budget_usd: 0, pct: 0 } },
          alerts: [],
          events: [],
          responseTime: 0,
        })
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHealthData()
    const interval = setInterval(fetchHealthData, 10000) // Faster refresh for production monitoring
    return () => clearInterval(interval)
  }, [])

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    return `${hours}h ${minutes}m`
  }

  const getMetricStatus = (metric: string, value: number): "ok" | "warn" | "critical" => {
    const thresholds = {
      cpu: { warn: 80, critical: 95 },
      memory: { warn: 80, critical: 90 },
      disk: { warn: 80, critical: 90 },
    }

    const t = thresholds[metric as keyof typeof thresholds]
    if (!t) return "ok"

    if (value >= t.critical) return "critical"
    if (value >= t.warn) return "warn"
    return "ok"
  }

  if (loading && !healthData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading health data...</p>
          <Button onClick={fetchHealthData} className="mt-4 bg-transparent" variant="outline" size="sm">
            Retry Now
          </Button>
        </div>
      </div>
    )
  }

  if (error && !healthData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Health Data Unavailable</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-2">
            <Button onClick={fetchHealthData}>Retry</Button>
            <Button asChild variant="outline">
              <a href="/">← Back to Resona</a>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!healthData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Health Data Unavailable</h2>
          <p className="text-gray-600 mb-4">Unable to load system health information</p>
          <Button onClick={fetchHealthData}>Retry</Button>
        </div>
      </div>
    )
  }

  if (!healthData.uptime || typeof healthData.uptime.seconds !== "number") {
    console.error("[v0] Invalid health data structure:", healthData)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Invalid Health Data</h2>
          <p className="text-gray-600 mb-4">Health data format is incorrect</p>
          <Button onClick={fetchHealthData}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        env={healthData.env.label}
        version={healthData.env.version}
        state={healthData.overall.state}
        stats={healthData}
      />

      <div className="container mx-auto p-6 space-y-6">
        {/* Core Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <HealthCard
            title="Uptime"
            value={formatUptime(healthData.uptime.seconds)}
            sub={`Last restart: ${healthData.uptime.last_restart_reason}`}
            icon={<CheckCircleIcon className="text-green-500" />}
            status="ok"
          />

          <HealthCard
            title="CPU Usage"
            value={`${healthData.cpu.pct}%`}
            sparkline={healthData.cpu.series}
            icon={<CpuIcon className="text-blue-500" />}
            status={getMetricStatus("cpu", healthData.cpu.pct)}
          />

          <HealthCard
            title="Memory"
            value={`${healthData.memory.pct}%`}
            sub={`${healthData.memory.used_mb} / ${healthData.memory.total_mb} MB`}
            sparkline={healthData.memory.series}
            icon={<DatabaseIcon className="text-purple-500" />}
            status={getMetricStatus("memory", healthData.memory.pct)}
          />

          <HealthCard
            title="Disk Usage"
            value={`${healthData.disk.pct}%`}
            sub={`${healthData.disk.used_gb} / ${healthData.disk.total_gb} GB`}
            icon={<HardDriveIcon className="text-orange-500" />}
            status={getMetricStatus("disk", healthData.disk.pct)}
          />
        </div>

        {/* Application Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <HealthCard
            title="Requests per Second"
            value={`${healthData.app.rps}`}
            sub={`Error rate: ${healthData.app.errors_pct}%`}
            icon={<TrendingUpIcon className="text-green-500" />}
          />

          <HealthCard
            title="Response Latency"
            value={`${healthData.app.latency_ms.p95}ms`}
            sub={`p50: ${healthData.app.latency_ms.p50}ms • p99: ${healthData.app.latency_ms.p99}ms`}
            icon={<ZapIcon className="text-yellow-500" />}
          />

          <HealthCard
            title="Network I/O"
            value={`${healthData.network.rx_kbps}/${healthData.network.tx_kbps} kB/s`}
            sub={`Error rate: ${healthData.network.errors_pct}%`}
            icon={<NetworkIcon className="text-blue-500" />}
          />
        </div>

        {/* Dependencies & Quotas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Dependencies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">OpenAI API</span>
                  <div className="text-right">
                    <div className="text-green-600">{healthData.deps.openai.success_pct}% success</div>
                    <div className="text-sm text-gray-500">Rate limits: {healthData.deps.openai.rate_limit_hits}</div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-medium">Database</span>
                  <div className="text-right">
                    <div className="text-green-600">{healthData.deps.db.connections} connections</div>
                    <div className="text-sm text-gray-500">Slow queries: {healthData.deps.db.slow_queries}</div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-medium">Cache</span>
                  <div className="text-right">
                    <div className="text-green-600">{healthData.deps.cache.hit_pct}% hit rate</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Quotas & Costs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">OpenAI (MTD)</span>
                    <span className="font-bold">
                      ${healthData.quotas.openai.mtd_cost_usd} / ${healthData.quotas.openai.budget_usd}
                    </span>
                  </div>
                  <Progress value={healthData.quotas.openai.pct} className="mb-1" />
                  <div className="text-sm text-gray-500">{healthData.quotas.openai.pct}% of monthly budget</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts & Events */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AlertsList alerts={healthData.alerts} />
          <EventsList events={healthData.events} />
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Last updated: {lastUpdated?.toLocaleTimeString()} • Auto-refresh: 10s
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchHealthData} disabled={loading} size="sm" variant="outline">
              <RefreshIcon className="mr-2" spinning={loading} />
              Refresh
            </Button>
            <Button asChild size="sm" variant="outline">
              <a href="/">← Back to Resona</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
