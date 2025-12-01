"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Globe,
  FileText,
  Calendar,
  Mail,
  Activity,
  Zap,
  BarChart3,
  Settings,
  ExternalLink,
  Menu,
  X,
  Github,
  Linkedin,
  Twitter,
  Monitor,
} from "@/components/ui/icons"

interface NavigationProps {
  currentView: "braid-map" | "strategy" | "dashboard" | "presentation" | "documentation"
  onViewChange: (view: "braid-map" | "strategy" | "dashboard" | "presentation" | "documentation") => void
}

export default function QOTENavigation({ currentView, onViewChange }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [systemStatus, setSystemStatus] = useState({
    uptime: 99.7,
    activeUsers: 247,
    demoRequests: 73,
    lastUpdate: new Date(),
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStatus((prev) => ({
        uptime: Math.max(99.0, Math.min(100, prev.uptime + (Math.random() - 0.5) * 0.1)),
        activeUsers: Math.floor(200 + Math.random() * 100),
        demoRequests: prev.demoRequests + Math.floor(Math.random() * 3),
        lastUpdate: new Date(),
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const navItems = [
    {
      id: "braid-map" as const,
      title: "Braid-Map Visualization",
      description: "Interactive quantum resonance interface",
      icon: Activity,
      color: "from-cyan-500 to-blue-500",
      status: "Live",
    },
    {
      id: "strategy" as const,
      title: "Strategy Dashboard",
      description: "90-day launch roadmap",
      icon: BarChart3,
      color: "from-purple-500 to-pink-500",
      status: "Active",
    },
    {
      id: "dashboard" as const,
      title: "Executive Overview",
      description: "Complete QOTE system status",
      icon: Settings,
      color: "from-emerald-500 to-green-500",
      status: "Ready",
    },
    {
      id: "presentation" as const,
      title: "Executive Presentation",
      description: "Full investor slideshow",
      icon: Monitor,
      color: "from-orange-500 to-red-500",
      status: "Ready",
    },
    {
      id: "documentation" as const,
      title: "Documentation",
      description: "Technical specifications",
      icon: FileText,
      color: "from-blue-500 to-cyan-500",
      status: "Active",
    },
  ]

  const externalLinks = [
    {
      title: "Live Demo",
      url: "braid-map", // Changed from placeholder to internal navigation
      description: "Production deployment",
      icon: Globe,
      color: "text-cyan-400 hover:text-cyan-300",
      category: "demo",
    },
    {
      title: "Documentation",
      url: "documentation", // Already correctly pointing to internal navigation
      description: "Technical specifications",
      icon: FileText,
      color: "text-blue-400 hover:text-blue-300",
      category: "docs",
    },
    {
      title: "Schedule Demo",
      url: "https://calendly.com/qote-resona/demo",
      description: "Book investor meeting",
      icon: Calendar,
      color: "text-green-400 hover:text-green-300",
      category: "contact",
    },
    {
      title: "Contact Team",
      url: "mailto:investors@example.com?subject=QOTE Investment Opportunity",
      description: "Direct investor contact",
      icon: Mail,
      color: "text-purple-400 hover:text-purple-300",
      category: "contact",
    },
  ]

  const socialLinks = [
    {
      title: "GitHub",
      url: "https://github.com/kayser-medical/qote-resona-dashboard",
      icon: Github,
      color: "text-gray-400 hover:text-gray-300",
    },
    {
      title: "LinkedIn",
      url: "https://www.linkedin.com/company/qote-resona",
      icon: Linkedin,
      color: "text-blue-400 hover:text-blue-300",
    },
    {
      title: "Twitter",
      url: "https://twitter.com/qote_resona",
      icon: Twitter,
      color: "text-sky-400 hover:text-sky-300",
    },
  ]

  const handleExternalLink = (url: string, trackingLabel?: string) => {
    if (url === "documentation") {
      onViewChange("documentation")
      return
    }

    if (url === "braid-map") {
      onViewChange("braid-map")
      return
    }

    if (typeof window !== "undefined" && (window as any).gtag) {
      ;(window as any).gtag("event", "click", {
        event_category: "navigation_link",
        event_label: trackingLabel || url,
        value: 1,
      })
    }

    if (url.startsWith("http") || url.startsWith("mailto:")) {
      window.open(url, "_blank", "noopener,noreferrer")
    }
  }

  return (
    <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 text-white relative">
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="text-center flex-1">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                QOTE-Resona v0
              </h1>
            </div>
            <p className="text-slate-300">The first quantum resonance interface for AI coherence measurement</p>
          </div>

          <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        <div className="mb-8 p-4 bg-slate-800/40 rounded-lg border border-slate-600/50 backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span>System Online</span>
                <Badge variant="outline" className="text-xs border-emerald-500/50 text-emerald-400">
                  {systemStatus.uptime.toFixed(1)}%
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span>Active Users: {systemStatus.activeUsers}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                <span>Demo Requests: {systemStatus.demoRequests}</span>
              </div>
            </div>
            <div className="text-slate-400 text-xs">Last updated: {systemStatus.lastUpdate.toLocaleTimeString()}</div>
          </div>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 ${isMenuOpen ? "block" : "hidden md:grid"}`}>
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Card
                key={item.id}
                className={`cursor-pointer transition-all duration-300 border-2 ${
                  currentView === item.id
                    ? "border-white bg-white/10 scale-105 shadow-lg shadow-blue-500/20"
                    : "border-slate-600 bg-slate-800/50 hover:bg-slate-700/50 hover:border-slate-500"
                }`}
                onClick={() => {
                  onViewChange(item.id)
                  setIsMenuOpen(false)
                }}
              >
                <CardContent className="p-6 text-center relative">
                  <div className="absolute top-3 right-3">
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        item.status === "Live"
                          ? "border-emerald-500/50 text-emerald-400"
                          : item.status === "Active"
                            ? "border-blue-500/50 text-blue-400"
                            : "border-purple-500/50 text-purple-400"
                      }`}
                    >
                      {item.status}
                    </Badge>
                  </div>
                  <div
                    className={`w-12 h-12 mx-auto mb-3 rounded-lg bg-gradient-to-r ${item.color} flex items-center justify-center`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-400">{item.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className={`space-y-6 ${isMenuOpen ? "block" : "hidden md:block"}`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {externalLinks.map((link) => {
              const Icon = link.icon
              return (
                <Button
                  key={link.title}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2 bg-slate-800/30 border-slate-600 hover:bg-slate-700/50 transition-all duration-200"
                  onClick={() =>
                    handleExternalLink(link.url, `nav_${link.category}_${link.title.toLowerCase().replace(" ", "_")}`)
                  }
                >
                  <Icon className={`w-5 h-5 ${link.color}`} />
                  <span className="font-medium">{link.title}</span>
                  <span className="text-xs text-slate-400">{link.description}</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </Button>
              )
            })}
          </div>

          <div className="flex items-center justify-center gap-4 pt-4 border-t border-slate-700/50">
            <span className="text-sm text-slate-400">Follow QOTE:</span>
            {socialLinks.map((social) => {
              const Icon = social.icon
              return (
                <Button
                  key={social.title}
                  variant="ghost"
                  size="sm"
                  className={`${social.color} hover:bg-slate-700/30`}
                  onClick={() => handleExternalLink(social.url, `social_${social.title.toLowerCase()}`)}
                >
                  <Icon className="w-4 h-4" />
                </Button>
              )
            })}
          </div>
        </div>

        <div className="mt-8 p-4 bg-slate-800/30 rounded-lg border border-slate-700">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span>Production Ready</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span>Demo Deployed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                <span>Investor Pipeline Active</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                <span>Patent Pending</span>
              </div>
            </div>
            <div className="text-slate-400 text-center md:text-right">
              <div>QOTE-Resona v0.1.0 • Build {Date.now().toString().slice(-6)}</div>
              <div className="text-xs">© 2024 Kayser Medical • All Rights Reserved</div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button
            size="sm"
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 shadow-lg"
            onClick={() => handleExternalLink("braid-map", "demo_button")}
          >
            <Globe className="w-4 h-4 mr-1" />
            Live Demo
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="bg-slate-800/80 border-slate-600 hover:bg-slate-700/80 backdrop-blur-sm shadow-lg"
            onClick={() => handleExternalLink("https://calendly.com/qote-resona/demo", "schedule_button")}
          >
            <Calendar className="w-4 h-4 mr-1" />
            Schedule
          </Button>
        </div>
      </div>
    </div>
  )
}
