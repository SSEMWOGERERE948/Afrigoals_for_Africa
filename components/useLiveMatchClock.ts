"use client"

import { matchTimerManager } from "@/lib/match-timer-manager"
import { useEffect, useState, useCallback } from "react"
import type { MatchState } from "@/app/types"

type MatchStatus =
  | "Not Started"
  | "Live First Half"
  | "Half Time"
  | "Live Second Half"
  | "Full Time"
  | "Extra Time"
  | "Penalties"
  | "Finished" // Added Finished status

interface UseLiveMatchClockOptions {
  matchId: string // Add match ID to make it specific
}

interface MatchClock {
  period: MatchStatus
  minutes: number // For display
  seconds: number // For display
  totalSeconds: number // The official total seconds from matchState
  phase: MatchStatus
  running: boolean
  // Removed startClock, stopClock, resetClock as they are now controlled externally by LiveMatchControl
}

export default function useLiveMatchClock({ matchId }: UseLiveMatchClockOptions): MatchClock {
  // Internal state for granular display, synced with matchState.currentMinute (total seconds)
  const [totalSecondsElapsed, setTotalSecondsElapsed] = useState(0)
  const [phase, setPhase] = useState<MatchStatus>("Not Started")
  const [running, setIsRunning] = useState(false)

  // Register with global timer manager to receive updates
  useEffect(() => {
    console.log(`📞 useLiveMatchClock: Registering clock callback for match ${matchId}`)

    const handleGlobalUpdate = (globalState: MatchState) => {
      console.log(`📡 useLiveMatchClock: Clock received global update for match ${matchId}:`, globalState)
      setTotalSecondsElapsed(globalState.currentMinute) // currentMinute is total seconds
      setIsRunning(globalState.running)

      if (globalState.status === "Finished") {
        setPhase("Finished")
      } else if (globalState.currentMinute >= 5400) {
        // 90+ minutes = second half complete
        setPhase("Full Time")
      } else if (globalState.currentMinute >= 2700) {
        // 45+ minutes = should be second half
        if (globalState.running) {
          setPhase("Live Second Half")
        } else {
          // If not running but time > 45 min, check if it's actually halftime or full time
          if (globalState.currentMinute >= 5400) {
            setPhase("Full Time")
          } else {
            setPhase("Half Time") // Paused during second half
          }
        }
      } else if (globalState.currentMinute > 0) {
        // 0-45 minutes = first half
        if (globalState.running) {
          setPhase("Live First Half")
        } else {
          setPhase("Half Time") // Paused during first half
        }
      } else {
        setPhase("Not Started")
      }

      if (globalState.period === "Extra Time First" || globalState.period === "Extra Time Second") {
        setPhase("Extra Time")
      } else if (globalState.period === "Penalty Shootout") {
        setPhase("Penalties")
      }
    }

    // Register callback with global timer manager
    matchTimerManager.registerCallback(matchId, handleGlobalUpdate)

    const syncInitialState = async () => {
      // Small delay to ensure backend state is ready
      await new Promise((resolve) => setTimeout(resolve, 100))

      const initialGlobalState = matchTimerManager.getMatchState(matchId)
      if (initialGlobalState) {
        console.log(`✅ useLiveMatchClock: Initial state from manager for ${matchId}:`, initialGlobalState)
        handleGlobalUpdate(initialGlobalState)

        if (initialGlobalState.running && initialGlobalState.currentMinute > 2700) {
          setTimeout(() => {
            const recheck = matchTimerManager.getMatchState(matchId)
            if (recheck) handleGlobalUpdate(recheck)
          }, 500)
        }
      } else {
        console.log(`⚠️ useLiveMatchClock: No initial global state found in manager for match ${matchId}.`)
      }
    }

    syncInitialState()

    // Cleanup callback when component unmounts
    return () => {
      console.log(`📞 useLiveMatchClock: Unregistering clock callback for match ${matchId}`)
      matchTimerManager.unregisterCallback(matchId, handleGlobalUpdate) // Pass the specific callback to unregister
    }
  }, [matchId]) // Dependency on matchId

  const { displayMinutes, displaySeconds } = useCallback((totalSecs: number) => {
    const minutes = Math.floor(totalSecs / 60)
    const seconds = totalSecs % 60
    return { displayMinutes: minutes, displaySeconds: seconds }
  }, [])(totalSecondsElapsed)

  // Log current state of the hook on every render
  console.log(
    `useLiveMatchClock Render: Match ${matchId} - TotalSeconds: ${totalSecondsElapsed}, Running: ${running}, Phase: ${phase}`,
  )

  return {
    period: phase,
    minutes: displayMinutes,
    seconds: displaySeconds,
    totalSeconds: totalSecondsElapsed, // The official total seconds
    phase,
    running,
  }
}
