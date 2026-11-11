"use client"

import GuidedRabbitJourney from "@/components/recovered/sideways-slip/guided-rabbit-journey"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin, Clock, Users, Star } from "lucide-react"

export default function GuidedJourneyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <MapPin className="h-8 w-8 text-indigo-500" />
            Guided Rabbit Journey
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A step-by-step exploration into consciousness, breathing techniques, and quantum field awareness. Follow the
            rabbit deeper into understanding.
          </p>
        </div>

        {/* Journey Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-blue-500" />
                Duration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">45 min</div>
              <div className="text-sm text-gray-600">Total estimated time</div>
              <div className="text-xs text-gray-500 mt-1">Self-paced, return anytime</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-green-500" />
                Experience Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Beginner</div>
              <div className="text-sm text-gray-600">No prior experience needed</div>
              <div className="text-xs text-gray-500 mt-1">Suitable for all levels</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Star className="h-5 w-5 text-purple-500" />
                Completion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">5 Steps</div>
              <div className="text-sm text-gray-600">Progressive learning path</div>
              <div className="text-xs text-gray-500 mt-1">Track your progress</div>
            </CardContent>
          </Card>
        </div>

        {/* Journey Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Journey Categories</CardTitle>
            <CardDescription>The journey is organized into four progressive categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-blue-50">
                <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                  1
                </div>
                <h3 className="font-semibold text-blue-900">Introduction</h3>
                <p className="text-sm text-blue-700">Welcome & orientation</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-green-50">
                <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                  2
                </div>
                <h3 className="font-semibold text-green-900">Exploration</h3>
                <p className="text-sm text-green-700">Learn core techniques</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-purple-50">
                <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                  3
                </div>
                <h3 className="font-semibold text-purple-900">Practice</h3>
                <p className="text-sm text-purple-700">Apply advanced methods</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-orange-50">
                <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                  4
                </div>
                <h3 className="font-semibold text-orange-900">Mastery</h3>
                <p className="text-sm text-orange-700">Integrate everything</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Notice */}
        <Alert>
          <Star className="h-4 w-4" />
          <AlertDescription>
            <strong>Remember:</strong> This journey is about exploration and discovery. There's no rush - take your time
            with each step, practice regularly, and return to review concepts as needed. Your progress is automatically
            saved locally.
          </AlertDescription>
        </Alert>

        {/* Main Journey Component */}
        <GuidedRabbitJourney />

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground py-8">
          <p>Guided Rabbit Journey • Part of the Sideways Slip Starter Kit</p>
          <p className="mt-1">"The rabbit hole goes deeper than you think, but every step reveals new wonders."</p>
        </div>
      </div>
    </div>
  )
}
