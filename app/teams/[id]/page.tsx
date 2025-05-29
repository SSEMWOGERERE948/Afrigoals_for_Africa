"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Trophy, Calendar, MapPin, User, ArrowLeft, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { Team, Player } from "@/app/types"
import { fetchAllTeams } from "@/components/team_api"
import { fetchPlayersByTeamId } from "@/components/player_api"
import axios from "axios"

export default function TeamDetailPage() {
  const params = useParams()
  const router = useRouter()
  const teamId = params.id as string

  const [team, setTeam] = useState<Team | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadTeamData = async () => {
      setLoading(true)
      setError(null)

      try {
        console.log("🌐 Fetching team data for ID:", teamId)

        // Fetch all teams and find the one we need
        const teams = await fetchAllTeams()
        console.log("✅ Teams fetched:", teams.length)

        const currentTeam = teams.find((t) => t.id.toString() === teamId)
        console.log("🔍 Looking for team with ID:", teamId)
        console.log(
          "📋 Available team IDs:",
          teams.map((t) => t.id),
        )

        if (!currentTeam) {
          throw new Error(`Team with ID ${teamId} not found`)
        }

        setTeam(currentTeam)
        console.log("✅ Team loaded:", currentTeam.name)

        // Fetch players for this team
        console.log("👥 Fetching players for team:", teamId)
        const teamPlayers = await fetchPlayersByTeamId(teamId)
        setPlayers(teamPlayers)
        console.log("✅ Players loaded:", teamPlayers.length)
      } catch (err) {
        console.error("❌ Failed to load team data:", err)
        if (axios.isAxiosError(err)) {
          console.error("📡 API Error details:", {
            status: err.response?.status,
            statusText: err.response?.statusText,
            data: err.response?.data,
            url: err.config?.url,
          })
          setError(`API Error: ${err.response?.status} - ${err.response?.statusText || err.message}`)
        } else {
          setError(err instanceof Error ? err.message : "Failed to load team data")
        }
      } finally {
        setLoading(false)
      }
    }

    if (teamId) {
      loadTeamData()
    }
  }, [teamId])

  // Group players by position
  const groupPlayersByPosition = (playersList: Player[]) => {
    const groups: Record<string, Player[]> = {
      Goalkeepers: [],
      Defenders: [],
      Midfielders: [],
      Forwards: [],
      Other: [],
    }

    playersList.forEach((player) => {
      const position = player.position?.name?.toLowerCase() || ""

      if (position.includes("goalkeeper") || position.includes("gk")) {
        groups.Goalkeepers.push(player)
      } else if (position.includes("defender") || position.includes("back")) {
        groups.Defenders.push(player)
      } else if (position.includes("midfielder") || position.includes("mid")) {
        groups.Midfielders.push(player)
      } else if (
        position.includes("forward") ||
        position.includes("striker") ||
        position.includes("winger") ||
        position.includes("attacker")
      ) {
        groups.Forwards.push(player)
      } else {
        groups.Other.push(player)
      }
    })

    return groups
  }

  const playerGroups = groupPlayersByPosition(players)

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading team data...</span>
        </div>
      </div>
    )
  }

  if (error || !team) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2 text-red-600">Error Loading Team</h2>
          <p className="text-muted-foreground mb-4">{error || "Team not found"}</p>
          <Button onClick={() => router.push("/teams")} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Teams
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <div className="mb-6">
        <Button variant="outline" size="sm" onClick={() => router.push("/teams")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Teams
        </Button>
      </div>

      {/* Team Header */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="relative h-32 w-32 md:h-40 md:w-40">
            <Image
              src={team.logo || "/placeholder.svg?height=160&width=160&query=football team logo"}
              alt={team.name}
              fill
              className="object-contain"
            />
          </div>

          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">{team.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={team.teamType === "club" ? "default" : "secondary"}>
                    {team.teamType === "club" ? "Club Team" : "National Team"}
                  </Badge>
                  {team.founded && <span className="text-sm text-muted-foreground">Est. {team.founded}</span>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                {team.league && (
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                    <span>{team.league}</span>
                  </div>
                )}
                {team.stadium && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{team.stadium}</span>
                  </div>
                )}
                {team.manager && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>Manager: {team.manager}</span>
                  </div>
                )}
              </div>

              <div className="bg-accent/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Season Stats</h3>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-2xl font-bold">{team.stats.position}</div>
                    <div className="text-xs text-muted-foreground">Position</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{team.stats.points}</div>
                    <div className="text-xs text-muted-foreground">Points</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{team.stats.played}</div>
                    <div className="text-xs text-muted-foreground">Played</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center mt-2">
                  <div>
                    <div className="text-lg font-semibold text-green-600">{team.stats.won}</div>
                    <div className="text-xs text-muted-foreground">Won</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-yellow-600">{team.stats.drawn}</div>
                    <div className="text-xs text-muted-foreground">Drawn</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-red-600">{team.stats.lost}</div>
                    <div className="text-xs text-muted-foreground">Lost</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Team Content */}
      <Tabs defaultValue="squad">
        <TabsList className="mb-6">
          <TabsTrigger value="squad">Squad</TabsTrigger>
          <TabsTrigger value="matches">Matches</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="squad">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Users className="h-5 w-5" />
                Squad
              </h2>
              <Badge variant="outline">{players.length} Players</Badge>
            </div>

            {players.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No players found for this team.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(playerGroups).map(
                  ([position, positionPlayers]) =>
                    positionPlayers.length > 0 && (
                      <div key={position}>
                        <h3 className="font-semibold mb-3 text-primary">{position}</h3>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-12">#</TableHead>
                                <TableHead>Player</TableHead>
                                <TableHead>Age</TableHead>
                                <TableHead>Nationality</TableHead>
                                <TableHead>Position</TableHead>
                                <TableHead className="text-right">Stats</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {positionPlayers.map((player) => (
                                <TableRow key={player.id}>
                                  <TableCell className="font-medium">{player.number}</TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-3">
                                      <div className="relative h-8 w-8 rounded-full overflow-hidden">
                                        <Image
                                          src={player.image || "/placeholder.svg?height=32&width=32&query=player"}
                                          alt={player.name}
                                          fill
                                          className="object-cover"
                                        />
                                      </div>
                                      <span>{player.name}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>{player.age}</TableCell>
                                  <TableCell>{player.nationality}</TableCell>
                                  <TableCell>{player.position?.name || "Unknown"}</TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <Badge
                                        variant="outline"
                                        className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                      >
                                        {team.teamType === "club"
                                          ? `${player.clubStats?.goals || 0} G`
                                          : `${player.nationalStats?.goals || 0} G`}
                                      </Badge>
                                      <Badge
                                        variant="outline"
                                        className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                      >
                                        {team.teamType === "club"
                                          ? `${player.clubStats?.assists || 0} A`
                                          : `${player.nationalStats?.assists || 0} A`}
                                      </Badge>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    ),
                )}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="matches">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent & Upcoming Matches
            </h2>

            <div className="text-center py-8">
              <p className="text-muted-foreground">Match history will be available soon.</p>
              <Link href="/matches" className="text-primary hover:underline mt-2 inline-block">
                View all matches
              </Link>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Team Statistics
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-4">Season Performance</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Wins</span>
                      <span className="text-sm text-muted-foreground">
                        {team.stats.won} / {team.stats.played}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div
                        className="bg-green-600 h-2.5 rounded-full"
                        style={{ width: `${(team.stats.won / team.stats.played) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Draws</span>
                      <span className="text-sm text-muted-foreground">
                        {team.stats.drawn} / {team.stats.played}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div
                        className="bg-yellow-600 h-2.5 rounded-full"
                        style={{ width: `${(team.stats.drawn / team.stats.played) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Losses</span>
                      <span className="text-sm text-muted-foreground">
                        {team.stats.lost} / {team.stats.played}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div
                        className="bg-red-600 h-2.5 rounded-full"
                        style={{ width: `${(team.stats.lost / team.stats.played) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Goals For</span>
                      <span className="text-sm text-muted-foreground">{team.stats.goalsFor}</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Goals Against</span>
                      <span className="text-sm text-muted-foreground">{team.stats.goalsAgainst}</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Goal Difference</span>
                      <span className="text-sm text-muted-foreground">
                        {team.stats.goalsFor - team.stats.goalsAgainst > 0
                          ? `+${team.stats.goalsFor - team.stats.goalsAgainst}`
                          : team.stats.goalsFor - team.stats.goalsAgainst}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Top Performers</h3>
                {players.length === 0 ? (
                  <p className="text-muted-foreground">No player data available</p>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Top Goalscorers</h4>
                      <div className="space-y-2">
                        {players
                          .sort((a, b) => {
                            const aGoals =
                              team.teamType === "club" ? a.clubStats?.goals || 0 : a.nationalStats?.goals || 0
                            const bGoals =
                              team.teamType === "club" ? b.clubStats?.goals || 0 : b.nationalStats?.goals || 0
                            return bGoals - aGoals
                          })
                          .slice(0, 3)
                          .map((player, index) => (
                            <div key={player.id} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{index + 1}.</span>
                                <span>{player.name}</span>
                              </div>
                              <Badge
                                variant="outline"
                                className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              >
                                {team.teamType === "club"
                                  ? player.clubStats?.goals || 0
                                  : player.nationalStats?.goals || 0}{" "}
                                goals
                              </Badge>
                            </div>
                          ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Top Assisters</h4>
                      <div className="space-y-2">
                        {players
                          .sort((a, b) => {
                            const aAssists =
                              team.teamType === "club" ? a.clubStats?.assists || 0 : a.nationalStats?.assists || 0
                            const bAssists =
                              team.teamType === "club" ? b.clubStats?.assists || 0 : b.nationalStats?.assists || 0
                            return bAssists - aAssists
                          })
                          .slice(0, 3)
                          .map((player, index) => (
                            <div key={player.id} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{index + 1}.</span>
                                <span>{player.name}</span>
                              </div>
                              <Badge
                                variant="outline"
                                className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              >
                                {team.teamType === "club"
                                  ? player.clubStats?.assists || 0
                                  : player.nationalStats?.assists || 0}{" "}
                                assists
                              </Badge>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
