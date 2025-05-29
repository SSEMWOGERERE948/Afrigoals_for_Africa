"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpDown, Target, AlertTriangle, Square } from "lucide-react"
import type { Match } from "@/app/types"

interface ClientMatchEventsProps {
  match: Match
  homeSubstitutions: any[]
  awaySubstitutions: any[]
}

interface Event {
  time: string
  team: "home" | "away"
  type: "goal" | "yellow_card" | "red_card" | "substitution"
  player: string
  description?: string
}

export default function ClientMatchEvents({ match, homeSubstitutions, awaySubstitutions }: ClientMatchEventsProps) {
  // Create events from substitutions and mock other events
  const substitutionEvents: Event[] = [
    ...homeSubstitutions.map((sub) => ({
      time: `${sub.minute || 60}'`,
      team: "home" as const,
      type: "substitution" as const,
      player: `${sub.playerOut.name} → ${sub.playerIn.name}`,
      description: sub.reason,
    })),
    ...awaySubstitutions.map((sub) => ({
      time: `${sub.minute || 65}'`,
      team: "away" as const,
      type: "substitution" as const,
      player: `${sub.playerOut.name} → ${sub.playerIn.name}`,
      description: sub.reason,
    })),
  ]

  // Mock other events - in a real app, these would come from the API
  const mockEvents: Event[] = [
    { time: "23'", team: "home", type: "goal", player: "John Doe" },
    { time: "45'", team: "away", type: "goal", player: "Jane Smith" },
    { time: "67'", team: "home", type: "goal", player: "Mike Johnson" },
    { time: "78'", team: "away", type: "yellow_card", player: "Sarah Wilson" },
  ]

  // Combine and sort all events by time
  const allEvents = [...substitutionEvents, ...mockEvents].sort((a, b) => {
    const timeA = Number.parseInt(a.time.replace("'", ""))
    const timeB = Number.parseInt(b.time.replace("'", ""))
    return timeA - timeB
  })

  const getEventIcon = (type: string) => {
    switch (type) {
      case "goal":
        return <Target className="h-4 w-4" />
      case "yellow_card":
        return <Square className="h-4 w-4 text-yellow-500" />
      case "red_card":
        return <Square className="h-4 w-4 text-red-500" />
      case "substitution":
        return <ArrowUpDown className="h-4 w-4 text-blue-500" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case "goal":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "yellow_card":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "red_card":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "substitution":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-6">Match Events</h3>

      {allEvents.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No events recorded for this match yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {allEvents.map((event, index) => (
            <div
              key={index}
              className={`flex items-center ${event.team === "home" ? "justify-start" : "justify-end"} mb-4`}
            >
              <div className={`flex items-center ${event.team === "away" && "flex-row-reverse"} gap-3 max-w-md`}>
                <Badge variant="outline" className="text-xs font-mono">
                  {event.time}
                </Badge>

                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg ${getEventColor(event.type)} ${
                    event.team === "away" && "flex-row-reverse"
                  }`}
                >
                  {getEventIcon(event.type)}
                  <div className={`${event.team === "away" && "text-right"}`}>
                    <div className="text-sm font-medium">{event.player}</div>
                    {event.description && <div className="text-xs opacity-75">{event.description}</div>}
                  </div>
                </div>

                <div className={`text-xs text-muted-foreground ${event.team === "away" && "text-right"}`}>
                  {event.team === "home" ? match.homeTeam : match.awayTeam}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Match Score Summary */}
      <div className="mt-8 pt-6 border-t">
        <div className="text-center">
          <div className="text-2xl font-bold mb-2">
            {match.homeScore || 0} - {match.awayScore || 0}
          </div>
          <div className="text-sm text-muted-foreground">
            {match.homeTeam} vs {match.awayTeam}
          </div>
          <Badge variant="secondary" className="mt-2">
            {match.status}
          </Badge>
        </div>
      </div>
    </Card>
  )
}
