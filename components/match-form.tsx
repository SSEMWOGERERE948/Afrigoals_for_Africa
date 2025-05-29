"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Calendar } from "lucide-react"
import type { Team, League, Match } from "@/app/types"

interface MatchFormProps {
  teams: Team[]
  leagues: League[]
  onScheduleMatch: (matchData: Omit<Match, "id">) => Promise<void>
  isLoading: boolean
}

interface MatchFormData {
  league: string
  homeTeamId: string
  awayTeamId: string
  date: string
  time: string
  stadium: string
  referee: string
}

export default function MatchForm({ teams, leagues, onScheduleMatch, isLoading }: MatchFormProps) {
  const [matchForm, setMatchForm] = useState<MatchFormData>({
    league: "",
    homeTeamId: "",
    awayTeamId: "",
    date: "",
    time: "",
    stadium: "",
    referee: "",
  })

  const handleScheduleMatch = async () => {
    if (!matchForm.homeTeamId || !matchForm.awayTeamId || !matchForm.date || !matchForm.time || !matchForm.league) {
      alert("Please fill in all required fields")
      return
    }

    if (matchForm.homeTeamId === matchForm.awayTeamId) {
      alert("Home team and away team cannot be the same")
      return
    }

    try {
      const homeTeam = teams.find((t) => t.id === matchForm.homeTeamId)
      const awayTeam = teams.find((t) => t.id === matchForm.awayTeamId)

      const matchData: Omit<Match, "id"> = {
        league: matchForm.league,
        homeTeam: homeTeam?.name || "",
        awayTeam: awayTeam?.name || "",
        date: matchForm.date,
        time: matchForm.time,
        stadium: matchForm.stadium,
        referee: matchForm.referee,
        status: "Scheduled",
        homeScore: null,
        awayScore: null,
      }

      await onScheduleMatch(matchData)

      // Reset form
      setMatchForm({
        league: "",
        homeTeamId: "",
        awayTeamId: "",
        date: "",
        time: "",
        stadium: "",
        referee: "",
      })
    } catch (error) {
      console.error("Failed to schedule match:", error)
      alert("Failed to schedule match. Please try again.")
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Calendar className="h-5 w-5" />
        Schedule New Match
      </h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-sm font-medium mb-1 block">League *</label>
          <Select value={matchForm.league} onValueChange={(val) => setMatchForm({ ...matchForm, league: val })}>
            <SelectTrigger>
              <SelectValue placeholder="Select league" />
            </SelectTrigger>
            <SelectContent>
              {leagues.map((league) => (
                <SelectItem key={league.id} value={league.id}>
                  {league.name} ({league.season})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Stadium</label>
          <Input
            value={matchForm.stadium}
            onChange={(e) => setMatchForm({ ...matchForm, stadium: e.target.value })}
            placeholder="Stadium name"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Home Team *</label>
          <Select value={matchForm.homeTeamId} onValueChange={(val) => setMatchForm({ ...matchForm, homeTeamId: val })}>
            <SelectTrigger>
              <SelectValue placeholder="Select home team" />
            </SelectTrigger>
            <SelectContent>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Away Team *</label>
          <Select value={matchForm.awayTeamId} onValueChange={(val) => setMatchForm({ ...matchForm, awayTeamId: val })}>
            <SelectTrigger>
              <SelectValue placeholder="Select away team" />
            </SelectTrigger>
            <SelectContent>
              {teams
                .filter((team) => team.id !== matchForm.homeTeamId)
                .map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Date *</label>
          <Input
            type="date"
            value={matchForm.date}
            onChange={(e) => setMatchForm({ ...matchForm, date: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Time *</label>
          <Input
            type="time"
            value={matchForm.time}
            onChange={(e) => setMatchForm({ ...matchForm, time: e.target.value })}
          />
        </div>

        <div className="col-span-2">
          <label className="text-sm font-medium mb-1 block">Referee</label>
          <Input
            value={matchForm.referee}
            onChange={(e) => setMatchForm({ ...matchForm, referee: e.target.value })}
            placeholder="Referee name"
          />
        </div>
      </div>

      <Button onClick={handleScheduleMatch} className="w-full" disabled={isLoading}>
        {isLoading ? "Scheduling..." : "Schedule Match"}
      </Button>
    </Card>
  )
}
