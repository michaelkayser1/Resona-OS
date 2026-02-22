"use client"

import React from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; retry: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[v0] RBFR Error Boundary caught error:", error, errorInfo)
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return <FallbackComponent error={this.state.error} retry={this.retry} />
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ error, retry }: { error?: Error; retry: () => void }) {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Quantum Field Disruption</h2>
        <p className="text-gray-400 mb-4">The RBFR system encountered an unexpected error. This could be due to:</p>
        <ul className="text-sm text-gray-500 text-left mb-6 space-y-1">
          <li>• AI model API connectivity issues</li>
          <li>• WebGL shader compilation failure</li>
          <li>• Consensus calculation overflow</li>
          <li>• Browser compatibility problems</li>
        </ul>
        {error && (
          <details className="text-xs text-gray-600 mb-4 text-left">
            <summary className="cursor-pointer">Technical Details</summary>
            <pre className="mt-2 p-2 bg-gray-800 rounded overflow-auto">{error.message}</pre>
          </details>
        )}
        <button
          onClick={retry}
          className="flex items-center space-x-2 bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded mx-auto"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reinitialize Field</span>
        </button>
      </div>
    </div>
  )
}
