/**
 * PHI Guardrails & Redaction
 * Automatically redacts sensitive patterns from logs.
 * No PHI in development logs.
 */

const PATTERNS: { name: string; regex: RegExp; replacement: string }[] = [
  {
    name: "SSN",
    regex: /\b\d{3}-\d{2}-\d{4}\b/g,
    replacement: "[REDACTED-SSN]",
  },
  {
    name: "MRN",
    regex: /\bMRN[:\s]?\d{6,10}\b/gi,
    replacement: "[REDACTED-MRN]",
  },
  {
    name: "DOB",
    regex: /\b(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/(19|20)\d{2}\b/g,
    replacement: "[REDACTED-DOB]",
  },
  {
    name: "Email",
    regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    replacement: "[REDACTED-EMAIL]",
  },
  {
    name: "Phone",
    regex: /\b(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    replacement: "[REDACTED-PHONE]",
  },
]

export interface RedactionResult {
  sanitized: string
  redactionsApplied: { pattern: string; count: number }[]
}

export function redact(input: string): RedactionResult {
  let sanitized = input
  const redactionsApplied: { pattern: string; count: number }[] = []

  for (const pattern of PATTERNS) {
    const matches = sanitized.match(pattern.regex)
    if (matches && matches.length > 0) {
      redactionsApplied.push({ pattern: pattern.name, count: matches.length })
      sanitized = sanitized.replace(pattern.regex, pattern.replacement)
    }
  }

  return { sanitized, redactionsApplied }
}

export function isSafe(input: string): boolean {
  return PATTERNS.every((p) => !p.regex.test(input))
}
