/**
 * ID Generation Utilities
 * UUIDs and trace ID generation
 * Works on both Edge Runtime and Node.js
 */

/**
 * Generate a UUID using Web Crypto API (Edge-compatible)
 */
function generateUUIDInternal(): string {
  // Use Web Crypto API which works on both Edge and Node.js
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Generate a unique trace ID for request tracking
 */
export function generateTraceId(): string {
  return `qote-trace-${generateUUIDInternal()}`;
}

/**
 * Generate a session ID
 */
export function generateSessionId(): string {
  return `qote-session-${generateUUIDInternal()}`;
}

/**
 * Generate a generic UUID
 */
export function generateUUID(): string {
  return generateUUIDInternal();
}

/**
 * Validate UUID format
 */
export function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}
