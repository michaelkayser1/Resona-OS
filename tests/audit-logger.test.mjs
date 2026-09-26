import test from "node:test"
import assert from "node:assert/strict"
import { getAuditChain, logAuditEvent, resetAuditChain, verifyChainIntegrity } from "../lib/audit/audit-logger.ts"

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
