interface AttentionHeatmapProps {
  attentionMatrix: number[][]
  tokens: string[]
  size?: number
  title?: string
}

export function AttentionHeatmap({
  attentionMatrix,
  tokens,
  size = 240,
  title = "Phase-Coherent Attention Matrix",
}: AttentionHeatmapProps) {
  if (!attentionMatrix || attentionMatrix.length === 0 || !tokens || tokens.length === 0) {
    return (
      <div className="overflow-x-auto">
        <div className="text-xs mb-2 opacity-80">{title}</div>
        <div className="p-5 text-center text-muted-foreground">No attention data available</div>
      </div>
    )
  }

  const N = attentionMatrix.length
  const cell = Math.max(12, Math.floor(size / Math.max(1, N)))
  const w = cell * N
  const h = cell * N
  const max = 1 // rows are softmaxed

  console.log("[v0] Rendering heatmap with dimensions:", N, "x", N, "cell size:", cell)
  console.log(
    "[v0] Sample attention values:",
    attentionMatrix[0]?.slice(0, 3).map((val) => val?.toFixed(4)),
  )

  return (
    <div className="overflow-x-auto">
      <div className="text-sm font-medium mb-3 text-foreground">{title}</div>
      <div className="bg-card border border-border rounded-lg p-4">
        <svg
          width={w}
          height={h}
          role="img"
          aria-label="attention heatmap"
          className="border border-border rounded bg-background"
        >
          {attentionMatrix.map((row, i) =>
            row.map((p, j) => {
              const value = typeof p === "number" && !isNaN(p) ? p : 0
              const v = Math.min(1, Math.max(0, value / max))
              const intensity = Math.round(v * 255)
              const fill = `rgb(${Math.max(0, 100 - intensity)}, ${Math.max(0, 150 - intensity)}, ${200 + Math.round(intensity * 0.2)})`
              return (
                <rect
                  key={`${i}-${j}`}
                  x={j * cell}
                  y={i * cell}
                  width={cell}
                  height={cell}
                  fill={fill}
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="0.5"
                  opacity={0.8 + v * 0.2}
                />
              )
            }),
          )}
        </svg>
        <div className="flex gap-1 flex-wrap mt-3">
          {tokens.map((t, i) => (
            <span
              key={i}
              className="text-xs bg-muted border border-border px-2 py-1 rounded text-muted-foreground font-mono"
            >
              {i}:{t.slice(0, 8)}
            </span>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 bg-gradient-to-r from-blue-900 to-blue-300 rounded border"></div>
            <span>Low → High Attention</span>
          </div>
          <div>Matrix shows phase-coherent attention weights between tokens</div>
        </div>
      </div>
    </div>
  )
}
