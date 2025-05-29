"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Users } from "lucide-react"
import type { Team, Player, Match } from "@/app/types"
import ClientFieldDisplay from "@/components/client/client-field-display"

interface ClientLineupViewProps {
  match: Match
  homeTeam?: Team
  awayTeam?: Team
  homeTeamPlayers: Player[]
  awayTeamPlayers: Player[]
  matchWithLineups: any
  homeSubstitutions: any[]
  awaySubstitutions: any[]
}

export default function ClientLineupView({
  match,
  homeTeam,
  awayTeam,
  homeTeamPlayers,
  awayTeamPlayers,
  matchWithLineups,
  homeSubstitutions,
  awaySubstitutions,
}: ClientLineupViewProps) {
  const getLineupData = (team: "home" | "away") => {
    const lineup = team === "home" ? matchWithLineups?.homeLineup : matchWithLineups?.awayLineup
    const teamData = team === "home" ? homeTeam : awayTeam
    const allPlayers = team === "home" ? homeTeamPlayers : awayTeamPlayers

    if (!lineup) {
      return {
        formation: "4-4-2",
        startingXI: [],
        substitutes: [],
        coach: teamData?.manager || "Unknown Manager",
        allPlayers,
      }
    }

    return {
      formation: lineup.formation || "4-4-2",
      startingXI: lineup.startingXI || [],
      substitutes: lineup.substitutes || [],
      coach: lineup.coach || teamData?.manager || "Unknown Manager",
      allPlayers,
    }
  }

  const homeLineup = getLineupData("home")
  const awayLineup = getLineupData("away")

  return (
    <div className="space-y-6">
      {/* Team Information Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Home Team Info */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <div>
              <h3 className="font-semibold text-lg">{match.homeTeam}</h3>
              <Badge variant="default">Home</Badge>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Manager:</span>
              <span className="text-sm">{homeLineup.coach}</span>
            </div>

            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Formation:</span>
              <span className="text-sm">{homeLineup.formation}</span>
            </div>

            <div className="text-sm text-muted-foreground">
              Starting XI: {homeLineup.startingXI.length}/11 | Substitutes: {homeLineup.substitutes.length}/7
            </div>

            {homeSubstitutions.length > 0 && (
              <div className="text-sm text-muted-foreground">Substitutions made: {homeSubstitutions.length}/5</div>
            )}
          </div>
        </Card>

        {/* Away Team Info */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <div>
              <h3 className="font-semibold text-lg">{match.awayTeam}</h3>
              <Badge variant="secondary">Away</Badge>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Manager:</span>
              <span className="text-sm">{awayLineup.coach}</span>
            </div>

            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Formation:</span>
              <span className="text-sm">{awayLineup.formation}</span>
            </div>

            <div className="text-sm text-muted-foreground">
              Starting XI: {awayLineup.startingXI.length}/11 | Substitutes: {awayLineup.substitutes.length}/7
            </div>

            {awaySubstitutions.length > 0 && (
              <div className="text-sm text-muted-foreground">Substitutions made: {awaySubstitutions.length}/5</div>
            )}
          </div>
        </Card>
      </div>

      {/* Field Displays */}
      <div className="grid lg:grid-cols-2 gap-6">
        <ClientFieldDisplay
          formation={homeLineup.formation}
          startingXI={homeLineup.startingXI}
          substitutes={homeLineup.substitutes}
          teamName={match.homeTeam}
          manager={homeLineup.coach}
          isHome={true}
          substitutions={homeSubstitutions}
        />

        <ClientFieldDisplay
          formation={awayLineup.formation}
          startingXI={awayLineup.startingXI}
          substitutes={awayLineup.substitutes}
          teamName={match.awayTeam}
          manager={awayLineup.coach}
          isHome={false}
          substitutions={awaySubstitutions}
        />
      </div>

      {/* Substitutes Lists */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Home Substitutes */}
        <Card className="p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <Users className="h-4 w-4" />
            {match.homeTeam} - Substitutes ({homeLineup.substitutes.length}/7)
          </h4>
          <div className="space-y-2">
            {homeLineup.substitutes.length > 0 ? (
              homeLineup.substitutes.map((player: Player) => (
                <div key={player.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <span className="text-sm">
                    {player.name} (#{player.number}) - {player.position?.name || "No Position"}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No substitutes selected</p>
            )}
          </div>
        </Card>

        {/* Away Substitutes */}
        <Card className="p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <Users className="h-4 w-4" />
            {match.awayTeam} - Substitutes ({awayLineup.substitutes.length}/7)
          </h4>
          <div className="space-y-2">
            {awayLineup.substitutes.length > 0 ? (
              awayLineup.substitutes.map((player: Player) => (
                <div key={player.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <span className="text-sm">
                    {player.name} (#{player.number}) - {player.position?.name || "No Position"}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No substitutes selected</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
