# Resona-OS Architecture

## Overview

Resona-OS is built on a Next.js foundation, implementing quantum-inspired coherence algorithms through the QOTE (Quantum Oscillatory Token Embedding) engine. The system provides real-time monitoring and visualization of coherence metrics.

## Core Modules

### 1. Core Snapshot Module (`/src/core/snapshot.ts`)

The canonical schema for system state snapshots, providing:

- **CoherenceSnapshot Type**: Structured schema for capturing system state
- **makeSnapshot()**: Factory function with intelligent defaults
- **validateSnapshot()**: Validation logic without external dependencies

**Key Fields:**
- `timestamp`: ISO date string for snapshot creation time
- `app`: Application metadata (version, environment, uptime)
- `context`: Coherence parameters (R, beta, deltaTheta, tauRecoveryMs)
- `metrics`: Runtime statistics (requests, errors, latency, QOTE processing)
- `flags`: String array for feature flags or warnings
- `notes`: Human-readable commentary

### 2. API Layer (`/app/api/snapshot/route.ts`)

REST endpoint exposing current system state:

- **GET /api/snapshot**: Returns CoherenceSnapshot JSON
- Stub implementation with placeholder metrics
- TODO: Add authentication/authorization

### 3. Sentinel Dashboard (`/app/sentinel/page.tsx`)

Client-side monitoring interface:

- Real-time snapshot fetching
- Tabular view of core coherence metrics
- Full JSON inspection view
- Auto-refresh capability

## Data Flow

```
Client (Sentinel Dashboard)
    ↓ GET /api/snapshot
API Route Handler
    ↓ makeSnapshot()
Core Snapshot Module
    ↓ CoherenceSnapshot
Client renders metrics + JSON
```

## Design Principles

1. **Minimal Dependencies**: Core logic uses only TypeScript primitives
2. **Type Safety**: Full TypeScript coverage with explicit types
3. **Validation**: Simple, readable validation without external libs
4. **Extensibility**: Modular design allows easy metric additions
5. **Observability**: Clear separation between data layer and presentation

## Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (strict mode)
- **UI Components**: Radix UI + Tailwind CSS
- **State Management**: React hooks (client-side)
- **API**: Next.js Route Handlers

## Security Considerations

**Current State:**
- No authentication on /api/snapshot endpoint
- No rate limiting
- No input sanitization (N/A for GET endpoint)

**TODO:**
- Implement authentication middleware
- Add API key or session-based auth
- Consider IP allowlisting for production
- Add request logging and monitoring

## Future Enhancements

1. **Real Metrics**: Wire in actual QOTE engine metrics
2. **Historical Data**: Store snapshots for trend analysis
3. **Alerting**: Threshold-based notifications
4. **Multi-node**: Aggregate snapshots from distributed instances
5. **Export**: CSV/JSON download for offline analysis
