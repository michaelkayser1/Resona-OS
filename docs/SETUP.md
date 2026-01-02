# Resona-OS Setup Guide

## Prerequisites

- Node.js 18+ or compatible runtime
- pnpm (recommended) or npm
- Git

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Resona-OS
```

### 2. Install Dependencies

```bash
pnpm install
# or
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the project root:

```env
# Optional: OpenAI API key for QOTE AI-powered responses
OPENAI_API_KEY=your_api_key_here

# Environment
NODE_ENV=development
```

**Note**: The application works without API keys using QOTE simulation mode.

### 4. Run Development Server

```bash
pnpm dev
# or
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
Resona-OS/
├── app/                    # Next.js app directory
│   ├── api/                # API route handlers
│   │   ├── qote/           # QOTE processing endpoint
│   │   └── snapshot/       # Coherence snapshot endpoint
│   ├── demo/               # QOTE demo page
│   ├── docs/               # Documentation page
│   ├── sentinel/           # Sentinel dashboard
│   └── page.tsx            # Home page
├── src/                    # Core application modules
│   └── core/               # Core business logic
│       └── snapshot.ts     # Coherence snapshot module
├── components/             # React components
│   └── ui/                 # UI components (Radix/shadcn)
├── lib/                    # Utility libraries
│   └── qote-engine.ts      # QOTE algorithm implementation
├── docs/                   # Documentation
│   ├── ARCHITECTURE.md     # System architecture
│   └── SETUP.md            # This file
└── public/                 # Static assets
```

## Accessing the Application

### Main Pages

- **Home**: `http://localhost:3000`
- **QOTE Demo**: `http://localhost:3000/demo`
- **Sentinel Dashboard**: `http://localhost:3000/sentinel`
- **Documentation**: `http://localhost:3000/docs`

### API Endpoints

- **POST /api/qote**: Process prompts with QOTE algorithm
- **GET /api/snapshot**: Retrieve current coherence snapshot

## Using the Sentinel Dashboard

1. Navigate to `/sentinel`
2. View real-time coherence metrics:
   - **R**: Coherence measure (0.0 - 1.0)
   - **β**: Coupling strength
   - **Δθ**: Phase difference
   - **τ**: Recovery time constant in milliseconds
3. Click "Refresh" to fetch latest snapshot
4. Inspect full JSON data in the Raw Snapshot Data panel

## Testing the Snapshot API

### Using curl:

```bash
curl http://localhost:3000/api/snapshot | jq
```

### Using the browser:

Navigate to `http://localhost:3000/api/snapshot` to see the JSON response.

## Development Workflow

### Making Changes

1. Edit files in the appropriate directories
2. Hot reload will automatically update the browser
3. Check the terminal for build errors

### Type Checking

```bash
pnpm tsc --noEmit
# or
npm run tsc --noEmit
```

### Building for Production

```bash
pnpm build
# or
npm run build
```

### Running Production Build

```bash
pnpm start
# or
npm start
```

## Troubleshooting

### Port Already in Use

If port 3000 is busy, specify a different port:

```bash
PORT=3001 pnpm dev
```

### Module Not Found Errors

Ensure all dependencies are installed:

```bash
pnpm install
```

### Type Errors

Check `tsconfig.json` paths are correctly configured:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

## Next Steps

1. Explore the QOTE demo at `/demo`
2. Review the architecture in `/docs/ARCHITECTURE.md`
3. Monitor system state via `/sentinel`
4. Extend the core snapshot module with real metrics

## TODO

- [ ] Add authentication to API endpoints
- [ ] Implement real-time metrics collection
- [ ] Add historical snapshot storage
- [ ] Create alerting system for threshold violations
- [ ] Add unit tests for core modules
