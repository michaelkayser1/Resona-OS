"use client"
import { useEffect, useRef } from "react"

export function Sparkline({ data, width = 200, height = 40 }: { data: number[]; width?: number; height?: number }) {
  const ref = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const c = ref.current!
    c.width = width
    c.height = height
    const ctx = c.getContext("2d")!
    ctx.clearRect(0, 0, width, height)
    ctx.strokeStyle = "#06b6d4" // cyan-500
    ctx.lineWidth = 2

    if (!data.length) return

    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = Math.max(1e-6, max - min)

    ctx.beginPath()
    data.forEach((v, i) => {
      const x = (i / Math.max(1, data.length - 1)) * width
      const y = height - ((v - min) / range) * height
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.stroke()

    // Add phi line if data includes values near it
    if (max >= 1.618) {
      const phiY = height - ((1.618 - min) / range) * height
      ctx.strokeStyle = "#fbbf24" // yellow-400
      ctx.lineWidth = 1
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.moveTo(0, phiY)
      ctx.lineTo(width, phiY)
      ctx.stroke()
      ctx.setLineDash([])
    }
  }, [data, width, height])

  return <canvas ref={ref} className="border border-gray-600 rounded" style={{ width, height }} />
}
