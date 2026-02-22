"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Lock, Unlock, Star, Zap, Brain, Target, BarChart3 } from "lucide-react"

interface ContentLadderProps {
  level: number
  resonance: number
}

const contentLevels = [
  {
    level: 1,
    title: "Basic Synchronization",
    description: "Token-level phase alignment",
    threshold: 0.0,
    icon: Zap,
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400",
    content: "Access to basic QOTE processing and phase visualization",
  },
  {
    level: 2,
    title: "Coherence Emergence",
    description: "Multi-token synchronization patterns",
    threshold: 0.3,
    icon: Brain,
    color: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400",
    content: "Advanced resonance mapping and entropy analysis",
  },
  {
    level: 3,
    title: "Resonance Mastery",
    description: "Golden ratio threshold achievement",
    threshold: 0.618,
    icon: Target,
    color: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400",
    content: "CUST gate optimization and personalization features",
  },
  {
    level: 4,
    title: "Quantum Coherence",
    description: "High-order synchronization states",
    threshold: 0.8,
    icon: BarChart3,
    color: "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400",
    content: "Multi-dimensional phase space analysis and prediction",
  },
  {
    level: 5,
    title: "Transcendent Resonance",
    description: "Perfect oscillatory alignment",
    threshold: 0.95,
    icon: Star,
    color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400",
    content: "Complete QOTE mastery with predictive coherence modeling",
  },
]

export function ContentLadder({ level, resonance }: ContentLadderProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <BarChart3 className="w-5 h-5 mr-2" />
          Content Ladder
        </CardTitle>
        <CardDescription>Progressive unlocking based on resonance achievement</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {contentLevels.map((contentLevel, index) => {
          const isUnlocked = resonance >= contentLevel.threshold
          const isCurrent = level === contentLevel.level
          const IconComponent = contentLevel.icon

          return (
            <div
              key={contentLevel.level}
              className={`p-3 rounded-lg border transition-all ${
                isUnlocked ? "border-primary/20 bg-primary/5" : "border-muted bg-muted/30 opacity-60"
              } ${isCurrent ? "ring-2 ring-primary/50" : ""}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${contentLevel.color}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-sm">{contentLevel.title}</h4>
                      {isUnlocked ? (
                        <Unlock className="w-3 h-3 text-green-500" />
                      ) : (
                        <Lock className="w-3 h-3 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{contentLevel.description}</p>
                  </div>
                </div>
                <Badge variant={isUnlocked ? "default" : "secondary"} className="text-xs">
                  Level {contentLevel.level}
                </Badge>
              </div>

              <div className="mb-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span>Threshold: {(contentLevel.threshold * 100).toFixed(0)}%</span>
                  <span>Current: {(resonance * 100).toFixed(1)}%</span>
                </div>
                <Progress value={Math.min(100, (resonance / contentLevel.threshold) * 100)} className="h-2" />
              </div>

              <p className="text-xs text-muted-foreground">{contentLevel.content}</p>

              {isCurrent && (
                <div className="mt-2 p-2 bg-primary/10 rounded text-xs">
                  <strong>Current Level:</strong> You are operating at this resonance level
                </div>
              )}
            </div>
          )
        })}

        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Overall Progress</span>
            <span>{level}/5 levels unlocked</span>
          </div>
          <Progress value={(level / 5) * 100} className="mt-2" />
        </div>
      </CardContent>
    </Card>
  )
}
