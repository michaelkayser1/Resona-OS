"use client"
import { useState, useEffect } from "react"
import { BarChart3, TrendingUp, Clock, Zap, Target, Activity, Users, Award } from "lucide-react"
import type { FieldMetrics, RBFRDesign } from "@/lib/schemas"

interface AnalyticsData {
  totalSessions: number
  totalEmergenceEvents: number
  averageCoherence: number
  mostActiveModel: string
  sessionDuration: number
  consensusRate: number
  emergenceFrequency: number
  topChallenges: string[]
}

interface AnalyticsDashboardProps {
  isOpen: boolean
  onClose: () => void
  currentMetrics: FieldMetrics
  sessionHistory: {
    timestamp: number
    metrics: FieldMetrics
    designs: Record<string, RBFRDesign | null>
    challenge: string
  }[]
}

export function AnalyticsDashboard({ isOpen, onClose, currentMetrics, sessionHistory }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalSessions: 0,
    totalEmergenceEvents: 0,
    averageCoherence: 0,
    mostActiveModel: "openai",
    sessionDuration: 0,
    consensusRate: 0,
    emergenceFrequency: 0,
    topChallenges: [],
  })

  useEffect(() => {
    if (sessionHistory.length === 0) return

    // Calculate analytics from session history
    const emergenceEvents = sessionHistory.filter((s) => s.metrics.CUST >= 1.618).length
    const avgCoherence =
      sessionHistory.reduce((sum, s) => {
        const coherence =
          (1 - Math.min(s.metrics.W, 1) + (s.metrics.beta - 0.8) / 0.4 + Math.min((s.metrics.CUST - 1) / 0.618, 1)) / 3
        return sum + coherence
      }, 0) / sessionHistory.length

    // Model activity analysis
    const modelCounts = { openai: 0, anthropic: 0, mistral: 0, xai: 0, deepseek: 0 }
    sessionHistory.forEach((s) => {
      Object.entries(s.designs).forEach(([model, design]) => {
        if (design) modelCounts[model as keyof typeof modelCounts]++
      })
    })
    const mostActive = Object.entries(modelCounts).reduce((a, b) =>
      modelCounts[a[0] as keyof typeof modelCounts] > modelCounts[b[0] as keyof typeof modelCounts] ? a : b,
    )[0]

    // Session duration (mock calculation)
    const sessionDuration =
      sessionHistory.length > 1
        ? (sessionHistory[sessionHistory.length - 1].timestamp - sessionHistory[0].timestamp) / 1000 / 60
        : 0

    // Consensus rate
    const consensusRate = sessionHistory.filter((s) => s.metrics.W < 0.3).length / sessionHistory.length

    // Challenge frequency
    const challengeMap = new Map<string, number>()
    sessionHistory.forEach((s) => {
      const challenge = s.challenge.toLowerCase()
      challengeMap.set(challenge, (challengeMap.get(challenge) || 0) + 1)
    })
    const topChallenges = Array.from(challengeMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([challenge]) => challenge)

    setAnalytics({
      totalSessions: sessionHistory.length,
      totalEmergenceEvents: emergenceEvents,
      averageCoherence: avgCoherence,
      mostActiveModel: mostActive,
      sessionDuration,
      consensusRate,
      emergenceFrequency: emergenceEvents / sessionHistory.length,
      topChallenges,
    })
  }, [sessionHistory])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-lg max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-cyan-500/30">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            <h3 className="text-xl font-semibold text-white">Analytics Dashboard</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-blue-300">Session Duration</span>
              </div>
              <div className="text-2xl font-bold text-white">{analytics.sessionDuration.toFixed(1)}m</div>
            </div>

            <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <span className="text-sm text-green-300">Consensus Rate</span>
              </div>
              <div className="text-2xl font-bold text-white">{(analytics.consensusRate * 100).toFixed(1)}%</div>
            </div>

            <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Award className="w-5 h-5 text-yellow-400" />
                <span className="text-sm text-yellow-300">Emergence Events</span>
              </div>
              <div className="text-2xl font-bold text-white">{analytics.totalEmergenceEvents}</div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Activity className="w-5 h-5 text-purple-400" />
                <span className="text-sm text-purple-300">Avg Coherence</span>
              </div>
              <div className="text-2xl font-bold text-white">{(analytics.averageCoherence * 100).toFixed(1)}%</div>
            </div>
          </div>

          {/* Current State */}
          <div className="bg-gray-700/50 rounded-lg p-6 border border-gray-600/50">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-cyan-400" />
              Current Field State
            </h4>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-300 mb-1">{currentMetrics.W.toFixed(3)}</div>
                <div className="text-sm text-gray-400">Wobble (W)</div>
                <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
                  <div
                    className="bg-red-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(currentMetrics.W * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-300 mb-1">{currentMetrics.beta.toFixed(3)}</div>
                <div className="text-sm text-gray-400">Beta (β)</div>
                <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(((currentMetrics.beta - 0.8) / 0.4) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div className="text-center">
                <div
                  className={`text-3xl font-bold mb-1 ${currentMetrics.CUST >= 1.618 ? "text-yellow-300" : "text-purple-300"}`}
                >
                  {currentMetrics.CUST.toFixed(3)}
                </div>
                <div className="text-sm text-gray-400">CUST</div>
                <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${currentMetrics.CUST >= 1.618 ? "bg-yellow-500" : "bg-purple-500"}`}
                    style={{ width: `${Math.min((currentMetrics.CUST / 1.618) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Model Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-700/50 rounded-lg p-6 border border-gray-600/50">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-400" />
                Model Performance
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Most Active Model</span>
                  <span className="text-sm font-semibold text-blue-300 capitalize">{analytics.mostActiveModel}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Total Data Points</span>
                  <span className="text-sm font-semibold text-green-300">{analytics.totalSessions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Emergence Frequency</span>
                  <span className="text-sm font-semibold text-yellow-300">
                    {(analytics.emergenceFrequency * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-6 border border-gray-600/50">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-green-400" />
                Top Challenges
              </h4>
              <div className="space-y-2">
                {analytics.topChallenges.length > 0 ? (
                  analytics.topChallenges.map((challenge, index) => (
                    <div key={index} className="text-sm text-gray-300 truncate">
                      {index + 1}. {challenge}
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">No challenge data available</div>
                )}
              </div>
            </div>
          </div>

          {/* Session Timeline */}
          {sessionHistory.length > 0 && (
            <div className="bg-gray-700/50 rounded-lg p-6 border border-gray-600/50">
              <h4 className="text-lg font-semibold text-white mb-4">Session Timeline</h4>
              <div className="h-32 bg-gray-800 rounded-lg p-4 overflow-x-auto">
                <div className="flex space-x-2 h-full">
                  {sessionHistory.slice(-50).map((session, index) => (
                    <div
                      key={index}
                      className="flex-shrink-0 w-2 bg-gray-600 rounded-full relative"
                      style={{
                        height: `${Math.max(10, (1 - session.metrics.W) * 100)}%`,
                        backgroundColor: session.metrics.CUST >= 1.618 ? "#fbbf24" : "#6b7280",
                      }}
                      title={`CUST: ${session.metrics.CUST.toFixed(3)}, W: ${session.metrics.W.toFixed(3)}`}
                    />
                  ))}
                </div>
              </div>
              <div className="text-xs text-gray-400 mt-2">
                Height represents consensus quality, yellow indicates emergence events
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
