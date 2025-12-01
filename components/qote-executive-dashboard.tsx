"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface MetricCardProps {
  title: string
  value: string | number
  change?: string
  trend?: "up" | "down" | "stable"
  description?: string
}

function MetricCard({ title, value, change, trend, description }: MetricCardProps) {
  const trendColors = {
    up: "text-emerald-400",
    down: "text-red-400",
    stable: "text-blue-400",
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-slate-400">{title}</h3>
          {trend && (
            <div className={`text-xs ${trendColors[trend]}`}>{trend === "up" ? "↗" : trend === "down" ? "↘" : "→"}</div>
          )}
        </div>
        <div className="text-2xl font-bold text-white mb-1">{value}</div>
        {change && <div className={`text-xs ${trendColors[trend || "stable"]}`}>{change}</div>}
        {description && <div className="text-xs text-slate-500 mt-2">{description}</div>}
      </CardContent>
    </Card>
  )
}

export default function QOTEExecutiveDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [systemMetrics, setSystemMetrics] = useState({
    coherenceScore: 0.87,
    stabilityIndex: 0.92,
    processingRate: 1247,
    uptime: 99.7,
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
      setSystemMetrics((prev) => ({
        coherenceScore: Math.max(0.7, Math.min(0.99, prev.coherenceScore + (Math.random() - 0.5) * 0.02)),
        stabilityIndex: Math.max(0.8, Math.min(0.99, prev.stabilityIndex + (Math.random() - 0.5) * 0.01)),
        processingRate: Math.floor(1200 + Math.random() * 100),
        uptime: Math.max(99.0, Math.min(100, prev.uptime + (Math.random() - 0.5) * 0.1)),
      }))
    }, 2000)

    return () => clearInterval(timer)
  }, [])

  const businessMetrics = [
    { title: "Demo Requests", value: "73", change: "+12 this week", trend: "up" as const },
    { title: "Investor Meetings", value: "25", change: "+8 scheduled", trend: "up" as const },
    { title: "Pilot Inquiries", value: "12", change: "+3 healthcare", trend: "up" as const },
    { title: "Revenue Pipeline", value: "$2.1M", change: "Series A target", trend: "stable" as const },
  ]

  const technicalMetrics = [
    { title: "System Uptime", value: `${systemMetrics.uptime.toFixed(1)}%`, trend: "up" as const },
    { title: "Coherence Score", value: systemMetrics.coherenceScore.toFixed(2), trend: "stable" as const },
    { title: "Processing Rate", value: `${systemMetrics.processingRate}/min`, trend: "up" as const },
    { title: "Stability Index", value: `${Math.round(systemMetrics.stabilityIndex * 100)}%`, trend: "stable" as const },
  ]

  const milestones = [
    { title: "Demo Platform Launch", progress: 100, status: "Complete" },
    { title: "Investor Outreach Campaign", progress: 75, status: "In Progress" },
    { title: "Healthcare Pilot Program", progress: 45, status: "In Progress" },
    { title: "Patent Application Filing", progress: 90, status: "Near Complete" },
    { title: "Series A Preparation", progress: 30, status: "Planning" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              QOTE Executive Dashboard
            </h1>
            <p className="text-slate-300 mt-2">Real-time system status and business metrics</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-400">System Time</div>
            <div className="text-lg font-mono">{currentTime.toLocaleTimeString()}</div>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs text-emerald-400">All Systems Operational</span>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-blue-400">Business Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {businessMetrics.map((metric) => (
              <MetricCard key={metric.title} {...metric} />
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-emerald-400">Technical Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {technicalMetrics.map((metric) => (
              <MetricCard key={metric.title} {...metric} />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-purple-400">Launch Milestones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {milestones.map((milestone) => (
                <div key={milestone.title} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{milestone.title}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        milestone.status === "Complete"
                          ? "bg-emerald-600/20 text-emerald-400"
                          : milestone.status === "In Progress"
                            ? "bg-blue-600/20 text-blue-400"
                            : "bg-slate-600/20 text-slate-400"
                      }`}
                    >
                      {milestone.status}
                    </span>
                  </div>
                  <Progress value={milestone.progress} className="h-2" />
                  <div className="text-xs text-slate-400">{milestone.progress}% Complete</div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-amber-400">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full justify-start bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border-blue-600/50"
                onClick={() => window.open("#", "_blank")}
              >
                🌐 View Live Demo
              </Button>
              <Button
                className="w-full justify-start bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border-emerald-600/50"
                onClick={() => window.open("https://calendly.com/qote-resona/demo", "_blank")}
              >
                📅 Schedule Investor Demo
              </Button>
              <Button
                className="w-full justify-start bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border-purple-600/50"
                onClick={() => window.open("#", "_blank")}
              >
                📚 Technical Documentation
              </Button>
              <Button
                className="w-full justify-start bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border-amber-600/50"
                onClick={() =>
                  window.open("mailto:investors@example.com?subject=QOTE Investment Opportunity", "_blank")
                }
              >
                💼 Contact Investors
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-cyan-400">System Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h4 className="font-medium text-slate-300">Core Systems</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Braid-Map Engine</span>
                    <span className="text-emerald-400">✓ Online</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Coherence Processor</span>
                    <span className="text-emerald-400">✓ Online</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Analytics Pipeline</span>
                    <span className="text-emerald-400">✓ Online</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-slate-300">Integration Status</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Demo Platform</span>
                    <span className="text-emerald-400">✓ Deployed</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monitoring</span>
                    <span className="text-emerald-400">✓ Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Contact Forms</span>
                    <span className="text-emerald-400">✓ Functional</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-slate-300">Business Pipeline</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Investor Outreach</span>
                    <span className="text-blue-400">→ Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Customer Demos</span>
                    <span className="text-blue-400">→ Scheduled</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Patent Filing</span>
                    <span className="text-amber-400">⚡ In Progress</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
