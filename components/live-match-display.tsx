"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Target } from "lucide-react"
import type { Match, Goal, MatchEvent } from "@/app/types"
import { fetchMatch, fetchMatchEvents, fetchMatchGoals } from "./matches_api"

interface LiveMatchDisplayProps {
  matchId: string
  refreshInterval?: number
}

export default function LiveMatchDisplay({ matchId, refreshInterval = 30000 }: LiveMatchDisplayProps) {
  const [match, setMatch] = useState<Match | null>(null)
  const [goals, setGoals] = useState<Goal[]>([])
  const [events, setEvents] = useState<MatchEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadMatchData = async () => {
      try {
        const [matchData, goalsData, eventsData] = await Promise.all([
          fetchMatch(matchId),
          fetchMatchGoals(matchId),
          fetchMatchEvents(matchId),
        ])

        setMatch(matchData)
        setGoals(goalsData)
        setEvents(eventsData)
      } catch (error) {
        console.error("Failed to load match data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadMatchData()

    // Set up polling for live updates
    const interval = setInterval(loadMatchData, refreshInterval)
    return () => clearInterval(interval)
  }, [matchId, refreshInterval])

  if (loading || !match) {
    return (
      <Card className="p-6">
        <div className="text-center">Loading match data...</div>
      </Card>
    )
  }

  const isLive = match.matchState?.isRunning
  const currentMinute = match.matchState?.currentMinute || 0
  const period = match.matchState?.period || "Scheduled"
  const addedTime = match.matchState?.addedTime || {
    firstHalf: 0,
    secondHalf: 0,
    extraTimeFirst: 0,
    extraTimeSecond: 0,
  }

  const getCurrentAddedTime = () => {
    switch (period) {
      case "First Half":
        return addedTime.firstHalf
      case "Second Half":
        return addedTime.secondHalf
      case "Extra Time First":
        return addedTime.extraTimeFirst
      case "Extra Time Second":
        return addedTime.extraTimeSecond
      default:
        return 0
    }
  }

  const getDisplayMinute = () => {
    const added = getCurrentAddedTime()
    if (added > 0) {
      return `${currentMinute}+${added}`
    }
    return currentMinute.toString()
  }

  return (
    <div className="space-y-4">
      {/* Live Match Header */}
      <Card className="p-6">
        <div className="text-center space-y-4">
          {/* Time and Status */}
          <div>
            <div className="text-4xl font-bold mb-2">{getDisplayMinute()}'</div>
            <Badge variant={isLive ? "destructive" : "secondary"} className="text-lg px-4 py-2">
              {period}
            </Badge>
            {isLive && (
              <div className="text-sm text-green-600 mt-2 flex items-center justify-center gap-1">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                LIVE
              </div>
            )}
          </div>

          {/* Score */}
          <div className="text-6xl font-bold">
            {match.homeScore || 0} - {match.awayScore || 0}
          </div>

          {/* Teams */}
          <div className="flex justify-between items-center">
            <div className="text-xl font-semibold">{match.homeTeam}</div>
            <div className="text-sm text-muted-foreground">vs</div>
            <div className="text-xl font-semibold">{match.awayTeam}</div>
          </div>
        </div>
      </Card>

      {/* Goals */}
      {goals.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Goals
          </h3>
          <div className="space-y-3">
            {goals.map((goal) => (
              <div key={goal.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant={goal.team === "home" ? "default" : "secondary"}>
                    {goal.team === "home" ? match.homeTeam : match.awayTeam}
                  </Badge>
                  <span className="font-medium">{goal.playerName}</span>
                  {goal.assistPlayerName && (
                    <span className="text-sm text-muted-foreground">(assist: {goal.assistPlayerName})</span>
                  )}
                  {goal.type !== "goal" && (
                    <Badge variant="outline" className="text-xs">
                      {goal.type.replace("_", " ")}
                    </Badge>
                  )}
                </div>
                <div className="text-sm font-medium">{goal.minute}'</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Events */}
      {events.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Match Events
          </h3>
          <div className="space-y-2">
            {events
              .slice(-5)
              .reverse()
              .map((event) => (
                <div key={event.id} className="flex items-center justify-between p-2 text-sm">
                  <span>{event.description}</span>
                  <span className="font-medium">{event.minute}'</span>
                </div>
              ))}
          </div>
        </Card>
      )}
    </div>
  )
}
