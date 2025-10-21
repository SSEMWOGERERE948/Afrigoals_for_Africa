"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Trophy, Users, Calendar, Play, Clock, MapPin, Search, Filter, AlertTriangle } from "lucide-react"
import type { FutsalLeague, FutsalTeam, FutsalMatch } from "@/app/types"
import { fetchFutsalLeagues } from "@/lib/leagues/api"
import { fetchFutsalTeams } from "@/lib/teams/api"
import { fetchFutsalMatches } from "@/lib/matches/api"

export default function FutsalMatchesPage() {
  const [leagues, setLeagues] = useState<FutsalLeague[]>([])
  const [teams, setTeams] = useState<FutsalTeam[]>([])
  const [matches, setMatches] = useState<FutsalMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Search and filter states
  const [leagueSearchTerm, setLeagueSearchTerm] = useState("")
  const [leagueStatusFilter, setLeagueStatusFilter] = useState<string>("all")
  const [leagueTeamSizeFilter, setLeagueTeamSizeFilter] = useState<string>("all")
  const [teamSearchTerm, setTeamSearchTerm] = useState("")
  const [teamCategoryFilter, setTeamCategoryFilter] = useState<string>("all")
  const [teamSizeFilter, setTeamSizeFilter] = useState<string>("all")
  const [matchSearchTerm, setMatchSearchTerm] = useState("")
  const [matchLeagueFilter, setMatchLeagueFilter] = useState<string>("all")
  const [matchStatusFilter, setMatchStatusFilter] = useState<string>("all")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [leaguesData, teamsData, matchesData] = await Promise.allSettled([
        fetchFutsalLeagues(),
        fetchFutsalTeams(),
        fetchFutsalMatches(),
      ])

      // Handle leagues
      if (leaguesData.status === "fulfilled") {
        setLeagues(leaguesData.value)
      } else {
        console.error("Failed to load leagues:", leaguesData.reason)
      }

      // Handle teams
      if (teamsData.status === "fulfilled") {
        setTeams(teamsData.value)
      } else {
        console.error("Failed to load teams:", teamsData.reason)
      }

      // Handle matches
      if (matchesData.status === "fulfilled") {
        setMatches(matchesData.value)
      } else {
        console.error("Failed to load matches:", matchesData.reason)
      }

      // Set error if all requests failed
      if (leaguesData.status === "rejected" && teamsData.status === "rejected" && matchesData.status === "rejected") {
        setError("Failed to load futsal data. Please check your connection and try again.")
      }
    } catch (error) {
      console.error("Failed to load futsal data:", error)
      setError("An unexpected error occurred while loading data.")
    } finally {
      setLoading(false)
    }
  }

  // Filter functions
  const filteredLeagues = leagues.filter((league) => {
    const matchesSearch =
      leagueSearchTerm === "" ||
      league.name.toLowerCase().includes(leagueSearchTerm.toLowerCase()) ||
      league.description?.toLowerCase().includes(leagueSearchTerm.toLowerCase())
    const matchesStatus = leagueStatusFilter === "all" || league.status === leagueStatusFilter
    const matchesTeamSize = leagueTeamSizeFilter === "all" || league.teamSize.toString() === leagueTeamSizeFilter
    return matchesSearch && matchesStatus && matchesTeamSize
  })

  const filteredTeams = teams.filter((team) => {
    const matchesSearch =
      teamSearchTerm === "" ||
      team.teamName.toLowerCase().includes(teamSearchTerm.toLowerCase()) ||
      team.institution.toLowerCase().includes(teamSearchTerm.toLowerCase()) ||
      team.manager?.toLowerCase().includes(teamSearchTerm.toLowerCase())
    const matchesCategory = teamCategoryFilter === "all" || team.category === teamCategoryFilter
    const matchesTeamSize = teamSizeFilter === "all" || team.preferredTeamSize.toString() === teamSizeFilter
    return matchesSearch && matchesCategory && matchesTeamSize
  })

  const filteredMatches = matches.filter((match) => {
    const matchesSearch =
      matchSearchTerm === "" ||
      match.homeTeam.toLowerCase().includes(matchSearchTerm.toLowerCase()) ||
      match.awayTeam.toLowerCase().includes(matchSearchTerm.toLowerCase()) ||
      match.league.toLowerCase().includes(matchSearchTerm.toLowerCase()) ||
      match.venue.toLowerCase().includes(matchSearchTerm.toLowerCase())
    const matchesLeague = matchLeagueFilter === "all" || match.league === matchLeagueFilter
    const matchesStatus = matchStatusFilter === "all" || match.status === matchStatusFilter
    return matchesSearch && matchesLeague && matchesStatus
  })

  const liveMatches = matches.filter((m) => m.status === "Live")
  const upcomingMatches = matches.filter((m) => m.status === "Scheduled").slice(0, 3)
  const activeLeagues = leagues.filter((l) => l.status === "active")
  const availableLeagues = Array.from(new Set(matches.map((m) => m.league)))

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p>Loading futsal matches...</p>
        </div>
      </div>
    )
  }

  const MatchCard = ({ match }: { match: FutsalMatch }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="text-center min-w-[200px]">
              <p className="font-medium text-lg">{match.homeTeam}</p>
              <div className="flex items-center justify-center gap-2 my-2">
                {match.status === "Live" || match.status === "Finished" ? (
                  <div className="text-2xl font-bold text-orange-600">
                    {match.homeScore} - {match.awayScore}
                  </div>
                ) : (
                  <div className="text-lg text-muted-foreground">vs</div>
                )}
              </div>
              <p className="font-medium text-lg">{match.awayTeam}</p>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">{match.league}</p>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {match.date} at {match.time}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {match.venue}
              </div>
              <p>Referee: {match.referee}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge
              variant={match.status === "Live" ? "destructive" : match.status === "Scheduled" ? "default" : "secondary"}
              className={match.status === "Live" ? "animate-pulse" : ""}
            >
              {match.status === "Live" && "🔴 "}
              {match.status}
            </Badge>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-orange-50 text-orange-700">
                {match.teamSize}-a-side
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                {match.matchDuration}min
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Futsal Matches</h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">Live scores, fixtures, and results</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold">{activeLeagues.length}</div>
                <div className="text-sm opacity-90">Active Leagues</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{teams.length}</div>
                <div className="text-sm opacity-90">Teams</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{matches.length}</div>
                <div className="text-sm opacity-90">Matches</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{liveMatches.length}</div>
                <div className="text-sm opacity-90">Live Now</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button variant="outline" size="sm" onClick={loadData} className="ml-4 bg-transparent">
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Live Matches Alert */}
        {liveMatches.length > 0 && (
          <div className="mb-8">
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
                  Live Matches ({liveMatches.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {liveMatches.map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="leagues">Leagues ({leagues.length})</TabsTrigger>
            <TabsTrigger value="teams">Teams ({teams.length})</TabsTrigger>
            <TabsTrigger value="matches">Matches ({matches.length})</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Active Leagues</p>
                      <p className="text-2xl font-bold">{activeLeagues.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Teams</p>
                      <p className="text-2xl font-bold">{teams.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Matches</p>
                      <p className="text-2xl font-bold">{matches.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Play className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Live Now</p>
                      <p className="text-2xl font-bold">{liveMatches.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Matches */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Upcoming Matches
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingMatches.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No upcoming matches scheduled</p>
                ) : (
                  <div className="space-y-4">
                    {upcomingMatches.map((match) => (
                      <MatchCard key={match.id} match={match} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leagues Tab */}
          <TabsContent value="leagues" className="space-y-6">
            {/* League Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filter Leagues
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search leagues..."
                      value={leagueSearchTerm}
                      onChange={(e) => setLeagueSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={leagueStatusFilter} onValueChange={setLeagueStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={leagueTeamSizeFilter} onValueChange={setLeagueTeamSizeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by team size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Team Sizes</SelectItem>
                      <SelectItem value="5">5-a-side</SelectItem>
                      <SelectItem value="6">6-a-side</SelectItem>
                      <SelectItem value="7">7-a-side</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            <div className="mb-6">
              <p className="text-muted-foreground">
                Showing {filteredLeagues.length} of {leagues.length} leagues
              </p>
            </div>

            {/* Leagues Grid */}
            {filteredLeagues.length === 0 ? (
              <Card className="p-8 text-center">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {leagues.length === 0 ? "No leagues available" : "No leagues found"}
                </h3>
                <p className="text-muted-foreground">
                  {leagues.length === 0
                    ? "No futsal leagues have been created yet."
                    : "Try adjusting your search criteria or filters."}
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLeagues.map((league) => (
                  <Card key={league.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <img
                          src={league.logo || "/placeholder.svg?height=48&width=48"}
                          alt={league.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <CardTitle className="text-lg">{league.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{league.season}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground line-clamp-3">{league.description}</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="bg-orange-50 text-orange-700">
                            {league.teamSize}-a-side
                          </Badge>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            {league.matchDuration}min
                          </Badge>
                          <Badge
                            variant={
                              league.status === "active"
                                ? "default"
                                : league.status === "upcoming"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {league.status}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Teams:</span>
                            <span className="font-medium">
                              {league.teams}/{league.maxTeams}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Matchday:</span>
                            <span className="font-medium">{league.currentMatchday}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Max Subs:</span>
                            <span className="font-medium">{league.maxSubstitutions}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Teams Tab */}
          <TabsContent value="teams" className="space-y-6">
            {/* Team Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filter Teams
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search teams..."
                      value={teamSearchTerm}
                      onChange={(e) => setTeamSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={teamCategoryFilter} onValueChange={setTeamCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="school">Schools</SelectItem>
                      <SelectItem value="club">Clubs</SelectItem>
                      <SelectItem value="community">Community</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={teamSizeFilter} onValueChange={setTeamSizeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by team size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Team Sizes</SelectItem>
                      <SelectItem value="5">5-a-side</SelectItem>
                      <SelectItem value="6">6-a-side</SelectItem>
                      <SelectItem value="7">7-a-side</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            <div className="mb-6">
              <p className="text-muted-foreground">
                Showing {filteredTeams.length} of {teams.length} teams
              </p>
            </div>

            {/* Teams Grid */}
            {filteredTeams.length === 0 ? (
              <Card className="p-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {teams.length === 0 ? "No teams available" : "No teams found"}
                </h3>
                <p className="text-muted-foreground">
                  {teams.length === 0
                    ? "No futsal teams have been created yet."
                    : "Try adjusting your search criteria or filters."}
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTeams.map((team) => (
                  <Card key={team.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <img
                          src={team.logo || "/placeholder.svg?height=48&width=48"}
                          alt={team.teamName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <CardTitle className="text-lg leading-tight">{team.teamName}</CardTitle>
                          <p className="text-sm text-muted-foreground">{team.institution}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{team.homeVenue}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          {team.preferredTeamSize}-a-side
                        </Badge>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          {team.category}
                        </Badge>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700">
                          Est. {team.founded}
                        </Badge>
                      </div>
                      {team.manager && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Manager:</span>
                          <span className="font-medium">{team.manager}</span>
                        </div>
                      )}
                      {/* Team Stats */}
                      <div className="grid grid-cols-3 gap-4 text-center text-sm border-t pt-4">
                        <div>
                          <p className="font-bold text-green-600">{team.stats.wins}</p>
                          <p className="text-muted-foreground">Wins</p>
                        </div>
                        <div>
                          <p className="font-bold text-yellow-600">{team.stats.draws}</p>
                          <p className="text-muted-foreground">Draws</p>
                        </div>
                        <div>
                          <p className="font-bold text-red-600">{team.stats.losses}</p>
                          <p className="text-muted-foreground">Losses</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-center text-sm">
                        <div>
                          <p className="font-bold text-orange-600">{team.stats.points}</p>
                          <p className="text-muted-foreground">Points</p>
                        </div>
                        <div>
                          <p className="font-bold text-blue-600">
                            {team.stats.goalsFor - team.stats.goalsAgainst > 0 ? "+" : ""}
                            {team.stats.goalsFor - team.stats.goalsAgainst}
                          </p>
                          <p className="text-muted-foreground">Goal Diff</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Matches Tab */}
          <TabsContent value="matches" className="space-y-6">
            {/* Match Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filter Matches
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search matches..."
                      value={matchSearchTerm}
                      onChange={(e) => setMatchSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={matchLeagueFilter} onValueChange={setMatchLeagueFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by league" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Leagues</SelectItem>
                      {availableLeagues.map((league) => (
                        <SelectItem key={league} value={league}>
                          {league}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={matchStatusFilter} onValueChange={setMatchStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="Live">Live</SelectItem>
                      <SelectItem value="Scheduled">Scheduled</SelectItem>
                      <SelectItem value="Finished">Finished</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            <div className="mb-6">
              <p className="text-muted-foreground">
                Showing {filteredMatches.length} of {matches.length} matches
              </p>
            </div>

            {/* Matches List */}
            {filteredMatches.length === 0 ? (
              <Card className="p-8 text-center">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {matches.length === 0 ? "No matches available" : "No matches found"}
                </h3>
                <p className="text-muted-foreground">
                  {matches.length === 0
                    ? "No futsal matches have been scheduled yet."
                    : "Try adjusting your search criteria or filters."}
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredMatches.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
