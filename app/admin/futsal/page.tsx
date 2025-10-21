"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Trophy, Users, Calendar, Play, Target, Clock, AlertTriangle, CheckCircle, Eye } from "lucide-react"
import FutsalTeamsAdmin from "@/components/futsal/futsal-teams-admin"
import FutsalPlayersAdmin from "@/components/futsal/futsal-players-admin"
import FutsalLineupManager from "@/components/futsal/futsal-lineup-manager"
import type { FutsalTeam, FutsalLeague, FutsalMatch, FutsalPlayer, FutsalPosition } from "@/app/types"
import FutsalLeagueManagement from "@/components/futsal/futsal-league-management"
import FutsalMatchForm from "@/components/futsal/futsal-match-form"
import { fetchFutsalTeams } from "@/lib/teams/api"
import { fetchFutsalLeagues } from "@/lib/leagues/api"
import { fetchFutsalPlayers } from "@/lib/players/api"
import { fetchFutsalMatches, startFutsalMatch } from "@/lib/matches/api"
import FutsalLiveControl from "@/components/futsal/futsal-live-control"

export default function FutsalAdminPage() {
  const [futsalTeams, setFutsalTeams] = useState<FutsalTeam[]>([])
  const [futsalLeagues, setFutsalLeagues] = useState<FutsalLeague[]>([])
  const [futsalMatches, setFutsalMatches] = useState<FutsalMatch[]>([])
  const [futsalPlayers, setFutsalPlayers] = useState<FutsalPlayer[]>([])
  const [futsalPositions, setFutsalPositions] = useState<FutsalPosition[]>([])
  const [selectedMatch, setSelectedMatch] = useState<FutsalMatch | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Initialize positions first
      const samplePositions: FutsalPosition[] = [
        { id: "1", name: "Goalkeeper", abbreviation: "GK", description: "Defends the goal" },
        { id: "2", name: "Defender", abbreviation: "DEF", description: "Defensive player" },
        { id: "3", name: "Midfielder", abbreviation: "MID", description: "Central player" },
        { id: "4", name: "Forward", abbreviation: "FWD", description: "Attacking player" },
        { id: "5", name: "Pivot", abbreviation: "PIV", description: "Target player" },
      ]
      setFutsalPositions(samplePositions)

      try {
        const [teamsData, leaguesData, playersData, matchesData] = await Promise.all([
          fetchFutsalTeams().catch(() => []),
          fetchFutsalLeagues().catch(() => []),
          fetchFutsalPlayers().catch(() => []),
          fetchFutsalMatches().catch(() => []),
        ])

        // Ensure all data is arrays before setting state
        setFutsalTeams(Array.isArray(teamsData) ? teamsData : [])
        setFutsalLeagues(Array.isArray(leaguesData) ? leaguesData : [])
        setFutsalPlayers(Array.isArray(playersData) ? playersData : [])
        setFutsalMatches(Array.isArray(matchesData) ? matchesData : [])
      } catch (apiError) {
        console.error("Failed to load data from APIs:", apiError)
        setError("Failed to load data from backend. Using sample data.")

        // Set empty arrays as fallback
        setFutsalTeams([])
        setFutsalLeagues([])
        setFutsalPlayers([])
        setFutsalMatches([])
      }
    } catch (error) {
      console.error("Failed to load data:", error)
      setError("An unexpected error occurred while loading data.")

      // Set empty arrays as fallback
      setFutsalTeams([])
      setFutsalLeagues([])
      setFutsalPlayers([])
      setFutsalMatches([])
    } finally {
      setLoading(false)
    }
  }

  // Team Management
  const handleAddTeam = async (teamData: Omit<FutsalTeam, "id">) => {
    const newTeam: FutsalTeam = {
      ...teamData,
      id: (futsalTeams.length + 1).toString(),
    }
    setFutsalTeams((prev) => [...prev, newTeam])
  }

  const handleUpdateTeam = async (id: string, teamData: Partial<FutsalTeam>) => {
    setFutsalTeams((prev) => prev.map((team) => (team.id === id ? { ...team, ...teamData } : team)))
  }

  const handleDeleteTeam = async (id: string) => {
    setFutsalTeams((prev) => prev.filter((team) => team.id !== id))
    setFutsalPlayers((prev) => prev.filter((player) => player.teamId !== id))
  }

  // League Management
  const handleAddLeague = async (leagueData: Omit<FutsalLeague, "id">) => {
    const newLeague: FutsalLeague = {
      ...leagueData,
      id: (futsalLeagues.length + 1).toString(),
    }
    setFutsalLeagues((prev) => [...prev, newLeague])
  }

  const handleUpdateLeague = async (id: string, leagueData: Partial<FutsalLeague>) => {
    setFutsalLeagues((prev) => prev.map((league) => (league.id === id ? { ...league, ...leagueData } : league)))
  }

  const handleDeleteLeague = async (id: string) => {
    setFutsalLeagues((prev) => prev.filter((league) => league.id !== id))
  }

  // Player Management
  const handleAddPlayer = async (playerData: Omit<FutsalPlayer, "id">) => {
    const newPlayer: FutsalPlayer = {
      ...playerData,
      id: (futsalPlayers.length + 1).toString(),
      position: futsalPositions.find((p) => p.id === playerData.positionId),
      teamName: futsalTeams.find((t) => t.id === playerData.teamId)?.teamName,
    }
    setFutsalPlayers((prev) => [...prev, newPlayer])
  }

  const handleUpdatePlayer = async (player: FutsalPlayer) => {
    setFutsalPlayers((prev) => prev.map((p) => (p.id === player.id ? player : p)))
  }

  const handleDeletePlayer = async (playerId: string) => {
    setFutsalPlayers((prev) => prev.filter((player) => player.id !== playerId))
  }

  // Match Management
  const handleScheduleMatch = async (matchData: Omit<FutsalMatch, "id">) => {
    const newMatch: FutsalMatch = {
      ...matchData,
      id: (futsalMatches.length + 1).toString(),
    }
    setFutsalMatches((prev) => [...prev, newMatch])
  }

  const handleUpdateMatch = (updatedMatch: FutsalMatch) => {
    setFutsalMatches((prev) => prev.map((match) => (match.id === updatedMatch.id ? updatedMatch : match)))
  }

  const handleSaveLineups = async (homeLineup: any, awayLineup: any) => {
    if (!selectedMatch) return

    setFutsalMatches((prev) =>
      prev.map((match) =>
        match.id === selectedMatch.id
          ? {
              ...match,
              homeLineup,
              awayLineup,
              status: "Lineup Set" as const,
            }
          : match,
      ),
    )
  }

  const getPlayersByTeam = (teamIdentifier: string): FutsalPlayer[] => {
    return futsalPlayers.filter((player) => {
      return (
        player.teamId === teamIdentifier ||
        player.teamName === teamIdentifier ||
        futsalTeams.find((t) => t.id === player.teamId)?.teamName === teamIdentifier
      )
    })
  }

  // Safe stats calculation with proper array checks
  const stats = {
    totalTeams: Array.isArray(futsalTeams) ? futsalTeams.length : 0,
    totalPlayers: Array.isArray(futsalPlayers) ? futsalPlayers.length : 0,
    totalLeagues: Array.isArray(futsalLeagues) ? futsalLeagues.length : 0,
    activeLeagues: Array.isArray(futsalLeagues) ? futsalLeagues.filter((l) => l.status === "active").length : 0,
    totalMatches: Array.isArray(futsalMatches) ? futsalMatches.length : 0,
    scheduledMatches: Array.isArray(futsalMatches) ? futsalMatches.filter((m) => m.status === "Scheduled").length : 0,
    liveMatches: Array.isArray(futsalMatches) ? futsalMatches.filter((m) => m.status === "Live").length : 0,
  }

  // Add a function to handle match status updates
const handleStartMatch = async (matchId: string) => {
  try {
    const matchToStart = futsalMatches.find((m) => m.id === matchId)
    if (!matchToStart) {
      setError("Match not found")
      return
    }

    // Call the API to start the match
    const startData = {
      status: "Live",
      startTime: new Date(),
      currentMinute: 0
    }
    
    const updatedMatch = await startFutsalMatch(matchId, startData)
    
    // Update local state with the response from the API
    setFutsalMatches((prev) => prev.map((m) => (m.id === matchId ? updatedMatch : m)))

    // Update the selected match if it's the one being started
    if (selectedMatch?.id === matchId) {
      setSelectedMatch(updatedMatch)
    }

    // Clear any existing errors
    setError(null)
    
    console.log("Match started successfully:", updatedMatch)
  } catch (error) {
    console.error("Failed to start match:", error)
    setError(`Failed to start match: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

  // Add function to activate a match (change status from Scheduled to Active)
  const handleActivateMatch = async (matchId: string) => {
    const matchToActivate = futsalMatches.find((m) => m.id === matchId)
    if (matchToActivate) {
      const updatedMatch: FutsalMatch = {
        ...matchToActivate,
        status: "Active" as const,
      }
      setFutsalMatches((prev) => prev.map((m) => (m.id === matchId ? updatedMatch : m)))

      // Show success message
      setError(null)
      // You could add a success state here if needed
    }
  }

  // Add function to view match details
  const handleViewMatch = (match: FutsalMatch) => {
    setSelectedMatch(match)
    // You could switch to a specific tab or open a modal here
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-foreground">Loading futsal admin panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-orange-600">Futsal Admin Panel</h1>
            <p className="text-muted-foreground">
              Complete management system for futsal leagues, teams, players, and matches
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Leagues</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalLeagues}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Teams</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalTeams}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Players</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalPlayers}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Matches</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalMatches}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-2">
              <Play className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-foreground">{stats.activeLeagues}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-bold text-foreground">{stats.scheduledMatches}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 bg-red-500 rounded-full animate-pulse" />
              <div>
                <p className="text-sm text-muted-foreground">Live</p>
                <p className="text-2xl font-bold text-foreground">{stats.liveMatches}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="leagues" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-muted">
            <TabsTrigger
              value="leagues"
              className="data-[state=active]:bg-background data-[state=active]:text-foreground"
            >
              Leagues
            </TabsTrigger>
            <TabsTrigger
              value="teams"
              className="data-[state=active]:bg-background data-[state=active]:text-foreground"
            >
              Teams
            </TabsTrigger>
            <TabsTrigger
              value="players"
              className="data-[state=active]:bg-background data-[state=active]:text-foreground"
            >
              Players
            </TabsTrigger>
            <TabsTrigger
              value="matches"
              className="data-[state=active]:bg-background data-[state=active]:text-foreground"
            >
              Matches
            </TabsTrigger>
            <TabsTrigger
              value="lineups"
              className="data-[state=active]:bg-background data-[state=active]:text-foreground"
            >
              Lineups
            </TabsTrigger>
            <TabsTrigger value="live" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
              Live Control
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leagues">
            <FutsalLeagueManagement
              leagues={futsalLeagues}
              onAddLeague={handleAddLeague}
              onUpdateLeague={handleUpdateLeague}
              onDeleteLeague={handleDeleteLeague}
            />
          </TabsContent>

          <TabsContent value="teams">
            <FutsalTeamsAdmin
              teams={futsalTeams}
              onAddTeam={handleAddTeam}
              onUpdateTeam={handleUpdateTeam}
              onDeleteTeam={handleDeleteTeam}
            />
          </TabsContent>

          <TabsContent value="players">
            <FutsalPlayersAdmin
              teams={futsalTeams}
              players={futsalPlayers}
              positions={futsalPositions}
              onAddPlayer={handleAddPlayer}
              onUpdatePlayer={handleUpdatePlayer}
              onDeletePlayer={handleDeletePlayer}
            />
          </TabsContent>

          <TabsContent value="matches">
            <div className="space-y-6">
              <FutsalMatchForm
                teams={futsalTeams}
                leagues={futsalLeagues}
                onScheduleMatch={handleScheduleMatch}
                isLoading={false}
              />
              {/* Matches List */}
              <Card className="p-6 bg-card border-border">
                <h3 className="text-lg font-semibold mb-4 text-foreground">Scheduled Futsal Matches</h3>
                {!Array.isArray(futsalMatches) || futsalMatches.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No futsal matches scheduled yet. Create a league and schedule your first match!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {futsalMatches.map((match) => (
                      <div
                        key={match.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="font-medium text-foreground">{match.homeTeam}</p>
                            <p className="text-sm text-muted-foreground">vs</p>
                            <p className="font-medium text-foreground">{match.awayTeam}</p>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <p>
                              {match.date} at {match.time}
                            </p>
                            <p>{match.venue}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="border-orange-200 text-orange-700 dark:border-orange-800 dark:text-orange-300"
                          >
                            {match.teamSize}-a-side
                          </Badge>
                          <Badge
                            variant="outline"
                            className="border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-300"
                          >
                            {match.matchDuration}min
                          </Badge>
                          <Badge
                            variant={
                              match.status === "Live"
                                ? "destructive"
                                : match.status === "Active"
                                  ? "default"
                                  : "secondary"
                            }
                            className={
                              match.status === "Live"
                                ? "bg-red-500 text-white"
                                : match.status === "Active"
                                  ? "bg-green-500 text-white"
                                  : "bg-muted text-muted-foreground"
                            }
                          >
                            {match.status === "Live" && "🔴 "}
                            {match.status === "Active" && "✅ "}
                            {match.status}
                          </Badge>

                          {/* Action Buttons */}
                          <div className="flex gap-1 ml-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewMatch(match)}
                              className="h-8 px-2"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>

                            {match.status === "Scheduled" && (
                              <Button
                                size="sm"
                                onClick={() => handleActivateMatch(match.id)}
                                className="h-8 px-3 bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Activate
                              </Button>
                            )}

                            {(match.status === "Active" || match.status === "Lineup Set") && (
                              <Button
                                size="sm"
                                onClick={() => handleStartMatch(match.id)}
                                className="h-8 px-3 bg-orange-600 hover:bg-orange-700 text-white"
                              >
                                <Play className="h-3 w-3 mr-1" />
                                Start
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="lineups">
            <div className="space-y-6">
              {!Array.isArray(futsalMatches) || futsalMatches.length === 0 ? (
                <Card className="p-8 text-center bg-card border-border">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-foreground">No Matches Available</h3>
                  <p className="text-muted-foreground">Schedule a match first to manage lineups.</p>
                </Card>
              ) : (
                <>
                  <Card className="p-4 bg-card border-border">
                    <h3 className="font-semibold mb-4 text-foreground">Select Match for Lineup Management</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {futsalMatches
                        .filter((match) =>
                          ["Scheduled", "scheduled", "Active", "active", "Lineup Set", "lineup set"].includes(
                            match.status || "",
                          ),
                        )
                        .map((match) => (
                          <Card
                            key={match.id}
                            className={`p-4 cursor-pointer border-2 transition-colors hover:bg-muted/50 ${
                              selectedMatch?.id === match.id
                                ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20"
                                : "border-border bg-card"
                            }`}
                            onClick={() => setSelectedMatch(match)}
                          >
                            <div className="text-center">
                              <p className="font-medium text-foreground">
                                {match.homeTeam} vs {match.awayTeam}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {match.date} • {match.teamSize}-a-side
                              </p>
                              <Badge variant="outline" className="mt-2 border-border text-foreground">
                                {match.status}
                              </Badge>
                            </div>
                          </Card>
                        ))}
                    </div>
                  </Card>
                  {selectedMatch && (
                    <FutsalLineupManager
                      match={selectedMatch}
                      homeTeam={futsalTeams.find((t) => t.teamName === selectedMatch.homeTeam)!}
                      awayTeam={futsalTeams.find((t) => t.teamName === selectedMatch.awayTeam)!}
                      homePlayers={getPlayersByTeam(selectedMatch.homeTeam)}
                      awayPlayers={getPlayersByTeam(selectedMatch.awayTeam)}
                      onSaveLineups={handleSaveLineups}
                    />
                  )}
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="live">
            <div className="space-y-6">
              {!Array.isArray(futsalMatches) ||
              futsalMatches.filter((m) =>
                ["Lineup Set", "lineup set", "Live", "live", "Active", "active"].includes(m.status || ""),
              ).length === 0 ? (
                <Card className="p-8 text-center bg-card border-border">
                  <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-foreground">No Live Matches</h3>
                  <p className="text-muted-foreground">Activate a match and set lineups to enable live control.</p>
                </Card>
              ) : (
                <>
                  <Card className="p-4 bg-card border-border">
                    <h3 className="font-semibold mb-4 text-foreground">Select Match for Live Control</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {futsalMatches
                        .filter((match) =>
                          ["Lineup Set", "lineup set", "Live", "live", "Active", "active"].includes(match.status || ""),
                        )
                        .map((match) => (
                          <Card
                            key={match.id}
                            className={`p-4 cursor-pointer border-2 transition-colors hover:bg-muted/50 ${
                              selectedMatch?.id === match.id
                                ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20"
                                : "border-border bg-card"
                            }`}
                            onClick={() => setSelectedMatch(match)}
                          >
                            <div className="text-center">
                              <p className="font-medium text-foreground">
                                {match.homeTeam} vs {match.awayTeam}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {match.date} • {match.teamSize}-a-side
                              </p>
                              <Badge
                                variant={
                                  match.status === "Live"
                                    ? "destructive"
                                    : match.status === "Active"
                                      ? "default"
                                      : "outline"
                                }
                                className={`mt-2 ${
                                  match.status === "Live"
                                    ? "bg-red-500 text-white"
                                    : match.status === "Active"
                                      ? "bg-green-500 text-white"
                                      : "border-border text-foreground"
                                }`}
                              >
                                {match.status === "Live" && "🔴 "}
                                {match.status === "Active" && "✅ "}
                                {match.status}
                              </Badge>
                            </div>
                          </Card>
                        ))}
                    </div>
                  </Card>
                  {selectedMatch && (
                    <FutsalLiveControl
                      match={selectedMatch}
                      homePlayers={getPlayersByTeam(selectedMatch.homeTeam)}
                      awayPlayers={getPlayersByTeam(selectedMatch.awayTeam)}
                      onMatchUpdate={handleUpdateMatch}
                      onStartMatch={handleStartMatch}
                    />
                  )}
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
