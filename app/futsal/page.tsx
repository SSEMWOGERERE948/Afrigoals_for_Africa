"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Users, Calendar, Play, Clock, MapPin, Search, Filter } from "lucide-react"
import type { FutsalLeague, FutsalTeam, FutsalMatch } from "@/app/types"

export default function FutsalPage() {
  const [leagues, setLeagues] = useState<FutsalLeague[]>([])
  const [teams, setTeams] = useState<FutsalTeam[]>([])
  const [matches, setMatches] = useState<FutsalMatch[]>([])
  const [loading, setLoading] = useState(true)

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
      // Sample data for demonstration
      const sampleLeagues: FutsalLeague[] = [
        {
          id: "1",
          name: "Inter-University Futsal Championship",
          country: "Uganda",
          logo: "/placeholder.svg?height=64&width=64",
          season: "2024",
          teamSize: 5,
          maxTeams: 16,
          matchDuration: 40,
          maxSubstitutions: 12,
          currentMatchday: 3,
          teams: 8,
          status: "active",
          description:
            "Annual futsal tournament for universities across Uganda featuring the best university teams competing in fast-paced indoor football action.",
        },
        {
          id: "2",
          name: "Schools Futsal League",
          country: "Uganda",
          logo: "/placeholder.svg?height=64&width=64",
          season: "2024",
          teamSize: 6,
          maxTeams: 12,
          matchDuration: 30,
          maxSubstitutions: 8,
          currentMatchday: 2,
          teams: 6,
          status: "active",
          description: "Secondary schools futsal competition promoting youth development and school sports excellence.",
        },
      ]

      const sampleTeams: FutsalTeam[] = [
        {
          id: "1",
          teamName: "Makerere University Futsal",
          logo: "/placeholder.svg?height=64&width=64",
          institution: "Makerere University",
          category: "school",
          preferredTeamSize: 5,
          homeVenue: "University Sports Complex",
          founded: 2020,
          manager: "Coach John Doe",
          players: [],
          stats: {
            matchesPlayed: 12,
            wins: 8,
            draws: 2,
            losses: 2,
            goalsFor: 35,
            goalsAgainst: 18,
            points: 26,
          },
          contactEmail: "futsal@mak.ac.ug",
          contactPhone: "+256 700 000 001",
        },
        {
          id: "2",
          teamName: "Kyambogo University Futsal",
          logo: "/placeholder.svg?height=64&width=64",
          institution: "Kyambogo University",
          preferredTeamSize: 5,
          homeVenue: "Kyambogo Sports Hall",
          founded: 2019,
          manager: "Coach Jane Smith",
          players: [],
          stats: {
            matchesPlayed: 10,
            wins: 6,
            draws: 2,
            losses: 2,
            goalsFor: 28,
            goalsAgainst: 15,
            points: 20,
          },
          contactEmail: "futsal@kyu.ac.ug",
          contactPhone: "+256 700 000 002",
          category: "school"
        },
      ]

      const sampleMatches: FutsalMatch[] = [
        {
          id: "1",
          league: "Inter-University Futsal Championship",
          homeTeam: "Makerere University Futsal",
          awayTeam: "Kyambogo University Futsal",
          date: "2024-01-20",
          time: "15:00",
          venue: "University Sports Complex",
          referee: "John Referee",
          teamSize: 5,
          matchDuration: 40,
          maxSubstitutions: 12,
          status: "Live",
          homeScore: 3,
          awayScore: 2,
        },
        {
          id: "2",
          league: "Schools Futsal League",
          homeTeam: "St. Mary's College",
          awayTeam: "King's College Budo",
          date: "2024-01-21",
          time: "16:00",
          venue: "School Sports Hall",
          referee: "Mary Referee",
          teamSize: 6,
          matchDuration: 30,
          maxSubstitutions: 8,
          status: "Scheduled",
          homeScore: 0,
          awayScore: 0,
        },
      ]

      setLeagues(sampleLeagues)
      setTeams(sampleTeams)
      setMatches(sampleMatches)
    } catch (error) {
      console.error("Failed to load futsal data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Filter functions
  const filteredLeagues = leagues.filter((league) => {
    const matchesSearch = leagueSearchTerm === "" || league.name.toLowerCase().includes(leagueSearchTerm.toLowerCase())
    const matchesStatus = leagueStatusFilter === "all" || league.status === leagueStatusFilter
    const matchesTeamSize = leagueTeamSizeFilter === "all" || league.teamSize.toString() === leagueTeamSizeFilter
    return matchesSearch && matchesStatus && matchesTeamSize
  })

  const filteredTeams = teams.filter((team) => {
    const matchesSearch = teamSearchTerm === "" || team.teamName.toLowerCase().includes(teamSearchTerm.toLowerCase())
    const matchesCategory = teamCategoryFilter === "all" || team.category === teamCategoryFilter
    const matchesSize = teamSizeFilter === "all" || team.preferredTeamSize.toString() === teamSizeFilter
    return matchesSearch && matchesCategory && matchesSize
  })

  const liveMatches = matches.filter((m) => m.status === "Live")
  const upcomingMatches = matches.filter((m) => m.status === "Scheduled").slice(0, 3)
  const activeLeagues = leagues.filter((l) => l.status === "active")

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p>Loading futsal data...</p>
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
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Uganda Futsal</h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">Fast-paced indoor football action across Uganda</p>
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

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="leagues">Leagues ({leagues.length})</TabsTrigger>
            <TabsTrigger value="teams">Teams ({teams.length})</TabsTrigger>
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLeagues.map((league) => (
                <Card key={league.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <img
                        src={league.logo || "/placeholder.svg"}
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
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Teams Tab */}
          <TabsContent value="teams" className="space-y-6">
            {/* Filter Teams */}
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
                      <SelectItem value="school">School</SelectItem>
                      <SelectItem value="university">University</SelectItem>
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

            {/* Teams List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTeams.map((team) => (
                <Card key={team.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <img
                        src={team.logo || "/placeholder.svg"}
                        alt={team.teamName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <CardTitle className="text-lg">{team.teamName}</CardTitle>
                        <p className="text-sm text-muted-foreground">{team.institution}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          {team.category}
                        </Badge>
                        <Badge variant="outline" className="bg-orange-50 text-orange-700">
                          {team.preferredTeamSize}-a-side
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Manager:</span>
                          <span className="font-medium">{team.manager}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Founded:</span>
                          <span className="font-medium">{team.founded}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Venue:</span>
                          <span className="font-medium">{team.homeVenue}</span>
                        </div>
                      </div>
                      {team.stats && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Season Stats</h4>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="text-center">
                              <div className="font-bold text-green-600">{team.stats.wins}</div>
                              <div className="text-muted-foreground">Wins</div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-yellow-600">{team.stats.draws}</div>
                              <div className="text-muted-foreground">Draws</div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-red-600">{team.stats.losses}</div>
                              <div className="text-muted-foreground">Losses</div>
                            </div>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Points:</span>
                            <span className="font-bold">{team.stats.points}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
