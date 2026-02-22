"use client"

import type { SimParams } from "@/lib/simulation/types"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

const PlayIcon = () => (
  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z"
    />
  </svg>
)

const PauseIcon = () => (
  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)

const RotateCcwIcon = () => (
  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </svg>
)

const ShuffleIcon = () => (
  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
    />
  </svg>
)

interface ControlsProps {
  params: SimParams
  updateParams: (updates: Partial<SimParams>) => void
  isRunning: boolean
  toggleSimulation: () => void
  resetSimulation: () => void
  randomizePhases: () => void
  loadPreset: (preset: string) => void
  t: (key: string) => string
}

export function Controls({
  params,
  updateParams,
  isRunning,
  toggleSimulation,
  resetSimulation,
  randomizePhases,
  loadPreset,
  t,
}: ControlsProps) {
  const presets = [
    { key: "chaos", label: t("controls.presets.chaos"), shortcut: "1" },
    { key: "edge", label: t("controls.presets.edge"), shortcut: "2" },
    { key: "coherent", label: t("controls.presets.coherent"), shortcut: "3" },
    { key: "pulse", label: t("controls.presets.pulse"), shortcut: "4" },
  ]

  return (
    <div className="glass p-6">
      <h2 className="heading-display text-xl mb-6">Controls</h2>

      {/* Main Controls */}
      <div className="flex gap-3 mb-6">
        <Button onClick={toggleSimulation} variant="default" size="lg" className="flex-1">
          {isRunning ? <PauseIcon /> : <PlayIcon />}
          {isRunning ? t("controls.pause") : t("controls.start")}
          <span className="ml-2 text-xs opacity-70">[Space]</span>
        </Button>

        <Button onClick={resetSimulation} variant="outline" size="lg">
          <RotateCcwIcon />
          {t("controls.reset")}
          <span className="ml-2 text-xs opacity-70">[R]</span>
        </Button>

        <Button onClick={randomizePhases} variant="outline" size="lg">
          <ShuffleIcon />
          {t("controls.randomize")}
        </Button>
      </div>

      {/* Presets */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Presets</h3>
        <div className="grid grid-cols-2 gap-2">
          {presets.map((preset) => (
            <Button
              key={preset.key}
              onClick={() => loadPreset(preset.key)}
              variant="secondary"
              size="sm"
              className="justify-between"
            >
              {preset.label}
              <span className="text-xs opacity-70">[{preset.shortcut}]</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Parameter Controls */}
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            {t("controls.coupling")} = {params.K.toFixed(2)}
          </label>
          <Slider
            value={[params.K]}
            onValueChange={([value]) => updateParams({ K: value })}
            min={0}
            max={5}
            step={0.1}
            className="w-full"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            {t("controls.noise")} = {params.D.toFixed(3)}
          </label>
          <Slider
            value={[params.D]}
            onValueChange={([value]) => updateParams({ D: value })}
            min={0}
            max={1}
            step={0.01}
            className="w-full"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">N = {params.N}</label>
          <Slider
            value={[params.N]}
            onValueChange={([value]) => updateParams({ N: Math.round(value) })}
            min={10}
            max={500}
            step={10}
            className="w-full"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            {t("controls.frequency")} = {params.omega0.toFixed(2)}
          </label>
          <Slider
            value={[params.omega0]}
            onValueChange={([value]) => updateParams({ omega0: value })}
            min={0.1}
            max={3}
            step={0.1}
            className="w-full"
          />
        </div>
      </div>
    </div>
  )
}
