"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Play, Pause, Square, Clock, Target, Plus, Minus } from "lucide-react"
import type { Match, MatchState, Goal, Player } from "@/app/types"
import { addGoal, addMatchEvent, updateMatchState } from "./matches_api"

interface LiveMatchControlProps {
  match: Match
  homeTeamPlayers: Player[]
  awayTeamPlayers: Player[]
  onMatchUpdate: (updatedMatch: Match) => void
}

export default function LiveMatchControl({
  match,
  homeTeamPlayers,
  awayTeamPlayers,
  onMatchUpdate,
}: LiveMatchControlProps) {
  const [matchState, setMatchState] = useState<MatchState>({
    status: (match.status as any) || "Scheduled",
    currentMinute: match.currentMinute || 0,
    period: "First Half",
    isRunning: false,
    addedTime: {
      firstHalf: 0,
      secondHalf: 0,
      extraTimeFirst: 0,
      extraTimeSecond: 0,
    },
  })

  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false)
  const [goalForm, setGoalForm] = useState({
    team: "home" as "home" | "away",
    playerId: "",
    type: "goal" as "goal" | "penalty" | "own_goal",
    assistPlayerId: "",
    minute: matchState.currentMinute,
  })

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (matchState.isRunning) {
      intervalRef.current = setInterval(() => {
        setMatchState((prev) => {
          const newMinute = prev.currentMinute + 1
          const updatedState = { ...prev, currentMinute: newMinute }

          // Auto-transition periods
          if (newMinute === 45 && prev.period === "First Half") {
            updatedState.period = "Half Time"
            updatedState.isRunning = false
          } else if (newMinute === 90 && prev.period === "Second Half") {
            updatedState.period = "Finished"
            updatedState.isRunning = false
            updatedState.status = "Finished"
          }

          return updatedState
        })
      }, 60000) // Update every minute (use 1000 for testing - every second)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [matchState.isRunning])

  const startMatch = async () => {
    const newState = {
      ...matchState,
      status: "Live" as const,
      period: "First Half" as const,
      isRunning: true,
      startTime: new Date(),
    }

    setMatchState(newState)
    await saveMatchState(newState)
  }

  const pauseMatch = async () => {
    const newState = { ...matchState, isRunning: false }
    setMatchState(newState)
    await saveMatchState(newState)
  }

  const resumeMatch = async () => {
    const newState = { ...matchState, isRunning: true }
    setMatchState(newState)
    await saveMatchState(newState)
  }

  const startSecondHalf = async () => {
    const newState = {
      ...matchState,
      period: "Second Half" as const,
      currentMinute: 45,
      isRunning: true,
      secondHalfStart: new Date(),
    }

    setMatchState(newState)
    await saveMatchState(newState)
  }

  const startExtraTime = async () => {
    const newState = {
      ...matchState,
      period: "Extra Time First" as const,
      currentMinute: 90,
      isRunning: true,
      extraTimeStart: new Date(),
    }

    setMatchState(newState)
    await saveMatchState(newState)
  }

  const endMatch = async () => {
    const newState = {
      ...matchState,
      status: "Finished" as const,
      period: "Finished" as const,
      isRunning: false,
    }

    setMatchState(newState)
    await saveMatchState(newState)

    // Add full-time event
    await addMatchEvent(match.id, {
      type: "full_time",
      minute: matchState.currentMinute,
      description: "Full Time",
    })
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

  const saveMatchState = async (state: MatchState) => {
    try {
      const updatedMatch = await updateMatchState(match.id, state)
      onMatchUpdate(updatedMatch)
    } catch (error) {
      console.error("Failed to save match state:", error)
    }
  }

  const handleAddGoal = async () => {
    if (!goalForm.playerId) {
      alert("Please select a player")
      return
    }

    const player = [...homeTeamPlayers, ...awayTeamPlayers].find((p) => p.id === goalForm.playerId)
    if (!player) return

    const assistPlayer = goalForm.assistPlayerId
      ? [...homeTeamPlayers, ...awayTeamPlayers].find((p) => p.id === goalForm.assistPlayerId)
      : null

    const goal: Omit<Goal, "id"> = {
      matchId: match.id,
      playerId: goalForm.playerId,
      playerName: player.name,
      team: goalForm.team,
      minute: goalForm.minute,
      type: goalForm.type,
      assistPlayerId: assistPlayer?.id,
      assistPlayerName: assistPlayer?.name,
    }

    try {
      const updatedMatch = await addGoal(match.id, goal)
      onMatchUpdate(updatedMatch)

      // Add goal event
      await addMatchEvent(match.id, {
        type: "goal",
        minute: goalForm.minute,
        team: goalForm.team,
        playerId: goalForm.playerId,
        playerName: player.name,
        description: `Goal by ${player.name}${assistPlayer ? ` (assist: ${assistPlayer.name})` : ""}`,
      })

      setIsGoalDialogOpen(false)
      setGoalForm({
        team: "home",
        playerId: "",
        type: "goal",
        assistPlayerId: "",
        minute: matchState.currentMinute,
      })
    } catch (error) {
      console.error("Failed to add goal:", error)
      alert("Failed to add goal")
    }
  }

  const getDisplayMinute = () => {
    const addedTime = getCurrentAddedTime()
    if (addedTime > 0) {
      return `${matchState.currentMinute}+${addedTime}`
    }
    return matchState.currentMinute.toString()
  }

  const canStart = matchState.status === "Lineup Set" || matchState.status === "Scheduled"
  const canPause = matchState.isRunning
  const canResume = !matchState.isRunning && matchState.status === "Live"
  const canStartSecondHalf = matchState.period === "Half Time"
  const canStartExtraTime = matchState.period === "Finished" && matchState.currentMinute >= 90
  const canEnd = matchState.status === "Live"

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Match Status Display */}
        <div className="text-center">
          <div className="text-4xl font-bold mb-2">{getDisplayMinute()}'</div>
          <Badge variant={matchState.isRunning ? "destructive" : "secondary"} className="text-lg px-4 py-2">
            {matchState.period}
          </Badge>
          {matchState.isRunning && (
            <div className="text-sm text-green-600 mt-2 flex items-center justify-center gap-1">
              <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
              LIVE
            </div>
          )}
        </div>

        {/* Score Display */}
        <div className="text-center">
          <div className="text-3xl font-bold">
            {match.homeScore || 0} - {match.awayScore || 0}
          </div>
          <div className="text-sm text-muted-foreground">
            {match.homeTeam} vs {match.awayTeam}
          </div>
        </div>

        {/* Match Controls */}
        <div className="grid grid-cols-2 gap-4">
          {canStart && (
            <Button onClick={startMatch} className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Start Match
            </Button>
          )}

          {canPause && (
            <Button onClick={pauseMatch} variant="outline" className="flex items-center gap-2">
              <Pause className="h-4 w-4" />
              Pause
            </Button>
          )}

          {canResume && (
            <Button onClick={resumeMatch} className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Resume
            </Button>
          )}

          {canStartSecondHalf && (
            <Button onClick={startSecondHalf} className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Start 2nd Half
            </Button>
          )}

          {canStartExtraTime && (
            <Button onClick={startExtraTime} variant="outline" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Extra Time
            </Button>
          )}

          {canEnd && (
            <Button onClick={endMatch} variant="destructive" className="flex items-center gap-2">
              <Square className="h-4 w-4" />
              End Match
            </Button>
          )}
        </div>

        {/* Added Time Controls */}
        {matchState.status === "Live" && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Added Time: {getCurrentAddedTime()} min</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addAddedTime(-1)}
                  disabled={getCurrentAddedTime() === 0}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => addAddedTime(1)}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Goal Controls */}
        <div className="border-t pt-4">
          <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full flex items-center gap-2">
                <Target className="h-4 w-4" />
                Add Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Goal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Team</label>
                  <Select
                    value={goalForm.team}
                    onValueChange={(value: "home" | "away") => setGoalForm({ ...goalForm, team: value })}
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
                    onValueChange={(value: "goal" | "penalty" | "own_goal") =>
                      setGoalForm({ ...goalForm, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="goal">Goal</SelectItem>
                      <SelectItem value="penalty">Penalty</SelectItem>
                      <SelectItem value="own_goal">Own Goal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Minute</label>
                  <Input
                    type="number"
                    value={goalForm.minute}
                    onChange={(e) => setGoalForm({ ...goalForm, minute: Number.parseInt(e.target.value) })}
                    min="0"
                    max="120"
                  />
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
                  <Button onClick={handleAddGoal} className="flex-1">
                    Add Goal
                  </Button>
                  <Button variant="outline" onClick={() => setIsGoalDialogOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Card>
  )
}
