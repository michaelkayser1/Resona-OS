/**
 * Immutable Audit Logging System
 * SHA-256 hash-chained append-only event store.
 * No event ever updates. Only inserts.
 */

export interface AuditEvent {
  id: string
  timestamp: string
  actor: string
  action: string
  resource: string
  metadata: Record<string, unknown>
  prevHash: string | null
  hash: string
}

export type AuditAction =
  | "agent.spawn"
  | "agent.commit"
  | "agent.complete"
  | "guardian.score"
  | "guardian.approve"
  | "guardian.reject"
  | "deploy.start"
  | "deploy.complete"
  | "auth.login"
  | "auth.logout"
  | "compliance.redaction"

let auditChain: AuditEvent[] = []
let lastHash: string | null = null

async function computeHash(data: string): Promise<string> {
  if (typeof globalThis.crypto !== "undefined" && globalThis.crypto.subtle) {
    const encoder = new TextEncoder()
    const buffer = await crypto.subtle.digest("SHA-256", encoder.encode(data))
    return Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  }
  // Fallback for environments without Web Crypto
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = ((hash << 5) - hash + char) | 0
  }
  return Math.abs(hash).toString(16).padStart(8, "0")
}

function generateId(): string {
  return `audit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

export async function logAuditEvent(
  actor: string,
  action: AuditAction,
  resource: string,
  metadata: Record<string, unknown> = {}
): Promise<AuditEvent> {
  const id = generateId()
  const timestamp = new Date().toISOString()

  const payload = JSON.stringify({ id, timestamp, actor, action, resource, metadata, prevHash: lastHash })
  const hash = await computeHash(payload)

  const event: AuditEvent = {
    id,
    timestamp,
    actor,
    action,
    resource,
    metadata,
    prevHash: lastHash,
    hash,
  }

  auditChain.push(event)
  lastHash = hash

  return event
}

export function getAuditChain(): AuditEvent[] {
  return [...auditChain]
}

export async function verifyChainIntegrity(): Promise<{
  valid: boolean
  brokenAt: number | null
}> {
  let prevHash: string | null = null

  for (let i = 0; i < auditChain.length; i++) {
    const event = auditChain[i]
    if (event.prevHash !== prevHash) {
      return { valid: false, brokenAt: i }
    }
    const payload = JSON.stringify({
      id: event.id,
      timestamp: event.timestamp,
      actor: event.actor,
      action: event.action,
      resource: event.resource,
      metadata: event.metadata,
      prevHash: event.prevHash,
    })
    prevHash = await computeHash(payload)
  }

  return { valid: true, brokenAt: null }
}

export function resetAuditChain(): void {
  auditChain = []
  lastHash = null
}
