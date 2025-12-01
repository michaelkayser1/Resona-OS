"use client"

import { useState } from "react"
import QOTENavigation from "@/components/qote-navigation"
import QOTEBraidMap from "@/components/qote-braid-map"
import QOTEStrategyDashboard from "@/components/qote-strategy-dashboard"
import QOTEExecutiveDashboard from "@/components/qote-executive-dashboard"
import QOTEPresentationComplete from "@/components/qote-presentation-complete"
import QOTEDocumentation from "@/components/qote-documentation"

export default function Home() {
  const [currentView, setCurrentView] = useState<
    "braid-map" | "strategy" | "dashboard" | "presentation" | "documentation"
  >("braid-map")

  const renderCurrentView = () => {
    switch (currentView) {
      case "braid-map":
        return <QOTEBraidMap />
      case "strategy":
        return <QOTEStrategyDashboard />
      case "dashboard":
        return <QOTEExecutiveDashboard />
      case "presentation":
        return <QOTEPresentationComplete />
      case "documentation":
        return <QOTEDocumentation />
      default:
        return <QOTEBraidMap />
    }
  }

  return (
    <div className="min-h-screen">
      <QOTENavigation currentView={currentView} onViewChange={setCurrentView} />

      <div className="relative">{renderCurrentView()}</div>
    </div>
  )
}
