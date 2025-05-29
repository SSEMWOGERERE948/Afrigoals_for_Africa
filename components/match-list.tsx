"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Trophy, Trash2 } from "lucide-react"
import type { Match, League } from "@/app/types"

interface MatchListProps {
  matches: Match[]
  leagues: League[]
  onSelectMatch: (matchId: string) => void
  onDeleteMatch: (matchId: string) => Promise<void>
}

export default function MatchList({ matches, leagues, onSelectMatch, onDeleteMatch }: MatchListProps) {
  const getLeagueName = (leagueId: string) => {
    return leagues.find((l) => l.id === leagueId)?.name || leagueId
  }

  const handleDeleteMatch = async (id: string) => {
    if (!confirm("Are you sure you want to delete this match?")) return
    try {
      await onDeleteMatch(id)
    } catch (error) {
      console.error("Failed to delete match:", error)
      alert("Failed to delete match.")
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Scheduled Matches</h2>
      {matches.length === 0 ? (
        <p className="text-muted-foreground">No matches scheduled yet.</p>
      ) : (
        <div className="space-y-3">
          {matches.map((match) => (
            <div key={match.id} className="border rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="font-semibold">{match.homeTeam}</div>
                  <div className="text-sm text-muted-foreground">vs</div>
                  <div className="font-semibold">{match.awayTeam}</div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Trophy className="h-4 w-4" />
                  {getLeagueName(match.league)}
                  <Calendar className="h-4 w-4 ml-2" />
                  {match.date}
                  <Clock className="h-4 w-4 ml-2" />
                  {match.time}
                  <MapPin className="h-4 w-4 ml-2" />
                  {match.stadium}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={match.status === "Scheduled" ? "secondary" : "default"}>{match.status}</Badge>
                <Button variant="outline" size="sm" onClick={() => onSelectMatch(match.id)}>
                  Set Lineup
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteMatch(match.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
