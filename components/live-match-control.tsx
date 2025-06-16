"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Play, Pause, Square, Clock, Target, CheckCircle, Users, BellIcon as Whistle, Edit } from "lucide-react"
import type { Match, MatchState, Goal, Player } from "@/app/types"
import {
  addMatchEvent,
  updateMatchState,
  addGoal,
  fetchMatchState,
  fetchMatchGoals,
  fetchMatchEvents,
  deleteGoal,
  updateGoal,
  deleteMatchEvent,
} from "./matches_api"
import { matchTimerManager } from "@/lib/match-timer-manager"
import MatchTimerDebug from "./match-timer-debug"
import useLiveMatchClock from "./useLiveMatchClock"

interface LiveMatchControlProps {
  match: Match
  homeTeamPlayers: Player[]
  awayTeamPlayers: Player[]
  onMatchUpdate: (updatedMatch: Match) => void
}

interface QuickEvent {
  id: string
  type: string
  description: string
  minute: number
  timestamp: Date
}

export default function LiveMatchControl({
  match,
  homeTeamPlayers,
  awayTeamPlayers,
  onMatchUpdate,
}: LiveMatchControlProps) {
  // Initialize match state from existing match data
  const [matchState, setMatchState] = useState<MatchState>(() => ({
    status: (match.status as any) || "Scheduled",
    currentMinute: match.matchState?.currentMinute || match.currentMinute || 0,
    period: match.matchState?.period || "First Half",
    running: match.matchState?.running || false,
    addedTime: match.matchState?.addedTime || {
      firstHalf: 0,
      secondHalf: 0,
      extraTimeFirst: 0,
      extraTimeSecond: 0,
    },
  }))

  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false)
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)
  const [isTimeEditDialogOpen, setIsTimeEditDialogOpen] = useState(false)
  const [recentEvents, setRecentEvents] = useState<QuickEvent[]>([])
  const [notification, setNotification] = useState<string>("")
  const [lastSyncTime, setLastSyncTime] = useState<number>(Date.now())
  const [isInitialized, setIsInitialized] = useState(false)
  const [pendingGoals, setPendingGoals] = useState<
    Array<{
      id: string
      team: "home" | "away"
      minute: number
      timestamp: Date
    }>
  >([])

  const [goalForm, setGoalForm] = useState({
    team: "home" as "home" | "away",
    playerId: "",
    type: "goal" as "goal" | "penalty" | "own_goal",
    assistPlayerId: "",
  })

  const [eventForm, setEventForm] = useState({
    type: "yellow_card" as "yellow_card" | "red_card" | "substitution",
    team: "home" as "home" | "away",
    playerId: "",
    description: "",
  })

  const [timeEditForm, setTimeEditForm] = useState({
    currentMinute: 0,
    period: "First Half" as MatchState["period"],
    addedTime: 0,
  })

  const [matchGoals, setMatchGoals] = useState<Goal[]>([])
  const [matchEvents, setMatchEvents] = useState<any[]>([])

  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Load match-specific state on component mount
  useEffect(() => {
    const loadMatchState = async () => {
      try {
        console.log(`🔄 Loading state for match ${match.id}`)

        // First check if there's a global timer state
        const globalState = matchTimerManager.getMatchState(match.id)
        if (globalState) {
          console.log(`✅ Found global timer state for match ${match.id}:`, globalState)
          setMatchState(globalState)
        } else {
          // Try to load from server
          const serverState = await fetchMatchState(match.id)
          if (serverState) {
            console.log(`✅ Loaded server state for match ${match.id}:`, serverState)
            setMatchState(serverState)
            // Initialize global timer manager with server state
            matchTimerManager.updateMatchState(match.id, serverState)
          } else {
            console.log(`📝 No state found for match ${match.id}, using default`)
            // Initialize global timer manager with default state
            matchTimerManager.updateMatchState(match.id, matchState)
          }
        }

        setIsInitialized(true)
      } catch (error) {
        console.error(`❌ Failed to load state for match ${match.id}:`, error)
        setIsInitialized(true)
      }
    }

    loadMatchState()
  }, [match.id])

  // Register with global timer manager when component mounts
  useEffect(() => {
    if (!isInitialized) return

    console.log(`📞 Registering callback for match ${match.id}`)

    // Register callback to receive state updates from global timer
    matchTimerManager.registerCallback(match.id, (newState) => {
      console.log(`📡 Received global state update for match ${match.id}:`, newState)
      setMatchState(newState)
      setLastSyncTime(Date.now())

      // Show notifications for period changes
      if (newState.period === "Half Time" && matchState.period === "First Half") {
        showNotification("⏰ Half Time - 45 minutes completed")
        addRecentEvent("half_time", "Half Time")
      } else if (newState.period === "Full Time" && matchState.period === "Second Half") {
        showNotification("🏁 Full Time - 90 minutes completed")
        addRecentEvent("full_time", "Full Time")
      }
    })

    // Cleanup callback when component unmounts or match changes
    return () => {
      console.log(`📞 Unregistering callback for match ${match.id}`)
      matchTimerManager.unregisterCallback(match.id)
    }
  }, [match.id, isInitialized])

  // Load match goals and events
  useEffect(() => {
    const loadMatchData = async () => {
      try {
        const [goals, events] = await Promise.all([fetchMatchGoals(match.id), fetchMatchEvents(match.id)])
        setMatchGoals(goals || [])
        setMatchEvents(events || [])
      } catch (error) {
        console.error(`Failed to load match data for ${match.id}:`, error)
      }
    }

    if (isInitialized) {
      loadMatchData()
    }
  }, [match.id, isInitialized])

  const showNotification = useCallback(
    (message: string) => {
      setNotification(`[Match ${match.id}] ${message}`)
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current)
      }
      notificationTimeoutRef.current = setTimeout(() => {
        setNotification("")
      }, 5000)
    },
    [match.id],
  )

  const addRecentEvent = useCallback(
    (type: string, description: string) => {
      const event: QuickEvent = {
        id: `${match.id}-${Date.now()}`,
        type,
        description,
        minute: matchState.currentMinute,
        timestamp: new Date(),
      }
      setRecentEvents((prev) => [event, ...prev.slice(0, 4)])
    },
    [matchState.currentMinute, match.id],
  )

  const saveMatchState = async (state: MatchState, showFeedback = true) => {
    try {
      console.log(`💾 Saving state for match ${match.id}:`, state)

      // Update global timer manager
      matchTimerManager.updateMatchState(match.id, state)

      // Save to backend
      const updatedMatch = await updateMatchState(match.id, state)
      onMatchUpdate(updatedMatch)

      if (showFeedback) {
        showNotification("✅ Match state saved")
      }
    } catch (error) {
      console.error(`❌ Failed to save state for match ${match.id}:`, error)
      if (showFeedback) {
        showNotification("❌ Failed to save match state")
      }
    }
  }

  const startMatch = async () => {
    const newState = {
      ...matchState,
      status: "Live" as const,
      period: "First Half" as const,
      running: true,
      currentMinute: 0,
      startTime: new Date(),
    }

    console.log(`🚀 Starting match ${match.id} with global timer`)
    setMatchState(newState)
    await saveMatchState(newState)

    // Start global timer
    matchTimerManager.startTimer(match.id, newState, (updatedState) => {
      setMatchState(updatedState)
      setLastSyncTime(Date.now())
    })

    showNotification("🚀 Match Started! Kick-off!")
    addRecentEvent("kick_off", "Match kicked off")

    await addMatchEvent(match.id, {
      type: "kick_off",
      minute: 0,
      description: "Kick-off",
    })
  }

  const pauseMatch = async () => {
    console.log(`⏸️ Pausing match ${match.id}`)
    matchTimerManager.pauseMatch(match.id)

    const newState = { ...matchState, running: false }
    await saveMatchState(newState)
    showNotification("⏸️ Match Paused")
    addRecentEvent("pause", `Match paused at ${getDisplayMinute()}'`)

    await addMatchEvent(match.id, {
      type: "pause",
      minute: matchState.currentMinute,
      description: `Match paused at ${getDisplayMinute()}'`,
    })
  }

  const resumeMatch = async () => {
    console.log(`▶️ Resuming match ${match.id}`)
    matchTimerManager.resumeMatch(match.id)

    const newState = { ...matchState, running: true }
    await saveMatchState(newState)
    showNotification("▶️ Match Resumed")
    addRecentEvent("resume", `Match resumed at ${getDisplayMinute()}'`)

    await addMatchEvent(match.id, {
      type: "resume",
      minute: matchState.currentMinute,
      description: `Match resumed at ${getDisplayMinute()}'`,
    })
  }

  const startSecondHalf = async () => {
    const newState = {
      ...matchState,
      period: "Second Half" as const,
      currentMinute: 45,
      running: true,
      secondHalfStart: new Date(),
    }

    console.log(`🔄 Starting second half for match ${match.id}`)
    setMatchState(newState)
    await saveMatchState(newState)

    // Update global timer
    matchTimerManager.updateMatchState(match.id, newState)

    showNotification("🔄 Second Half Started!")
    addRecentEvent("second_half", "Second half kicked off")

    await addMatchEvent(match.id, {
      type: "second_half_start",
      minute: 45,
      description: "Second half started",
    })
  }

  const startExtraTime = async () => {
    const newState = {
      ...matchState,
      period: "Extra Time First" as const,
      currentMinute: 90,
      running: true,
      extraTimeStart: new Date(),
    }

    console.log(`⏰ Starting extra time for match ${match.id}`)
    setMatchState(newState)
    await saveMatchState(newState)

    // Update global timer
    matchTimerManager.updateMatchState(match.id, newState)

    showNotification("⏰ Extra Time Started!")
    addRecentEvent("extra_time", "Extra time period started")

    await addMatchEvent(match.id, {
      type: "extra_time_start",
      minute: 90,
      description: "Extra time started",
    })
  }

  const startExtraTimeSecond = async () => {
    const newState = {
      ...matchState,
      period: "Extra Time Second" as const,
      currentMinute: 105,
      running: true,
    }

    console.log(`⏰ Starting extra time second half for match ${match.id}`)
    setMatchState(newState)
    await saveMatchState(newState)

    // Update global timer
    matchTimerManager.updateMatchState(match.id, newState)

    showNotification("⏰ Extra Time Second Half Started!")
    addRecentEvent("extra_time_second", "Extra time second half started")

    await addMatchEvent(match.id, {
      type: "extra_time_second_start",
      minute: 105,
      description: "Extra time second half started",
    })
  }

  const endMatch = async () => {
    const newState = {
      ...matchState,
      status: "Finished" as const,
      period: "Finished" as const,
      running: false,
    }

    console.log(`🏁 Ending match ${match.id}`)
    setMatchState(newState)
    await saveMatchState(newState)

    // Stop global timer
    matchTimerManager.stopTimer(match.id)

    showNotification("🏁 Match Ended! Final Whistle!")
    addRecentEvent("final_whistle", "Final whistle")

    await addMatchEvent(match.id, {
      type: "final_whistle",
      minute: matchState.currentMinute,
      description: "Final whistle",
    })
  }

  const quickAddTime = async (minutes: number) => {
    await addAddedTime(minutes)
    showNotification(`⏱️ Added ${minutes} minute(s) of stoppage time`)
    addRecentEvent("added_time", `+${minutes} minutes added`)
  }

  const addAddedTime = async (minutes: number) => {
    const newState = {
      ...matchState,
      addedTime: {
        ...matchState.addedTime,
        [matchState.period === "First Half"
          ? "firstHalf"
          : matchState.period === "Second Half"
            ? "secondHalf"
            : matchState.period === "Extra Time First"
              ? "extraTimeFirst"
              : "extraTimeSecond"]: Math.max(0, getCurrentAddedTime() + minutes),
      },
    }

    setMatchState(newState)
    await saveMatchState(newState)
  }

  const getCurrentAddedTime = () => {
    switch (matchState.period) {
      case "First Half":
        return matchState.addedTime.firstHalf
      case "Second Half":
        return matchState.addedTime.secondHalf
      case "Extra Time First":
        return matchState.addedTime.extraTimeFirst
      case "Extra Time Second":
        return matchState.addedTime.extraTimeSecond
      default:
        return 0
    }
  }

  const handleQuickGoal = async (team: "home" | "away") => {
    if (!matchState.running) {
      showNotification("❌ Cannot add goal - match is not running")
      return
    }

    const currentMinute = matchState.currentMinute
    const pendingGoalId = `pending-${match.id}-${Date.now()}`

    const updatedMatch = {
      ...match,
      homeScore: team === "home" ? (match.homeScore || 0) + 1 : match.homeScore || 0,
      awayScore: team === "away" ? (match.awayScore || 0) + 1 : match.awayScore || 0,
    }

    const pendingGoal = {
      id: pendingGoalId,
      team,
      minute: currentMinute,
      timestamp: new Date(),
    }

    setPendingGoals((prev) => [...prev, pendingGoal])
    onMatchUpdate(updatedMatch)

    const teamName = team === "home" ? match.homeTeam : match.awayTeam
    showNotification(`⚽ GOAL! ${teamName} - ${currentMinute}' (Details pending)`)
    addRecentEvent("goal_pending", `Goal scored by ${teamName} - Details TBD`)

    await addMatchEvent(match.id, {
      type: "goal",
      minute: currentMinute,
      team,
      playerId: "TBD",
      playerName: "TBD",
      description: `Goal by TBD (${teamName}) - Details pending`,
    })

    setGoalForm({ ...goalForm, team })
    setIsGoalDialogOpen(true)
  }

  const handleDeleteGoal = async (goalId: string) => {
    try {
      const updatedMatch = await deleteGoal(match.id, goalId)
      onMatchUpdate(updatedMatch)

      const goals = await fetchMatchGoals(match.id)
      setMatchGoals(goals || [])

      showNotification("✅ Goal deleted successfully")
    } catch (error) {
      console.error("Failed to delete goal:", error)
      showNotification("❌ Failed to delete goal")
    }
  }

  const handleUpdateGoal = async (goalId: string, goalData: any) => {
    try {
      const updatedMatch = await updateGoal(match.id, goalId, goalData)
      onMatchUpdate(updatedMatch)

      const goals = await fetchMatchGoals(match.id)
      setMatchGoals(goals || [])

      showNotification("✅ Goal updated successfully")
    } catch (error) {
      console.error("Failed to update goal:", error)
      showNotification("❌ Failed to update goal")
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteMatchEvent(match.id, eventId)

      const events = await fetchMatchEvents(match.id)
      setMatchEvents(events || [])

      showNotification("✅ Event deleted successfully")
    } catch (error) {
      console.error("Failed to delete event:", error)
      showNotification("❌ Failed to delete event")
    }
  }

  const handleAddGoal = async () => {
    if (!goalForm.playerId) {
      showNotification("❌ Please select a player")
      return
    }

    const player = [...homeTeamPlayers, ...awayTeamPlayers].find((p) => p.id === goalForm.playerId)
    if (!player) return

    const assistPlayer =
      goalForm.assistPlayerId && goalForm.assistPlayerId !== "none"
        ? [...homeTeamPlayers, ...awayTeamPlayers].find((p) => p.id === goalForm.assistPlayerId)
        : null

    const currentMinute = matchState.currentMinute
    const goal: Omit<Goal, "id"> = {
      playerId: goalForm.playerId,
      playerName: player.name,
      team: goalForm.team,
      minute: currentMinute,
      type: goalForm.type,
      assistPlayerId: assistPlayer?.id,
      assistPlayerName: assistPlayer?.name,
    }

    try {
      console.log(`⚽ Completing goal details for match ${match.id}:`, goal)
      const updatedMatch = await addGoal(match.id, goal)
      onMatchUpdate(updatedMatch)

      setPendingGoals((prev) => prev.filter((pg) => pg.team !== goalForm.team || pg.minute !== currentMinute))

      const [goals, events] = await Promise.all([fetchMatchGoals(match.id), fetchMatchEvents(match.id)])
      setMatchGoals(goals || [])
      setMatchEvents(events || [])

      await addMatchEvent(match.id, {
        type: "goal",
        minute: currentMinute,
        team: goalForm.team,
        playerId: goalForm.playerId,
        playerName: player.name,
        description: `Goal by ${player.name}${assistPlayer ? ` (assist: ${assistPlayer.name})` : ""}`,
      })

      const teamName = goalForm.team === "home" ? match.homeTeam : match.awayTeam
      const goalTypeText =
        goalForm.type === "penalty" ? "PENALTY GOAL" : goalForm.type === "own_goal" ? "OWN GOAL" : "GOAL"
      showNotification(`✅ ${goalTypeText} details completed! ${player.name} (${teamName})`)
      addRecentEvent("goal_completed", `${player.name} scored for ${teamName}`)

      setIsGoalDialogOpen(false)
      setGoalForm({
        team: "home",
        playerId: "",
        type: "goal",
        assistPlayerId: "",
      })
    } catch (error) {
      console.error(`❌ Failed to complete goal details for match ${match.id}:`, error)
      showNotification("❌ Failed to complete goal details")
    }
  }

  const handleAddEvent = async () => {
    if (!eventForm.playerId) {
      showNotification("❌ Please select a player")
      return
    }

    const player = [...homeTeamPlayers, ...awayTeamPlayers].find((p) => p.id === eventForm.playerId)
    if (!player) return

    const currentMinute = matchState.currentMinute
    const teamName = eventForm.team === "home" ? match.homeTeam : match.awayTeam

    try {
      console.log(`📝 Adding event to match ${match.id}:`, eventForm)
      await addMatchEvent(match.id, {
        type: eventForm.type,
        minute: currentMinute,
        team: eventForm.team,
        playerId: eventForm.playerId,
        playerName: player.name,
        description: eventForm.description || `${eventForm.type.replace("_", " ")} - ${player.name}`,
      })

      const eventIcon = eventForm.type === "yellow_card" ? "🟨" : eventForm.type === "red_card" ? "🟥" : "🔄"
      const eventText = eventForm.type.replace("_", " ").toUpperCase()
      showNotification(`${eventIcon} ${eventText}! ${player.name} (${teamName}) - ${currentMinute}'`)
      addRecentEvent(eventForm.type, `${player.name} - ${eventForm.type.replace("_", " ")}`)

      setIsEventDialogOpen(false)
      setEventForm({
        type: "yellow_card",
        team: "home",
        playerId: "",
        description: "",
      })
    } catch (error) {
      console.error(`❌ Failed to add event to match ${match.id}:`, error)
      showNotification("❌ Failed to add event")
    }
  }

  const handleTimeEdit = async () => {
    const newState = {
      ...matchState,
      currentMinute: timeEditForm.currentMinute,
      period: timeEditForm.period as MatchState["period"],
      addedTime: {
        ...matchState.addedTime,
        [matchState.period === "First Half"
          ? "firstHalf"
          : matchState.period === "Second Half"
            ? "secondHalf"
            : matchState.period === "Extra Time First"
              ? "extraTimeFirst"
              : "extraTimeSecond"]: timeEditForm.addedTime,
      },
    }

    setMatchState(newState)
    await saveMatchState(newState)
    setIsTimeEditDialogOpen(false)
    showNotification("✅ Match time updated")
    addRecentEvent("time_edit", `Time adjusted to ${timeEditForm.currentMinute}'`)
  }

  const openTimeEditDialog = () => {
    setTimeEditForm({
      currentMinute: matchState.currentMinute,
      period: matchState.period,
      addedTime: getCurrentAddedTime(),
    })
    setIsTimeEditDialogOpen(true)
  }

  const getDisplayMinute = () => {
    const addedTime = getCurrentAddedTime()
    if (addedTime > 0) {
      return `${matchState.currentMinute}+${addedTime}`
    }
    return matchState.currentMinute.toString()
  }

  const canStart = ["Lineup Set", "Scheduled"].includes(matchState.status)
  const canPause = matchState.running
  const canResume = !matchState.running && matchState.status === "Live"
  const canStartSecondHalf = matchState.period === "Half Time"
  const canStartExtraTime = matchState.period === "Full Time"
  const canStartExtraTimeSecond = matchState.period === "Extra Time Break"
  const canEnd = matchState.status === "Live"

  // Replace the existing timer useEffect with this:
  const matchClock = useLiveMatchClock({
    matchId: match.id,
    startTime: matchState.startTime || null,
    isLive: matchState.status === "Live",
    extraTime: getCurrentAddedTime(),
  })

  if (!isInitialized) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>Loading match control for Match {match.id}...</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Match ID Display */}
      <Card className="p-2 bg-blue-50 border-blue-200">
        <div className="text-center text-sm font-medium text-blue-800">
          Live Control - Match ID: {match.id} | Global Timer:{" "}
          {matchTimerManager.getActiveTimers().includes(match.id) ? "ACTIVE" : "INACTIVE"}
        </div>
      </Card>

      {/* Notification Bar */}
      {notification && (
        <Card className="p-4 bg-green-50 border-green-200 animate-in slide-in-from-top">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">{notification}</span>
          </div>
        </Card>
      )}

      {/* Main Match Display */}
      <Card className="p-6 border-2 border-green-500">
        <div className="text-center space-y-4">
          {/* Enhanced Timer Display with Match ID */}
          <div className="relative">
            <div className="flex items-center justify-center gap-2">
              <div className="text-7xl font-bold text-green-600 mb-2 font-mono">{getDisplayMinute()}'</div>
              <Button
                variant="ghost"
                size="sm"
                onClick={openTimeEditDialog}
                className="mb-2"
                disabled={matchState.running}
                title={`Edit time for Match ${match.id}`}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
            <Badge variant={matchState.running ? "destructive" : "secondary"} className="text-xl px-6 py-3">
              {matchState.period}
            </Badge>
            {matchState.running && (
              <div className="absolute -top-2 -right-2">
                <div className="w-6 h-6 bg-red-500 rounded-full animate-pulse flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
            )}
            {matchState.status === "Live" && (
              <div className="text-sm text-green-600 mt-2 flex items-center justify-center gap-2">
                <Whistle className="h-4 w-4" />
                <span className="font-semibold">LIVE MATCH #{match.id}</span>
              </div>
            )}
            {/* Match-specific timer indicator */}
            <div className="text-xs text-muted-foreground mt-1">
              Timer ID: {match.id} | Running: {matchState.running ? "YES" : "NO"} | Global:{" "}
              {matchTimerManager.getActiveTimers().includes(match.id) ? "ACTIVE" : "INACTIVE"}
            </div>
          </div>

          {/* Score Display */}
          <div className="text-6xl font-bold font-mono">
            {match.homeScore || 0} - {match.awayScore || 0}
          </div>

          {/* Goals Display */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            {/* Home Team Goals */}
            <div className="text-center">
              <h4 className="text-sm font-semibold text-blue-600 mb-2">{match.homeTeam} Goals</h4>
              <div className="space-y-1">
                {matchGoals
                  .filter((goal) => goal.team === "home")
                  .sort((a, b) => a.minute - b.minute)
                  .map((goal) => (
                    <div key={goal.id} className="text-xs bg-blue-50 p-2 rounded flex justify-between items-center">
                      <div>
                        <div className="font-medium">{goal.playerName}</div>
                        <div className="text-blue-600">
                          {goal.minute}' {goal.type === "penalty" ? "(P)" : goal.type === "own_goal" ? "(OG)" : ""}
                        </div>
                        {goal.assistPlayerName && (
                          <div className="text-blue-500 text-xs">Assist: {goal.assistPlayerName}</div>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 w-6 p-0"
                          onClick={() => handleUpdateGoal(goal.id, goal)}
                        >
                          ✏️
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 w-6 p-0"
                          onClick={() => handleDeleteGoal(goal.id)}
                        >
                          🗑️
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Away Team Goals */}
            <div className="text-center">
              <h4 className="text-sm font-semibold text-red-600 mb-2">{match.awayTeam} Goals</h4>
              <div className="space-y-1">
                {matchGoals
                  .filter((goal) => goal.team === "away")
                  .sort((a, b) => a.minute - b.minute)
                  .map((goal) => (
                    <div key={goal.id} className="text-xs bg-red-50 p-2 rounded flex justify-between items-center">
                      <div>
                        <div className="font-medium">{goal.playerName}</div>
                        <div className="text-red-600">
                          {goal.minute}' {goal.type === "penalty" ? "(P)" : goal.type === "own_goal" ? "(OG)" : ""}
                        </div>
                        {goal.assistPlayerName && (
                          <div className="text-red-500 text-xs">Assist: {goal.assistPlayerName}</div>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 w-6 p-0"
                          onClick={() => handleUpdateGoal(goal.id, goal)}
                        >
                          ✏️
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 w-6 p-0"
                          onClick={() => handleDeleteGoal(goal.id)}
                        >
                          🗑️
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Teams */}
          <div className="flex justify-between items-center text-xl">
            <span className="font-bold text-blue-600">{match.homeTeam}</span>
            <span className="text-muted-foreground font-semibold">vs</span>
            <span className="font-bold text-red-600">{match.awayTeam}</span>
          </div>

          {/* Sync Status */}
          <div className="text-xs text-muted-foreground">
            Last sync: {new Date(lastSyncTime).toLocaleTimeString()} | Match: {match.id}
          </div>
        </div>
      </Card>

      {/* Quick Goal Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button
          onClick={() => handleQuickGoal("home")}
          className="h-20 text-xl bg-blue-600 hover:bg-blue-700 font-bold disabled:opacity-50"
          disabled={!matchState.running}
        >
          <Target className="h-8 w-8 mr-3" />
          GOAL
          <br />
          {match.homeTeam}
          {!matchState.running && <div className="text-xs mt-1">Clock not running</div>}
        </Button>
        <Button
          onClick={() => handleQuickGoal("away")}
          className="h-20 text-xl bg-red-600 hover:bg-red-700 font-bold disabled:opacity-50"
          disabled={!matchState.running}
        >
          <Target className="h-8 w-8 mr-3" />
          GOAL
          <br />
          {match.awayTeam}
          {!matchState.running && <div className="text-xs mt-1">Clock not running</div>}
        </Button>
      </div>

      {/* Match Controls */}
      <Card className="p-6">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Whistle className="h-5 w-5" />
          Match Control
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {canStart && (
            <Button onClick={startMatch} className="h-12 text-lg font-semibold" size="lg">
              <Play className="h-5 w-5 mr-2" />
              START MATCH
            </Button>
          )}

          {canPause && (
            <Button onClick={pauseMatch} variant="outline" className="h-12 text-lg font-semibold" size="lg">
              <Pause className="h-5 w-5 mr-2" />
              PAUSE
            </Button>
          )}

          {canResume && (
            <Button onClick={resumeMatch} className="h-12 text-lg font-semibold" size="lg">
              <Play className="h-5 w-5 mr-2" />
              RESUME
            </Button>
          )}

          {canStartSecondHalf && (
            <Button onClick={startSecondHalf} className="h-12 text-lg font-semibold col-span-2" size="lg">
              <Play className="h-5 w-5 mr-2" />
              START 2ND HALF
            </Button>
          )}

          {canStartExtraTime && (
            <Button onClick={startExtraTime} variant="outline" className="h-12 text-lg font-semibold" size="lg">
              <Clock className="h-5 w-5 mr-2" />
              EXTRA TIME
            </Button>
          )}

          {canStartExtraTimeSecond && (
            <Button onClick={startExtraTimeSecond} className="h-12 text-lg font-semibold col-span-2" size="lg">
              <Play className="h-5 w-5 mr-2" />
              START EXTRA TIME 2ND HALF
            </Button>
          )}

          {canEnd && (
            <Button onClick={endMatch} variant="destructive" className="h-12 text-lg font-semibold" size="lg">
              <Square className="h-5 w-5 mr-2" />
              END MATCH
            </Button>
          )}
        </div>
      </Card>

      {/* Quick Time Controls */}
      {matchState.status === "Live" && (
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Stoppage Time: {getCurrentAddedTime()} min</h3>
          <div className="grid grid-cols-4 gap-2">
            <Button size="lg" onClick={() => quickAddTime(1)} variant="outline" className="font-bold">
              +1 min
            </Button>
            <Button size="lg" onClick={() => quickAddTime(2)} variant="outline" className="font-bold">
              +2 min
            </Button>
            <Button size="lg" onClick={() => quickAddTime(3)} variant="outline" className="font-bold">
              +3 min
            </Button>
            <Button size="lg" onClick={() => quickAddTime(5)} variant="outline" className="font-bold">
              +5 min
            </Button>
          </div>
        </Card>
      )}

      {/* Other Events */}
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Match Events</h3>
          <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={!matchState.running}>
                <Users className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  Add Match Event - {getDisplayMinute()}' (Match {match.id})
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Event Type</label>
                  <Select
                    value={eventForm.type}
                    onValueChange={(value: "yellow_card" | "red_card" | "substitution") =>
                      setEventForm({ ...eventForm, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yellow_card">🟨 Yellow Card</SelectItem>
                      <SelectItem value="red_card">🟥 Red Card</SelectItem>
                      <SelectItem value="substitution">🔄 Substitution</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Team</label>
                  <Select
                    value={eventForm.team}
                    onValueChange={(value: "home" | "away") => setEventForm({ ...eventForm, team: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home">{match.homeTeam}</SelectItem>
                      <SelectItem value="away">{match.awayTeam}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Player</label>
                  <Select
                    value={eventForm.playerId}
                    onValueChange={(value) => setEventForm({ ...eventForm, playerId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select player" />
                    </SelectTrigger>
                    <SelectContent>
                      {(eventForm.team === "home" ? homeTeamPlayers : awayTeamPlayers).map((player) => (
                        <SelectItem key={player.id} value={player.id}>
                          {player.name} (#{player.number})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Description (Optional)</label>
                  <Textarea
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    placeholder="Additional details..."
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleAddEvent} className="flex-1">
                    Add Event
                  </Button>
                  <Button variant="outline" onClick={() => setIsEventDialogOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      {/* Enhanced Events Feed */}
      {matchEvents.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Match Events Timeline (Match {match.id})</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {matchEvents
              .sort((a, b) => b.minute - a.minute)
              .map((event) => (
                <div key={event.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{event.description}</span>
                      {event.type === "goal" && (
                        <Badge variant="secondary" className="text-xs">
                          {event.team === "home" ? match.homeTeam : match.awayTeam}
                        </Badge>
                      )}
                    </div>
                    {event.playerName && event.playerName !== "TBD" && (
                      <div className="text-sm text-muted-foreground">Player: {event.playerName}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-green-600">{event.minute}'</span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 w-6 p-0"
                      onClick={() => handleDeleteEvent(event.id)}
                    >
                      🗑️
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* Pending Goals */}
      {pendingGoals.length > 0 && (
        <Card className="p-4 border-orange-200 bg-orange-50">
          <h3 className="font-semibold mb-4 text-orange-800">⏳ Pending Goal Details</h3>
          <div className="space-y-2">
            {pendingGoals.map((pendingGoal) => (
              <div
                key={pendingGoal.id}
                className="flex justify-between items-center p-3 bg-orange-100 rounded-lg border border-orange-200"
              >
                <span className="font-medium text-orange-900">
                  Goal by {pendingGoal.team === "home" ? match.homeTeam : match.awayTeam} - Details TBD
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-orange-700">{pendingGoal.minute}'</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setGoalForm({ ...goalForm, team: pendingGoal.team })
                      setIsGoalDialogOpen(true)
                    }}
                    className="text-orange-700 border-orange-300 hover:bg-orange-200"
                  >
                    Complete Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Time Edit Dialog */}
      <Dialog open={isTimeEditDialogOpen} onOpenChange={setIsTimeEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Match Time</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Current Minute</label>
              <Input
                type="number"
                value={timeEditForm.currentMinute}
                onChange={(e) =>
                  setTimeEditForm({ ...timeEditForm, currentMinute: Number.parseInt(e.target.value) || 0 })
                }
                min="0"
                max="150"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Period</label>
              <Select
                value={timeEditForm.period}
                onValueChange={(value: MatchState["period"]) => setTimeEditForm({ ...timeEditForm, period: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="First Half">First Half</SelectItem>
                  <SelectItem value="Half Time">Half Time</SelectItem>
                  <SelectItem value="Second Half">Second Half</SelectItem>
                  <SelectItem value="Full Time">Full Time</SelectItem>
                  <SelectItem value="Extra Time First">Extra Time First</SelectItem>
                  <SelectItem value="Extra Time Break">Extra Time Break</SelectItem>
                  <SelectItem value="Extra Time Second">Extra Time Second</SelectItem>
                  <SelectItem value="Finished">Finished</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Added Time (minutes)</label>
              <Input
                type="number"
                value={timeEditForm.addedTime}
                onChange={(e) => setTimeEditForm({ ...timeEditForm, addedTime: Number.parseInt(e.target.value) || 0 })}
                min="0"
                max="15"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleTimeEdit} className="flex-1">
                Update Time
              </Button>
              <Button variant="outline" onClick={() => setIsTimeEditDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Goal Dialog */}
      <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl">
              ⚽ {pendingGoals.some((pg) => pg.team === goalForm.team) ? "Complete Goal Details" : "Add Goal"} -{" "}
              {getDisplayMinute()}' (Match {match.id})
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <label className="text-sm font-medium mb-1 block">Scoring Team</label>
              <div className="text-2xl font-bold text-green-700">
                {goalForm.team === "home" ? match.homeTeam : match.awayTeam}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Goal Scorer</label>
              <Select
                value={goalForm.playerId}
                onValueChange={(value) => setGoalForm({ ...goalForm, playerId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select player" />
                </SelectTrigger>
                <SelectContent>
                  {(goalForm.team === "home" ? homeTeamPlayers : awayTeamPlayers).map((player) => (
                    <SelectItem key={player.id} value={player.id}>
                      {player.name} (#{player.number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Goal Type</label>
              <Select
                value={goalForm.type}
                onValueChange={(value: "goal" | "penalty" | "own_goal") => setGoalForm({ ...goalForm, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="goal">⚽ Regular Goal</SelectItem>
                  <SelectItem value="penalty">🥅 Penalty Goal</SelectItem>
                  <SelectItem value="own_goal">😬 Own Goal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Assist (Optional)</label>
              <Select
                value={goalForm.assistPlayerId}
                onValueChange={(value) => setGoalForm({ ...goalForm, assistPlayerId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select assist player" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No assist</SelectItem>
                  {(goalForm.team === "home" ? homeTeamPlayers : awayTeamPlayers)
                    .filter((p) => p.id !== goalForm.playerId)
                    .map((player) => (
                      <SelectItem key={player.id} value={player.id}>
                        {player.name} (#{player.number})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddGoal} className="flex-1 h-12 text-lg font-bold">
                ⚽ ADD GOAL
              </Button>
              <Button variant="outline" onClick={() => setIsGoalDialogOpen(false)} className="flex-1 h-12">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <MatchTimerDebug />
    </div>
  )
}
