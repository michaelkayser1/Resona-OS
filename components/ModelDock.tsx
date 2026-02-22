"use client"
import type { RBFRDesign } from "@/lib/schemas"

type ProviderId = "openai" | "anthropic" | "mistral" | "xai" | "deepseek"

export function ModelDock({ designs }: { designs: Record<ProviderId, RBFRDesign | null> }) {
  const items = Object.entries(designs) as [ProviderId, RBFRDesign | null][]

  const modelNames: Record<ProviderId, string> = {
    openai: "GPT-4",
    anthropic: "Claude",
    mistral: "Mistral",
    xai: "Grok",
    deepseek: "DeepSeek",
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-cyan-400">Model Proposals</h3>
      <div className="grid gap-3">
        {items.map(([id, d]) => (
          <div
            key={id}
            className={`glow p-3 rounded-lg bg-gray-800/60 border ${d ? "border-green-500/50" : "border-gray-600"}`}
          >
            <div className="flex justify-between items-center mb-2">
              <strong className="text-white">{modelNames[id]}</strong>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  d ? "bg-green-600 text-white" : "bg-gray-600 text-gray-300"
                }`}
              >
                {d ? "parsed" : "—"}
              </span>
            </div>
            {d ? (
              <div className="text-xs space-y-1">
                <div>
                  <span className="text-gray-400">goal:</span> <span className="text-white">{d.goal}</span>
                </div>
                <div>
                  <span className="text-gray-400">waveform:</span>{" "}
                  <span className="text-blue-300">{d.field.waveform}</span>
                </div>
                <div>
                  <span className="text-gray-400">coil:</span>{" "}
                  <span className="text-green-300">{d.field.coilConfig}</span>
                </div>
                <div>
                  <span className="text-gray-400">carrierHz:</span>{" "}
                  <span className="text-purple-300">{d.field.carrierHz}</span>
                </div>
                <div>
                  <span className="text-gray-400">modIndex:</span>{" "}
                  <span className="text-yellow-300">{d.field.modulationIndex}</span>
                </div>
                <details className="mt-2">
                  <summary className="cursor-pointer text-cyan-400">guards & notes</summary>
                  <div className="mt-1 text-xs text-gray-300">
                    <div>maxTempC: {d.guards.maxTempC}</div>
                    <div>maxFieldT: {d.guards.maxFieldTesla}</div>
                    {d.notes.length > 0 && (
                      <ul className="mt-1 list-disc list-inside">
                        {d.notes.map((n, i) => (
                          <li key={i}>{n}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </details>
              </div>
            ) : (
              <div className="text-xs text-gray-500">No JSON parsed</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
