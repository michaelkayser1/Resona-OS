export const linkHandlers = {
  demo: () => {
    console.log("[v0] Demo link clicked - redirecting to internal demo")
    // Instead of opening non-working external URL, show internal demo
    return false // Prevent external navigation
  },

  docs: () => {
    console.log("[v0] Docs link clicked - showing placeholder")
    alert("Documentation coming soon! Contact investors@example.com for early access.")
    return false
  },

  schedule: () => {
    window.open("https://calendly.com/qote-resona/demo", "_blank", "noopener,noreferrer")
    return true
  },

  contact: () => {
    window.open("mailto:investors@example.com?subject=QOTE Investment Opportunity", "_blank")
    return true
  },

  social: (platform: string, url: string) => {
    window.open(url, "_blank", "noopener,noreferrer")
    return true
  },
}
