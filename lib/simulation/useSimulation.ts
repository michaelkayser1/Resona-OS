"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { SimParams, RuntimeState } from "./types"
import { presets } from "./presets"
import { KuramotoEngine } from "./engine"

const defaultParams: SimParams = {
  N: 100,
  K: 1.0,
  sigma: 0.1,
  omega0: 1.0,
  D: 0.01,
  beta: 0.0,
  fv: 0.1,
  rhoqp: 1.0,
  dt: 0.01,
}

const initialState: RuntimeState = {
  theta: new Float64Array(100),
  r: 0,
  psi: 0,
  C: 0,
  R: 0,
  W: 0,
  time: 0,
}

export function useSimulation() {
  const [params, setParams] = useState<SimParams>(defaultParams)
  const [state, setState] = useState<RuntimeState>(initialState)
  const [isRunning, setIsRunning] = useState(false)

  const engineRef = useRef<KuramotoEngine>()
  const animationRef = useRef<number>()

  // Initialize engine
  useEffect(() => {
    engineRef.current = new KuramotoEngine(params)
    setState(engineRef.current.getState())
  }, [])

  // Update engine when parameters change
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.updateParams(params)
    }
  }, [params])

  // Animation loop - runs entirely in main thread
  useEffect(() => {
    if (!isRunning) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      return
    }

    const animate = () => {
      if (engineRef.current) {
        engineRef.current.step()
        setState(engineRef.current.getState())
      }
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isRunning])

  const updateParams = useCallback((updates: Partial<SimParams>) => {
    setParams((prev) => ({ ...prev, ...updates }))
  }, [])

  const toggleSimulation = useCallback(() => {
    setIsRunning((prev) => !prev)
  }, [])

  const resetSimulation = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.reset()
      setState(engineRef.current.getState())
    }
  }, [])

  const randomizePhases = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.randomizePhases()
      setState(engineRef.current.getState())
    }
  }, [])

  const loadPreset = useCallback((presetName: string) => {
    const preset = presets[presetName]
    if (preset) {
      setParams(preset.params)
    }
  }, [])

  return {
    state,
    params,
    updateParams,
    isRunning,
    toggleSimulation,
    resetSimulation,
    randomizePhases,
    loadPreset,
  }
}
