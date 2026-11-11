"use client"

import { useState, useEffect, useCallback, useRef } from "react"

interface ProgressData {
  [stepId: string]: boolean | any
}

export function useLocalProgress(key: string) {
  const [progress, setProgress] = useState<ProgressData>({})
  const mountedRef = useRef(false)
  const [loadedKey, setLoadedKey] = useState<string | null>(null)

  const storageKey = `progress_${key}`

  // Load progress from localStorage on mount
  useEffect(() => {
    mountedRef.current = true
    try {
      const saved = localStorage.getItem(storageKey)
      setProgress(saved ? JSON.parse(saved) : {})
    } catch (error) {
      console.error("Failed to load progress from localStorage:", error)
      setProgress({})
    } finally {
      setLoadedKey(storageKey)
    }
  }, [storageKey])

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    if (!mountedRef.current || loadedKey !== storageKey) return

    try {
      localStorage.setItem(storageKey, JSON.stringify(progress))
    } catch (error) {
      console.error("Failed to save progress to localStorage:", error)
    }
  }, [progress, storageKey, loadedKey])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  const updateProgress = useCallback((stepId: string, value: boolean | any) => {
    if (!mountedRef.current) return

    setProgress((prev) => ({
      ...prev,
      [stepId]: value,
    }))
  }, [])

  const getStepProgress = useCallback(() => {
    return progress
  }, [progress])

  const isStepCompleted = useCallback(
    (stepId: string): boolean => {
      return Boolean(progress[stepId])
    },
    [progress],
  )

  const getCompletedSteps = useCallback((): string[] => {
    return Object.keys(progress).filter((stepId) => Boolean(progress[stepId]))
  }, [progress])

  const resetProgress = useCallback(() => {
    if (!mountedRef.current) return

    setProgress({})
    try {
      localStorage.removeItem(storageKey)
    } catch (error) {
      console.error("Failed to reset progress:", error)
    }
  }, [storageKey])

  const getProgressPercentage = useCallback(
    (totalSteps: number): number => {
      const completedCount = getCompletedSteps().length
      return totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0
    },
    [getCompletedSteps],
  )

  return {
    progress,
    updateProgress,
    getStepProgress,
    isStepCompleted,
    getCompletedSteps,
    resetProgress,
    getProgressPercentage,
  }
}
