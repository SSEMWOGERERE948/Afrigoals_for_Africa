"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Loader2, Trophy, Calendar, ArrowLeft, Users, Target } from "lucide-react"
import Image from "next/image"
import type { League, Match } from "@/app/types"
import { fetchLeagues } from "@/components/team_api"
import axios from "axios"
import { fetchMatches } from "@/components/matches_api"

export default function LeagueDetailPage() {
  const params = useParams()
  const router = useRouter()
  const leagueId = params.id as string

  const [league, setLeague] = useState<League | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadLeagueData = async () => {
      setLoading(true)
      setError(null)

      try {
        console.log("🌐 Fetching league data for ID:", leagueId)

        // Fetch all leagues and find the one we need
        const [leagues, allMatches] = await Promise.all([fetchLeagues(), fetchMatches().catch(() => [])])

        console.log("✅ Data fetched:", { leagues: leagues.length, matches: allMatches.length })

        const currentLeague = leagues.find((l) => l.id.toString() === leagueId)
        console.log("🔍 Looking for league with ID:", leagueId)
        console.log(
          "📋 Available league IDs:",
          leagues.map((l) => l.id),
        )

        if (!currentLeague) {
          throw new Error(`League with ID ${leagueId} not found`)
        }

        setLeague(currentLeague)
        console.log("✅ League loaded:", currentLeague.name)

        // Filter matches for this league
        const leagueMatches = allMatches.filter((match) => match.league === leagueId)
        setMatches(leagueMatches)
        console.log("✅ League matches loaded:", leagueMatches.length)
      } catch (err) {
        console.error("❌ Failed to load league data:", err)
        if (axios.isAxiosError(err)) {
          console.error("📡 API Error details:", {
            status: err.response?.status,
            statusText: err.response?.statusText,
            data: err.response?.data,
            url: err.config?.url,
          })
          setError(`API Error: ${err.response?.status} - ${err.response?.statusText || err.message}`)
        } else {
          setError(err instanceof Error ? err.message : "Failed to load league data")
        }
      } finally {
        setLoading(false)
      }
    }

    if (leagueId) {
      loadLeagueData()
    }
  }, [leagueId])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading league data...</span>
        </div>
      </div>
    )
  }

  if (error || !league) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2 text-red-600">Error Loading League</h2>
          <p className="text-muted-foreground mb-4">{error || "League not found"}</p>
          <Button onClick={() => router.push("/leagues")} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Leagues
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <div className="mb-6">
        <Button variant="outline" size="sm" onClick={() => router.push("/leagues")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Leagues
        </Button>
      </div>

      {/* League Header */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="relative h-32 w-32 md:h-40 md:w-40">
            {league.logo ? (
              <Image src={league.logo || "/placeholder.svg"} alt={league.name} fill className="object-contain" />
            ) : (
              <div className="w-full h-full bg-muted rounded flex items-center justify-center">
                <Trophy className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">{league.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant={
                      league.country.toLowerCase() === "africa" ||
                      league.name.toLowerCase().includes("champions") ||
                      league.name.toLowerCase().includes("cup")
                        ? "default"
                        : "secondary"
                    }
                  >
                    {league.country.toLowerCase() === "africa" ||
                    league.name.toLowerCase().includes("champions") ||
                    league.name.toLowerCase().includes("cup")
                      ? "Continental"
                      : "Domestic"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{league.country}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Season {league.season}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{league.teams} teams</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span>Matchday {league.currentMatchday}</span>
                </div>
              </div>

              <div className="bg-accent/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">League Info</h3>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div>
                    <div className="text-2xl font-bold">{matches.length}</div>
                    <div className="text-xs text-muted-foreground">Matches</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{matches.filter((m) => m.status === "Finished").length}</div>
                    <div className="text-xs text-muted-foreground">Completed</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* League Content */}
      <Tabs defaultValue="matches">
        <TabsList className="mb-6">
          <TabsTrigger value="matches">Matches</TabsTrigger>
          <TabsTrigger value="table">Table</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="matches">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Matches
              </h2>
              <Badge variant="outline">{matches.length} Total</Badge>
            </div>

            {matches.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No matches found for this league.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {matches.map((match) => (
                  <div key={match.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="font-semibold">{match.homeTeam}</div>
                          <div className="text-sm text-muted-foreground">vs</div>
                          <div className="font-semibold">{match.awayTeam}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            {match.homeScore ?? 0} - {match.awayScore ?? 0}
                          </div>
                          <Badge
                            variant={
                              match.status === "Live"
                                ? "destructive"
                                : match.status === "Finished"
                                  ? "secondary"
                                  : "default"
                            }
                          >
                            {match.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <div>{match.date}</div>
                        <div>{match.time}</div>
                        {match.stadium && <div>{match.stadium}</div>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="table">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              League Table
            </h2>

            <div className="text-center py-8">
              <p className="text-muted-foreground">League table will be calculated based on match results.</p>
              <p className="text-sm text-muted-foreground mt-2">Complete some matches to see the standings here.</p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Target className="h-5 w-5" />
              League Statistics
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-4">Match Statistics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Matches:</span>
                    <span className="font-medium">{matches.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completed:</span>
                    <span className="font-medium text-green-600">
                      {matches.filter((m) => m.status === "Finished").length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Scheduled:</span>
                    <span className="font-medium text-blue-600">
                      {matches.filter((m) => m.status === "Scheduled").length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Live:</span>
                    <span className="font-medium text-red-600">
                      {matches.filter((m) => m.status === "Live").length}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">League Progress</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Season Progress</span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round((matches.filter((m) => m.status === "Finished").length / matches.length) * 100) ||
                          0}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div
                        className="bg-primary h-2.5 rounded-full"
                        style={{
                          width: `${
                            Math.round(
                              (matches.filter((m) => m.status === "Finished").length / matches.length) * 100,
                            ) || 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <span>Current Matchday:</span>
                    <span className="font-medium">{league.currentMatchday}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Teams:</span>
                    <span className="font-medium">{league.teams}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Season:</span>
                    <span className="font-medium">{league.season}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
