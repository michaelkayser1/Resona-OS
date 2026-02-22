export function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function logToCSV(resonanceLog: { time: number; CUST: number; snapshot: any[] }[]): string {
  const headers = "Time,CUST,Consensus_Count,Event_Type\n"
  const rows = resonanceLog
    .map((event) => `${event.time.toFixed(2)},${event.CUST.toFixed(4)},${event.snapshot.length},emergence`)
    .join("\n")
  return headers + rows
}
