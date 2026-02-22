"use client"
import type { RBFRDesign } from "@/lib/schemas"

export function RBFRPanel(props: {
  goal: RBFRDesign["goal"]
  setGoal: (v: RBFRDesign["goal"]) => void
  carrierHz: number
  setCarrierHz: (v: number) => void
  waveform: RBFRDesign["field"]["waveform"]
  setWaveform: (v: any) => void
  modulationIndex: number
  setModulationIndex: (v: number) => void
  coilConfig: RBFRDesign["field"]["coilConfig"]
  setCoilConfig: (v: any) => void
  maxTempC: number
  setMaxTempC: (v: number) => void
  maxFieldTesla: number
  setMaxFieldTesla: (v: number) => void
  notes: string[]
  setNotes: (v: string[]) => void
}) {
  const addNote = () => props.setNotes([...props.notes, ""])
  const setNote = (i: number, text: string) => {
    const next = props.notes.slice()
    next[i] = text
    props.setNotes(next)
  }

  return (
    <div className="holographic p-4 mb-4">
      <h3 className="text-lg font-semibold text-cyan-400 mb-4">RBFR Control Panel</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm text-gray-300 mb-1">Goal</label>
          <select
            value={props.goal}
            onChange={(e) => props.setGoal(e.target.value as any)}
            className="knob w-full text-sm"
          >
            <option value="maximize_yield">maximize_yield</option>
            <option value="reduce_heat">reduce_heat</option>
            <option value="stabilize_structure">stabilize_structure</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">carrierHz</label>
          <input
            type="number"
            value={props.carrierHz}
            onChange={(e) => props.setCarrierHz(Number(e.target.value))}
            className="knob w-full text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">waveform</label>
          <select
            value={props.waveform}
            onChange={(e) => props.setWaveform(e.target.value)}
            className="knob w-full text-sm"
          >
            <option value="sine">sine</option>
            <option value="pulse">pulse</option>
            <option value="fm">fm</option>
            <option value="am">am</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">coilConfig</label>
          <select
            value={props.coilConfig}
            onChange={(e) => props.setCoilConfig(e.target.value)}
            className="knob w-full text-sm"
          >
            <option value="helmholtz">helmholtz</option>
            <option value="solenoid">solenoid</option>
            <option value="multi-turn">multi-turn</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm text-gray-300 mb-1">
            modulationIndex ({props.modulationIndex.toFixed(2)})
          </label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={props.modulationIndex}
            onChange={(e) => props.setModulationIndex(Number(e.target.value))}
            className="w-full accent-cyan-500"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">maxTempC</label>
          <input
            type="number"
            value={props.maxTempC}
            onChange={(e) => props.setMaxTempC(Number(e.target.value))}
            className="knob w-full text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">maxFieldTesla</label>
          <input
            type="number"
            step="0.1"
            value={props.maxFieldTesla}
            onChange={(e) => props.setMaxFieldTesla(Number(e.target.value))}
            className="knob w-full text-sm"
          />
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <strong className="text-cyan-400">Contradiction Notes (TRIZ)</strong>
          <button
            onClick={addNote}
            className="px-3 py-1 text-xs bg-cyan-600 hover:bg-cyan-700 rounded transition-colors"
          >
            + Note
          </button>
        </div>
        <div className="grid gap-2">
          {props.notes.map((n, i) => (
            <input
              key={i}
              placeholder={`note ${i + 1}`}
              value={n}
              onChange={(e) => setNote(i, e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-400"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
