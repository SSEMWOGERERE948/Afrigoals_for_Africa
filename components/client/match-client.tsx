"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Team, Player, Match } from "@/app/types"
import { fetchAllTeams } from "@/components/team_api"
import { fetchPlayersByTeamId } from "@/components/player_api"
import { fetchSubstitutions } from "@/components/substitutions_api"
import ClientLineupView from "@/components/client/client-lineup-view"
import ClientMatchStats from "@/components/client/client-match-stats"
import ClientMatchEvents from "@/components/client/client-match-events"
import ClientLeagueTable from "@/components/client/client-league-table"
import ClientMatchFacts from "@/components/client/client-match-facts"
import { fetchMatchWithLineups } from "../matches_api"

interface MatchClientProps {
  match: Match
  allMatches: { [key: string]: Match }
  currentMatchId: string
}

export default function MatchClient({ match, allMatches, currentMatchId }: MatchClientProps) {
  const router = useRouter()
  const [teams, setTeams] = useState<Team[]>([])
  const [homeTeamPlayers, setHomeTeamPlayers] = useState<Player[]>([])
  const [awayTeamPlayers, setAwayTeamPlayers] = useState<Player[]>([])
  const [matchWithLineups, setMatchWithLineups] = useState<any>(null)
  const [homeSubstitutions, setHomeSubstitutions] = useState<any[]>([])
  const [awaySubstitutions, setAwaySubstitutions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadMatchData = async () => {
      if (!match?.id) return

      setLoading(true)
      setError(null)

      try {
        console.log("Loading match data for:", match.id)

        // Load teams data first
        const allTeams = await fetchAllTeams()
        setTeams(allTeams)

        // Find team objects
        const homeTeam = allTeams.find((t) => t.name === match.homeTeam)
        const awayTeam = allTeams.find((t) => t.name === match.awayTeam)

        if (!homeTeam || !awayTeam) {
          throw new Error("Could not find team data")
        }

        // Load match lineups, players, and substitutions in parallel
        const [matchLineups, homePlayers, awayPlayers, substitutions] = await Promise.all([
          fetchMatchWithLineups(match.id).catch(() => null),
          fetchPlayersByTeamId(homeTeam.id),
          fetchPlayersByTeamId(awayTeam.id),
          fetchSubstitutions(match.id).catch(() => []),
        ])

        setMatchWithLineups(matchLineups)
        setHomeTeamPlayers(homePlayers || [])
        setAwayTeamPlayers(awayPlayers || [])

        // Separate substitutions by team
        const homeSubs = substitutions.filter((sub: any) => sub.team === "home")
        const awaySubs = substitutions.filter((sub: any) => sub.team === "away")
        setHomeSubstitutions(homeSubs)
        setAwaySubstitutions(awaySubs)

        console.log("Match data loaded successfully:", {
          homeTeam: homeTeam.name,
          awayTeam: awayTeam.name,
          homePlayers: homePlayers?.length || 0,
          awayPlayers: awayPlayers?.length || 0,
          hasLineups: !!matchLineups,
          substitutions: substitutions.length,
        })
      } catch (err) {
        console.error("Error loading match data:", err)
        setError(err instanceof Error ? err.message : "Failed to load match data")
      } finally {
        setLoading(false)
      }
    }

    loadMatchData()
  }, [match])

  const getTeamData = () => {
    const homeTeam = teams.find((t) => t.name === match.homeTeam)
    const awayTeam = teams.find((t) => t.name === match.awayTeam)
    return { homeTeam, awayTeam }
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading match data...</span>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <div className="text-red-600 mb-2">
            <p>Error loading match data: {error}</p>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Please check the console for more details and ensure your API is running.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </Card>
    )
  }

  return (
    <>
      {/* Match Selection */}
      <div className="mb-6">
        <label htmlFor="match-select" className="block text-sm font-medium mb-2">
          Select Match:
        </label>
        <select
          id="match-select"
          value={currentMatchId}
          onChange={(e) => {
            router.push(`/matches/${e.target.value}`)
          }}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {Object.entries(allMatches || {}).map(([id, matchData]) => (
            <option key={id} value={id}>
              {matchData.homeTeam} vs {matchData.awayTeam} - {matchData.date}
            </option>
          ))}
        </select>
      </div>

      <Tabs defaultValue="lineups">
        <TabsList className="mb-6">
          <TabsTrigger value="lineups">Lineups</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="table">Table</TabsTrigger>
          <TabsTrigger value="facts">Facts</TabsTrigger>
        </TabsList>

        <TabsContent value="lineups">
          <ClientLineupView
            match={match}
            homeTeam={getTeamData().homeTeam}
            awayTeam={getTeamData().awayTeam}
            homeTeamPlayers={homeTeamPlayers}
            awayTeamPlayers={awayTeamPlayers}
            matchWithLineups={matchWithLineups}
            homeSubstitutions={homeSubstitutions}
            awaySubstitutions={awaySubstitutions}
          />
        </TabsContent>

        <TabsContent value="stats">
          <ClientMatchStats match={match} />
        </TabsContent>

        <TabsContent value="events">
          <ClientMatchEvents
            match={match}
            homeSubstitutions={homeSubstitutions}
            awaySubstitutions={awaySubstitutions}
          />
        </TabsContent>

        <TabsContent value="table">
          <ClientLeagueTable match={match} />
        </TabsContent>

        <TabsContent value="facts">
          <ClientMatchFacts match={match} />
        </TabsContent>
      </Tabs>
    </>
  )
}
