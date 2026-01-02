"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Activity, RefreshCw } from "lucide-react";
import Link from "next/link";
import type { CoherenceSnapshot } from "@/src/core/snapshot";

export default function SentinelPage() {
  const [snapshot, setSnapshot] = useState<CoherenceSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSnapshot = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/snapshot");
      if (!response.ok) {
        throw new Error(`Failed to fetch snapshot: ${response.statusText}`);
      }
      const data = await response.json();
      setSnapshot(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSnapshot();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Sentinel Dashboard</h1>
                <p className="text-xs text-muted-foreground">Coherence Snapshot Monitor</p>
              </div>
            </div>
          </div>
          <Button onClick={fetchSnapshot} disabled={loading} size="sm">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Metrics Table */}
          <Card>
            <CardHeader>
              <CardTitle>Context Metrics</CardTitle>
              <CardDescription>Core coherence parameters</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                </div>
              ) : error ? (
                <div className="text-red-600 dark:text-red-400">Error: {error}</div>
              ) : snapshot ? (
                <div className="space-y-4">
                  <table className="w-full text-sm">
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2 font-medium">R (Coherence)</td>
                        <td className="py-2 text-right font-mono">{snapshot.context.R.toFixed(4)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 font-medium">β (Coupling Strength)</td>
                        <td className="py-2 text-right font-mono">{snapshot.context.beta.toFixed(4)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 font-medium">Δθ (Phase Difference)</td>
                        <td className="py-2 text-right font-mono">{snapshot.context.deltaTheta.toFixed(4)}</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-medium">τ Recovery (ms)</td>
                        <td className="py-2 text-right font-mono">{snapshot.context.tauRecoveryMs}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* System Info */}
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
              <CardDescription>Application state</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                </div>
              ) : error ? (
                <div className="text-red-600 dark:text-red-400">Error: {error}</div>
              ) : snapshot ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Version</span>
                    <Badge variant="outline">{snapshot.app.version}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Environment</span>
                    <Badge variant="secondary">{snapshot.app.environment}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Uptime</span>
                    <span className="text-sm font-mono">{snapshot.app.uptime.toFixed(2)}s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Timestamp</span>
                    <span className="text-xs font-mono text-muted-foreground">
                      {new Date(snapshot.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {snapshot.notes && (
                    <div className="pt-2 border-t">
                      <span className="text-sm font-medium">Notes</span>
                      <p className="text-sm text-muted-foreground mt-1">{snapshot.notes}</p>
                    </div>
                  )}
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* Full JSON View */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Raw Snapshot Data</CardTitle>
              <CardDescription>Complete JSON representation</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
                  <div className="h-4 bg-muted rounded animate-pulse w-5/6"></div>
                </div>
              ) : error ? (
                <div className="text-red-600 dark:text-red-400">Error: {error}</div>
              ) : snapshot ? (
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                  {JSON.stringify(snapshot, null, 2)}
                </pre>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
