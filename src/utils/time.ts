/**
 * Time Utilities
 * Timestamp formatting and conversions
 */

/**
 * Get current ISO timestamp
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Parse ISO timestamp to Date
 */
export function parseTimestamp(timestamp: string): Date {
  return new Date(timestamp);
}

/**
 * Get Unix timestamp (seconds)
 */
export function getUnixTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Format duration in milliseconds to human-readable string
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
  return `${(ms / 60000).toFixed(2)}m`;
}

/**
 * Check if timestamp is within last N minutes
 */
export function isRecent(timestamp: string, minutes: number = 5): boolean {
  const date = parseTimestamp(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return diff < minutes * 60 * 1000;
}
