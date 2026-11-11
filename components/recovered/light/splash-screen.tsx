"use client"

import { useEffect, useState } from "react"

interface SplashScreenProps {
  onComplete: () => void
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    console.log("[v0] Splash screen mounted, starting timer")

    const timer = setTimeout(() => {
      console.log("[v0] Starting fade out")
      setFadeOut(true)
      setTimeout(() => {
        console.log("[v0] Calling onComplete callback")
        onComplete()
      }, 500)
    }, 2500)

    return () => {
      console.log("[v0] Splash screen unmounting, clearing timer")
      clearTimeout(timer)
    }
  }, []) // Empty dependency array prevents loop

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#050816] transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="relative w-full max-w-2xl px-8">
        {/* Animated wave with wobble */}
        <div className="mb-12 h-32 relative overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 800 150">
            {/* Electric field - blue wave */}
            <path
              d="M0,75 Q100,25 200,75 T400,75 T600,75 T800,75"
              fill="none"
              stroke="#60a5fa"
              strokeWidth="3"
              className="animate-wave"
            >
              <animate
                attributeName="d"
                dur="2s"
                repeatCount="indefinite"
                values="M0,75 Q100,25 200,75 T400,75 T600,75 T800,75;
                        M0,75 Q100,125 200,75 T400,75 T600,75 T800,75;
                        M0,75 Q100,25 200,75 T400,75 T600,75 T800,75"
              />
            </path>

            {/* Magnetic field - red spiral wobble */}
            <path
              d="M0,75 Q100,60 200,75 T400,75 T600,75 T800,75"
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
              opacity="0.8"
              className="animate-wobble"
            >
              <animate
                attributeName="d"
                dur="2s"
                repeatCount="indefinite"
                values="M0,75 Q100,60 200,75 T400,75 T600,75 T800,75;
                        M0,75 Q100,90 200,75 T400,75 T600,75 T800,75;
                        M0,75 Q100,60 200,75 T400,75 T600,75 T800,75"
              />
            </path>

            {/* Vertical line representing coherence */}
            <line
              x1="400"
              y1="0"
              x2="400"
              y2="150"
              stroke="white"
              strokeWidth="1"
              opacity="0.4"
              className="animate-pulse"
            />
          </svg>
        </div>

        {/* Text content */}
        <div className="text-center space-y-4 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
            When light admits <span className="text-magnetic">its wobble</span>…
          </h1>
          <p className="text-lg text-gray-400">QOTE Light Wobble Explorer</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes wave {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(-10px);
          }
        }
        
        @keyframes wobble {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-5px) rotate(2deg);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-wave {
          animation: wave 3s ease-in-out infinite;
        }
        
        .animate-wobble {
          animation: wobble 2s ease-in-out infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out 0.5s both;
        }
      `}</style>
    </div>
  )
}
