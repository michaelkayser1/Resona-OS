export default function Home() {
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>QOTE Middleware</h1>
      <p>Central nervous system for QOTE-aware applications.</p>

      <h2>Endpoints</h2>
      <ul>
        <li>
          <code>POST /api/qote/chat</code> - Main conversational endpoint
        </li>
        <li>
          <code>POST /api/qote/chat-stream</code> - Streaming chat endpoint
        </li>
        <li>
          <code>POST /api/qote/event</code> - Event logging endpoint
        </li>
      </ul>

      <h2>Documentation</h2>
      <ul>
        <li>
          <a href="https://github.com/yourusername/qote-middleware/blob/main/README.md">
            README
          </a>
        </li>
        <li>
          <a href="https://github.com/yourusername/qote-middleware/blob/main/docs/API_REFERENCE.md">
            API Reference
          </a>
        </li>
        <li>
          <a href="https://github.com/yourusername/qote-middleware/blob/main/QUICKSTART.md">
            Quickstart Guide
          </a>
        </li>
      </ul>

      <h2>Status</h2>
      <p>✅ Middleware is running</p>

      <h2>QOTE Metrics</h2>
      <p>
        This middleware computes and applies QOTE coherence metrics (Δθ, W, Φ)
        to all interactions.
      </p>

      <ul>
        <li>
          <strong>Δθ (Delta Theta)</strong>: Misalignment / tension measure
        </li>
        <li>
          <strong>W (Wobble)</strong>: Oscillatory instability
        </li>
        <li>
          <strong>Φ (Phi Index)</strong>: Coherence / golden corridor proximity
        </li>
      </ul>
    </main>
  );
}
