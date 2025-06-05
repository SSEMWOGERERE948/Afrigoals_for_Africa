"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Target, Wifi, WifiOff } from "lucide-react"
import type { Match, Goal, MatchEvent } from "@/app/types"
import { fetchMatch, fetchMatchEvents, fetchMatchGoals } from "./matches_api"

interface LiveMatchDisplayProps {
  matchId: string
  refreshInterval?: number
}

export default function LiveMatchDisplay({ matchId, refreshInterval = 3000 }: LiveMatchDisplayProps) {
  const [match, setMatch] = useState<Match | null>(null)
  const [goals, setGoals] = useState<Goal[]>([])
  const [events, setEvents] = useState<MatchEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    const loadMatchData = async () => {
      try {
        setIsConnected(true)
        const [matchData, goalsData, eventsData] = await Promise.all([
          fetchMatch(matchId),
          fetchMatchGoals(matchId),
          fetchMatchEvents(matchId),
        ])

        setMatch(matchData)
        setGoals(goalsData)
        setEvents(eventsData)
        setLastUpdate(new Date())
      } catch (error) {
        console.error("Failed to load match data:", error)
        setIsConnected(false)
      } finally {
        setLoading(false)
      }
    }

    loadMatchData()

    // More frequent polling for live matches (every 3 seconds)
    const interval = setInterval(loadMatchData, refreshInterval)
    return () => clearInterval(interval)
  }, [matchId, refreshInterval])

  if (loading || !match) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <div className="animate-pulse">Loading live match data...</div>
        </div>
      </Card>
    )
  }

  const isLive = match.matchState?.running
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

  const getPeriodColor = () => {
    if (isLive) return "destructive"
    if (period === "Half Time" || period === "Extra Time Break") return "secondary"
    if (period === "Finished") return "outline"
    return "secondary"
  }

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          {isConnected ? (
            <>
              <Wifi className="h-3 w-3 text-green-500" />
              <span>Live</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3 w-3 text-red-500" />
              <span>Connection lost</span>
            </>
          )}
        </div>
        <div>Last update: {lastUpdate.toLocaleTimeString()}</div>
      </div>

      {/* Live Match Header */}
      <Card className={`p-6 ${isLive ? "border-2 border-red-500 shadow-lg" : ""}`}>
        <div className="text-center space-y-4">
          {/* Time and Status */}
          <div className="relative">
            <div className={`text-5xl font-bold mb-2 font-mono ${isLive ? "text-red-600" : "text-gray-600"}`}>
              {getDisplayMinute()}'
            </div>
            <Badge variant={getPeriodColor()} className="text-lg px-4 py-2">
              {period}
            </Badge>
            {isLive && (
              <div className="text-sm text-red-600 mt-2 flex items-center justify-center gap-1">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                <span className="font-bold">LIVE</span>
              </div>
            )}
          </div>

          {/* Score */}
          <div className="text-7xl font-bold font-mono">
            <span className="text-blue-600">{match.homeScore || 0}</span>
            <span className="text-gray-400 mx-4">-</span>
            <span className="text-red-600">{match.awayScore || 0}</span>
          </div>

          {/* Teams */}
          <div className="flex justify-between items-center">
            <div className="text-xl font-bold text-blue-600">{match.homeTeam}</div>
            <div className="text-sm text-muted-foreground font-semibold">vs</div>
            <div className="text-xl font-bold text-red-600">{match.awayTeam}</div>
          </div>

          {/* Match Info */}
          <div className="text-sm text-muted-foreground">
            {match.date} • {match.venue}
          </div>
        </div>
      </Card>

      {/* Goals */}
      {goals.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Goals ({goals.length})
          </h3>
          <div className="space-y-3">
            {goals
              .sort((a, b) => a.minute - b.minute)
              .map((goal) => (
                <div key={goal.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant={goal.team === "home" ? "default" : "secondary"} className="font-bold">
                      {goal.team === "home" ? match.homeTeam : match.awayTeam}
                    </Badge>
                    <div className="flex flex-col">
                      <span className="font-bold text-lg">{goal.playerName}</span>
                      {goal.assistPlayerName && (
                        <span className="text-sm text-muted-foreground">assist: {goal.assistPlayerName}</span>
                      )}
                    </div>
                    {goal.type !== "goal" && (
                      <Badge variant="outline" className="text-xs">
                        {goal.type === "penalty" ? "Penalty" : "Own Goal"}
                      </Badge>
                    )}
                  </div>
                  <div className="text-lg font-bold text-green-600">{goal.minute}'</div>
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
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {events
              .slice(-10)
              .reverse()
              .map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 text-sm border-l-4 border-blue-200 bg-blue-50 rounded"
                >
                  <div className="flex items-center gap-2">
                    {event.type === "goal" && "⚽"}
                    {event.type === "yellow_card" && "🟨"}
                    {event.type === "red_card" && "🟥"}
                    {event.type === "substitution" && "🔄"}
                    {event.type === "kick_off" && "🏁"}
                    {event.type === "final_whistle" && "🏁"}
                    <span className="font-medium">{event.description}</span>
                  </div>
                  <span className="font-bold text-green-600">{event.minute}'</span>
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* Live Status Indicator */}
      {isLive && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-center justify-center gap-2 text-red-700">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="font-bold">MATCH IN PROGRESS</span>
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          </div>
        </Card>
      )}
    </div>
  )
}
