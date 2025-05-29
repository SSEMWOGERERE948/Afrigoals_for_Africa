"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, Trophy } from "lucide-react"
import type { Match, Team } from "@/app/types"
import { fetchAllTeams } from "@/components/team_api"
import { fetchMatches } from "../matches_api"

interface ClientLeagueTableProps {
  match: Match
}

interface TeamStats {
  team: Team
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
}

export default function ClientLeagueTable({ match }: ClientLeagueTableProps) {
  const [leagueTable, setLeagueTable] = useState<TeamStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const calculateLeagueTable = async () => {
      setLoading(true)
      setError(null)

      try {
        console.log("🏆 Calculating league table for league:", match.league)

        // Fetch all teams and matches
        const [allTeams, allMatches] = await Promise.all([fetchAllTeams(), fetchMatches()])

        // Filter matches for this specific league
        const leagueMatches = allMatches.filter((m) => m.league === match.league)
        console.log("📊 League matches found:", leagueMatches.length)

        if (leagueMatches.length === 0) {
          setLeagueTable([])
          setLoading(false)
          return
        }

        // Get all teams that have played in this league
        const teamsInLeague = new Set<string>()
        leagueMatches.forEach((m) => {
          teamsInLeague.add(m.homeTeam)
          teamsInLeague.add(m.awayTeam)
        })

        console.log("👥 Teams in league:", Array.from(teamsInLeague))

        // Find team objects for teams in this league
        const leagueTeamObjects = allTeams.filter((team) => teamsInLeague.has(team.name))

        // Validate team types - ensure no mixing of national and club teams in league play
        const teamTypes = leagueTeamObjects.map((team) => team.teamType)
        const hasClubTeams = teamTypes.includes("club")
        const hasNationalTeams = teamTypes.includes("national")

        if (hasClubTeams && hasNationalTeams) {
          console.warn("⚠️ Mixed team types detected in league - this should only happen in friendlies")
          // For mixed leagues (friendlies), we'll still show the table but with a warning
        }

        // Calculate stats for each team
        const teamStats: TeamStats[] = leagueTeamObjects.map((team) => {
          const stats = {
            team,
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            goalDifference: 0,
            points: 0,
          }

          // Calculate stats from completed matches only
          const teamMatches = leagueMatches.filter(
            (m) =>
              (m.homeTeam === team.name || m.awayTeam === team.name) &&
              m.status === "Finished" &&
              m.homeScore !== null &&
              m.awayScore !== null,
          )

          teamMatches.forEach((m) => {
            const isHome = m.homeTeam === team.name
            const teamScore = isHome ? m.homeScore! : m.awayScore!
            const opponentScore = isHome ? m.awayScore! : m.homeScore!

            stats.played++
            stats.goalsFor += teamScore
            stats.goalsAgainst += opponentScore

            if (teamScore > opponentScore) {
              stats.won++
              stats.points += 3
            } else if (teamScore === opponentScore) {
              stats.drawn++
              stats.points += 1
            } else {
              stats.lost++
            }
          })

          stats.goalDifference = stats.goalsFor - stats.goalsAgainst
          return stats
        })

        // Sort by points (desc), then goal difference (desc), then goals for (desc)
        teamStats.sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points
          if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference
          return b.goalsFor - a.goalsFor
        })

        console.log("📈 League table calculated:", teamStats.length, "teams")
        setLeagueTable(teamStats)
      } catch (err) {
        console.error("❌ Error calculating league table:", err)
        setError(err instanceof Error ? err.message : "Failed to calculate league table")
      } finally {
        setLoading(false)
      }
    }

    calculateLeagueTable()
  }, [match.league])

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Calculating league table...</span>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">League Table</h3>
        <div className="text-center py-8">
          <p className="text-red-600 mb-2">Error loading league table</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </Card>
    )
  }

  if (leagueTable.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">League Table</h3>
        <div className="text-center py-8">
          <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-2">No league table available</p>
          <p className="text-sm text-muted-foreground">Complete some matches in this league to see the standings</p>
        </div>
      </Card>
    )
  }

  // Check if this is a mixed league (friendlies)
  const teamTypes = leagueTable.map((stat) => stat.team.teamType)
  const isMixedLeague = teamTypes.includes("club") && teamTypes.includes("national")

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">League Table</h3>
        <div className="flex items-center gap-2">
          {isMixedLeague && (
            <Badge variant="outline" className="text-orange-600 border-orange-600">
              Friendly Tournament
            </Badge>
          )}
          <Badge variant="outline">{leagueTable.length} Teams</Badge>
        </div>
      </div>

      {isMixedLeague && (
        <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
          <p className="text-sm text-orange-800 dark:text-orange-200">
            ⚠️ This appears to be a friendly tournament with mixed team types (club and national teams)
          </p>
        </div>
      )}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Team</TableHead>
              <TableHead className="text-center">P</TableHead>
              <TableHead className="text-center">W</TableHead>
              <TableHead className="text-center">D</TableHead>
              <TableHead className="text-center">L</TableHead>
              <TableHead className="text-center">GF</TableHead>
              <TableHead className="text-center">GA</TableHead>
              <TableHead className="text-center">GD</TableHead>
              <TableHead className="text-center font-bold">Pts</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leagueTable.map((teamStat, index) => (
              <TableRow
                key={teamStat.team.id}
                className={
                  [match.homeTeam, match.awayTeam].includes(teamStat.team.name)
                    ? "bg-accent font-medium"
                    : !isMixedLeague && index < 4
                      ? "bg-green-50 dark:bg-green-950/20"
                      : !isMixedLeague && index >= leagueTable.length - 3
                        ? "bg-red-50 dark:bg-red-950/20"
                        : ""
                }
              >
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{teamStat.team.name}</span>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        teamStat.team.teamType === "club"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-green-50 text-green-700 border-green-200"
                      }`}
                    >
                      {teamStat.team.teamType === "club" ? "Club" : "National"}
                    </Badge>
                    {[match.homeTeam, match.awayTeam].includes(teamStat.team.name) && (
                      <span className="text-xs text-blue-600">●</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">{teamStat.played}</TableCell>
                <TableCell className="text-center">{teamStat.won}</TableCell>
                <TableCell className="text-center">{teamStat.drawn}</TableCell>
                <TableCell className="text-center">{teamStat.lost}</TableCell>
                <TableCell className="text-center">{teamStat.goalsFor}</TableCell>
                <TableCell className="text-center">{teamStat.goalsAgainst}</TableCell>
                <TableCell className="text-center">
                  {teamStat.goalDifference > 0 ? `+${teamStat.goalDifference}` : teamStat.goalDifference}
                </TableCell>
                <TableCell className="text-center font-bold">{teamStat.points}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {!isMixedLeague && leagueTable.length > 4 && (
        <div className="mt-4 text-xs text-muted-foreground">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-200 dark:bg-green-900 rounded"></div>
              <span>Champions League Qualification</span>
            </div>
            {leagueTable.length > 6 && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-200 dark:bg-red-900 rounded"></div>
                <span>Relegation Zone</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-blue-600">●</span>
              <span>Teams in this match</span>
            </div>
          </div>
        </div>
      )}

      {leagueTable.some((stat) => stat.played === 0) && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            ℹ️ Some teams haven't played any completed matches yet. The table will update as matches are finished.
          </p>
        </div>
      )}
    </Card>
  )
}
