"use client"

import { useState } from "react"
import { Download, Eye, Archive, FileText, Zap, GitBranch, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

const QOTEFigures = () => {
  const [selectedFigure, setSelectedFigure] = useState(null)

  const figures = [
    {
      id: "figure1",
      title: "Figure 1: Oscillatory Neural Architecture",
      description:
        "Core QOTE framework showing oscillatory embeddings, Kuramoto synchronization, and phase-coherent attention mechanisms",
      svg: `<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="oscillGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea"/>
            <stop offset="100%" style="stop-color:#764ba2"/>
          </linearGradient>
          <linearGradient id="phaseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#f093fb"/>
            <stop offset="50%" style="stop-color:#f5576c"/>
            <stop offset="100%" style="stop-color:#4facfe"/>
          </linearGradient>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#64748b"/>
          </marker>
        </defs>

         Background 
        <rect width="800" height="600" fill="#f8fafc"/>
        
         Title 
        <text x="400" y="30" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="bold" fill="#1e293b">
          QOTE: Oscillatory Neural Framework
        </text>
        
         Oscillatory Embedding Layer 
        <g transform="translate(50, 80)">
          <rect width="700" height="120" rx="10" fill="url(#oscillGrad)" opacity="0.1" stroke="#667eea" strokeWidth="2"/>
          <text x="20" y="25" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="bold" fill="#1e293b">
            Oscillatory Embedding Layer
          </text>
          
           Oscillatory nodes 
          <g transform="translate(50, 40)">
            <circle cx="0" cy="0" r="15" fill="#667eea" opacity="0.8"/>
            <text x="0" y="5" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="10" fill="white">θ₁</text>
            <path d="M 20 0 Q 35 -10 50 0 Q 65 10 80 0" stroke="#667eea" strokeWidth="2" fill="none"/>
          </g>
          
          <g transform="translate(200, 40)">
            <circle cx="0" cy="0" r="15" fill="#667eea" opacity="0.8"/>
            <text x="0" y="5" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="10" fill="white">θ₂</text>
            <path d="M 20 0 Q 35 -15 50 0 Q 65 15 80 0" stroke="#667eea" strokeWidth="2" fill="none"/>
          </g>
          
          <g transform="translate(350, 40)">
            <circle cx="0" cy="0" r="15" fill="#667eea" opacity="0.8"/>
            <text x="0" y="5" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="10" fill="white">θ₃</text>
            <path d="M 20 0 Q 35 -5 50 0 Q 65 5 80 0" stroke="#667eea" strokeWidth="2" fill="none"/>
          </g>
          
          <text x="500" y="50" fontFamily="Arial, sans-serif" fontSize="12" fill="#64748b">
            φᵢ(t) = Aᵢ cos(ωᵢt + θᵢ)
          </text>
        </g>
        
         Kuramoto Synchronization 
        <g transform="translate(50, 220)">
          <rect width="700" height="100" rx="10" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1"/>
          <text x="20" y="25" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="bold" fill="#1e293b">
            Kuramoto Synchronization
          </text>
          
           Sync equation 
          <text x="50" y="55" fontFamily="Arial, sans-serif" fontSize="13" fill="#475569">
            dθᵢ/dt = ωᵢ + (K/N) Σⱼ sin(θⱼ - θᵢ)
          </text>
          
           Coupling strength visualization 
          <g transform="translate(400, 40)">
            <rect width="200" height="40" rx="5" fill="url(#phaseGrad)" opacity="0.3"/>
            <text x="100" y="25" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="11" fill="#1e293b">
              Coupling Strength K
            </text>
          </g>
        </g>
        
         CUST Gate 
        <g transform="translate(50, 340)">
          <rect width="320" height="100" rx="10" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2"/>
          <text x="20" y="25" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="bold" fill="#92400e">
            CUST Gate (φ ≈ 0.618)
          </text>
          
          <text x="30" y="50" fontFamily="Arial, sans-serif" fontSize="12" fill="#78350f">
            R ≥ φ → Gate Open
          </text>
          <text x="30" y="70" fontFamily="Arial, sans-serif" fontSize="12" fill="#78350f">
            R &lt; φ → TRIZ Recovery
          </text>
          
           Golden ratio symbol 
          <circle cx="280" cy="60" r="25" fill="#f59e0b" opacity="0.2"/>
          <text x="280" y="67" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="bold" fill="#92400e">
            φ
          </text>
        </g>
        
         Resonance Map 
        <g transform="translate(400, 340)">
          <rect width="350" height="100" rx="10" fill="#ecfdf5" stroke="#10b981" strokeWidth="2"/>
          <text x="20" y="25" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="bold" fill="#065f46">
            Resonance Map (W)
          </text>
          
          <text x="30" y="50" fontFamily="Arial, sans-serif" fontSize="11" fill="#047857">
            W[context,agent] = coherence strength
          </text>
          <text x="30" y="70" fontFamily="Arial, sans-serif" fontSize="11" fill="#047857">
            Dynamic adaptation via Δθ control
          </text>
        </g>
        
         Phase Coherent Attention 
        <g transform="translate(50, 460)">
          <rect width="700" height="80" rx="10" fill="#fdf4ff" stroke="#a855f7" strokeWidth="2"/>
          <text x="20" y="25" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="bold" fill="#7c2d92">
            Phase-Coherent Attention
          </text>
          
          <text x="50" y="50" fontFamily="Arial, sans-serif" fontSize="12" fill="#86198f">
            A[i,j] = λ · cos(θᵢ - θⱼ - Δθ) · softmax(QKᵀ/√d)
          </text>
        </g>
        
         Connecting arrows 
        <path d="M 400 200 L 400 220" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead)"/>
        <path d="M 400 320 L 400 340" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead)"/>
        <path d="M 400 440 L 400 460" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead)"/>
      </svg>`,
      category: "architecture",
    },
    {
      id: "figure2",
      title: "Figure 2: Kuramoto Synchronization Dynamics",
      description:
        "Phase oscillator network showing synchronization emergence, critical coupling, and order parameter evolution",
      svg: `<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="syncGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#ef4444"/>
            <stop offset="50%" style="stop-color:#f59e0b"/>
            <stop offset="100%" style="stop-color:#10b981"/>
          </linearGradient>
        </defs>
        
        <rect width="800" height="600" fill="#f8fafc"/>
        
        <text x="400" y="30" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="bold" fill="#1e293b">
          Kuramoto Synchronization Dynamics
        </text>
        
         Phase circle 
        <g transform="translate(150, 200)">
          <circle cx="0" cy="0" r="80" fill="none" stroke="#e2e8f0" strokeWidth="2"/>
          <text x="0" y="-100" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="bold" fill="#1e293b">
            Phase Space
          </text>
          
           Oscillators as rotating vectors 
          <g transform="rotate(30)">
            <line x1="0" y1="0" x2="60" y2="0" stroke="#ef4444" strokeWidth="3"/>
            <circle cx="60" cy="0" r="4" fill="#ef4444"/>
            <text x="70" y="5" fontFamily="Arial, sans-serif" fontSize="10" fill="#ef4444">θ₁</text>
          </g>
          
          <g transform="rotate(85)">
            <line x1="0" y1="0" x2="60" y2="0" stroke="#f59e0b" strokeWidth="3"/>
            <circle cx="60" cy="0" r="4" fill="#f59e0b"/>
            <text x="70" y="5" fontFamily="Arial, sans-serif" fontSize="10" fill="#f59e0b">θ₂</text>
          </g>
          
          <g transform="rotate(45)">
            <line x1="0" y1="0" x2="60" y2="0" stroke="#10b981" strokeWidth="3"/>
            <circle cx="60" cy="0" r="4" fill="#10b981"/>
            <text x="70" y="5" fontFamily="Arial, sans-serif" fontSize="10" fill="#10b981">θ₃</text>
          </g>
        </g>
        
         Coupling strength plot 
        <g transform="translate(350, 120)">
          <rect width="400" height="200" fill="white" stroke="#e2e8f0" strokeWidth="1"/>
          <text x="200" y="-10" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="12" fontWeight="bold" fill="#1e293b">
            Order Parameter R vs Coupling K
          </text>
          
           Axes 
          <line x1="40" y1="160" x2="360" y2="160" stroke="#64748b" strokeWidth="1"/>
          <line x1="40" y1="20" x2="40" y2="160" stroke="#64748b" strokeWidth="1"/>
          
           Labels 
          <text x="200" y="185" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="10" fill="#64748b">
            Coupling Strength (K)
          </text>
          <text x="15" y="90" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="10" fill="#64748b" transform="rotate(-90, 15, 90)">
            Order Parameter (R)
          </text>
          
           Critical transition curve 
          <path d="M 40 160 Q 120 160 200 80 Q 280 40 360 30" stroke="url(#syncGrad)" strokeWidth="3" fill="none"/>
          
           Critical point 
          <circle cx="200" cy="80" r="5" fill="#f59e0b"/>
          <text x="210" y="75" fontFamily="Arial, sans-serif" fontSize="10" fill="#f59e0b">Kc</text>
          
           Sync regions 
          <text x="100" y="140" fontFamily="Arial, sans-serif" fontSize="10" fill="#ef4444">Incoherent</text>
          <text x="280" y="50" fontFamily="Arial, sans-serif" fontSize="10" fill="#10b981">Synchronized</text>
        </g>
        
         Equation panel 
        <g transform="translate(50, 380)">
          <rect width="700" height="150" rx="10" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1"/>
          <text x="20" y="25" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="bold" fill="#1e293b">
            Kuramoto Model Equations
          </text>
          
          <text x="50" y="55" fontFamily="Arial, sans-serif" fontSize="13" fill="#475569">
            dθᵢ/dt = ωᵢ + (K/N) Σⱼ sin(θⱼ - θᵢ)
          </text>
          
          <text x="50" y="85" fontFamily="Arial, sans-serif" fontSize="13" fill="#475569">
            R = |⟨e^(iθⱼ)⟩| = |(1/N) Σⱼ e^(iθⱼ)|
          </text>
          
          <text x="50" y="115" fontFamily="Arial, sans-serif" fontSize="11" fill="#64748b">
            where R ∈ [0,1] measures synchronization strength
          </text>
        </g>
      </svg>`,
      category: "dynamics",
    },
    {
      id: "figure3",
      title: "Figure 3: CUST Gating & Golden Ratio Threshold",
      description:
        "Coherence Under Synchronization Threshold (CUST) mechanism with φ ≈ 0.618 critical point and TRIZ recovery pathways",
      svg: `<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="custGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#ef4444"/>
            <stop offset="61.8%" style="stop-color:#f59e0b"/>
            <stop offset="100%" style="stop-color:#10b981"/>
          </linearGradient>
          <radialGradient id="goldenGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style="stop-color:#fbbf24"/>
            <stop offset="100%" style="stop-color:#f59e0b"/>
          </radialGradient>
        </defs>
        
        <rect width="800" height="600" fill="#f8fafc"/>
        
        <text x="400" y="30" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="bold" fill="#1e293b">
          CUST Gating: Golden Ratio Threshold
        </text>
        
         Main coherence meter 
        <g transform="translate(100, 80)">
          <rect width="600" height="60" rx="30" fill="url(#custGrad)" opacity="0.3"/>
          <rect width="600" height="60" rx="30" fill="none" stroke="#94a3b8" strokeWidth="2"/>
          
           Golden ratio line 
          <line x1="370.8" y1="0" x2="370.8" y2="60" stroke="#f59e0b" strokeWidth="4"/>
          <text x="370.8" y="-10" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="12" fontWeight="bold" fill="#f59e0b">
            φ ≈ 0.618
          </text>
          
           Current R indicator 
          <circle cx="450" cy="30" r="8" fill="#10b981"/>
          <text x="450" y="55" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="10" fill="#10b981">R</text>
          
           Labels 
          <text x="50" y="-15" fontFamily="Arial, sans-serif" fontSize="11" fill="#ef4444">Chaos</text>
          <text x="550" y="-15" fontFamily="Arial, sans-serif" fontSize="11" fill="#10b981">Coherence</text>
        </g>
        
         Gate states 
        <g transform="translate(50, 180)">
           Closed gate (R < φ) 
          <g transform="translate(0, 0)">
            <rect width="300" height="120" rx="10" fill="#fef2f2" stroke="#ef4444" strokeWidth="2"/>
            <text x="20" y="25" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="bold" fill="#dc2626">
              Gate CLOSED (R &lt; φ)
            </text>
            
            <rect x="130" y="40" width="40" height="60" fill="#ef4444" opacity="0.8"/>
            <text x="150" y="75" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="10" fill="white">BLOCK</text>
            
            <text x="20" y="110" fontFamily="Arial, sans-serif" fontSize="11" fill="#991b1b">
              → Trigger TRIZ Recovery
            </text>
          </g>
          
           Open gate (R ≥ φ) 
          <g transform="translate(350, 0)">
            <rect width="300" height="120" rx="10" fill="#f0fdf4" stroke="#10b981" strokeWidth="2"/>
            <text x="20" y="25" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="bold" fill="#059669">
              Gate OPEN (R ≥ φ)
            </text>
            
            <path d="M 130 40 L 170 40 L 170 100 L 130 100 Z" fill="none" stroke="#10b981" strokeWidth="3"/>
            <path d="M 135 70 L 165 70" stroke="#10b981" strokeWidth="2"/>
            
            <text x="20" y="110" fontFamily="Arial, sans-serif" fontSize="11" fill="#166534">
              → Allow Response Generation
            </text>
          </g>
        </g>
        
         TRIZ Recovery Panel 
        <g transform="translate(50, 330)">
          <rect width="700" height="180" rx="10" fill="#fefce8" stroke="#eab308" strokeWidth="2"/>
          <text x="20" y="25" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="bold" fill="#a16207">
            TRIZ Recovery Principles (When R &lt; φ)
          </text>
          
           TRIZ principles grid 
          <g transform="translate(40, 50)">
            <rect width="150" height="40" rx="5" fill="#fbbf24" opacity="0.3" stroke="#f59e0b" strokeWidth="1"/>
            <text x="75" y="15" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="10" fontWeight="bold" fill="#92400e">
              Dynamics
            </text>
            <text x="75" y="28" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="9" fill="#a16207">
              Shift operational mode
            </text>
          </g>
          
          <g transform="translate(210, 50)">
            <rect width="150" height="40" rx="5" fill="#fbbf24" opacity="0.3" stroke="#f59e0b" strokeWidth="1"/>
            <text x="75" y="15" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="10" fontWeight="bold" fill="#92400e">
              Feedback
            </text>
            <text x="75" y="28" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="9" fill="#a16207">
              Introduce correction loop
            </text>
          </g>
          
          <g transform="translate(380, 50)">
            <rect width="150" height="40" rx="5" fill="#fbbf24" opacity="0.3" stroke="#f59e0b" strokeWidth="1"/>
            <text x="75" y="15" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="10" fontWeight="bold" fill="#92400e">
              Phase Transition
            </text>
            <text x="75" y="28" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="9" fill="#a16207">
              Change system state
            </text>
          </g>
          
          <g transform="translate(550, 50)">
            <rect width="120" height="40" rx="5" fill="#fbbf24" opacity="0.3" stroke="#f59e0b" strokeWidth="1"/>
            <text x="60" y="15" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="10" fontWeight="bold" fill="#92400e">
              Asymmetry
            </text>
            <text x="60" y="28" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="9" fill="#a16207">
              Break symmetry
            </text>
          </g>
          
           Recovery flow 
          <text x="40" y="120" fontFamily="Arial, sans-serif" fontSize="12" fill="#a16207">
            Recovery Flow: Detect R &lt; φ → Select TRIZ → Adjust Δθ → Re-evaluate R
          </text>
          
           Golden ratio highlight 
          <g transform="translate(300, 140)">
            <circle cx="0" cy="0" r="20" fill="url(#goldenGrad)"/>
            <text x="0" y="6" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="bold" fill="white">
              φ
            </text>
            <text x="30" y="6" fontFamily="Arial, sans-serif" fontSize="11" fill="#a16207">
              = (1 + √5) / 2 ≈ 1.618 → φ⁻¹ ≈ 0.618
            </text>
          </g>
        </g>
      </svg>`,
      category: "gating",
    },
  ]

  // Download functions
  const downloadSVG = (figure) => {
    const blob = new Blob([figure.svg], { type: "image/svg+xml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${figure.id}.svg`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadPNG = async (figure) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    canvas.width = 1600 // 2x for crisp export
    canvas.height = 1200

    const svgBlob = new Blob([figure.svg], { type: "image/svg+xml" })
    const url = URL.createObjectURL(svgBlob)

    img.onload = () => {
      ctx.drawImage(img, 0, 0, 1600, 1200)
      canvas.toBlob((blob) => {
        const pngUrl = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = pngUrl
        a.download = `${figure.id}.png`
        a.click()
        URL.revokeObjectURL(pngUrl)
      })
      URL.revokeObjectURL(url)
    }

    img.src = url
  }

  const downloadAllAsZip = async () => {
    // Note: In production, you'd use JSZip library
    // For demo, we'll trigger individual downloads
    for (const figure of figures) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      downloadSVG(figure)
    }
  }

  const CategoryIcon = ({ category }) => {
    switch (category) {
      case "architecture":
        return <GitBranch className="w-5 h-5" />
      case "dynamics":
        return <Zap className="w-5 h-5" />
      case "gating":
        return <FileText className="w-5 h-5" />
      case "control":
        return <Users className="w-5 h-5" />
      default:
        return <FileText className="w-5 h-5" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">QOTE Patent Figures</h1>
          <p className="text-lg text-slate-600 mb-4">Technical diagrams for "The Lens of QOTE" provisional patent</p>
          <p className="text-sm text-slate-500">
            High-quality SVG exports for filings, presentations, and documentation
          </p>
        </div>

        {/* Download All Button */}
        <div className="flex justify-center mb-8">
          <Button
            onClick={downloadAllAsZip}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
          >
            <Archive className="w-5 h-5" />
            Download All Figures
          </Button>
        </div>

        {/* Figures Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {figures.map((figure) => (
            <div key={figure.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
              {/* Figure Preview */}
              <div className="aspect-[4/3] bg-slate-50 p-4 border-b">
                <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: figure.svg }} />
              </div>

              {/* Figure Info */}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <CategoryIcon category={figure.category} />
                  <h3 className="text-xl font-semibold text-slate-800">{figure.title}</h3>
                </div>

                <p className="text-slate-600 mb-4 leading-relaxed">{figure.description}</p>

                {/* Action buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => setSelectedFigure(figure)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Full
                  </Button>

                  <Button
                    onClick={() => downloadSVG(figure)}
                    variant="outline"
                    className="flex items-center gap-2 text-blue-700 border-blue-200 hover:bg-blue-50"
                  >
                    <Download className="w-4 h-4" />
                    SVG
                  </Button>

                  <Button
                    onClick={() => downloadPNG(figure)}
                    variant="outline"
                    className="flex items-center gap-2 text-green-700 border-green-200 hover:bg-green-50"
                  >
                    <Download className="w-4 h-4" />
                    PNG
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Patent Information */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Patent Information</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">Filing Details</h3>
              <ul className="space-y-1 text-slate-600">
                <li>
                  <strong>Title:</strong> The Lens of QOTE: Oscillatory Neural Framework
                </li>
                <li>
                  <strong>Type:</strong> Provisional Patent Application
                </li>
                <li>
                  <strong>Filed:</strong> August 27, 2025
                </li>
                <li>
                  <strong>Inventor:</strong> Dr. Michael A. Kayser, DO, FACMG
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">Key Claims</h3>
              <ul className="space-y-1 text-slate-600 text-sm">
                <li>• Oscillatory embedding representations</li>
                <li>• Kuramoto synchronization for neural networks</li>
                <li>• Phase-coherent attention mechanisms</li>
                <li>• Relational Δθ control systems</li>
                <li>• CUST gating with golden ratio threshold</li>
                <li>• Resonance mapping for context adaptation</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Full View Modal */}
        {selectedFigure && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-6xl max-h-[90vh] overflow-auto">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-slate-800">{selectedFigure.title}</h3>
                  <button
                    onClick={() => setSelectedFigure(null)}
                    className="text-slate-500 hover:text-slate-700 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="w-full mb-4" dangerouslySetInnerHTML={{ __html: selectedFigure.svg }} />

                <p className="text-slate-600 mb-4">{selectedFigure.description}</p>

                <div className="flex gap-3">
                  <Button
                    onClick={() => downloadSVG(selectedFigure)}
                    className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <Download className="w-4 h-4" />
                    Download SVG
                  </Button>

                  <Button
                    onClick={() => downloadPNG(selectedFigure)}
                    className="flex items-center gap-2 bg-green-600 text-white hover:bg-green-700"
                  >
                    <Download className="w-4 h-4" />
                    Download PNG
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default QOTEFigures
