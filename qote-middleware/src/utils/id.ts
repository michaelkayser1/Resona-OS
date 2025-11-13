/**
 * ID Generation Utilities
 * UUIDs and trace ID generation
 */

import { randomUUID } from "crypto";

/**
 * Generate a unique trace ID for request tracking
 */
export function generateTraceId(): string {
  return `qote-trace-${randomUUID()}`;
}

/**
 * Generate a session ID
 */
export function generateSessionId(): string {
  return `qote-session-${randomUUID()}`;
}

/**
 * Generate a generic UUID
 */
export function generateUUID(): string {
  return randomUUID();
}

/**
 * Validate UUID format
 */
export function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}
