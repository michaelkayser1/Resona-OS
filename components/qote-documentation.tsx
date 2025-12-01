"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  Code,
  Database,
  Activity,
  BarChart3,
  Download,
  ChevronRight,
  Book,
  Terminal,
  Cpu,
} from "@/components/ui/icons"

export default function QOTEDocumentation() {
  const [activeSection, setActiveSection] = useState("overview")

  const sections = [
    {
      id: "overview",
      title: "System Overview",
      icon: Book,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-bold mb-4 text-white">QOTE-Resona Documentation</h3>
            <p className="text-slate-300 mb-6">
              Complete technical documentation for the Quantum Ontological Token Engineering (QOTE) system - the first
              quantum resonance interface for AI coherence measurement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-slate-800/50 border-slate-600">
              <CardHeader>
                <CardTitle className="text-cyan-400 flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Braid-Map Visualization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 text-sm mb-3">
                  Interactive quantum resonance interface with real-time coherence measurement
                </p>
                <Badge variant="outline" className="text-emerald-400 border-emerald-500/50">
                  Live System
                </Badge>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-600">
              <CardHeader>
                <CardTitle className="text-purple-400 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Strategy Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 text-sm mb-3">
                  90-day launch roadmap with investor metrics and milestone tracking
                </p>
                <Badge variant="outline" className="text-blue-400 border-blue-500/50">
                  Active Development
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      ),
    },
    {
      id: "api",
      title: "API Reference",
      icon: Code,
      content: (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold mb-4 text-white">API Documentation</h3>

          <Card className="bg-slate-800/50 border-slate-600">
            <CardHeader>
              <CardTitle className="text-cyan-400">Coherence Measurement API</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                <code className="text-green-400 text-sm">POST /api/coherence/analyze</code>
                <p className="text-slate-300 text-sm mt-2">
                  Analyzes quantum coherence patterns and returns resonance metrics
                </p>
              </div>

              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                <code className="text-green-400 text-sm">GET /api/braid-map/status</code>
                <p className="text-slate-300 text-sm mt-2">
                  Returns current braid-map visualization state and parameters
                </p>
              </div>

              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                <code className="text-green-400 text-sm">POST /api/demo/schedule</code>
                <p className="text-slate-300 text-sm mt-2">Schedules investor demo and sends confirmation email</p>
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "technical",
      title: "Technical Specs",
      icon: Cpu,
      content: (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold mb-4 text-white">Technical Specifications</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-slate-800/50 border-slate-600">
              <CardHeader>
                <CardTitle className="text-cyan-400">System Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300">Node.js</span>
                  <Badge variant="outline" className="text-green-400 border-green-500/50">
                    18.0+
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">React</span>
                  <Badge variant="outline" className="text-blue-400 border-blue-500/50">
                    18.0+
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Next.js</span>
                  <Badge variant="outline" className="text-purple-400 border-purple-500/50">
                    14.0+
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">TypeScript</span>
                  <Badge variant="outline" className="text-cyan-400 border-cyan-500/50">
                    5.0+
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-600">
              <CardHeader>
                <CardTitle className="text-purple-400">Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300">Response Time</span>
                  <Badge variant="outline" className="text-green-400 border-green-500/50">
                    &lt;100ms
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Uptime</span>
                  <Badge variant="outline" className="text-emerald-400 border-emerald-500/50">
                    99.7%
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Concurrent Users</span>
                  <Badge variant="outline" className="text-blue-400 border-blue-500/50">
                    1000+
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Data Processing</span>
                  <Badge variant="outline" className="text-purple-400 border-purple-500/50">
                    Real-time
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ),
    },
    {
      id: "deployment",
      title: "Deployment Guide",
      icon: Terminal,
      content: (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold mb-4 text-white">Deployment Guide</h3>

          <Card className="bg-slate-800/50 border-slate-600">
            <CardHeader>
              <CardTitle className="text-cyan-400">Quick Start</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                <p className="text-slate-300 text-sm mb-2">1. Clone the repository</p>
                <code className="text-green-400 text-sm">
                  git clone https://github.com/kayser-medical/qote-resona-dashboard.git
                </code>
              </div>

              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                <p className="text-slate-300 text-sm mb-2">2. Install dependencies</p>
                <code className="text-green-400 text-sm">npm install</code>
              </div>

              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                <p className="text-slate-300 text-sm mb-2">3. Start development server</p>
                <code className="text-green-400 text-sm">npm run dev</code>
              </div>

              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                <p className="text-slate-300 text-sm mb-2">4. Deploy to Vercel</p>
                <code className="text-green-400 text-sm">vercel --prod</code>
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
  ]

  const currentSection = sections.find((s) => s.id === activeSection) || sections[0]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <div className="container mx-auto p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-1/4">
            <Card className="bg-slate-800/50 border-slate-600 sticky top-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Documentation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {sections.map((section) => {
                  const Icon = section.icon
                  return (
                    <Button
                      key={section.id}
                      variant={activeSection === section.id ? "default" : "ghost"}
                      className={`w-full justify-start ${
                        activeSection === section.id
                          ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                          : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                      }`}
                      onClick={() => setActiveSection(section.id)}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {section.title}
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </Button>
                  )
                })}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <Card className="bg-slate-800/30 border-slate-600 backdrop-blur-sm">
              <CardContent className="p-8">{currentSection.content}</CardContent>
            </Card>

            {/* Download Section */}
            <Card className="bg-slate-800/50 border-slate-600 mt-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Resources & Downloads
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2 bg-slate-700/30 border-slate-600 hover:bg-slate-600/50"
                  >
                    <FileText className="w-6 h-6 text-cyan-400" />
                    <span className="font-medium">Technical Whitepaper</span>
                    <span className="text-xs text-slate-400">PDF • 2.4 MB</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2 bg-slate-700/30 border-slate-600 hover:bg-slate-600/50"
                  >
                    <Code className="w-6 h-6 text-green-400" />
                    <span className="font-medium">Source Code</span>
                    <span className="text-xs text-slate-400">GitHub Repository</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2 bg-slate-700/30 border-slate-600 hover:bg-slate-600/50"
                  >
                    <Database className="w-6 h-6 text-purple-400" />
                    <span className="font-medium">API Schema</span>
                    <span className="text-xs text-slate-400">OpenAPI 3.0</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
