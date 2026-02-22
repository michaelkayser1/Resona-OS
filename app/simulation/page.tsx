"use client"

import { useState, useCallback, useEffect } from "react"
import { Header } from "@/components/Header"
import { CoherenceChart } from "@/components/CoherenceChart"
import { Gauges } from "@/components/Gauges"
import { Controls } from "@/components/Controls"
import { PhaseRing } from "@/components/PhaseRing"
import { TorusTraumaCycle } from "@/components/TorusTraumaCycle"
import { SettingsDrawer } from "@/components/SettingsDrawer"
import { LanguageToggle } from "@/components/LanguageToggle"
import { Footer } from "@/components/Footer"
import { useSimulation } from "@/lib/simulation/useSimulation"
import { useI18n } from "@/lib/i18n/useI18n"
type Language = "en" | "fr" | "es"

export default function SimulationPage() {
  const [lang, setLang] = useState<Language>("en")
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const { t } = useI18n()

  const { state, params, isRunning, updateParams, toggleSimulation, resetSimulation, randomizePhases, loadPreset } =
    useSimulation()

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return

      switch (e.key.toLowerCase()) {
        case " ":
          e.preventDefault()
          toggleSimulation()
          break
        case "r":
          resetSimulation()
          break
        case "1":
          loadPreset("chaos")
          break
        case "2":
          loadPreset("edge")
          break
        case "3":
          loadPreset("coherent")
          break
        case "4":
          loadPreset("pulse")
          break
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [toggleSimulation, resetSimulation, loadPreset])

  const handleLangChange = useCallback((newLang: string) => {
    setLang(newLang as Language)
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header lang={lang} setLang={handleLangChange} onSettingsClick={() => setIsSettingsOpen(true)} t={t} />

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <PhaseRing state={state} />
          <CoherenceChart state={state} />
        </div>

        <div className="mb-6">
          <div className="glass p-6">
            <h2 className="heading-display text-xl mb-4 text-center">QOTE Trauma → Breath Cycle</h2>
            <div className="flex justify-center">
              <TorusTraumaCycle isRunning={isRunning} speed={params.omega0} resonance={state.R} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Controls
              params={params}
              updateParams={updateParams}
              isRunning={isRunning}
              toggleSimulation={toggleSimulation}
              resetSimulation={resetSimulation}
              randomizePhases={randomizePhases}
              loadPreset={loadPreset}
              t={t}
            />
          </div>
          <div>
            <Gauges state={state} t={t} />
          </div>
        </div>
      </main>

      <Footer t={t} />
      <LanguageToggle lang={lang} setLang={handleLangChange} />

      <SettingsDrawer isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} t={t} />
    </div>
  )
}
