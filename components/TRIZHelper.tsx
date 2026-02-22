"use client"

import { useState } from "react"
import { Lightbulb, ArrowRight } from "lucide-react"

interface TRIZHelperProps {
  onSuggestion: (suggestion: string) => void
}

const TRIZ_PRINCIPLES = {
  "Efficiency|Heat Management": [
    "Principle 35: Parameter change (duty cycle, frequency modulation)",
    "Principle 10: Preliminary action (pre-cooling systems)",
    "Principle 3: Local quality (targeted cooling where heating occurs)",
  ],
  "Fuel Throughput|Signal Purity": [
    "Principle 2: Taking out (noise gating and filtering)",
    "Principle 19: Periodic action (burst throughput cycles)",
    "Principle 15: Dynamics (adaptive control systems)",
  ],
  "Coil Durability|EMI": [
    "Principle 40: Composite materials (hybrid coil construction)",
    "Principle 24: Mediator (Faraday shielding)",
    "Principle 28: Mechanics substitution (field-based control)",
  ],
  "Power|Control": [
    "Principle 1: Segmentation (modular power stages)",
    "Principle 16: Partial or excessive actions (controlled overshoot)",
    "Principle 35: Parameter change (variable control algorithms)",
  ],
  "Stability|Yield": [
    "Principle 11: Beforehand cushioning (stability buffers)",
    "Principle 27: Cheap short-living objects (sacrificial elements)",
    "Principle 32: Color changes (visual feedback systems)",
  ],
}

const IMPROVE_OPTIONS = [
  "Efficiency",
  "Heat Management",
  "Coil Durability",
  "Fuel Throughput",
  "Signal Purity",
  "Power",
  "Control",
  "Stability",
  "Yield",
]

const WORSEN_OPTIONS = ["Noise", "Complexity", "Weight", "Safety Margin", "EMI", "Thermal Load", "Cost", "Maintenance"]

export function TRIZHelper({ onSuggestion }: TRIZHelperProps) {
  const [improve, setImprove] = useState("Efficiency")
  const [worsen, setWorsen] = useState("Heat Management")
  const [suggestions, setSuggestions] = useState<string[]>([])

  const generateSuggestions = () => {
    const key1 = `${improve}|${worsen}`
    const key2 = `${worsen}|${improve}`

    let principles = TRIZ_PRINCIPLES[key1] || TRIZ_PRINCIPLES[key2]

    if (!principles) {
      // Fallback generic principles
      principles = [
        "Principle 1: Segmentation (divide system into independent parts)",
        "Principle 35: Parameter change (modify physical/chemical states)",
        "Principle 15: Dynamics (make system adaptive and flexible)",
      ]
    }

    setSuggestions(principles)

    const suggestionText = `TRIZ Analysis:\nImprove: ${improve}\nMay worsen: ${worsen}\n\nSuggested principles:\n${principles.map((p) => `• ${p}`).join("\n")}`
    onSuggestion(suggestionText)
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
      <div className="flex items-center space-x-2 mb-4">
        <Lightbulb className="w-5 h-5 text-yellow-400" />
        <h3 className="text-lg font-semibold">TRIZ Contradiction Helper</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Improve →</label>
          <select
            value={improve}
            onChange={(e) => setImprove(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
          >
            {IMPROVE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">May Worsen →</label>
          <select
            value={worsen}
            onChange={(e) => setWorsen(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
          >
            {WORSEN_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={generateSuggestions}
        className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-medium py-2 px-4 rounded flex items-center justify-center space-x-2"
      >
        <span>Generate TRIZ Suggestions</span>
        <ArrowRight className="w-4 h-4" />
      </button>

      {suggestions.length > 0 && (
        <div className="mt-4 bg-gray-700 rounded p-3">
          <h4 className="text-sm font-semibold text-yellow-300 mb-2">Suggested Principles:</h4>
          <ul className="text-sm text-gray-300 space-y-1">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-yellow-400">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
