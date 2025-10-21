"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GroupIcon as Formation, Play } from "lucide-react"
import type { Team, Player, Match, League, TeamLineup, MatchUpdateRequest } from "@/app/types"
import { fetchAllTeams, fetchLeagues, createLeague, deleteLeague } from "@/components/team_api"
import { fetchPlayersByTeamId } from "@/components/player_api"
import { fetchMatches, fetchMatchWithLineups, createMatch, deleteMatch, updateMatch } from "@/components/matches_api"
import { saveSubstitutions, fetchSubstitutions } from "@/components/substitutions_api"
import FieldDisplay from "@/components/field-display"
import LeagueManagement from "@/components/league-management"
import MatchForm from "@/components/match-form"
import MatchList from "@/components/match-list"
import LineupManager from "@/components/lineup-manager"
import SubstitutionManager, { type Substitution } from "@/components/substitution-manager"
import LiveMatchControl from "@/components/live-match-control"

interface MatchLineup {
  matchId: string
  homeLineup: TeamLineup
  awayLineup: TeamLineup
}

const formations = ["4-4-2", "4-3-3", "3-5-2", "4-2-3-1", "3-4-3", "5-3-2", "4-5-1", "3-4-2-1"]

export default function MatchScheduling() {
  const [teams, setTeams] = useState<Team[]>([])
  const [leagues, setLeagues] = useState<League[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [homeTeamPlayers, setHomeTeamPlayers] = useState<Player[]>([])
  const [awayTeamPlayers, setAwayTeamPlayers] = useState<Player[]>([])
  const [selectedMatch, setSelectedMatch] = useState<string>("")
  const [selectedLiveMatch, setSelectedLiveMatch] = useState<string>("")
  const [activeTab, setActiveTab] = useState("schedule")
  const [isLoading, setIsLoading] = useState(false)
  const [homeSubstitutions, setHomeSubstitutions] = useState<Substitution[]>([])
  const [awaySubstitutions, setAwaySubstitutions] = useState<Substitution[]>([])

  const [matchLineup, setMatchLineup] = useState<MatchLineup>({
    matchId: "",
    homeLineup: {
      formation: "4-4-2",
      startingXI: [],
      substitutes: [],
      coach: "",
    },
    awayLineup: {
      formation: "4-4-2",
      startingXI: [],
      substitutes: [],
      coach: "",
    },
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const [allTeams, leaguesList, matchesList] = await Promise.all([
          fetchAllTeams(),
          fetchLeagues(),
          fetchMatches(),
        ])
        setTeams(allTeams)
        setLeagues(leaguesList)
        setMatches(matchesList)
      } catch (error) {
        console.error("Failed to load data:", error)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    const loadMatchData = async () => {
      if (selectedMatch && matches.length > 0 && teams.length > 0) {
        console.log("🔍 Loading data for selected match:", selectedMatch)
        const selectedMatchData = matches.find((m) => m.id === selectedMatch)

        if (selectedMatchData) {
          try {
            // Load match lineups and substitutions
            const [matchWithLineups, substitutions] = await Promise.all([
              fetchMatchWithLineups(selectedMatch),
              fetchSubstitutions(selectedMatch),
            ])

            // Find team objects
            const homeTeam = teams.find((t) => t.name === selectedMatchData.homeTeam)
            const awayTeam = teams.find((t) => t.name === selectedMatchData.awayTeam)

            // Load players
            const [homePlayers, awayPlayers] = await Promise.all([
              homeTeam ? fetchPlayersByTeamId(homeTeam.id) : Promise.resolve([]),
              awayTeam ? fetchPlayersByTeamId(awayTeam.id) : Promise.resolve([]),
            ])

            setHomeTeamPlayers(homePlayers)
            setAwayTeamPlayers(awayPlayers)

            // Set substitutions
            const homeSubsData = substitutions.filter((sub) => sub.team === "home")
            const awaySubsData = substitutions.filter((sub) => sub.team === "away")
            setHomeSubstitutions(homeSubsData)
            setAwaySubstitutions(awaySubsData)

            // Set lineups
            setMatchLineup({
              matchId: selectedMatch,
              homeLineup: matchWithLineups.homeLineup || {
                formation: "4-4-2",
                startingXI: [],
                substitutes: [],
                coach: homeTeam?.manager || "",
              },
              awayLineup: matchWithLineups.awayLineup || {
                formation: "4-4-2",
                startingXI: [],
                substitutes: [],
                coach: awayTeam?.manager || "",
              },
            })
          } catch (error) {
            console.error("❌ Error loading match data:", error)
          }
        }
      }
    }
    loadMatchData()
  }, [selectedMatch, matches, teams])

  // Load live match data when selected
  useEffect(() => {
    const loadLiveMatchData = async () => {
      if (selectedLiveMatch && matches.length > 0 && teams.length > 0) {
        const selectedMatchData = matches.find((m) => m.id === selectedLiveMatch)

        if (selectedMatchData) {
          try {
            // Find team objects
            const homeTeam = teams.find((t) => t.name === selectedMatchData.homeTeam)
            const awayTeam = teams.find((t) => t.name === selectedMatchData.awayTeam)

            // Load players for live match control
            const [homePlayers, awayPlayers] = await Promise.all([
              homeTeam ? fetchPlayersByTeamId(homeTeam.id) : Promise.resolve([]),
              awayTeam ? fetchPlayersByTeamId(awayTeam.id) : Promise.resolve([]),
            ])

            setHomeTeamPlayers(homePlayers)
            setAwayTeamPlayers(awayPlayers)
          } catch (error) {
            console.error("❌ Error loading live match data:", error)
          }
        }
      }
    }
    loadLiveMatchData()
  }, [selectedLiveMatch, matches, teams])

  const handleAddLeague = async (leagueData: Omit<League, "id">) => {
    const newLeague = await createLeague(leagueData)
    setLeagues((prev) => [...prev, newLeague])
    alert("League added successfully!")
  }

  const handleDeleteLeague = async (id: string) => {
    await deleteLeague(id)
    setLeagues((prev) => prev.filter((league) => league.id !== id))
    alert("League deleted successfully!")
  }

  const handleScheduleMatch = async (matchData: Omit<Match, "id">) => {
    setIsLoading(true)
    try {
      const createdMatch = await createMatch(matchData)
      setMatches((prev) => [...prev, createdMatch])
      alert("Match scheduled successfully!")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteMatch = async (id: string) => {
    await deleteMatch(id)
    setMatches((prev) => prev.filter((match) => match.id !== id))
    alert("Match deleted successfully!")
  }

  const handleSelectMatch = (matchId: string) => {
    setSelectedMatch(matchId)
    setActiveTab("lineup")
  }

  const handleSelectLiveMatch = (matchId: string) => {
    setSelectedLiveMatch(matchId)
    setActiveTab("live")
  }

  const handleMatchUpdate = (updatedMatch: Match) => {
    setMatches((prev) => prev.map((match) => (match.id === updatedMatch.id ? updatedMatch : match)))
  }

  const handleSubstitution = (playerOut: Player, playerIn: Player, team: "home" | "away") => {
    const currentSubs = team === "home" ? homeSubstitutions : awaySubstitutions
    if (currentSubs.length >= 5) {
      alert("Maximum 5 substitutions allowed per team")
      return
    }

    // Update lineup
    setMatchLineup((prev) => {
      const lineup = team === "home" ? prev.homeLineup : prev.awayLineup
      const newStartingXI = lineup.startingXI.map((player) => (player.id === playerOut.id ? playerIn : player))
      const newSubstitutes = lineup.substitutes.filter((player) => player.id !== playerIn.id).concat(playerOut)

      return {
        ...prev,
        [team === "home" ? "homeLineup" : "awayLineup"]: {
          ...lineup,
          startingXI: newStartingXI,
          substitutes: newSubstitutes,
        },
      }
    })

    // Record substitution
    const substitution: Substitution = {
      matchId: selectedMatch,
      team,
      playerOut,
      playerIn,
      minute: 45, // Default minute
      timestamp: new Date().toISOString(),
    }

    if (team === "home") {
      setHomeSubstitutions((prev) => [...prev, substitution])
    } else {
      setAwaySubstitutions((prev) => [...prev, substitution])
    }
  }

  const handleSaveSubstitutions = async (substitutions: Substitution[]) => {
    await saveSubstitutions(selectedMatch, substitutions)
  }

  const handlePlayerSelection = (player: Player, team: "home" | "away", type: "starting" | "substitute") => {
    setMatchLineup((prev) => {
      const lineup = team === "home" ? prev.homeLineup : prev.awayLineup
      const newStartingXI = lineup.startingXI.filter((p) => p.id !== player.id)
      const newSubstitutes = lineup.substitutes.filter((p) => p.id !== player.id)

      if (type === "starting" && newStartingXI.length < 11) {
        newStartingXI.push(player)
      } else if (type === "substitute" && newSubstitutes.length < 7) {
        newSubstitutes.push(player)
      }

      return {
        ...prev,
        [team === "home" ? "homeLineup" : "awayLineup"]: {
          ...lineup,
          startingXI: newStartingXI,
          substitutes: newSubstitutes,
        },
      }
    })
  }

  const handleRemovePlayer = (playerId: string, team: "home" | "away") => {
    setMatchLineup((prev) => {
      const lineup = team === "home" ? prev.homeLineup : prev.awayLineup
      return {
        ...prev,
        [team === "home" ? "homeLineup" : "awayLineup"]: {
          ...lineup,
          startingXI: lineup.startingXI.filter((p) => p.id !== playerId),
          substitutes: lineup.substitutes.filter((p) => p.id !== playerId),
        },
      }
    })
  }

  const saveLineup = async () => {
    if (!selectedMatch) {
      alert("Please select a match first")
      return
    }

    if (matchLineup.homeLineup.startingXI.length !== 11 || matchLineup.awayLineup.startingXI.length !== 11) {
      alert("Both teams must have exactly 11 starting players")
      return
    }

    try {
      const updatedMatchData: MatchUpdateRequest = {
        status: "Scheduled",
        homeLineup: {
          formation: matchLineup.homeLineup.formation,
          coach: matchLineup.homeLineup.coach,
          startingXIIds: matchLineup.homeLineup.startingXI.map((p) => p.id),
          substituteIds: matchLineup.homeLineup.substitutes.map((p) => p.id),
        },
        awayLineup: {
          formation: matchLineup.awayLineup.formation,
          coach: matchLineup.awayLineup.coach,
          startingXIIds: matchLineup.awayLineup.startingXI.map((p) => p.id),
          substituteIds: matchLineup.awayLineup.substitutes.map((p) => p.id),
        },
      }

      const updatedMatch = await updateMatch(selectedMatch, updatedMatchData)
      setMatches((prev) => prev.map((match) => (match.id === selectedMatch ? updatedMatch : match)))
      alert("Lineups saved successfully!")
    } catch (error) {
      console.error("Failed to save lineups:", error)
      alert("Failed to save lineups. Please try again.")
    }
  }

  const getSelectedMatchTeams = () => {
    if (!selectedMatch) return { homeTeam: null, awayTeam: null }
    const selectedMatchData = matches.find((m) => m.id === selectedMatch)
    if (!selectedMatchData) return { homeTeam: null, awayTeam: null }

    const homeTeam = teams.find((t) => t.name === selectedMatchData.homeTeam)
    const awayTeam = teams.find((t) => t.name === selectedMatchData.awayTeam)
    return { homeTeam, awayTeam }
  }

  const getAvailablePlayers = (team: "home" | "away") => {
    const allPlayers = team === "home" ? homeTeamPlayers : awayTeamPlayers
    const lineup = team === "home" ? matchLineup.homeLineup : matchLineup.awayLineup

    return allPlayers.filter(
      (player) =>
        !lineup.startingXI.find((p) => p.id === player.id) && !lineup.substitutes.find((p) => p.id === player.id),
    )
  }

  const getEligibleMatches = () => {
    return matches.filter((match) => match.status === "Scheduled" || match.status === "Live")
  }

  const getSelectedLiveMatch = () => {
    return matches.find((m) => m.id === selectedLiveMatch)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Match Scheduling & Management</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="schedule">Schedule Match</TabsTrigger>
          <TabsTrigger value="lineup">Set Lineups</TabsTrigger>
          <TabsTrigger value="live">Live Control</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-6">
          <LeagueManagement leagues={leagues} onAddLeague={handleAddLeague} onDeleteLeague={handleDeleteLeague} />
          <MatchForm teams={teams} leagues={leagues} onScheduleMatch={handleScheduleMatch} isLoading={isLoading} />
          <MatchList
            matches={matches}
            leagues={leagues}
            onSelectMatch={handleSelectMatch}
            onDeleteMatch={handleDeleteMatch}
            onSelectLiveMatch={handleSelectLiveMatch} onStartMatch={function (matchId: string): void {
              throw new Error("Function not implemented.")
            } }          />
        </TabsContent>

        <TabsContent value="lineup" className="space-y-6">
          {!selectedMatch ? (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">Please select a match from the Schedule tab to set lineups.</p>
            </Card>
          ) : (
            <>
              <Card className="p-6">
                {(() => {
                  const { homeTeam, awayTeam } = getSelectedMatchTeams()
                  return (
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Formation className="h-5 w-5" />
                      Match Lineup - {homeTeam?.name || "Home Team"} vs {awayTeam?.name || "Away Team"}
                    </h2>
                  )
                })()}

                <div className="grid grid-cols-2 gap-6">
                  {(() => {
                    const { homeTeam, awayTeam } = getSelectedMatchTeams()
                    return (
                      <>
                        <LineupManager
                          teamName={`${homeTeam?.name || "Home Team"} (Home)`}
                          lineup={matchLineup.homeLineup}
                          availablePlayers={getAvailablePlayers("home")}
                          formations={formations}
                          onLineupChange={(lineup) => setMatchLineup((prev) => ({ ...prev, homeLineup: lineup }))}
                          onPlayerSelection={(player, type) => handlePlayerSelection(player, "home", type)}
                          onRemovePlayer={(playerId) => handleRemovePlayer(playerId, "home")}
                        />
                        <LineupManager
                          teamName={`${awayTeam?.name || "Away Team"} (Away)`}
                          lineup={matchLineup.awayLineup}
                          availablePlayers={getAvailablePlayers("away")}
                          formations={formations}
                          onLineupChange={(lineup) => setMatchLineup((prev) => ({ ...prev, awayLineup: lineup }))}
                          onPlayerSelection={(player, type) => handlePlayerSelection(player, "away", type)}
                          onRemovePlayer={(playerId) => handleRemovePlayer(playerId, "away")}
                        />
                      </>
                    )
                  })()}
                </div>

                {/* Field Visualization */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                  {(() => {
                    const { homeTeam, awayTeam } = getSelectedMatchTeams()
                    return (
                      <>
                        <FieldDisplay
                          formation={matchLineup.homeLineup.formation}
                          startingXI={matchLineup.homeLineup.startingXI}
                          substitutes={matchLineup.homeLineup.substitutes}
                          teamName={homeTeam?.name || "Home Team"}
                          isHome={true}
                          onSubstitution={(playerOut, playerIn) => handleSubstitution(playerOut, playerIn, "home")}
                          substitutions={homeSubstitutions}
                        />
                        <FieldDisplay
                          formation={matchLineup.awayLineup.formation}
                          startingXI={matchLineup.awayLineup.startingXI}
                          substitutes={matchLineup.awayLineup.substitutes}
                          teamName={awayTeam?.name || "Away Team"}
                          isHome={false}
                          onSubstitution={(playerOut, playerIn) => handleSubstitution(playerOut, playerIn, "away")}
                          substitutions={awaySubstitutions}
                        />
                      </>
                    )
                  })()}
                </div>

                {/* Substitutions History */}
                {(() => {
                  const { homeTeam, awayTeam } = getSelectedMatchTeams()
                  return (
                    <SubstitutionManager
                      matchId={selectedMatch}
                      homeTeamName={homeTeam?.name || "Home Team"}
                      awayTeamName={awayTeam?.name || "Away Team"}
                      homeSubstitutions={homeSubstitutions}
                      awaySubstitutions={awaySubstitutions}
                      onSaveSubstitutions={handleSaveSubstitutions}
                    />
                  )
                })()}

                <div className="mt-6 pt-6 border-t">
                  <Button onClick={saveLineup} className="w-full" size="lg">
                    Save Lineups
                  </Button>
                </div>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="live" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Play className="h-5 w-5" />
              Live Match Control
            </h2>

            <div className="mb-6">
              <label className="text-sm font-medium mb-2 block">Select Match to Control</label>
              <Select value={selectedLiveMatch} onValueChange={setSelectedLiveMatch}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a match with lineups set" />
                </SelectTrigger>
                <SelectContent>
                  {getEligibleMatches().map((match) => (
                    <SelectItem key={match.id} value={match.id}>
                      {match.homeTeam} vs {match.awayTeam} - {match.date} ({match.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedLiveMatch && getSelectedLiveMatch() ? (
              <LiveMatchControl
                match={getSelectedLiveMatch()!}
                homeTeamPlayers={homeTeamPlayers}
                awayTeamPlayers={awayTeamPlayers}
                onMatchUpdate={handleMatchUpdate}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {getEligibleMatches().length === 0
                    ? "No matches with lineups set are available for live control."
                    : "Please select a match to start live control."}
                </p>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
