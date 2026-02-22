export default function Home() {
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ marginBottom: "1rem" }}>The Field Refinery</h1>
      <p style={{ opacity: 0.8, maxWidth: 700 }}>
        RBFR Quantum Cockpit — a multi-AI, science-aware, interactive art instrument.
      </p>
      <a
        href="/rbfr"
        style={{
          display: "inline-block",
          marginTop: "1.5rem",
          padding: "0.75rem 1rem",
          border: "1px solid #333",
          borderRadius: 8,
          textDecoration: "none",
        }}
      >
        Launch Cockpit →
      </a>
    </main>
  )
}
