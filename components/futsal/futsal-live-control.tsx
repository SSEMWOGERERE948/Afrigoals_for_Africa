"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Trophy,
  ArrowUpDown,
  AlertTriangle,
  Timer,
  Loader2,
  RefreshCw,
  Settings,
  Plus,
  Minus,
  Check,
  X,
  Clock,
} from "lucide-react"
import FutsalFieldDisplay from "./futsal-field-display"
import type { FutsalMatch, FutsalPlayer, Goal, FutsalMatchEvent, MatchPeriod } from "@/app/types"
import {
  addGoalToMatch,
  addFutsalEventToMatch,
  updateFutsalMatch,
  updateMatchScore,
  resetFutsalMatch,
  getMatchEvents,
  updateFutsalMatchPeriods,
} from "@/lib/matches/api"

// Normalize legacy periods (string[] or MatchPeriod[])
const normalizePeriods = (input?: MatchPeriod[] | string[]): MatchPeriod[] => {
  if (!input) return []
  if (typeof input[0] === "string") {
    return (input as string[]).map((name, i) => ({
      id: `${i + 1}`,
      name,
      duration: 20, // default 20 min
      orderIndex: i,
      breakPeriod: false,
    }))
  }
  return input as MatchPeriod[]
}

interface FutsalLiveControlEnhancedProps {
  match: FutsalMatch
  homePlayers: FutsalPlayer[]
  awayPlayers: FutsalPlayer[]
  onMatchUpdate: (match: FutsalMatch) => void
  onStartMatch?: (matchId: string) => void
  isAdmin?: boolean
}

// Helper function to parse startTime from backend format
const parseStartTime = (startTime: any): Date | null => {
  if (!startTime || startTime === null) return null
  if (typeof startTime === "string" || startTime instanceof Date) {
    return new Date(startTime)
  }
  if (Array.isArray(startTime) && startTime.length >= 6) {
    const [year, month, day, hour, minute, second, nanosecond = 0] = startTime
    return new Date(year, month - 1, day, hour, minute, second, Math.floor(nanosecond / 1000000))
  }
  return null
}

export default function FutsalLiveControlEnhanced({
  match,
  homePlayers,
  awayPlayers,
  onMatchUpdate,
  onStartMatch,
  isAdmin = false,
}: FutsalLiveControlEnhancedProps) {
  const normalizedPeriods = normalizePeriods(match.periods)

  const [currentMatch, setCurrentMatch] = useState<FutsalMatch>(match)
  const [running, setIsRunning] = useState(false)
  const [currentPeriodElapsedMinute, setCurrentPeriodElapsedMinute] = useState(0)
  const [currentPeriodElapsedSecond, setCurrentPeriodElapsedSecond] = useState(0)
  const [totalPlayingMinutes, setTotalPlayingMinutes] = useState(0) // Total elapsed playing time
  const [currentPeriodIndex, setCurrentPeriodIndex] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingEvents, setIsLoadingEvents] = useState(false)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")

  // Duration editing states
  const [isEditingPeriods, setIsEditingPeriods] = useState(false)
  const [tempPeriods, setTempPeriods] = useState<MatchPeriod[]>(normalizedPeriods)
  const [periodEditError, setPeriodEditError] = useState("")

  // Dialog states
  const [goalDialog, setGoalDialog] = useState({ open: false, team: "" as "home" | "away" | "" })
  const [cardDialog, setCardDialog] = useState({
    open: false,
    team: "" as "home" | "away" | "",
    type: "" as "yellow" | "red" | "",
  })
  const [subDialog, setSubDialog] = useState({
    open: false,
    team: "" as "home" | "away" | "",
    playerOut: "",
    playerIn: "",
  })
  const [timeoutDialog, setTimeoutDialog] = useState({ open: false, team: "" as "home" | "away" | "" })

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Helper function to fetch match events from backend
  const fetchMatchEvents = async () => {
    try {
      setIsLoadingEvents(true)
      setError("")
      const events = await getMatchEvents(currentMatch.id)
      const updatedMatch = {
        ...currentMatch,
        events: events,
      }
      setCurrentMatch(updatedMatch)
      onMatchUpdate(updatedMatch)
      console.log("Match events fetched successfully:", events.length, "events")
    } catch (error) {
      console.error("Failed to fetch match events:", error)
      setError("Failed to fetch match events from server")
    } finally {
      setIsLoadingEvents(false)
    }
  }

  // Update match durations (now periods) - Simplified version
  const updateMatchPeriods = async (periodsToSave: MatchPeriod[]) => {
    try {
      setError("")
      setPeriodEditError("")
      setIsSaving(true)
      // Basic validation for periods
      if (periodsToSave.length === 0) {
        setPeriodEditError("At least one period is required.")
        return
      }
      for (const period of periodsToSave) {
        if (!period.name.trim()) {
          setPeriodEditError("Period name cannot be empty.")
          return
        }
        if (period.duration < 1 || period.duration > 120) {
          setPeriodEditError(`Period '${period.name}' duration must be between 1 and 120 minutes.`)
          return
        }
      }
      // 🔥 SIMPLIFIED: Just call the periods endpoint - backend handles matchDuration
      const updatedMatch = await updateFutsalMatchPeriods(currentMatch.id, periodsToSave)

      setCurrentMatch(updatedMatch)
      onMatchUpdate(updatedMatch)
      setSuccess("Match periods updated successfully!")
      console.log("Match periods updated:", periodsToSave)
    } catch (error) {
      console.error("Failed to update match periods:", error)
      setError("Failed to update match periods")
      setPeriodEditError("Failed to update match periods")
    } finally {
      setIsSaving(false)
    }
  }

  // Update local state when match prop changes
  useEffect(() => {
    setCurrentMatch(match)
    setTempPeriods(normalizePeriods(match.periods))
  }, [match])

  // Fetch events when component mounts or match changes
  useEffect(() => {
    if (currentMatch.id) {
      fetchMatchEvents()
    }
  }, [currentMatch.id])

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success || periodEditError) {
      const timer = setTimeout(() => {
        setError("")
        setSuccess("")
        setPeriodEditError("")
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, success, periodEditError])

  // Enhanced real-time timer with dynamic periods and persistence
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    const { startTime, status, periods, periodState } = currentMatch
    const normalizedMatchPeriods = normalizePeriods(periods)

    // Only run timer logic if match is Live and periods are defined
    if (status === "Live" && normalizedMatchPeriods && normalizedMatchPeriods.length > 0) {
      const initialPeriodOrder = periodState?.currentPeriodOrder ?? 0
      const initialElapsedTimeInCurrentPeriodMs = periodState?.elapsedTimeInCurrentPeriodMs ?? 0
      const initialTotalPlayingTimeMs = periodState?.totalPlayingTimeMs ?? 0
      const initialIsPaused = periodState?.matchPaused ?? false
      const lastUpdatedTimestamp =
        periodState?.lastUpdatedTimestamp ?? (parseStartTime(startTime)?.getTime() || Date.now())

      setIsRunning(!initialIsPaused)
      setIsRunning(!initialIsPaused) // This was missing - sync local running state with backend

      const updateTimer = () => {
        const now = Date.now()
        let currentPeriodIdx = initialPeriodOrder
        let currentPeriodElapsedMs = initialElapsedTimeInCurrentPeriodMs
        const currentTotalPlayingMs = initialTotalPlayingTimeMs

        // Only advance time if the timer is currently running (local state)
        if (running) {
          const timeSinceLastUpdate = now - lastUpdatedTimestamp
          currentPeriodElapsedMs += timeSinceLastUpdate
        }

        let tempAccumulatedPlayingTimeMs = 0 // Accumulates playing time of completed periods
        let foundCurrentPeriod = false

        for (let i = 0; i < normalizedMatchPeriods.length; i++) {
          const period = normalizedMatchPeriods[i]
          const periodDurationMs = period.duration * 60 * 1000

          if (i < currentPeriodIdx) {
            // This period was already completed before the last update
            if (!period.breakPeriod) {
              tempAccumulatedPlayingTimeMs += periodDurationMs
            }
          } else if (i === currentPeriodIdx) {
            // This is the current period we are tracking
            if (currentPeriodElapsedMs < periodDurationMs) {
              // Still within this period
              setCurrentPeriodElapsedMinute(Math.floor(currentPeriodElapsedMs / 60000))
              setCurrentPeriodElapsedSecond(Math.floor((currentPeriodElapsedMs % 60000) / 1000))
              if (!period.breakPeriod) {
                setTotalPlayingMinutes(Math.floor((tempAccumulatedPlayingTimeMs + currentPeriodElapsedMs) / 60000))
              } else {
                setTotalPlayingMinutes(Math.floor(tempAccumulatedPlayingTimeMs / 60000))
              }
              setCurrentPeriodIndex(i)
              foundCurrentPeriod = true
              break
            } else {
              // This period has finished, move to the next
              currentPeriodElapsedMs -= periodDurationMs // Carry over remaining time
              if (!period.breakPeriod) {
                tempAccumulatedPlayingTimeMs += periodDurationMs
              }
              currentPeriodIdx++ // Advance to next period for next iteration
            }
          } else {
            // This is a future period, and the previous one just finished (due to carry-over)
            if (currentPeriodElapsedMs < periodDurationMs) {
              setCurrentPeriodElapsedMinute(Math.floor(currentPeriodElapsedMs / 60000))
              setCurrentPeriodElapsedSecond(Math.floor((currentPeriodElapsedMs % 60000) / 1000))
              if (!period.breakPeriod) {
                setTotalPlayingMinutes(Math.floor((tempAccumulatedPlayingTimeMs + currentPeriodElapsedMs) / 60000))
              } else {
                setTotalPlayingMinutes(Math.floor(tempAccumulatedPlayingTimeMs / 60000))
              }
              setCurrentPeriodIndex(i)
              foundCurrentPeriod = true
              break
            } else {
              currentPeriodElapsedMs -= periodDurationMs
              if (!period.breakPeriod) {
                tempAccumulatedPlayingTimeMs += periodDurationMs
              }
              currentPeriodIdx++
            }
          }
        }

        if (!foundCurrentPeriod) {
          // All periods are finished
          const lastPeriod = normalizedMatchPeriods[normalizedMatchPeriods.length - 1]
          setCurrentPeriodIndex(normalizedMatchPeriods.length - 1)
          setCurrentPeriodElapsedMinute(lastPeriod && !lastPeriod.breakPeriod ? lastPeriod.duration : 0)
          setCurrentPeriodElapsedSecond(0)
          setTotalPlayingMinutes(Math.floor(tempAccumulatedPlayingTimeMs / 60000))
          setIsRunning(false)
          endMatch() // Automatically end match if all periods are done
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
          }
        }
      }

      // Initial update when component mounts or currentMatch changes
      updateTimer()

      if (!initialIsPaused && !periodState?.matchPaused) {
        intervalRef.current = setInterval(updateTimer, 1000)
      }
    } else {
      // Match is not Live, or no periods defined, or it's Finished
      setIsRunning(false)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      // Reset UI states if match is Scheduled or Active
      if (status === "Scheduled" || status === "Active") {
        setCurrentPeriodIndex(0)
        setCurrentPeriodElapsedMinute(0)
        setCurrentPeriodElapsedSecond(0)
        setTotalPlayingMinutes(0)
      } else if (status === "Finished" && periodState) {
        // If finished, display final state from periodState
        setCurrentPeriodIndex(periodState.currentPeriodOrder)
        setCurrentPeriodElapsedMinute(Math.floor(periodState.elapsedTimeInCurrentPeriodMs / 60000))
        setCurrentPeriodElapsedSecond(Math.floor((periodState.elapsedTimeInCurrentPeriodMs % 60000) / 1000))
        setTotalPlayingMinutes(Math.floor(periodState.totalPlayingTimeMs / 60000))
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [currentMatch]) // Depend on currentMatch object to re-run when it changes

  // Create a new match event
  const createFutsalMatchEvent = (eventData: Omit<FutsalMatchEvent, "id">): FutsalMatchEvent => {
    return {
      ...eventData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    }
  }

  // Create a new goal
  const createGoal = (goalData: Omit<Goal, "id">): Goal => {
    return {
      ...goalData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    }
  }

  const addEvent = async (
    type: FutsalMatchEvent["type"],
    minute: number, // This minute is relative to the current period
    team?: "home" | "away",
    description?: string,
    playerId?: string,
    playerName?: string,
    additionalInfo?: FutsalMatchEvent["additionalInfo"],
  ) => {
    try {
      setError("")
      // Use totalPlayingMinutes for event timestamp
      const eventMinute = totalPlayingMinutes + currentPeriodElapsedMinute + currentPeriodElapsedSecond / 60
      const newEvent = createFutsalMatchEvent({
        matchId: currentMatch.id,
        type,
        minute: Number.parseFloat(eventMinute.toFixed(2)),
        team,
        playerId,
        playerName,
        description: description || `${type} event`,
        additionalInfo,
      })
      // Update local state immediately for better UX
      const updatedMatch = {
        ...currentMatch,
        events: [...(currentMatch.events || []), newEvent],
      }
      setCurrentMatch(updatedMatch)
      onMatchUpdate(updatedMatch)
      // Save to backend
      try {
        await addFutsalEventToMatch({
          matchId: currentMatch.id,
          type,
          minute: Number.parseFloat(eventMinute.toFixed(2)),
          team,
          playerId,
          playerName,
          description: description || `${type} event`,
          ...(additionalInfo || {}),
        })
        console.log("Futsal event saved to backend successfully")
      } catch (backendError) {
        console.error("Failed to save futsal event to backend:", backendError)
        setError("Event recorded locally but failed to save to server")
      }
    } catch (error) {
      console.error("Failed to add futsal event:", error)
      setError("Failed to record event")
    }
  }

  const addGoal = async (
    playerId: string,
    playerName: string,
    team: "home" | "away",
    assistId?: string,
    assistName?: string,
  ) => {
    try {
      setError("")
      setIsSaving(true)
      const newGoal = createGoal({
        matchId: currentMatch.id,
        playerId,
        playerName,
        team,
        minute: totalPlayingMinutes + currentPeriodElapsedMinute, // Use total playing minutes for goal timestamp
        type: "goal",
        assistPlayerId: assistId,
        assistPlayerName: assistName,
      })
      const newHomeScore = team === "home" ? (currentMatch.homeScore || 0) + 1 : currentMatch.homeScore
      const newAwayScore = team === "away" ? (currentMatch.awayScore || 0) + 1 : currentMatch.awayScore
      // Update local state immediately
      const updatedMatch = {
        ...currentMatch,
        goals: [...(currentMatch.goals || []), newGoal],
        homeScore: newHomeScore,
        awayScore: newAwayScore,
      }
      setCurrentMatch(updatedMatch)
      onMatchUpdate(updatedMatch)
      // Save goal and update score in backend
      try {
        await Promise.all([
          addGoalToMatch({
            matchId: currentMatch.id,
            playerId,
            playerName,
            team,
            minute: totalPlayingMinutes + currentPeriodElapsedMinute,
            type: "goal",
            assistPlayerId: assistId,
            assistPlayerName: assistName,
          }),
          updateMatchScore(currentMatch.id, newHomeScore || 0, newAwayScore || 0),
        ])
        // Also add the goal event
        await addEvent(
          "goal",
          totalPlayingMinutes + currentPeriodElapsedMinute,
          team,
          `Goal by ${playerName}`,
          playerId,
          playerName,
        )
        setSuccess(`Goal by ${playerName} saved successfully!`)
        console.log("Goal and score saved to backend successfully")
      } catch (backendError) {
        console.error("Failed to save goal to backend:", backendError)
        setError("Goal recorded locally but failed to save to server")
      }
    } catch (error) {
      console.error("Failed to add goal:", error)
      setError("Failed to record goal")
    } finally {
      setIsSaving(false)
    }
  }

  const addSubstitution = async (
    team: "home" | "away",
    playerOutId: string,
    playerOutName: string,
    playerInId: string,
    playerInName: string,
  ) => {
    try {
      setError("")
      setIsSaving(true)
      const description = `Substitution: ${playerInName} in for ${playerOutName}`
      await addEvent(
        "substitution",
        totalPlayingMinutes + currentPeriodElapsedMinute,
        team,
        description,
        playerOutId,
        playerOutName,
        {
          playerInId,
          playerInName,
          playerOutId,
          playerOutName,
        },
      )
      setSuccess(`Substitution recorded: ${playerInName} in for ${playerOutName}`)
      console.log("Substitution saved successfully")
    } catch (error) {
      console.error("Failed to add substitution:", error)
      setError("Failed to record substitution")
    } finally {
      setIsSaving(false)
    }
  }

  const addTimeout = async (team: "home" | "away") => {
    try {
      setError("")
      setIsSaving(true)
      const teamName = team === "home" ? currentMatch.homeTeam : currentMatch.awayTeam
      const description = `Timeout called by ${teamName}`
      await addEvent(
        "timeout",
        totalPlayingMinutes + currentPeriodElapsedMinute,
        team,
        description,
        undefined,
        undefined,
        {
          timeoutDuration: 60, // 1 minute timeout in futsal
          timeoutReason: "tactical",
        },
      )
      setSuccess(`Timeout recorded for ${teamName}`)
      console.log("Timeout saved successfully")
    } catch (error) {
      console.error("Failed to add timeout:", error)
      setError("Failed to record timeout")
    } finally {
      setIsSaving(false)
    }
  }

  const startMatch = async () => {
    try {
      setError("")
      setIsSaving(true)
      const normalizedMatchPeriods = normalizePeriods(currentMatch.periods)
      const currentPeriod = normalizedMatchPeriods[currentPeriodIndex]
      if (!currentPeriod) {
        setError("No periods defined for this match.")
        setIsSaving(false)
        return
      }

      const newStatus: FutsalMatch["status"] = "Live"
      let newStartTime: Date | undefined = currentMatch.startTime
        ? parseStartTime(currentMatch.startTime) || undefined
        : undefined
      let newPeriodState: FutsalMatch["periodState"]

      if (!newStartTime || currentMatch.status === "Scheduled" || currentMatch.status === "Active") {
        // Starting the match for the very first time
        newStartTime = new Date()
        newPeriodState = {
          currentPeriodId: currentPeriod.id,
          currentPeriodOrder: 0,
          elapsedTimeInCurrentPeriodMs: 0,
          totalPlayingTimeMs: 0,
          lastUpdatedTimestamp: newStartTime.getTime(),
          matchPaused: false,
          breakPeriod: currentPeriod.breakPeriod || false,
        }
        setTotalPlayingMinutes(0)
        setCurrentPeriodElapsedMinute(0)
        setCurrentPeriodElapsedSecond(0)
        setCurrentPeriodIndex(0)
        await addEvent("kick_off", 0, undefined, "Kick off")
        setSuccess("Match started successfully!")
      } else if (currentMatch.periodState?.matchPaused) {
        // Resuming from a paused state (either break or playing period)
        newPeriodState = {
          ...currentMatch.periodState,
          matchPaused: false,
          lastUpdatedTimestamp: Date.now(), // Update timestamp to now
        }
        setSuccess("Match resumed successfully!")
      } else if (currentPeriod.breakPeriod) {
        // Resuming from a break (e.g., Half Time)
        const nextPlayingPeriodIndex = normalizedMatchPeriods.findIndex(
          (p, idx) => idx > currentPeriodIndex && !p.breakPeriod,
        )
        if (nextPlayingPeriodIndex === -1) {
          setError("No more playing periods left to resume.")
          setIsSaving(false)
          return
        }
        const nextPlayingPeriod = normalizedMatchPeriods[nextPlayingPeriodIndex]
        newPeriodState = {
          currentPeriodId: nextPlayingPeriod.id,
          currentPeriodOrder: nextPlayingPeriodIndex,
          elapsedTimeInCurrentPeriodMs: 0,
          totalPlayingTimeMs: currentMatch.periodState?.totalPlayingTimeMs || totalPlayingMinutes * 60 * 1000,
          lastUpdatedTimestamp: Date.now(),
          matchPaused: false,
          breakPeriod: nextPlayingPeriod.breakPeriod || false,
        }
        setCurrentPeriodIndex(nextPlayingPeriodIndex)
        setCurrentPeriodElapsedMinute(0)
        setCurrentPeriodElapsedSecond(0)
        await addEvent("period_start", totalPlayingMinutes, undefined, `${nextPlayingPeriod.name} started`)
        setSuccess(`${nextPlayingPeriod.name} started!`)
      } else {
        // This case should ideally not be hit if the button logic is correct,
        // but as a fallback, if it's live and not paused, it's already running.
        console.warn(
          "startMatch called in an unexpected state. Match status:",
          currentMatch.status,
          "matchPaused:",
          currentMatch.periodState?.matchPaused,
        )
        setIsSaving(false)
        return
      }

      const updatedMatch = {
        ...currentMatch,
        status: newStatus,
        startTime: newStartTime,
        periodState: newPeriodState,
      }
      setCurrentMatch(updatedMatch)
      onMatchUpdate(updatedMatch) // Propagate update to parent

      try {
        await updateFutsalMatch(currentMatch.id, {
          status: newStatus,
          startTime: newStartTime,
          periodState: newPeriodState,
        })
        if (onStartMatch) {
          onStartMatch(currentMatch.id)
        }
      } catch (backendError) {
        console.error("Failed to start match in backend:", backendError)
        setError("Match started locally but failed to save to server")
      }
    } catch (error) {
      console.error("Failed to start match:", error)
      setError("Failed to start match")
    } finally {
      setIsSaving(false)
    }
  }

  const pauseMatch = async () => {
    try {
      setError("")
      setIsSaving(true)
      setIsRunning(false) // Stop local timer immediately

      const normalizedMatchPeriods = normalizePeriods(currentMatch.periods)
      const currentPeriod = normalizedMatchPeriods[currentPeriodIndex]
      if (!currentPeriod) {
        setError("Cannot pause: No current period defined.")
        setIsSaving(false)
        return
      }

      const currentElapsedMs = currentPeriodElapsedMinute * 60 * 1000 + currentPeriodElapsedSecond * 1000
      const currentTotalPlayingMs = totalPlayingMinutes * 60 * 1000

      const updatedPeriodState: FutsalMatch["periodState"] = {
        currentPeriodId: currentPeriod.id,
        currentPeriodOrder: currentPeriodIndex,
        elapsedTimeInCurrentPeriodMs: currentElapsedMs,
        totalPlayingTimeMs: currentTotalPlayingMs,
        lastUpdatedTimestamp: Date.now(),
        matchPaused: true,
        breakPeriod: currentPeriod.breakPeriod || false,
      }

      const updatedMatch = {
        ...currentMatch,
        status: "Live" as const, // Status remains "Live" but timer is paused
        periodState: updatedPeriodState,
      }
      setCurrentMatch(updatedMatch)
      onMatchUpdate(updatedMatch) // Propagate update to parent

      try {
        await updateFutsalMatch(currentMatch.id, {
          periodState: updatedPeriodState,
        })
        await addEvent("pause", totalPlayingMinutes + currentPeriodElapsedMinute, undefined, "Match paused")
        setSuccess("Match paused successfully!")
      } catch (backendError) {
        console.error("Failed to pause match in backend:", backendError)
        setError("Match paused locally but failed to save to server")
      }
    } catch (error) {
      console.error("Failed to pause match:", error)
      setError("Failed to pause match")
    } finally {
      setIsSaving(false)
    }
  }

  const endMatch = async () => {
    const normalizedMatchPeriods = normalizePeriods(currentMatch.periods)
    if (!normalizedMatchPeriods || normalizedMatchPeriods.length === 0) return

    try {
      setError("")
      setIsSaving(true)
      setIsRunning(false) // Stop local timer immediately

      const currentElapsedMs = currentPeriodElapsedMinute * 60 * 1000 + currentPeriodElapsedSecond * 1000
      const currentTotalPlayingMs = totalPlayingMinutes * 60 * 1000

      const updatedPeriodState: FutsalMatch["periodState"] = {
        currentPeriodId: normalizedMatchPeriods[currentPeriodIndex]?.id || "",
        currentPeriodOrder: currentPeriodIndex,
        elapsedTimeInCurrentPeriodMs: currentElapsedMs,
        totalPlayingTimeMs: currentTotalPlayingMs,
        lastUpdatedTimestamp: Date.now(),
        matchPaused: true,
        breakPeriod: normalizedMatchPeriods[currentPeriodIndex]?.breakPeriod || false,
      }

      const updatedMatch = {
        ...currentMatch,
        status: "Finished" as const,
        periodState: updatedPeriodState,
      }
      setCurrentMatch(updatedMatch)
      onMatchUpdate(updatedMatch) // Propagate update to parent

      try {
        await updateFutsalMatch(currentMatch.id, {
          status: "Finished",
          periodState: updatedPeriodState,
        })
        await addEvent("final_whistle", totalPlayingMinutes + currentPeriodElapsedMinute, undefined, "Match ended")
        setSuccess("Match ended and saved successfully!")
      } catch (backendError) {
        console.error("Failed to end match in backend:", backendError)
        setError("Match ended locally but failed to save to server")
      }
    } catch (error) {
      console.error("Failed to end match:", error)
      setError("Failed to end match")
    } finally {
      setIsSaving(false)
    }
  }

  const resetMatch = async () => {
    if (confirm("Are you sure you want to reset the match? This will clear all events and scores.")) {
      try {
        setError("")
        setIsSaving(true)
        setCurrentPeriodElapsedMinute(0)
        setCurrentPeriodElapsedSecond(0)
        setTotalPlayingMinutes(0)
        setCurrentPeriodIndex(0)
        setIsRunning(false)

        const resetMatchData = {
          ...currentMatch,
          status: "Active" as const, // Or "Scheduled" depending on desired initial state
          homeScore: 0,
          awayScore: 0,
          goals: [],
          events: [],
          startTime: undefined, // Clear start time
          periodState: undefined, // Clear period state
        }
        setCurrentMatch(resetMatchData)
        onMatchUpdate(resetMatchData) // Propagate update to parent

        try {
          await resetFutsalMatch(currentMatch.id, {
            status: "Active",
            homeScore: 0,
            awayScore: 0,
            currentMinute: 0, // This might become redundant if periodState is used
            periodState: undefined, // Explicitly pass undefined to clear it on backend
          })
          setSuccess("Match reset successfully!")
        } catch (backendError) {
          console.error("Failed to reset match in backend:", backendError)
          setError("Match reset locally but failed to save to server")
        }
      } catch (error) {
        console.error("Failed to reset match:", error)
        setError("Failed to reset match")
      } finally {
        setIsSaving(false)
      }
    }
  }

  const formatTime = (minutes: number, seconds: number) => {
    const mins = Math.floor(minutes)
    const secs = Math.floor(seconds)
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getMatchStatus = () => {
    if (currentMatch.status === "Finished") return "Finished"
    const normalizedMatchPeriods = normalizePeriods(currentMatch.periods)
    const currentPeriod = normalizedMatchPeriods[currentPeriodIndex]
    if (!currentPeriod) return "Unknown Period"
    if (running && currentMatch.status === "Live") {
      return `🔴 LIVE - ${currentPeriod.name}`
    }
    if (currentPeriod.breakPeriod) {
      return `⏸️ ${currentPeriod.name}`
    }
    if (currentMatch.status === "Live") {
      return `⏸️ PAUSED - ${currentPeriod.name}`
    }
    return "Scheduled" // Or "Active"
  }

  const normalizedMatchPeriods = normalizePeriods(currentMatch.periods)
  const currentPeriod = normalizedMatchPeriods[currentPeriodIndex]
  const totalMatchPlayingDuration =
    normalizedMatchPeriods.filter((p) => !p.breakPeriod).reduce((sum, p) => sum + p.duration, 0) || 0

  // Handle duration editing
  const handleAddPeriod = (breakPeriod: boolean) => {
    setTempPeriods((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: breakPeriod ? `Break ${prev.length + 1}` : `Period ${prev.length + 1}`,
        duration: breakPeriod ? 5 : 20,
        orderIndex: prev.length,
        breakPeriod: breakPeriod,
      },
    ])
  }

  const handleRemovePeriod = (id: string) => {
    setTempPeriods((prev) => prev.filter((p) => p.id !== id).map((p, idx) => ({ ...p, orderIndex: idx })))
  }

  const handlePeriodChange = (id: string, field: keyof MatchPeriod, value: any) => {
    setTempPeriods((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)))
  }

  const handleSavePeriods = async () => {
    await updateMatchPeriods(tempPeriods)
    if (!periodEditError) {
      setIsEditingPeriods(false)
    }
  }

  const handleCancelEditingPeriods = () => {
    setIsEditingPeriods(false)
    // </CHANGE> Use normalizePeriods to convert string[] | MatchPeriod[] to MatchPeriod[]
    setTempPeriods(normalizePeriods(currentMatch.periods))
    setPeriodEditError("")
  }

  return (
    <div className="space-y-6 bg-background">
      {/* Error/Success Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
      {/* Match Header */}
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground">{currentMatch.homeTeam}</h2>
              <p className="text-sm text-muted-foreground">Home</p>
            </div>
            <div className="text-center px-8">
              <div className="text-4xl font-bold text-foreground">
                {currentMatch.homeScore ?? 0} - {currentMatch.awayScore ?? 0}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {currentPeriod && !currentPeriod.breakPeriod
                  ? formatTime(currentPeriodElapsedMinute, currentPeriodElapsedSecond)
                  : "00:00"}
              </div>
              {/* Enhanced Period Display */}
              <div className="text-xs text-muted-foreground mt-1">
                {currentPeriod && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {currentPeriod.name} ({currentPeriod.duration} min)
                  </span>
                )}
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground">{currentMatch.awayTeam}</h2>
              <p className="text-sm text-muted-foreground">Away</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={running ? "destructive" : "secondary"}>{getMatchStatus()}</Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              {currentMatch.teamSize} players • Total Playing Time: {totalMatchPlayingDuration} min
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Total Elapsed Playing Time: {formatTime(totalPlayingMinutes, 0)}
            </div>
            {(isSaving || isLoadingEvents) && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                {isSaving ? "Saving..." : "Loading events..."}
              </div>
            )}
          </div>
        </div>
        {/* Match Controls */}
        <div className="flex items-center justify-center gap-2">
          {currentMatch.status !== "Live" && currentMatch.status !== "Finished" && (
            <Button
              onClick={startMatch}
              className="bg-green-600 hover:bg-green-700"
              disabled={isSaving || !normalizedMatchPeriods || normalizedMatchPeriods.length === 0}
            >
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
              {currentMatch.startTime ? "Resume Match" : "Start Match"}
            </Button>
          )}
          {currentPeriod?.breakPeriod && currentMatch.status === "Live" && (
            <Button onClick={startMatch} className="bg-blue-600 hover:bg-blue-700" disabled={isSaving}>
              <Play className="h-4 w-4 mr-2" />
              Start {normalizedMatchPeriods[currentPeriodIndex + 1]?.name || "Next Period"}
            </Button>
          )}
          {running && currentMatch.status === "Live" && !currentPeriod?.breakPeriod && (
            <Button onClick={pauseMatch} variant="outline" className="border-input bg-transparent">
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
          )}
          {!running && currentMatch.status === "Live" && !currentPeriod?.breakPeriod && (
            <Button onClick={startMatch} className="bg-green-600 hover:bg-green-700">
              <Play className="h-4 w-4 mr-2" />
              Resume
            </Button>
          )}
          {currentMatch.status !== "Finished" && currentMatch.startTime && (
            <Button onClick={endMatch} variant="destructive" disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Square className="h-4 w-4 mr-2" />}
              End Match
            </Button>
          )}
          <Button onClick={resetMatch} variant="outline" className="border-input bg-transparent" disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RotateCcw className="h-4 w-4 mr-2" />}
            Reset
          </Button>
        </div>
      </Card>
      {/* Enhanced Duration Control Card */}
      <Card className="p-6 bg-card border-border">
        <h3 className="font-semibold mb-3 flex items-center gap-2 text-foreground">
          <Clock className="h-4 w-4" />
          Match Period Control
          {!isEditingPeriods && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditingPeriods(true)}
              disabled={isSaving || currentMatch.status === "Live"}
              className="ml-auto"
            >
              <Settings className="h-4 w-4 mr-1" />
              Edit Periods
            </Button>
          )}
        </h3>
        {periodEditError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{periodEditError}</AlertDescription>
          </Alert>
        )}
        {!isEditingPeriods ? (
          /* Display Mode */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            {normalizedMatchPeriods && normalizedMatchPeriods.length > 0 ? (
              normalizedMatchPeriods.map((period, idx) => (
                <div
                  key={period.id}
                  className={`text-center p-3 rounded-lg ${period.breakPeriod ? "bg-yellow-50/30 border-yellow-200" : "bg-blue-50/30 border-blue-200"}`}
                >
                  <div className="font-medium text-foreground">{period.name}</div>
                  <div
                    className={`text-2xl font-bold mt-1 ${period.breakPeriod ? "text-yellow-700" : "text-blue-700"}`}
                  >
                    {period.duration}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    minutes {period.breakPeriod ? "(Break)" : "(Playing)"}
                  </div>
                  {currentPeriodIndex === idx && currentMatch.status === "Live" && (
                    <Badge variant="secondary" className="mt-2">
                      Current
                    </Badge>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground col-span-full py-4">
                No periods defined. Click "Edit Periods" to add some.
              </p>
            )}
          </div>
        ) : (
          /* Edit Mode */
          <div className="space-y-6">
            {/* Period List */}
            <div className="space-y-4">
              {tempPeriods.map((period, idx) => (
                <div key={period.id} className="flex items-center gap-3 p-3 border rounded-lg bg-muted/20">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor={`period-name-${period.id}`} className="sr-only">
                        Period Name
                      </Label>
                      <Input
                        id={`period-name-${period.id}`}
                        value={period.name}
                        onChange={(e) => handlePeriodChange(period.id, "name", e.target.value)}
                        placeholder="Period Name"
                        className="bg-background border-input"
                        disabled={isSaving}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`period-duration-${period.id}`} className="sr-only">
                        Duration (min)
                      </Label>
                      <Input
                        id={`period-duration-${period.id}`}
                        type="number"
                        min="1"
                        max="120"
                        value={period.duration}
                        onChange={(e) => handlePeriodChange(period.id, "duration", Number(e.target.value))}
                        placeholder="Duration"
                        className="bg-background border-input"
                        disabled={isSaving}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        id={`is-break-${period.id}`}
                        type="checkbox"
                        checked={period.breakPeriod || false}
                        onChange={(e) => handlePeriodChange(period.id, "breakPeriod", e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        disabled={isSaving}
                      />
                      <Label htmlFor={`is-break-${period.id}`}>Is Break?</Label>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemovePeriod(period.id)}
                    disabled={isSaving || tempPeriods.length <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            {/* Add Period Buttons */}
            <div className="flex gap-2">
              <Button onClick={() => handleAddPeriod(false)} variant="outline" disabled={isSaving}>
                <Plus className="h-4 w-4 mr-2" /> Add Playing Period
              </Button>
              <Button onClick={() => handleAddPeriod(true)} variant="outline" disabled={isSaving}>
                <Plus className="h-4 w-4 mr-2" /> Add Break Period
              </Button>
            </div>
            {/* Preview */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-center">
                <div className="text-sm text-blue-800 font-medium">Total Playing Duration Preview</div>
                <div className="text-2xl font-bold text-blue-900 mt-1">
                  {tempPeriods.filter((p) => !p.breakPeriod).reduce((sum, p) => sum + p.duration, 0)} minutes
                </div>
                <div className="text-xs text-blue-700 mt-1">
                  Includes {tempPeriods.filter((p) => !p.breakPeriod).length} playing periods and{" "}
                  {tempPeriods.filter((p) => p.breakPeriod).length} break periods.
                </div>
              </div>
            </div>
            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={handleCancelEditingPeriods} disabled={isSaving}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSavePeriods}
                disabled={isSaving || tempPeriods.length === 0 || !!periodEditError}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Card>
      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-card border-border">
          <h3 className="font-semibold mb-2 flex items-center gap-2 text-foreground">
            <Trophy className="h-4 w-4 text-yellow-600" />
            Goals
          </h3>
          <div className="space-y-2">
            <Button
              size="sm"
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => setGoalDialog({ open: true, team: "home" })}
              disabled={currentMatch.status !== "Live" || currentPeriod?.breakPeriod || isSaving}
            >
              Home Goal
            </Button>
            <Button
              size="sm"
              className="w-full bg-red-600 hover:bg-red-700"
              onClick={() => setGoalDialog({ open: true, team: "away" })}
              disabled={currentMatch.status !== "Live" || currentPeriod?.breakPeriod || isSaving}
            >
              Away Goal
            </Button>
          </div>
        </Card>
        <Card className="p-4 bg-card border-border">
          <h3 className="font-semibold mb-2 flex items-center gap-2 text-foreground">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            Cards
          </h3>
          <div className="space-y-2">
            <Button
              size="sm"
              variant="outline"
              className="w-full border-yellow-500 text-yellow-700 bg-transparent"
              onClick={() => setCardDialog({ open: true, team: "", type: "yellow" })}
              disabled={currentMatch.status !== "Live" || currentPeriod?.breakPeriod || isSaving}
            >
              Yellow Card
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="w-full border-red-500 text-red-700 bg-transparent"
              onClick={() => setCardDialog({ open: true, team: "", type: "red" })}
              disabled={currentMatch.status !== "Live" || currentPeriod?.breakPeriod || isSaving}
            >
              Red Card
            </Button>
          </div>
        </Card>
        <Card className="p-4 bg-card border-border">
          <h3 className="font-semibold mb-2 flex items-center gap-2 text-foreground">
            <ArrowUpDown className="h-4 w-4 text-blue-600" />
            Substitutions
          </h3>
          <div className="space-y-2">
            <Button
              size="sm"
              variant="outline"
              className="w-full border-input bg-transparent"
              onClick={() => setSubDialog({ open: true, team: "home", playerOut: "", playerIn: "" })}
              disabled={currentMatch.status !== "Live" || currentPeriod?.breakPeriod || isSaving}
            >
              Home Sub
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="w-full border-input bg-transparent"
              onClick={() => setSubDialog({ open: true, team: "away", playerOut: "", playerIn: "" })}
              disabled={currentMatch.status !== "Live" || currentPeriod?.breakPeriod || isSaving}
            >
              Away Sub
            </Button>
          </div>
        </Card>
        <Card className="p-4 bg-card border-border">
          <h3 className="font-semibold mb-2 flex items-center gap-2 text-foreground">
            <Timer className="h-4 w-4 text-purple-600" />
            Timeouts
          </h3>
          <div className="space-y-2">
            <Button
              size="sm"
              variant="outline"
              className="w-full border-input bg-transparent"
              onClick={() => setTimeoutDialog({ open: true, team: "home" })}
              disabled={currentMatch.status !== "Live" || currentPeriod?.breakPeriod || isSaving}
            >
              Home Timeout
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="w-full border-input bg-transparent"
              onClick={() => setTimeoutDialog({ open: true, team: "away" })}
              disabled={currentMatch.status !== "Live" || currentPeriod?.breakPeriod || isSaving}
            >
              Away Timeout
            </Button>
          </div>
        </Card>
      </div>
      {/* Field Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {currentMatch.homeLineup && (
          <FutsalFieldDisplay
            formation={currentMatch.homeLineup.formation}
            startingXI={currentMatch.homeLineup.startingXI}
            substitutes={currentMatch.homeLineup.substitutes}
            teamName={currentMatch.homeTeam}
            isHome={true}
            teamSize={currentMatch.teamSize}
          />
        )}
        {currentMatch.awayLineup && (
          <FutsalFieldDisplay
            formation={currentMatch.awayLineup.formation}
            startingXI={currentMatch.awayLineup.startingXI}
            substitutes={currentMatch.awayLineup.substitutes}
            teamName={currentMatch.awayTeam}
            isHome={false}
            teamSize={currentMatch.teamSize}
          />
        )}
      </div>
      {/* Match Events */}
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Match Events</h3>
          <Button
            size="sm"
            variant="outline"
            onClick={fetchMatchEvents}
            disabled={isLoadingEvents}
            className="border-input bg-transparent"
          >
            {isLoadingEvents ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {isLoadingEvents ? "Loading..." : "Refresh Events"}
          </Button>
        </div>
        {!currentMatch.events || currentMatch.events.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No events recorded yet.</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {currentMatch.events
              .slice()
              .reverse()
              .map((event) => (
                <div key={event.id} className="flex items-center gap-3 p-2 border border-border rounded">
                  <Badge variant="outline" className="w-12 text-center">
                    {event.minute}'
                  </Badge>
                  <div className="flex-1">
                    <span className="font-medium text-foreground">{event.description}</span>
                    {event.playerName && <span className="text-muted-foreground ml-2">- {event.playerName}</span>}
                  </div>
                  {event.team && (
                    <Badge variant={event.team === "home" ? "default" : "secondary"}>
                      {event.team === "home" ? currentMatch.homeTeam : currentMatch.awayTeam}
                    </Badge>
                  )}
                </div>
              ))}
          </div>
        )}
      </Card>
      {/* Goal Dialog */}
      <Dialog open={goalDialog.open} onOpenChange={(open) => setGoalDialog({ ...goalDialog, open })}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Record Goal - {goalDialog.team === "home" ? currentMatch.homeTeam : currentMatch.awayTeam}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-foreground">Goal Scorer</Label>
              <Select
                onValueChange={(value) => {
                  const [playerId, playerName] = value.split("|")
                  addGoal(playerId, playerName, goalDialog.team as "home" | "away")
                  setGoalDialog({ open: false, team: "" })
                }}
                disabled={isSaving}
              >
                <SelectTrigger className="bg-background border-input">
                  <SelectValue placeholder={isSaving ? "Saving..." : "Select player"} />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {(goalDialog.team === "home" ? homePlayers : awayPlayers).map((player) => (
                    <SelectItem key={player.id} value={`${player.id}|${player.name}`}>
                      #{player.number} {player.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Card Dialog */}
      <Dialog open={cardDialog.open} onOpenChange={(open) => setCardDialog({ ...cardDialog, open })}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {cardDialog.type === "yellow" ? "Yellow" : "Red"} Card - Select Team & Player
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-foreground">Team</Label>
              <Select onValueChange={(value) => setCardDialog({ ...cardDialog, team: value as "home" | "away" })}>
                <SelectTrigger className="bg-background border-input">
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="home">{currentMatch.homeTeam}</SelectItem>
                  <SelectItem value="away">{currentMatch.awayTeam}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {cardDialog.team && (
              <div>
                <Label className="text-foreground">Player</Label>
                <Select
                  onValueChange={(value) => {
                    const [playerId, playerName] = value.split("|")
                    addEvent(
                      cardDialog.type === "yellow" ? "yellow_card" : "red_card",
                      totalPlayingMinutes + currentPeriodElapsedMinute,
                      cardDialog.team as "home" | "away",
                      `${cardDialog.type === "yellow" ? "Yellow" : "Red"} card for ${playerName}`,
                      playerId,
                      playerName,
                    )
                    setCardDialog({ open: false, team: "", type: "" })
                  }}
                  disabled={isSaving}
                >
                  <SelectTrigger className="bg-background border-input">
                    <SelectValue placeholder={isSaving ? "Saving..." : "Select player"} />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {(cardDialog.team === "home" ? homePlayers : awayPlayers).map((player) => (
                      <SelectItem key={player.id} value={`${player.id}|${player.name}`}>
                        #{player.number} {player.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      {/* Substitution Dialog */}
      <Dialog open={subDialog.open} onOpenChange={(open) => setSubDialog({ ...subDialog, open })}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Substitution - {subDialog.team === "home" ? currentMatch.homeTeam : currentMatch.awayTeam}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-foreground">Player Coming Off</Label>
              <Select onValueChange={(value) => setSubDialog({ ...subDialog, playerOut: value })}>
                <SelectTrigger className="bg-background border-input">
                  <SelectValue placeholder="Select player coming off" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {(subDialog.team === "home" ? homePlayers : awayPlayers).map((player) => (
                    <SelectItem key={player.id} value={`${player.id}|${player.name}`}>
                      #{player.number} {player.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-foreground">Player Coming On</Label>
              <Select onValueChange={(value) => setSubDialog({ ...subDialog, playerIn: value })}>
                <SelectTrigger className="bg-background border-input">
                  <SelectValue placeholder="Select player coming on" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {(subDialog.team === "home" ? homePlayers : awayPlayers).map((player) => (
                    <SelectItem key={player.id} value={`${player.id}|${player.name}`}>
                      #{player.number} {player.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {subDialog.playerOut && subDialog.playerIn && (
              <Button
                onClick={() => {
                  const [playerOutId, playerOutName] = subDialog.playerOut.split("|")
                  const [playerInId, playerInName] = subDialog.playerIn.split("|")
                  addSubstitution(
                    subDialog.team as "home" | "away",
                    playerOutId,
                    playerOutName,
                    playerInId,
                    playerInName,
                  )
                  setSubDialog({ open: false, team: "", playerOut: "", playerIn: "" })
                }}
                disabled={isSaving}
                className="w-full"
              >
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Record Substitution
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
      {/* Timeout Dialog */}
      <Dialog open={timeoutDialog.open} onOpenChange={(open) => setTimeoutDialog({ ...timeoutDialog, open })}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Timeout - {timeoutDialog.team === "home" ? currentMatch.homeTeam : currentMatch.awayTeam}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Record a timeout for {timeoutDialog.team === "home" ? currentMatch.homeTeam : currentMatch.awayTeam} at
              minute {totalPlayingMinutes + currentPeriodElapsedMinute}.
            </p>
            <Button
              onClick={() => {
                addTimeout(timeoutDialog.team as "home" | "away")
                setTimeoutDialog({ open: false, team: "" })
              }}
              disabled={isSaving}
              className="w-full"
            >
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Record Timeout
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
