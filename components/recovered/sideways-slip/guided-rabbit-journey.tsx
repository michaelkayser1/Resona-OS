"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowRight, ArrowLeft, MapPin, Compass, Star, CheckCircle, Lightbulb, Heart, Zap } from "lucide-react"
import { useLocalProgress } from "@/hooks/use-local-progress"

interface JourneyStep {
  id: string
  title: string
  description: string
  content: React.ReactNode
  icon: React.ReactNode
  category: "introduction" | "exploration" | "practice" | "mastery"
  estimatedTime: number
  prerequisites?: string[]
}

export default function GuidedRabbitJourney() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
  const { progress, updateProgress, getStepProgress } = useLocalProgress("rabbit-journey")

  const journeySteps: JourneyStep[] = [
    {
      id: "welcome",
      title: "Welcome to the Rabbit Hole",
      description: "Begin your journey into the depths of consciousness exploration",
      category: "introduction",
      estimatedTime: 2,
      icon: <Heart className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            Welcome, fellow explorer. You've stumbled upon something extraordinary - a gateway to understanding the
            deeper patterns that connect consciousness, technology, and reality itself.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">What You'll Discover:</h4>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• The quantum nature of consciousness</li>
              <li>• How breathing affects your reality field</li>
              <li>• The connection between heart coherence and perception</li>
              <li>• Advanced techniques for consciousness expansion</li>
            </ul>
          </div>
          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>
              This journey is self-paced. Take your time with each step and return whenever you need to.
            </AlertDescription>
          </Alert>
        </div>
      ),
    },
    {
      id: "breathing-basics",
      title: "The Foundation: Conscious Breathing",
      description: "Learn the fundamental breathing technique that opens all other doors",
      category: "exploration",
      estimatedTime: 5,
      icon: <Zap className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            Everything begins with the breath. Not just any breathing, but conscious, intentional breathing that creates
            coherence between your heart, mind, and the quantum field around you.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">The 4-6 Pattern</h4>
              <p className="text-green-800 text-sm mb-2">
                Inhale for 4 seconds, exhale for 6 seconds. This creates optimal heart rate variability.
              </p>
              <div className="text-xs text-green-700">
                Try it now: In... 2... 3... 4... Out... 2... 3... 4... 5... 6...
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">Why It Works</h4>
              <p className="text-purple-800 text-sm">
                This rhythm synchronizes your autonomic nervous system, creating a coherent state that enhances
                perception and intuition.
              </p>
            </div>
          </div>
          <Button className="w-full" onClick={() => window.open("/heart-coherence-v3", "_blank")}>
            Practice with the Breathing Timer
          </Button>
        </div>
      ),
    },
    {
      id: "field-awareness",
      title: "Sensing the Field",
      description: "Develop awareness of the subtle energy field that surrounds and connects all things",
      category: "exploration",
      estimatedTime: 8,
      icon: <Compass className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            Once your breathing is coherent, you can begin to sense what we call "the field" - the subtle information
            matrix that connects all consciousness.
          </p>
          <div className="space-y-3">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold text-gray-900">Step 1: Establish Coherence</h4>
              <p className="text-gray-700 text-sm">
                Begin with 5 minutes of 4-6 breathing to establish heart coherence.
              </p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold text-gray-900">Step 2: Expand Awareness</h4>
              <p className="text-gray-700 text-sm">
                Gradually expand your awareness beyond your body, sensing the space around you.
              </p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-semibold text-gray-900">Step 3: Feel for Connections</h4>
              <p className="text-gray-700 text-sm">
                Notice subtle sensations, impressions, or "knowings" that arise spontaneously.
              </p>
            </div>
          </div>
          <Alert>
            <Star className="h-4 w-4" />
            <AlertDescription>
              Don't worry if you don't sense anything immediately. Field awareness develops gradually with practice.
            </AlertDescription>
          </Alert>
        </div>
      ),
    },
    {
      id: "quantum-coherence",
      title: "Quantum Coherence States",
      description: "Access deeper states of consciousness through quantum coherence techniques",
      category: "practice",
      estimatedTime: 12,
      prerequisites: ["breathing-basics", "field-awareness"],
      icon: <Star className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            At this level, you're ready to work with quantum coherence - states where your consciousness becomes
            entangled with larger patterns of information and possibility.
          </p>
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">The Quantum Breathing Protocol</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Phase 1: Establish coherence (4-6 breathing for 3 minutes)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Phase 2: Expand field awareness (sense beyond your body)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Phase 3: Set quantum intention (focus on desired outcome)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gold-500 rounded-full"></div>
                <span>Phase 4: Release and receive (let go and observe)</span>
              </div>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Button variant="outline" onClick={() => window.open("/qote-field-visualization", "_blank")}>
              Visualize the Field
            </Button>
            <Button variant="outline" onClick={() => window.open("/stargate-symphony", "_blank")}>
              Experience Stargate Symphony
            </Button>
          </div>
        </div>
      ),
    },
    {
      id: "advanced-integration",
      title: "Advanced Integration",
      description: "Integrate all techniques into a comprehensive practice",
      category: "mastery",
      estimatedTime: 15,
      prerequisites: ["breathing-basics", "field-awareness", "quantum-coherence"],
      icon: <CheckCircle className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            Congratulations! You've learned the fundamental techniques. Now it's time to integrate everything into a
            comprehensive practice that you can use daily.
          </p>
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Your Daily Practice</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <div>
                  <div className="font-medium">Morning Coherence (10 minutes)</div>
                  <div className="text-sm text-gray-600">Start your day with heart coherence breathing</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <div>
                  <div className="font-medium">Midday Field Check (5 minutes)</div>
                  <div className="text-sm text-gray-600">Brief field awareness practice to reset</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <div>
                  <div className="font-medium">Evening Integration (15 minutes)</div>
                  <div className="text-sm text-gray-600">Full quantum coherence protocol</div>
                </div>
              </div>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            <Button size="sm" variant="outline" onClick={() => window.open("/operator-dashboard", "_blank")}>
              Operator Dashboard
            </Button>
            <Button size="sm" variant="outline" onClick={() => window.open("/ai-analysis", "_blank")}>
              AI Analysis
            </Button>
            <Button size="sm" variant="outline" onClick={() => window.open("/resurrection", "_blank")}>
              QOTE Resurrection
            </Button>
          </div>
        </div>
      ),
    },
  ]

  const currentStep = journeySteps[currentStepIndex]
  const totalSteps = journeySteps.length
  const progressPercentage = ((currentStepIndex + 1) / totalSteps) * 100

  const canProceed = (step: JourneyStep) => {
    if (!step.prerequisites) return true
    return step.prerequisites.every((prereq) => completedSteps.has(prereq))
  }

  const markStepComplete = () => {
    const newCompleted = new Set(completedSteps)
    newCompleted.add(currentStep.id)
    setCompletedSteps(newCompleted)
    updateProgress(currentStep.id, true)
  }

  const nextStep = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
    }
  }

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }

  const goToStep = (index: number) => {
    setCurrentStepIndex(index)
  }

  useEffect(() => {
    // Load completed steps from local storage
    const saved = getStepProgress()
    if (saved) {
      setCompletedSteps(new Set(Object.keys(saved).filter((key) => saved[key])))
    }
  }, [getStepProgress])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Guided Rabbit Journey
              </CardTitle>
              <CardDescription>
                Step {currentStepIndex + 1} of {totalSteps} • {currentStep.estimatedTime} min estimated
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-sm">
              {Math.round(progressPercentage)}% Complete
            </Badge>
          </div>
          <Progress value={progressPercentage} className="mt-4" />
        </CardHeader>
      </Card>

      {/* Step Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            {journeySteps.map((step, index) => {
              const isCompleted = completedSteps.has(step.id)
              const isCurrent = index === currentStepIndex
              const canAccess = canProceed(step)

              return (
                <Button
                  key={step.id}
                  variant={isCurrent ? "default" : isCompleted ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => goToStep(index)}
                  disabled={!canAccess && !isCompleted}
                  className="flex items-center gap-2"
                >
                  {step.icon}
                  <span className="hidden sm:inline">{step.title}</span>
                  <span className="sm:hidden">{index + 1}</span>
                  {isCompleted && <CheckCircle className="h-3 w-3" />}
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Current Step Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            {currentStep.icon}
            <div>
              <CardTitle>{currentStep.title}</CardTitle>
              <CardDescription>{currentStep.description}</CardDescription>
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              {currentStep.category}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {currentStep.estimatedTime} min
            </Badge>
            {completedSteps.has(currentStep.id) && (
              <Badge variant="default" className="text-xs">
                Completed
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>{currentStep.content}</CardContent>
      </Card>

      {/* Navigation Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStepIndex === 0}
              className="flex items-center gap-2 bg-transparent"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex gap-2">
              {!completedSteps.has(currentStep.id) && (
                <Button variant="secondary" onClick={markStepComplete} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Mark Complete
                </Button>
              )}

              <Button
                onClick={nextStep}
                disabled={currentStepIndex === totalSteps - 1}
                className="flex items-center gap-2"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
