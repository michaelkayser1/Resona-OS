"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Target,
  TrendingUp,
  DollarSign,
  Rocket,
  CheckCircle,
  Circle,
  ArrowRight,
  Zap,
  Building,
  Presentation,
  ExternalLink,
  FileText,
  Calendar,
  Mail,
  Globe,
  Users,
  BarChart,
} from "@/components/ui/icons"

const phases = [
  {
    id: 1,
    title: "Demo Readiness",
    subtitle: "Make it undeniably real",
    days: "Days 1-30",
    color: "from-blue-500 to-cyan-500",
    icon: Presentation,
    objectives: [
      "Deploy live braid-map demo at qote-demo.kayser-medical.com",
      "Create 30-second elevator pitch with live visualization",
      "Mobile-optimized version for tablet presentations",
      "Complete content arsenal (video, one-pager, social assets)",
    ],
    metrics: [
      { label: "Demo Visitors", target: "1,000+", current: 0 },
      { label: "Video Completion", target: "60%+", current: 0 },
      { label: "Meeting Bookings", target: "50+", current: 0 },
      { label: "Social Impressions", target: "10K+", current: 0 },
    ],
  },
  {
    id: 2,
    title: "Investor Magnetism",
    subtitle: "Make it inevitable",
    days: "Days 31-60",
    color: "from-purple-500 to-pink-500",
    icon: TrendingUp,
    objectives: [
      "Transform pitch from 'idea' to 'future running'",
      "50 qualified investor conversations in 14 days",
      "Target healthcare AI VCs and enterprise specialists",
      "Lead with live braid-map demonstrations",
    ],
    metrics: [
      { label: "Investor Meetings", target: "50", current: 0 },
      { label: "Term Sheets", target: "3+", current: 0 },
      { label: "Demo Conversion", target: "25%+", current: 0 },
      { label: "Follow-up Rate", target: "80%+", current: 0 },
    ],
  },
  {
    id: 3,
    title: "Licensing Pilot",
    subtitle: "Make it profitable",
    days: "Days 61-90",
    color: "from-green-500 to-emerald-500",
    icon: Building,
    objectives: [
      "3 paying pilot customers generating $150K ARR",
      "Healthcare AI integration (Epic, Mayo, Kaiser)",
      "Enterprise expansion beyond healthcare",
      "Prove scalable licensing model",
    ],
    metrics: [
      { label: "Pilot Customers", target: "3+", current: 0 },
      { label: "ARR Generated", target: "$150K+", current: 0 },
      { label: "Customer Satisfaction", target: "4.5/5", current: 0 },
      { label: "Enterprise Pipeline", target: "10+", current: 0 },
    ],
  },
]

const revenueProjections = [
  { month: "1-3", customers: 3, type: "Healthcare Pilots", revenue: 75000 },
  { month: "4-6", customers: 5, type: "Enterprise Pilots", revenue: 125000 },
  { month: "7-9", customers: 6, type: "Platform Deal", revenue: 225000 },
  { month: "10-12", customers: 10, type: "Scale", revenue: 500000 },
]

export default function QOTEStrategyDashboard() {
  const [activePhase, setActivePhase] = useState(1)
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set())

  const toggleTask = (taskId: string) => {
    const newCompleted = new Set(completedTasks)
    if (newCompleted.has(taskId)) {
      newCompleted.delete(taskId)
    } else {
      newCompleted.add(taskId)
    }
    setCompletedTasks(newCompleted)
  }

  const handleExternalLink = (url: string, trackingEvent?: string) => {
    // Track the click event for analytics
    if (trackingEvent && typeof window !== "undefined" && (window as any).gtag) {
      ;(window as any).gtag("event", "click", {
        event_category: "external_link",
        event_label: trackingEvent,
        value: 1,
      })
    }

    window.open(url, "_blank", "noopener,noreferrer")
  }

  const externalLinks = {
    demo: "https://qote-demo.kayser-medical.com",
    demoStaging: "https://qote-staging.vercel.app",
    documentation: "https://docs.qote.kayser-medical.com",
    technicalSpecs: "https://docs.qote.kayser-medical.com/technical-overview",
    investorDeck: "https://pitch.qote.kayser-medical.com",
    patentPortal: "https://ip.qote.kayser-medical.com",
    landingPage: "https://qote.kayser-medical.com",
    pricing: "https://qote.kayser-medical.com/pricing",

    // Contact and scheduling
    scheduleDemo: "https://calendly.com/qote-resona/demo",
    scheduleInvestor: "https://calendly.com/qote-resona/investor-meeting",
    contactInvestors:
      "mailto:investors@kayser-medical.com?subject=QOTE Investment Opportunity&body=I'm interested in learning more about the QOTE-Resona investment opportunity. Please send me the investor deck and schedule a demo.",
    contactSales: "mailto:sales@kayser-medical.com?subject=QOTE Pilot Program Inquiry",
    contactSupport: "mailto:support@kayser-medical.com?subject=QOTE Technical Support",

    // Social and media
    linkedin: "https://www.linkedin.com/company/qote-resona",
    twitter: "https://twitter.com/qote_resona",
    github: "https://github.com/kayser-medical/qote-resona-dashboard",

    // Healthcare partnerships
    mayoClinic: "https://www.mayoclinic.org/about-mayo-clinic/research/centers-programs/artificial-intelligence",
    epicSystems: "https://www.epic.com/about/",
    kaiserPermanente:
      "https://about.kaiserpermanente.org/our-story/health-research/our-scientists/artificial-intelligence",
  }

  const currentPhase = phases.find((p) => p.id === activePhase)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">QOTE Launch Strategy</h1>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Transform QOTE from visual prototype to market-deployed coherence operating system in 90 days
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              First-mover advantage in AI coherence measurement
            </span>
            <span className="flex items-center gap-2">
              <Rocket className="w-4 h-4" />
              $2.1M Series A target
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mt-6 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleExternalLink(externalLinks.demo, "header_demo_click")}
              className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10"
            >
              <Globe className="w-4 h-4 mr-1" />
              Live Demo
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleExternalLink(externalLinks.documentation, "header_docs_click")}
              className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
            >
              <FileText className="w-4 h-4 mr-1" />
              Docs
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleExternalLink(externalLinks.scheduleDemo, "header_schedule_click")}
              className="text-green-400 hover:text-green-300 hover:bg-green-400/10"
            >
              <Calendar className="w-4 h-4 mr-1" />
              Schedule
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleExternalLink(externalLinks.investorDeck, "header_pitch_click")}
              className="text-purple-400 hover:text-purple-300 hover:bg-purple-400/10"
            >
              <BarChart className="w-4 h-4 mr-1" />
              Pitch Deck
            </Button>
          </div>
        </div>

        {/* Phase Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {phases.map((phase) => {
            const Icon = phase.icon
            return (
              <Card
                key={phase.id}
                className={`cursor-pointer transition-all duration-300 border-2 ${
                  activePhase === phase.id
                    ? "border-white bg-white/10 scale-105"
                    : "border-gray-600 bg-gray-800/50 hover:bg-gray-800/70"
                }`}
                onClick={() => setActivePhase(phase.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg bg-gradient-to-r ${phase.color} flex items-center justify-center`}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-lg">{phase.title}</CardTitle>
                      <p className="text-gray-400 text-sm">{phase.days}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 text-sm italic">"{phase.subtitle}"</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Active Phase Details */}
        {currentPhase && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Objectives */}
            <Card className="bg-gray-800/50 border-gray-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Phase {currentPhase.id} Objectives
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentPhase.objectives.map((objective, index) => {
                  const taskId = `${currentPhase.id}-${index}`
                  const isCompleted = completedTasks.has(taskId)

                  const getObjectiveLinks = (text: string) => {
                    const links = []
                    if (text.includes("qote-demo.kayser-medical.com")) {
                      links.push({ url: externalLinks.demo, label: "Visit Demo", icon: Globe })
                    }
                    if (text.includes("elevator pitch")) {
                      links.push({ url: externalLinks.investorDeck, label: "View Pitch", icon: Presentation })
                    }
                    if (text.includes("investor conversations")) {
                      links.push({ url: externalLinks.scheduleInvestor, label: "Schedule", icon: Calendar })
                    }
                    if (text.includes("healthcare AI") || text.includes("Mayo") || text.includes("Epic")) {
                      links.push({ url: externalLinks.contactSales, label: "Contact Sales", icon: Mail })
                    }
                    if (text.includes("pilot customers")) {
                      links.push({ url: externalLinks.pricing, label: "View Pricing", icon: DollarSign })
                    }
                    return links
                  }

                  const objectiveLinks = getObjectiveLinks(objective)

                  return (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="cursor-pointer" onClick={() => toggleTask(taskId)}>
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex-1">
                        <span className={`text-sm ${isCompleted ? "text-green-300 line-through" : "text-gray-300"}`}>
                          {objective}
                        </span>
                        {objectiveLinks.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {objectiveLinks.map((link, linkIndex) => {
                              const LinkIcon = link.icon
                              return (
                                <button
                                  key={linkIndex}
                                  onClick={() =>
                                    handleExternalLink(link.url, `objective_${currentPhase.id}_${index}_${linkIndex}`)
                                  }
                                  className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-gray-600/50 text-cyan-400 hover:text-cyan-300 hover:bg-gray-600/70 transition-colors"
                                >
                                  <LinkIcon className="w-3 h-3" />
                                  {link.label}
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Success Metrics */}
            <Card className="bg-gray-800/50 border-gray-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Success Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentPhase.metrics.map((metric, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 text-sm">{metric.label}</span>
                      <Badge variant="outline" className="text-gray-300 border-gray-500">
                        Target: {metric.target}
                      </Badge>
                    </div>
                    <Progress value={metric.current} className="h-2 bg-gray-700" />
                  </div>
                ))}

                <div className="pt-4 border-t border-gray-600">
                  <div className="flex flex-wrap gap-2">
                    {currentPhase.id === 1 && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleExternalLink(externalLinks.demo, `phase1_demo_metrics`)}
                          className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Track Demo
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleExternalLink(externalLinks.github, `phase1_github_metrics`)}
                          className="border-gray-500/50 text-gray-400 hover:bg-gray-500/10"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          GitHub
                        </Button>
                      </>
                    )}
                    {currentPhase.id === 2 && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleExternalLink(externalLinks.scheduleInvestor, `phase2_investor_metrics`)}
                          className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                        >
                          <Calendar className="w-3 h-3 mr-1" />
                          Book Meetings
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleExternalLink(externalLinks.linkedin, `phase2_linkedin_metrics`)}
                          className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                        >
                          <Users className="w-3 h-3 mr-1" />
                          LinkedIn
                        </Button>
                      </>
                    )}
                    {currentPhase.id === 3 && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleExternalLink(externalLinks.contactSales, `phase3_sales_metrics`)}
                          className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                        >
                          <Mail className="w-3 h-3 mr-1" />
                          Contact Sales
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleExternalLink(externalLinks.pricing, `phase3_pricing_metrics`)}
                          className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                        >
                          <DollarSign className="w-3 h-3 mr-1" />
                          Pricing
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Revenue Projections */}
        <Card className="bg-gray-800/50 border-gray-600">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Revenue Projections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {revenueProjections.map((projection, index) => (
                <div key={index} className="text-center p-4 rounded-lg bg-gray-700/30">
                  <div className="text-2xl font-bold text-white mb-1">${(projection.revenue / 1000).toFixed(0)}K</div>
                  <div className="text-sm text-gray-400 mb-2">Month {projection.month}</div>
                  <div className="text-xs text-gray-500">{projection.customers} customers</div>
                  <div className="text-xs text-gray-500">{projection.type}</div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <div className="text-3xl font-bold text-green-400">$500K ARR</div>
              <div className="text-sm text-gray-400">Target by Month 12</div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleExternalLink(externalLinks.investorDeck, "revenue_projections_deck")}
                className="mt-2 text-green-400 hover:text-green-300"
              >
                <BarChart className="w-3 h-3 mr-1" />
                View Full Projections
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Strategic Advantages */}
        <Card className="bg-gradient-to-r from-purple-900/50 to-cyan-900/50 border-purple-500/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5" />
              The Unfair Advantage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-white">While Competitors Build Chatbots...</h4>
                <p className="text-gray-300 text-sm">
                  You're building <strong>the coherence layer for all AI</strong>. The braid-map isn't just a
                  visualization—it's the GUI for quantum AI measurement.
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleExternalLink(externalLinks.technicalSpecs, "advantage_technical_specs")}
                  className="text-cyan-400 hover:text-cyan-300"
                >
                  <FileText className="w-3 h-3 mr-1" />
                  Technical Specs
                </Button>
              </div>
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-white">First-Mover Monopoly</h4>
                <p className="text-gray-300 text-sm">
                  Every healthcare system, enterprise, and AI platform will eventually need coherence measurement.{" "}
                  <strong>QOTE + visual interface = inevitable market dominance</strong>.
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleExternalLink(externalLinks.patentPortal, "advantage_patent_portal")}
                  className="text-purple-400 hover:text-purple-300"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Patent Portfolio
                </Button>
              </div>
            </div>
            <div className="mt-6 p-4 rounded-lg bg-white/10 border border-white/20">
              <p className="text-center text-white font-medium">"The braid-map makes QOTE inevitable." ✨🚀</p>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center space-y-4">
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <Button
              variant="outline"
              onClick={() => handleExternalLink(externalLinks.demo, "cta_demo")}
              className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Live Demo
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExternalLink(externalLinks.contactInvestors, "cta_investors")}
              className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
            >
              <Mail className="w-4 h-4 mr-2" />
              Contact Investors
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExternalLink(externalLinks.scheduleDemo, "cta_schedule")}
              className="border-green-500 text-green-400 hover:bg-green-500/10"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Demo
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExternalLink(externalLinks.documentation, "cta_docs")}
              className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
            >
              <FileText className="w-4 h-4 mr-2" />
              Documentation
            </Button>
          </div>

          <Button
            size="lg"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" })
              setActivePhase(1)
            }}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white px-8 py-3"
          >
            <Rocket className="w-5 h-5 mr-2" />
            Deploy Coherence Revolution
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
