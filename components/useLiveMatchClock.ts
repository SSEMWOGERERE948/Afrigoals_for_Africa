"use client"

import { matchTimerManager } from "@/lib/match-timer-manager"
import { useEffect, useState, useCallback } from "react"

type MatchStatus =
  | "Not Started"
  | "Live First Half"
  | "Half Time"
  | "Live Second Half"
  | "Full Time"
  | "Extra Time"
  | "Penalties"

interface UseLiveMatchClockOptions {
  matchId: string // Add match ID to make it specific
  startTime: Date | null
  isLive: boolean
  extraTime?: number
}

interface MatchClock {
  minute: number
  phase: MatchStatus
  startClock: () => void
  stopClock: () => void
  resetClock: () => void
  running: boolean
}

export default function useLiveMatchClock({
  matchId,
  startTime,
  isLive,
  extraTime = 0,
}: UseLiveMatchClockOptions): MatchClock {
  const [minute, setMinute] = useState(0)
  const [phase, setPhase] = useState<MatchStatus>("Not Started")
  const [running, setIsRunning] = useState(false)
  const [half, setHalf] = useState<1 | 2>(1)

  // Get initial state from global timer manager
  useEffect(() => {
    console.log(`🔄 Initializing clock for match ${matchId}`)

    // Check if there's existing global state for this match
    const globalState = matchTimerManager.getMatchState(matchId)
    if (globalState) {
      console.log(`✅ Found existing global state for match ${matchId}:`, globalState)
      setMinute(globalState.currentMinute)
      setIsRunning(globalState.running)

      // Convert global state to local phase
      if (globalState.period === "First Half") {
        setPhase(globalState.running ? "Live First Half" : "Not Started")
        setHalf(1)
      } else if (globalState.period === "Half Time") {
        setPhase("Half Time")
        setHalf(2)
      } else if (globalState.period === "Second Half") {
        setPhase(globalState.running ? "Live Second Half" : "Half Time")
        setHalf(2)
      } else if (globalState.period === "Full Time") {
        setPhase("Full Time")
      }
    } else if (startTime && isLive) {
      // Calculate elapsed time from start time
      const elapsed = Math.floor((Date.now() - new Date(startTime).getTime()) / 60000)
      setMinute(elapsed)

      if (elapsed < 45) {
        setPhase("Live First Half")
        setHalf(1)
        setIsRunning(true)
      } else if (elapsed < 60) {
        setPhase("Half Time")
        setHalf(2)
        setIsRunning(false)
      } else if (elapsed < 90 + extraTime) {
        setPhase("Live Second Half")
        setHalf(2)
        setIsRunning(true)
      } else {
        setPhase("Full Time")
        setIsRunning(false)
      }
    }
  }, [matchId, startTime, isLive, extraTime])

  // Register with global timer manager to receive updates
  useEffect(() => {
    console.log(`📞 Registering clock callback for match ${matchId}`)

    const handleGlobalUpdate = (globalState: any) => {
      console.log(`📡 Clock received global update for match ${matchId}:`, globalState)

      setMinute(globalState.currentMinute)
      setIsRunning(globalState.running)

      // Update phase based on global state
      if (globalState.period === "First Half") {
        setPhase(globalState.running ? "Live First Half" : "Not Started")
        setHalf(1)
      } else if (globalState.period === "Half Time") {
        setPhase("Half Time")
        setHalf(2)
      } else if (globalState.period === "Second Half") {
        setPhase(globalState.running ? "Live Second Half" : "Half Time")
        setHalf(2)
      } else if (globalState.period === "Full Time") {
        setPhase("Full Time")
      } else if (globalState.period === "Extra Time First") {
        setPhase("Extra Time")
        setHalf(1)
      } else if (globalState.period === "Extra Time Second") {
        setPhase("Extra Time")
        setHalf(2)
      } else if (globalState.period === "Finished") {
        setPhase("Full Time")
      }
    }

    // Register callback with global timer manager
    matchTimerManager.registerCallback(matchId, handleGlobalUpdate)

    // Cleanup callback when component unmounts
    return () => {
      console.log(`📞 Unregistering clock callback for match ${matchId}`)
      matchTimerManager.unregisterCallback(matchId)
    }
  }, [matchId])

  const startClock = useCallback(() => {
    console.log(`🚀 Starting clock for match ${matchId}`)

    if (!isLive) {
      console.log(`❌ Cannot start clock for match ${matchId} - not live`)
      return
    }

    const initialState = {
      status: "Live",
      currentMinute: minute,
      period: half === 1 ? "First Half" : "Second Half",
      running: true,
      addedTime: {
        firstHalf: 0,
        secondHalf: 0,
        extraTimeFirst: 0,
        extraTimeSecond: 0,
      },
    }

    // Start global timer
    matchTimerManager.startTimer(matchId, initialState, (updatedState) => {
      console.log(`⏰ Clock callback for match ${matchId}:`, updatedState)
      setMinute(updatedState.currentMinute)
      setIsRunning(updatedState.running)
    })

    setIsRunning(true)
    setPhase(half === 1 ? "Live First Half" : "Live Second Half")
  }, [matchId, isLive, minute, half])

  const stopClock = useCallback(() => {
    console.log(`⏸️ Stopping clock for match ${matchId}`)

    // Pause the global timer
    matchTimerManager.pauseMatch(matchId)
    setIsRunning(false)
  }, [matchId])

  const resetClock = useCallback(() => {
    console.log(`🔄 Resetting clock for match ${matchId}`)

    // Stop global timer
    matchTimerManager.stopTimer(matchId)

    setMinute(0)
    setHalf(1)
    setPhase("Not Started")
    setIsRunning(false)
  }, [matchId])

  return {
    minute,
    phase,
    startClock,
    stopClock,
    resetClock,
    running,
  }
}
