"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"

interface SettingsDrawerProps {
  isOpen: boolean
  onClose: () => void
  t: (key: string) => string
}

const XIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

export function SettingsDrawer({ isOpen, onClose, t }: SettingsDrawerProps) {
  const [fpsLimit, setFpsLimit] = useState(60)
  const [particleSize, setParticleSize] = useState(1)
  const [highContrast, setHighContrast] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(false)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="ml-auto w-80 h-full glass-strong border-l border-border p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="heading-display text-xl">Settings</h2>
          <Button onClick={onClose} variant="ghost" size="sm">
            <XIcon />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Performance */}
          <div>
            <h3 className="font-semibold mb-3">Performance</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">FPS Limit: {fpsLimit}</label>
                <Slider
                  value={[fpsLimit]}
                  onValueChange={([value]) => setFpsLimit(value)}
                  min={30}
                  max={120}
                  step={30}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Particle Size: {particleSize}x</label>
                <Slider
                  value={[particleSize]}
                  onValueChange={([value]) => setParticleSize(value)}
                  min={0.5}
                  max={2}
                  step={0.1}
                />
              </div>
            </div>
          </div>

          {/* Accessibility */}
          <div>
            <h3 className="font-semibold mb-3">Accessibility</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">High Contrast</label>
                <Switch checked={highContrast} onCheckedChange={setHighContrast} />
              </div>
            </div>
          </div>

          {/* Audio */}
          <div>
            <h3 className="font-semibold mb-3">Audio</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Enable Sonification</label>
                <Switch checked={audioEnabled} onCheckedChange={setAudioEnabled} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
