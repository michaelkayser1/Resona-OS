"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Crypto utilities for memory encryption
const CryptoUtils = {
  async deriveKey(passphrase: string, salt: Uint8Array) {
    const encoder = new TextEncoder()
    const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(passphrase), "PBKDF2", false, ["deriveKey"])

    return await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"],
    )
  },

  async encryptText(text: string, passphrase: string) {
    try {
      const salt = crypto.getRandomValues(new Uint8Array(16))
      const iv = crypto.getRandomValues(new Uint8Array(12))
      const key = await this.deriveKey(passphrase, salt)

      const encoder = new TextEncoder()
      const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, key, encoder.encode(text))

      // Combine salt + iv + encrypted data
      const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength)
      combined.set(salt, 0)
      combined.set(iv, salt.length)
      combined.set(new Uint8Array(encrypted), salt.length + iv.length)

      return btoa(String.fromCharCode(...combined))
    } catch (error) {
      console.error("Encryption failed:", error)
      throw error
    }
  },

  async decryptText(encryptedData: string, passphrase: string) {
    try {
      const combined = new Uint8Array(
        atob(encryptedData)
          .split("")
          .map((c) => c.charCodeAt(0)),
      )
      const salt = combined.slice(0, 16)
      const iv = combined.slice(16, 28)
      const encrypted = combined.slice(28)

      const key = await this.deriveKey(passphrase, salt)
      const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, key, encrypted)

      const decoder = new TextDecoder()
      return decoder.decode(decrypted)
    } catch (error) {
      console.error("Decryption failed:", error)
      throw error
    }
  },
}

// Clustering utilities for room discovery
const ClusteringUtils = {
  euclideanDistance(a: number[], b: number[]) {
    return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0))
  },

  dbscan(points: number[][], eps = 0.35, minPts = 3) {
    const clusters: number[][] = []
    const visited = new Set<number>()
    const clustered = new Set<number>()

    for (let i = 0; i < points.length; i++) {
      if (visited.has(i)) continue
      visited.add(i)

      const neighbors = this.getNeighbors(points, i, eps)

      if (neighbors.length < minPts) {
        continue // Point is noise
      }

      // Create new cluster
      const cluster: number[] = []
      const neighborQueue = [...neighbors]

      while (neighborQueue.length > 0) {
        const neighbor = neighborQueue.shift()!

        if (!visited.has(neighbor)) {
          visited.add(neighbor)
          const subNeighbors = this.getNeighbors(points, neighbor, eps)

          if (subNeighbors.length >= minPts) {
            neighborQueue.push(...subNeighbors)
          }
        }

        if (!clustered.has(neighbor)) {
          cluster.push(neighbor)
          clustered.add(neighbor)
        }
      }

      if (cluster.length > 0) {
        clusters.push(cluster)
      }
    }

    return clusters
  },

  getNeighbors(points: number[][], pointIndex: number, eps: number) {
    const neighbors: number[] = []
    const point = points[pointIndex]

    for (let i = 0; i < points.length; i++) {
      if (i !== pointIndex) {
        const distance = this.euclideanDistance(point, points[i])
        if (distance <= eps) {
          neighbors.push(i)
        }
      }
    }

    return neighbors
  },

  calculateCentroid(points: number[][], clusterIndices: number[]) {
    if (clusterIndices.length === 0) return [0, 0, 0]

    const sum = clusterIndices.reduce(
      (acc, idx) => {
        const point = points[idx]
        return [acc[0] + point[0], acc[1] + point[1], acc[2] + point[2]]
      },
      [0, 0, 0],
    )

    return [sum[0] / clusterIndices.length, sum[1] / clusterIndices.length, sum[2] / clusterIndices.length]
  },
}

interface Memory {
  id: string
  title: string
  content: string
  x: number
  y: number
  z: number
  timestamp: string
  encrypted: boolean
  color: string
  tags: string[]
}

interface Room {
  id: string
  name: string
  centroid: number[]
  members: Memory[]
  size: number
}

// 3D Memory Visualizer Component
function MemoryVisualizer({
  memories,
  onMemorySelect,
  rooms,
}: {
  memories: Memory[]
  onMemorySelect: (memory: Memory) => void
  rooms: Room[]
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const cameraRef = useRef({ x: 0, y: 5, z: 10, rotX: 0, rotY: 0 })
  const zoomRef = useRef(1)

  const zoom = (factor: number) => {
    zoomRef.current = Math.max(0.5, Math.min(3, zoomRef.current * factor))
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Simple 3D projection
    const project3D = (x: number, y: number, z: number) => {
      const camera = cameraRef.current

      // Apply camera rotation
      const cosY = Math.cos(camera.rotY)
      const sinY = Math.sin(camera.rotY)
      const cosX = Math.cos(camera.rotX)
      const sinX = Math.sin(camera.rotX)

      // Translate relative to camera
      const dx = x - camera.x
      const dy = y - camera.y
      const dz = z - camera.z

      // Rotate around Y axis
      const x1 = dx * cosY - dz * sinY
      const z1 = dx * sinY + dz * cosY

      // Rotate around X axis
      const y1 = dy * cosX - z1 * sinX
      const z2 = dy * sinX + z1 * cosX

      // Project to 2D
      const distance = Math.max(0.5, z2 + 10)
      const scale = (canvas.width / 4 / distance) * zoomRef.current

      return {
        x: canvas.width / 2 + x1 * scale,
        y: canvas.height / 2 - y1 * scale,
        scale: Math.max(0.1, scale),
        distance: distance,
      }
    }

    const animate = () => {
      // Clear canvas with cosmic background
      ctx.fillStyle = "rgba(10, 10, 15, 0.9)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw grid
      ctx.strokeStyle = "rgba(100, 200, 255, 0.1)"
      ctx.lineWidth = 1
      for (let i = -10; i <= 10; i++) {
        const start = project3D(i, 0, -10)
        const end = project3D(i, 0, 10)
        ctx.beginPath()
        ctx.moveTo(start.x, start.y)
        ctx.lineTo(end.x, end.y)
        ctx.stroke()

        const start2 = project3D(-10, 0, i)
        const end2 = project3D(10, 0, i)
        ctx.beginPath()
        ctx.moveTo(start2.x, start2.y)
        ctx.lineTo(end2.x, end2.y)
        ctx.stroke()
      }

      // Draw room portals
      rooms.forEach((room, index) => {
        const pos = project3D(room.centroid[0], room.centroid[1] + 2, room.centroid[2])

        ctx.strokeStyle = "rgba(76, 175, 80, 0.6)"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, 20 * pos.scale, 0, Math.PI * 2)
        ctx.stroke()

        ctx.fillStyle = "rgba(76, 175, 80, 0.8)"
        ctx.font = `${12 * pos.scale}px monospace`
        ctx.textAlign = "center"
        ctx.fillText(`Room ${index + 1}`, pos.x, pos.y - 25 * pos.scale)
      })

      // Sort memories by distance for proper depth rendering
      const sortedMemories = memories
        .map((memory) => ({
          memory,
          projected: project3D(memory.x, memory.y, memory.z),
        }))
        .sort((a, b) => b.projected.distance - a.projected.distance)

      // Draw memories
      sortedMemories.forEach(({ memory, projected }) => {
        const size = 8 * projected.scale

        // Draw memory node
        ctx.fillStyle = memory.color
        ctx.beginPath()
        ctx.arc(projected.x, projected.y, size, 0, Math.PI * 2)
        ctx.fill()

        // Add glow effect
        ctx.shadowColor = memory.color
        ctx.shadowBlur = 10 * projected.scale
        ctx.fill()
        ctx.shadowBlur = 0

        // Draw encrypted indicator
        if (memory.encrypted) {
          ctx.fillStyle = "rgba(255, 215, 0, 0.8)"
          ctx.font = `${10 * projected.scale}px monospace`
          ctx.textAlign = "center"
          ctx.fillText("🔒", projected.x, projected.y - size - 5)
        }

        // Draw title if close enough
        if (projected.scale > 0.5) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
          ctx.font = `${10 * projected.scale}px monospace`
          ctx.textAlign = "center"
          ctx.fillText(memory.title, projected.x, projected.y + size + 15)
        }
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    let gesture: { id: number; x: number; y: number; dragged: boolean } | null = null

    const handlePointerDown = (event: PointerEvent) => {
      if (!event.isPrimary || event.button !== 0 || gesture) return
      canvas.setPointerCapture(event.pointerId)
      gesture = { id: event.pointerId, x: event.clientX, y: event.clientY, dragged: false }
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (!gesture || gesture.id !== event.pointerId) return
      const dx = event.clientX - gesture.x
      const dy = event.clientY - gesture.y
      if (!gesture.dragged && Math.hypot(dx, dy) < 8) return
      gesture.dragged = true
      const camera = cameraRef.current
      camera.rotY -= dx * 0.01
      camera.rotX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotX + dy * 0.01))
      gesture.x = event.clientX
      gesture.y = event.clientY
    }

    const clearPointer = (event: PointerEvent) => {
      if (gesture?.id === event.pointerId) gesture = null
    }

    const handlePointerUp = (event: PointerEvent) => {
      if (!gesture || gesture.id !== event.pointerId) return
      const { dragged } = gesture
      clearPointer(event)
      if (dragged) return

      const rect = canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      if (x < 0 || y < 0 || x >= rect.width || y >= rect.height) return

      let nearest: Memory | undefined
      let bestDistance = Number.POSITIVE_INFINITY
      for (const memory of memories) {
        const projected = project3D(memory.x, memory.y, memory.z)
        const distance = Math.hypot(x - projected.x, y - projected.y)
        if (distance < bestDistance && distance <= Math.max(22, 15 * projected.scale)) {
          nearest = memory
          bestDistance = distance
        }
      }
      if (nearest) onMemorySelect(nearest)
    }

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()
      zoom(event.deltaY > 0 ? 1 / 1.1 : 1.1)
    }

    canvas.addEventListener("pointerdown", handlePointerDown)
    canvas.addEventListener("pointermove", handlePointerMove)
    canvas.addEventListener("pointerup", handlePointerUp)
    canvas.addEventListener("pointercancel", clearPointer)
    canvas.addEventListener("lostpointercapture", clearPointer)
    canvas.addEventListener("wheel", handleWheel, { passive: false })

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      canvas.removeEventListener("pointerdown", handlePointerDown)
      canvas.removeEventListener("pointermove", handlePointerMove)
      canvas.removeEventListener("pointerup", handlePointerUp)
      canvas.removeEventListener("pointercancel", clearPointer)
      canvas.removeEventListener("lostpointercapture", clearPointer)
      canvas.removeEventListener("wheel", handleWheel)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [memories, rooms, onMemorySelect])

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Button type="button" variant="outline" className="min-h-11" onClick={() => zoom(1.2)}>Zoom in</Button>
        <Button type="button" variant="outline" className="min-h-11" onClick={() => zoom(1 / 1.2)}>Zoom out</Button>
      </div>
      <canvas
        ref={canvasRef}
        aria-label="3D Memory Space"
        className="w-full h-full touch-none bg-slate-900 rounded-lg cursor-grab active:cursor-grabbing"
        style={{ minHeight: "400px" }}
      />
      {memories.length > 0 && (
        <ul aria-label="Memories" className="flex flex-wrap gap-2">
          {memories.map((memory) => (
            <li key={memory.id} className="min-w-0 max-w-full">
              <Button type="button" variant="outline" className="min-h-11 max-w-full" onClick={() => onMemorySelect(memory)}>
                <span className="truncate">{memory.title}</span>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function MemoryPalace() {
  const [memories, setMemories] = useState<Memory[]>([])
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [passphrase, setPassphrase] = useState("")
  const [showRooms, setShowRooms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [newMemoryTitle, setNewMemoryTitle] = useState("")
  const [newMemoryContent, setNewMemoryContent] = useState("")
  const [memoryError, setMemoryError] = useState("")
  const [decryptedContent, setDecryptedContent] = useState("")

  useEffect(() => {
    let cancelled = false
    setDecryptedContent("")
    if (!selectedMemory?.encrypted || !passphrase) return
    setDecryptedContent("Decrypting...")
    CryptoUtils.decryptText(selectedMemory.content, passphrase).then(
      (content) => { if (!cancelled) setDecryptedContent(content) },
      () => { if (!cancelled) setDecryptedContent("Failed to decrypt - check passphrase") },
    )
    return () => { cancelled = true }
  }, [selectedMemory, passphrase])

  const addMemory = async () => {
    if (!newMemoryTitle.trim()) return
    setMemoryError("")

    const memory: Memory = {
      id: crypto.randomUUID(),
      title: newMemoryTitle,
      content: newMemoryContent || "A creative thought captured in time...",
      x: (Math.random() - 0.5) * 20,
      y: Math.random() * 5,
      z: (Math.random() - 0.5) * 20,
      timestamp: new Date().toISOString(),
      encrypted: false,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
      tags: [],
    }

    // Encrypt if passphrase is provided
    if (passphrase) {
      try {
        memory.content = await CryptoUtils.encryptText(memory.content, passphrase)
        memory.encrypted = true
      } catch (error) {
        console.error("Failed to encrypt memory:", error)
        setMemoryError("Encryption failed. Memory was not added. Try again or export your existing memories.")
        return
      }
    }

    setMemories((previous) => [...previous, memory])
    setNewMemoryTitle("")
    setNewMemoryContent("")
  }

  const discoverRooms = async () => {
    if (memories.length < 3) {
      alert("Need at least 3 memories for room discovery")
      return
    }

    setIsLoading(true)

    try {
      // Create points for clustering
      const points = memories.map((m) => [m.x, m.y, m.z])

      // Run DBSCAN clustering
      const clusters = ClusteringUtils.dbscan(points, 3.5, 2)

      // Create room objects
      const discoveredRooms = clusters.map((cluster, index) => {
        const centroid = ClusteringUtils.calculateCentroid(points, cluster)
        const memberMemories = cluster.map((idx) => memories[idx])

        return {
          id: `room_${index}`,
          name: `Room ${index + 1}`,
          centroid: centroid,
          members: memberMemories,
          size: cluster.length,
        }
      })

      setRooms(discoveredRooms)
      setShowRooms(true)
    } catch (error) {
      console.error("Room discovery failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const exportMemories = () => {
    const exportData = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      memories: memories,
      rooms: rooms,
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `memory-palace-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importMemories = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        if (data.memories) {
          setMemories(data.memories)
          if (data.rooms) {
            setRooms(data.rooms)
          }
        }
      } catch (error) {
        console.error("Import failed:", error)
        alert("Failed to import memories")
      }
    }
    reader.readAsText(file)
  }

  const clearAllMemories = () => {
    if (confirm("Clear all memories? This cannot be undone.")) {
      setMemories([])
      setRooms([])
      setSelectedMemory(null)
      setShowRooms(false)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">
        Memories are temporary and reset when this panel closes or the page reloads. Export to keep a copy.
        An optional passphrase encrypts content only; titles, positions, tags, and timestamps remain visible.
      </p>
      {memoryError && <p role="alert" className="text-sm text-red-400">{memoryError}</p>}
      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="cosmic-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-cyan-400">Add Memory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <input
              type="text"
              placeholder="Memory title"
              value={newMemoryTitle}
              onChange={(e) => setNewMemoryTitle(e.target.value)}
              className="w-full min-h-11 px-3 py-2 text-base bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
            />
            <textarea
              placeholder="Memory content (optional)"
              value={newMemoryContent}
              onChange={(e) => setNewMemoryContent(e.target.value)}
              className="w-full min-h-11 px-3 py-2 text-base bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 resize-none"
              rows={2}
            />
            <input
              type="password"
              placeholder="Encryption passphrase (optional)"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              className="w-full min-h-11 px-3 py-2 text-base bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
            />
            <Button onClick={addMemory} className="w-full min-h-11 cosmic-button">
              Add Memory
            </Button>
          </CardContent>
        </Card>

        <Card className="cosmic-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-cyan-400">Palace Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={discoverRooms} disabled={isLoading} className="min-h-11 cosmic-button text-sm">
                {isLoading ? "Discovering..." : "Discover Rooms"}
              </Button>
              <Button onClick={exportMemories} className="min-h-11 cosmic-button text-sm">
                Export
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <label className="cosmic-button relative flex min-h-11 cursor-pointer items-center justify-center text-sm focus-within:ring-2">
                Import
                <input type="file" aria-label="Import memories" accept=".json" onChange={importMemories} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
              </label>
              <Button onClick={clearAllMemories} variant="destructive" className="min-h-11 text-sm">
                Clear All
              </Button>
            </div>
            <div className="text-xs text-slate-400 text-center">
              {memories.length} memories • {memories.filter((m) => m.encrypted).length} encrypted • {rooms.length} rooms
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3D Visualizer */}
      <Card className="cosmic-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-cyan-400">3D Memory Space</CardTitle>
          <CardDescription>Drag to rotate. Tap a memory to open it.</CardDescription>
        </CardHeader>
        <CardContent>
          <MemoryVisualizer memories={memories} onMemorySelect={setSelectedMemory} rooms={rooms} />
        </CardContent>
      </Card>

      {/* Rooms Panel */}
      {showRooms && rooms.length > 0 && (
        <Card className="cosmic-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-cyan-400">Discovered Rooms</CardTitle>
            <CardDescription>Memory clusters found in your palace</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {rooms.map((room) => (
                <div key={room.id} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-amber-400">{room.name}</h4>
                    <Badge variant="secondary">{room.size} memories</Badge>
                  </div>
                  <div className="text-xs text-slate-400">
                    Center: ({room.centroid.map((c) => c.toFixed(1)).join(", ")})
                  </div>
                  <div className="mt-2 space-y-1">
                    {room.members.slice(0, 3).map((memory) => (
                      <div key={memory.id} className="text-xs text-slate-300 truncate">
                        • {memory.title}
                      </div>
                    ))}
                    {room.members.length > 3 && (
                      <div className="text-xs text-slate-500">+{room.members.length - 3} more...</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Button onClick={() => setShowRooms(false)} variant="outline" className="mt-4 min-h-11 bg-transparent">
              Close Rooms
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Memory Details */}
      {selectedMemory && (
        <Card className="cosmic-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-cyan-400">{selectedMemory.title}</CardTitle>
            <CardDescription>
              Created: {new Date(selectedMemory.timestamp).toLocaleString()}
              {selectedMemory.encrypted && (
                <Badge variant="secondary" className="ml-2">
                  🔒 Encrypted
                </Badge>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
              {selectedMemory.encrypted ? (
                <div className="space-y-2">
                  <div className="text-slate-400 text-sm">Encrypted content:</div>
                  {passphrase ? (
                    <div className="text-slate-300">{decryptedContent}</div>
                  ) : (
                    <div className="text-slate-500 italic">Enter passphrase to decrypt</div>
                  )}
                </div>
              ) : (
                <div className="text-slate-300">{selectedMemory.content}</div>
              )}
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>
                Position: ({selectedMemory.x.toFixed(1)}, {selectedMemory.y.toFixed(1)}, {selectedMemory.z.toFixed(1)})
              </span>
              <span>ID: {selectedMemory.id}</span>
            </div>
            <Button onClick={() => setSelectedMemory(null)} variant="outline" className="min-h-11 bg-transparent">
              Close
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      {memories.length === 0 && (
        <Card className="cosmic-card">
          <CardContent className="text-center py-8">
            <div className="text-slate-400 mb-4">🧠 Your Memory Palace is empty</div>
            <div className="text-sm text-slate-500">Add your first memory above to begin exploring the 3D space</div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

