"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { idbListSessions, idbExportSession, idbImportSession, idbClearAllSessions } from "@/lib/idb"
import { Download, Upload, Trash2, FileText, Share2, Check } from "lucide-react"

interface SessionManagerProps {
  currentSessionId: string
  onSessionChange: (sessionId: string) => void
  onClose: () => void
}

export function SessionManager({ currentSessionId, onSessionChange, onClose }: SessionManagerProps) {
  const [sessions, setSessions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [importData, setImportData] = useState("")

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      const sessionList = await idbListSessions()
      setSessions(sessionList)
    } catch (error) {
      console.error("Failed to load sessions:", error)
    }
  }

  const handleExport = async (sessionId: string) => {
    try {
      setLoading(true)
      const exportData = await idbExportSession(sessionId)

      // Create download
      const blob = new Blob([exportData], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `rbfr-session-${sessionId}-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Export failed:", error)
      alert("Export failed: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    if (!importData.trim()) return

    try {
      setLoading(true)
      const sessionId = await idbImportSession(importData)
      await loadSessions()
      onSessionChange(sessionId)
      setImportData("")
      alert(`Session imported successfully as: ${sessionId}`)
    } catch (error) {
      console.error("Import failed:", error)
      alert("Import failed: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setLoading(false)
    }
  }

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setImportData(content)
    }
    reader.readAsText(file)
  }

  const handleClearAll = async () => {
    if (!confirm("Are you sure you want to delete all sessions? This cannot be undone.")) return

    try {
      setLoading(true)
      await idbClearAllSessions()
      await loadSessions()
      alert("All sessions cleared")
    } catch (error) {
      console.error("Clear failed:", error)
      alert("Clear failed: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setLoading(false)
    }
  }

  const copyShareLink = async (sessionId: string) => {
    try {
      const exportData = await idbExportSession(sessionId)
      const compressed = btoa(JSON.stringify(JSON.parse(exportData)))
      const shareUrl = `${window.location.origin}/rbfr?import=${encodeURIComponent(compressed)}`

      await navigator.clipboard.writeText(shareUrl)
      setCopied(sessionId)
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      console.error("Share link failed:", error)
      alert("Failed to create share link")
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto border border-cyan-500/30">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-cyan-400">Session Manager</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Session List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-300">Saved Sessions</h4>
              <button
                onClick={handleClearAll}
                disabled={loading || sessions.length === 0}
                className="flex items-center space-x-2 px-3 py-1 bg-red-600/20 border border-red-500/50 rounded text-red-300 hover:bg-red-600/30 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear All</span>
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {sessions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No saved sessions</p>
              ) : (
                sessions.map((sessionId) => (
                  <div
                    key={sessionId}
                    className={`p-3 rounded-lg border transition-all ${
                      sessionId === currentSessionId
                        ? "bg-cyan-600/20 border-cyan-500/50"
                        : "bg-gray-700/50 border-gray-600/50 hover:bg-gray-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-white">{sessionId}</div>
                        <div className="text-xs text-gray-400">
                          {sessionId === currentSessionId ? "Current session" : "Saved session"}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onSessionChange(sessionId)}
                          className="px-2 py-1 bg-blue-600/20 border border-blue-500/50 rounded text-blue-300 hover:bg-blue-600/30 transition-colors text-xs"
                        >
                          Load
                        </button>

                        <button
                          onClick={() => copyShareLink(sessionId)}
                          disabled={loading}
                          className="p-1 bg-purple-600/20 border border-purple-500/50 rounded text-purple-300 hover:bg-purple-600/30 transition-colors"
                        >
                          {copied === sessionId ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                        </button>

                        <button
                          onClick={() => handleExport(sessionId)}
                          disabled={loading}
                          className="p-1 bg-green-600/20 border border-green-500/50 rounded text-green-300 hover:bg-green-600/30 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Import/Export */}
          <div>
            <h4 className="text-lg font-medium text-gray-300 mb-4">Import/Export</h4>

            <div className="space-y-4">
              {/* File Import */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Import from File</label>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              {/* JSON Import */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Import from JSON</label>
                <textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  placeholder="Paste session JSON data here..."
                  className="w-full h-32 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm resize-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
                <button
                  onClick={handleImport}
                  disabled={loading || !importData.trim()}
                  className="mt-2 flex items-center space-x-2 px-4 py-2 bg-blue-600/20 border border-blue-500/50 rounded text-blue-300 hover:bg-blue-600/30 transition-colors disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  <span>Import Session</span>
                </button>
              </div>

              {/* Instructions */}
              <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30">
                <h5 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Session Sharing
                </h5>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• Export sessions as JSON files for backup</li>
                  <li>• Share sessions via generated links</li>
                  <li>• Import sessions from files or JSON data</li>
                  <li>• Sessions include all RBFR parameters and AI responses</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {loading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
            <div className="text-white">Processing...</div>
          </div>
        )}
      </div>
    </div>
  )
}
