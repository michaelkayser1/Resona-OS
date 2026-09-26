import test from "node:test"
import assert from "node:assert/strict"
import { getAuditChain, logAuditEvent, resetAuditChain, verifyAuditEvents, verifyChainIntegrity } from "../lib/audit/audit-logger.ts"

test("audit verifier detects a changed stored hash", async () => {
  resetAuditChain()
  await logAuditEvent("test", "agent.spawn", "sample")
  assert.deepEqual(await verifyChainIntegrity(), { valid: true, brokenAt: null })

  const [event] = getAuditChain()
  event.hash = "0".repeat(64)
  assert.deepEqual(await verifyChainIntegrity(), { valid: false, brokenAt: 0 })
  resetAuditChain()
})

test("audit verifier detects a changed payload in the final event", async () => {
  resetAuditChain()
  await logAuditEvent("test", "agent.spawn", "sample")
  const [event] = getAuditChain()
  event.resource = "changed"
  assert.deepEqual(await verifyChainIntegrity(), { valid: false, brokenAt: 0 })
  resetAuditChain()
})

test("chain checks links, ordering, deletion, and head anchoring", async () => {
  resetAuditChain()
  for (const resource of ["first", "second", "third"]) {
    await logAuditEvent("test", "agent.spawn", resource)
  }
  const original = getAuditChain().map((event) => ({ ...event }))
  const head = { count: original.length, hash: original.at(-1).hash }

  assert.deepEqual(await verifyAuditEvents(original, head), { valid: true, brokenAt: null })
  assert.deepEqual(
    await verifyAuditEvents(original.map((event, i) => i === 1 ? { ...event, prevHash: "0".repeat(64) } : event), head),
    { valid: false, brokenAt: 1 },
  )
  assert.deepEqual(await verifyAuditEvents([original[1], original[0], original[2]], head), { valid: false, brokenAt: 0 })
  assert.deepEqual(await verifyAuditEvents([original[0], original[2]], head), { valid: false, brokenAt: 1 })

  const truncated = original.slice(0, -1)
  // A self-contained chain has no knowledge that a valid tail was removed.
  assert.deepEqual(await verifyAuditEvents(truncated), { valid: true, brokenAt: null })
  assert.deepEqual(await verifyAuditEvents(truncated, head), { valid: false, brokenAt: 2 })
  resetAuditChain()
})
