"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Pause,
  Play,
  RotateCcw,
  Trophy,
  ArrowUpDown,
  AlertTriangle,
  Timer,
  Loader2,
  RefreshCw,
  Check,
  Clock,
} from "lucide-react"
import type { Match, MatchState, Goal, Player, MatchEvent, MatchStateUpdatePayload } from "@/app/types"
import {
  fetchLiveState,
  fetchMatchGoals,
  fetchMatchEvents,
  updateMatchState,
  addMatchEvent,
  addGoal,
  deleteGoal,
  deleteMatchEvent,
  resetMatchState,
} from "./matches_api"

interface LiveMatchControlProps {
  match: Match
  homeTeamPlayers: Player[]
  awayTeamPlayers: Player[]
  onMatchUpdate: (updatedMatch: Match) => void
}

export default function SimplifiedLiveMatchControl({
  match,
  homeTeamPlayers,
  awayTeamPlayers,
  onMatchUpdate,
}: LiveMatchControlProps) {
  const [currentMatch, setCurrentMatch] = useState<Match>(match)
  const [matchState, setMatchState] = useState<MatchState | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingEvents, setIsLoadingEvents] = useState(false)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")

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

  const [matchGoals, setMatchGoals] = useState<Goal[]>([])
  const [matchEvents, setMatchEvents] = useState<MatchEvent[]>([])

  // Periodic state refresh - polls backend every 5 seconds for live matches
  useEffect(() => {
    const refreshMatchState = async () => {
      try {
        const liveState = await fetchLiveState(match.id)
        setCurrentMatch(liveState)
        setMatchState(liveState.matchState || null)
        onMatchUpdate(liveState)
      } catch (error) {
        console.error("Failed to refresh match state:", error)
      }
    }

    // Initial load
    refreshMatchState()

    // Set up polling for live matches
    const shouldPoll = currentMatch?.status === "Live" || matchState?.status === "Live"
    if (shouldPoll) {
      const interval = setInterval(refreshMatchState, 5000) // Poll every 5 seconds
      return () => clearInterval(interval)
    }
  }, [match.id, currentMatch?.status, matchState?.status, onMatchUpdate])

  // Load match goals and events
  const loadMatchData = useCallback(async () => {
    try {
      setIsLoadingEvents(true)
      setError("")
      const [goals, events] = await Promise.all([fetchMatchGoals(match.id), fetchMatchEvents(match.id)])
      setMatchGoals(goals || [])
      setMatchEvents(events || [])
    } catch (error) {
      console.error("Failed to load match data:", error)
      setError("Failed to fetch match data from server")
    } finally {
      setIsLoadingEvents(false)
    }
  }, [match.id])

  useEffect(() => {
    loadMatchData()
  }, [loadMatchData])

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("")
        setSuccess("")
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, success])

  const showNotification = useCallback((message: string) => {
    setSuccess(message)
  }, [])

  const pauseMatch = async () => {
    try {
      setIsSaving(true)
      const payload: MatchStateUpdatePayload = {
        running: false,
        status: matchState?.status || "Live",
        currentMinute: matchState?.currentMinute || 0,
        elapsedSeconds: matchState?.elapsedSeconds || 0,
        period: matchState?.period || "First Half",
        addedTime: matchState?.addedTime || { firstHalf: 0, secondHalf: 0, extraTimeFirst: 0, extraTimeSecond: 0 },
        homeScore: currentMatch.homeScore,
        awayScore: currentMatch.awayScore,
      }

      const updatedMatch = await updateMatchState(match.id, payload)
      setCurrentMatch(updatedMatch)
      onMatchUpdate(updatedMatch)
      showNotification("Match paused")
    } catch (error) {
      console.error("Failed to pause match:", error)
      setError("Failed to pause match")
    } finally {
      setIsSaving(false)
    }
  }

  const resumeMatch = async () => {
    try {
      setIsSaving(true)
      const payload: MatchStateUpdatePayload = {
        running: true,
        status: matchState?.status || "Live",
        currentMinute: matchState?.currentMinute || 0,
        elapsedSeconds: matchState?.elapsedSeconds || 0,
        period: matchState?.period || "First Half",
        addedTime: matchState?.addedTime || { firstHalf: 0, secondHalf: 0, extraTimeFirst: 0, extraTimeSecond: 0 },
        homeScore: currentMatch.homeScore,
        awayScore: currentMatch.awayScore,
      }

      const updatedMatch = await updateMatchState(match.id, payload)
      setCurrentMatch(updatedMatch)
      onMatchUpdate(updatedMatch)
      showNotification("Match resumed")
    } catch (error) {
      console.error("Failed to resume match:", error)
      setError("Failed to resume match")
    } finally {
      setIsSaving(false)
    }
  }

  const resetMatch = async () => {
    if (confirm("Are you sure you want to reset the match? This will clear all events and scores.")) {
      try {
        setIsSaving(true)
        const resetMatch = await resetMatchState(match.id)
        setCurrentMatch(resetMatch)
        setMatchState(null)
        onMatchUpdate(resetMatch)
        setMatchGoals([])
        setMatchEvents([])
        showNotification("Match reset successfully!")
      } catch (error) {
        console.error("Failed to reset match:", error)
        setError("Failed to reset match")
      } finally {
        setIsSaving(false)
      }
    }
  }

  const handleAddGoal = async (
    playerId: string,
    playerName: string,
    team: "home" | "away",
    assistId?: string,
    assistName?: string,
    goalType: Goal["type"] = "goal",
  ) => {
    try {
      setError("")
      setIsSaving(true)
      const newGoal: Omit<Goal, "id"> = {
        matchId: currentMatch.id,
        playerId,
        playerName,
        team,
        minute: matchState?.elapsedSeconds || 0, // Use total seconds from current state
        type: goalType,
        assistPlayerId: assistId,
        assistPlayerName: assistName,
      }

      await addGoal(currentMatch.id, newGoal)
      await addMatchEvent(currentMatch.id, {
        type: "goal",
        minute: matchState?.elapsedSeconds || 0,
        team,
        playerId,
        playerName,
        description: `Goal by ${playerName}`,
      })

      loadMatchData() // Refresh data
      setSuccess(`Goal by ${playerName} saved successfully!`)
    } catch (error) {
      console.error("Failed to add goal:", error)
      setError("Failed to record goal")
    } finally {
      setIsSaving(false)
    }
  }

  const addEvent = async (
    type: MatchEvent["type"],
    team?: "home" | "away",
    description?: string,
    playerId?: string,
    playerName?: string,
    additionalInfo?: MatchEvent["additionalInfo"],
  ) => {
    try {
      setError("")
      setIsSaving(true)
      const newEvent: Omit<MatchEvent, "id"> = {
        matchId: currentMatch.id,
        type,
        minute: matchState?.elapsedSeconds || 0,
        team,
        playerId,
        playerName,
        description: description || `${type} event`,
        additionalInfo,
      }

      await addMatchEvent(currentMatch.id, newEvent)
      loadMatchData()
      setSuccess("Match event saved successfully")
    } catch (error) {
      console.error("Failed to add match event:", error)
      setError("Failed to record event")
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
      await addEvent("substitution", team, description, playerOutId, playerOutName, {
        playerInId,
        playerInName,
        playerOutId,
        playerOutName,
      })
      setSuccess(`Substitution recorded: ${playerInName} in for ${playerOutName}`)
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
      await addEvent("timeout", team, description, undefined, undefined, {
        timeoutDuration: 60,
        timeoutReason: "tactical",
      })
      setSuccess(`Timeout recorded for ${teamName}`)
    } catch (error) {
      console.error("Failed to add timeout:", error)
      setError("Failed to record timeout")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteGoal = async (goalId: string) => {
    try {
      setIsSaving(true)
      const updatedMatch = await deleteGoal(currentMatch.id, goalId)
      setCurrentMatch(updatedMatch)
      onMatchUpdate(updatedMatch)
      loadMatchData()
      setSuccess("Goal deleted successfully!")
    } catch (error) {
      console.error("Failed to delete goal:", error)
      setError("Failed to delete goal")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    try {
      setIsSaving(true)
      await deleteMatchEvent(currentMatch.id, eventId)
      loadMatchData()
      setSuccess("Event deleted successfully!")
    } catch (error) {
      console.error("Failed to delete event:", error)
      setError("Failed to delete event")
    } finally {
      setIsSaving(false)
    }
  }

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getTimeDisplay = () => {
    // If we have match state with elapsed seconds, use that (live match)
    if (matchState?.elapsedSeconds !== undefined && matchState.elapsedSeconds > 0) {
      return formatTime(matchState.elapsedSeconds)
    }

    // If match hasn't started yet, show countdown or scheduled time
    if (currentMatch?.date && currentMatch?.time && matchState?.status === "Scheduled") {
      const now = new Date()
      const matchDateTime = new Date(`${currentMatch.date}T${currentMatch.time}`)
      const timeDiff = matchDateTime.getTime() - now.getTime()

      if (timeDiff > 0) {
        // Show countdown to match start
        const hoursLeft = Math.floor(timeDiff / (1000 * 60 * 60))
        const minutesLeft = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
        const secondsLeft = Math.floor((timeDiff % (1000 * 60)) / 1000)

        if (hoursLeft > 0) {
          return `${hoursLeft}h ${minutesLeft}m`
        } else if (minutesLeft > 0) {
          return `${minutesLeft}m ${secondsLeft}s`
        } else {
          return `${secondsLeft}s`
        }
      }
    }

    return "00:00"
  }

  const getMatchStatus = () => {
    if (!matchState) {
      // Check if match should have started based on scheduled time
      if (currentMatch?.date && currentMatch?.time) {
        const now = new Date()
        const matchDateTime = new Date(`${currentMatch.date}T${currentMatch.time}`)
        const timeDiff = matchDateTime.getTime() - now.getTime()

        if (timeDiff > 0) {
          return "Scheduled"
        } else {
          return "Starting Soon"
        }
      }
      return currentMatch?.status || "Scheduled"
    }

    if (matchState.status === "Finished") return "Finished"
    if (matchState.running) return `LIVE - ${matchState.period}`

    // Paused or natural break
    return `${matchState.period} (Paused)`
  }

  const getStatusBadgeVariant = () => {
    if (matchState?.running) return "destructive" // Red for live
    if (matchState?.status === "Live" && !matchState.running) return "default" // Blue for paused
    if (matchState?.status === "Finished") return "secondary" // Gray for finished
    return "outline" // Default for scheduled
  }

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    // Only run real-time updates for live matches or countdown for scheduled matches
    if (matchState?.running || (matchState?.status === "Scheduled" && currentMatch?.date && currentMatch?.time)) {
      interval = setInterval(() => {
        // Force re-render to update time display
        setCurrentMatch((prev) => ({ ...prev }))
      }, 1000) // Update every second
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [matchState?.running, matchState?.status, currentMatch?.date, currentMatch?.time])

  const canPause = matchState?.running === true
  const canResume = matchState?.running === false && matchState?.status === "Live"

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
          <Check className="h-4 w-4" />
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
              <div className="text-lg font-mono text-muted-foreground mt-1 bg-muted/20 px-3 py-1 rounded">
                {getTimeDisplay()}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {matchState?.period || "Pre-Match"}
                </span>
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground">{currentMatch.awayTeam}</h2>
              <p className="text-sm text-muted-foreground">Away</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={getStatusBadgeVariant()}>{getMatchStatus()}</Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              Minute: {matchState?.currentMinute || Math.floor((matchState?.elapsedSeconds || 0) / 60)}
            </div>
            {matchState?.status === "Scheduled" && currentMatch?.date && currentMatch?.time && (
              <div className="text-xs text-muted-foreground mt-1">
                Starts: {currentMatch.time} on {currentMatch.date}
              </div>
            )}
            {(isSaving || isLoadingEvents) && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                {isSaving ? "Saving..." : "Loading..."}
              </div>
            )}
          </div>
        </div>

        {/* Match Controls - Only pause/resume/reset */}
        <div className="flex items-center justify-center gap-2">
          {canPause && (
            <Button onClick={pauseMatch} className="bg-orange-600 hover:bg-orange-700" disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Pause className="h-4 w-4 mr-2" />}
              Pause Match
            </Button>
          )}
          {canResume && (
            <Button onClick={resumeMatch} className="bg-green-600 hover:bg-green-700" disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
              Resume Match
            </Button>
          )}
          <Button onClick={resetMatch} variant="outline" className="border-input bg-transparent" disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RotateCcw className="h-4 w-4 mr-2" />}
            Reset
          </Button>
        </div>

        <div className="text-center mt-4 text-xs text-muted-foreground">
          {matchState?.status === "Scheduled" ? (
            <>
              Match starts automatically at {currentMatch.time} on {currentMatch.date}
            </>
          ) : matchState?.startTime ? (
            <>Match started at {new Date(matchState.startTime).toLocaleTimeString()}</>
          ) : (
            <>Live match in progress</>
          )}
        </div>
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
              disabled={isSaving}
            >
              Home Goal
            </Button>
            <Button
              size="sm"
              className="w-full bg-red-600 hover:bg-red-700"
              onClick={() => setGoalDialog({ open: true, team: "away" })}
              disabled={isSaving}
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
              disabled={isSaving}
            >
              Yellow Card
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="w-full border-red-500 text-red-700 bg-transparent"
              onClick={() => setCardDialog({ open: true, team: "", type: "red" })}
              disabled={isSaving}
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
              disabled={isSaving}
            >
              Home Sub
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="w-full border-input bg-transparent"
              onClick={() => setSubDialog({ open: true, team: "away", playerOut: "", playerIn: "" })}
              disabled={isSaving}
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
              disabled={isSaving}
            >
              Home Timeout
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="w-full border-input bg-transparent"
              onClick={() => setTimeoutDialog({ open: true, team: "away" })}
              disabled={isSaving}
            >
              Away Timeout
            </Button>
          </div>
        </Card>
      </div>

      {/* Match Events */}
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Match Events</h3>
          <Button
            size="sm"
            variant="outline"
            onClick={loadMatchData}
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
        {!matchEvents || matchEvents.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No events recorded yet.</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {matchEvents
              .slice()
              .reverse()
              .map((event) => (
                <div key={event.id} className="flex items-center gap-3 p-2 border border-border rounded">
                  <Badge variant="outline" className="w-12 text-center">
                    {Math.floor(event.minute / 60)}'
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
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 w-6 p-0 bg-transparent"
                    onClick={() => handleDeleteEvent(event.id)}
                  >
                    🗑️
                  </Button>
                </div>
              ))}
          </div>
        )}
      </Card>

      {/* All the dialog components remain the same */}
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
                  handleAddGoal(playerId, playerName, goalDialog.team as "home" | "away")
                  setGoalDialog({ open: false, team: "" })
                }}
                disabled={isSaving}
              >
                <SelectTrigger className="bg-background border-input">
                  <SelectValue placeholder={isSaving ? "Saving..." : "Select player"} />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {(goalDialog.team === "home" ? homeTeamPlayers : awayTeamPlayers).map((player) => (
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
                    {(cardDialog.team === "home" ? homeTeamPlayers : awayTeamPlayers).map((player) => (
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
              <Label className="text-foreground">Team</Label>
              <Select onValueChange={(value) => setSubDialog({ ...subDialog, team: value as "home" | "away" })}>
                <SelectTrigger className="bg-background border-input">
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="home">{currentMatch.homeTeam}</SelectItem>
                  <SelectItem value="away">{currentMatch.awayTeam}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {subDialog.team && (
              <>
                <div>
                  <Label className="text-foreground">Player Coming Off</Label>
                  <Select onValueChange={(value) => setSubDialog({ ...subDialog, playerOut: value })}>
                    <SelectTrigger className="bg-background border-input">
                      <SelectValue placeholder="Select player coming off" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {(subDialog.team === "home" ? homeTeamPlayers : awayTeamPlayers).map((player) => (
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
                      {(subDialog.team === "home" ? homeTeamPlayers : awayTeamPlayers).map((player) => (
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
              </>
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
            <div>
              <Label className="text-foreground">Team</Label>
              <Select onValueChange={(value) => setTimeoutDialog({ ...timeoutDialog, team: value as "home" | "away" })}>
                <SelectTrigger className="bg-background border-input">
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="home">{currentMatch.homeTeam}</SelectItem>
                  <SelectItem value="away">{currentMatch.awayTeam}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {timeoutDialog.team && (
              <>
                <p className="text-muted-foreground">
                  Record a timeout for {timeoutDialog.team === "home" ? currentMatch.homeTeam : currentMatch.awayTeam}{" "}
                  at minute {Math.floor((matchState?.elapsedSeconds || 0) / 60)}.
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
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
