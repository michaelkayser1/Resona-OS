"use client"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"
import { validatePacket } from "../lib/telemetry-validate"

export default function ImportTelemetry({ onLoad }: { onLoad: (pkt: any) => void }) {
  return (
    <label className="cursor-pointer">
      <Button variant="outline" size="sm" className="gap-2 bg-transparent">
        <Upload className="w-4 h-4" />
        Import Telemetry JSON
      </Button>
      <input
        type="file"
        hidden
        accept="application/json"
        onChange={async (e) => {
          const f = e.target.files?.[0]
          if (!f) return
          try {
            const validated = validatePacket(JSON.parse(await f.text()))
            onLoad(validated)
          } catch (error) {
            console.error("Failed to parse telemetry JSON:", error)
          }
        }}
      />
    </label>
  )
}
