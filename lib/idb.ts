const DB_NAME = "field-refinery"
const STORE = "sessions"
const VERSION = 1

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function idbSet(key: string, value: unknown) {
  const db = await openDB()
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite")
    tx.objectStore(STORE).put(value, key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function idbGet<T = any>(key: string): Promise<T | null> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly")
    const req = tx.objectStore(STORE).get(key)
    req.onsuccess = () => resolve((req.result as T) ?? null)
    req.onerror = () => reject(req.error)
  })
}

export async function idbDel(key: string) {
  const db = await openDB()
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite")
    tx.objectStore(STORE).delete(key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function idbListSessions(): Promise<string[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly")
    const req = tx.objectStore(STORE).getAllKeys()
    req.onsuccess = () => {
      const keys = req.result as string[]
      const sessionKeys = keys.filter((key) => key.startsWith("rbfr-session:"))
      resolve(sessionKeys.map((key) => key.replace("rbfr-session:", "")))
    }
    req.onerror = () => reject(req.error)
  })
}

export async function idbExportSession(sessionId: string): Promise<string> {
  const sessionData = await idbGet(`rbfr-session:${sessionId}`)
  if (!sessionData) throw new Error("Session not found")

  const exportData = {
    version: "1.0",
    timestamp: new Date().toISOString(),
    sessionId,
    data: sessionData,
  }

  return JSON.stringify(exportData, null, 2)
}

export async function idbImportSession(jsonData: string): Promise<string> {
  try {
    const importData = JSON.parse(jsonData)

    if (!importData.version || !importData.data) {
      throw new Error("Invalid session format")
    }

    const sessionId = importData.sessionId || `imported-${Date.now()}`
    await idbSet(`rbfr-session:${sessionId}`, importData.data)

    return sessionId
  } catch (error) {
    throw new Error(`Import failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function idbClearAllSessions(): Promise<void> {
  const sessions = await idbListSessions()
  const promises = sessions.map((sessionId) => idbDel(`rbfr-session:${sessionId}`))
  await Promise.all(promises)
}

export async function idbGetSessionMetadata(sessionId: string): Promise<{
  id: string
  lastModified: string
  size: number
  hasDesigns: boolean
} | null> {
  const sessionData = await idbGet(`rbfr-session:${sessionId}`)
  if (!sessionData) return null

  const dataString = JSON.stringify(sessionData)
  const hasDesigns = sessionData.designs && Object.values(sessionData.designs).some(Boolean)

  return {
    id: sessionId,
    lastModified: new Date().toISOString(), // Could be enhanced with actual timestamp tracking
    size: new Blob([dataString]).size,
    hasDesigns,
  }
}
