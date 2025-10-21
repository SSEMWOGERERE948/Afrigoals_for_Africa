"use client"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Users,
  Save,
  RotateCcw,
  Info,
  Shield,
  Target,
  AlertTriangle,
  CheckCircle,
  X,
  Loader2,
  Download,
  Trash2,
} from "lucide-react"
import type { FutsalTeam, FutsalPlayer, FutsalMatch, FutsalTeamLineup, FutsalPosition } from "@/app/types"
import FutsalFieldDisplay from "./futsal-field-display"
import { TeamLineupFullResponse, fetchBothLineups, TeamLineupSaveRequest, saveTeamLineup, deleteTeamLineup } from "@/lib/lineups/api"


interface FutsalLineupManagerProps {
  match: FutsalMatch
  homeTeam: FutsalTeam
  awayTeam: FutsalTeam
  homePlayers: FutsalPlayer[]
  awayPlayers: FutsalPlayer[]
  onSaveLineups?: (homeLineup: FutsalTeamLineup, awayLineup: FutsalTeamLineup) => Promise<void>
}

// Futsal formations based on team size - corrected to match backend validation
const futsalFormations = {
  4: ["1-2-1", "1-1-2", "2-2", "1-3"], // 4-a-side formations
  5: ["1-3-1", "1-2-2", "2-2-1", "1-4"], // 5-a-side formations
  6: ["1-4-1", "1-3-2", "2-3-1", "1-5"], // 6-a-side formations
  7: ["1-5-1", "1-4-2", "2-4-1", "1-6"], // 7-a-side formations
}

// Fetch positions function
async function fetchFutsalPositions(): Promise<FutsalPosition[]> {
  try {
    const response = await fetch("/api/futsal/positions")
    if (!response.ok) {
      throw new Error("Failed to fetch positions")
    }
    return await response.json()
  } catch (error) {
    console.error("Error fetching futsal positions:", error)
    // Return default positions if API fails
    return [
      { id: "1", name: "Goalkeeper", abbreviation: "GK", description: "Defends the goal" },
      { id: "2", name: "Defender", abbreviation: "DEF", description: "Defensive player" },
      { id: "3", name: "Midfielder", abbreviation: "MID", description: "Central player" },
      { id: "4", name: "Forward", abbreviation: "FWD", description: "Attacking player" },
      { id: "5", name: "Pivot", abbreviation: "PIV", description: "Target player" },
    ]
  }
}

export default function FutsalLineupManager({
  match,
  homeTeam,
  awayTeam,
  homePlayers,
  awayPlayers,
  onSaveLineups,
}: FutsalLineupManagerProps) {
  console.log("FutsalLineupManager props:", { match, homeTeam, awayTeam, homePlayers, awayPlayers })

  // Add null checks and default values
  const safeHomeTeam = homeTeam || { name: "Home Team", teamName: "Home Team", manager: "" }
  const safeAwayTeam = awayTeam || { name: "Away Team", teamName: "Away Team", manager: "" }
  const safeHomePlayers = homePlayers || []
  const safeAwayPlayers = awayPlayers || []
  const safeMatch = match || { teamSize: 5, matchDuration: 40 }

  // Add positions state
  const [positions, setPositions] = useState<FutsalPosition[]>([])
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [successMessage, setSuccessMessage] = useState<string>("")
  const [existingLineups, setExistingLineups] = useState<{
    HOME?: TeamLineupFullResponse
    AWAY?: TeamLineupFullResponse
  } | null>(null)
  const [isLoadingLineups, setIsLoadingLineups] = useState(false)
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false)
  const [lineupsExist, setLineupsExist] = useState(false)
  const [isCheckingLineups, setIsCheckingLineups] = useState(false)

  const [homeLineup, setHomeLineup] = useState<FutsalTeamLineup>({
    formation: futsalFormations[safeMatch.teamSize]?.[0] || "1-3-1", // Changed default
    startingXI: [],
    substitutes: [],
    coach: safeHomeTeam.manager || "",
  })

  const [awayLineup, setAwayLineup] = useState<FutsalTeamLineup>({
    formation: futsalFormations[safeMatch.teamSize]?.[0] || "1-3-1", // Changed default
    startingXI: [],
    substitutes: [],
    coach: safeAwayTeam.manager || "",
  })

  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Load positions on component mount
  useEffect(() => {
    const loadPositions = async () => {
      try {
        const positionsData = await fetchFutsalPositions()
        setPositions(positionsData)
        console.log("Positions loaded in lineup manager:", positionsData)
      } catch (error) {
        console.error("Failed to load positions:", error)
      }
    }

    loadPositions()
  }, [])

  // Load existing lineups when match changes
  useEffect(() => {
    if (match?.id) {
      loadExistingLineups()
    }
  }, [match?.id])

  // Also load lineups when players are available
  useEffect(() => {
    if (match?.id && safeHomePlayers.length > 0 && safeAwayPlayers.length > 0 && !hasAttemptedLoad) {
      loadExistingLineups()
    }
  }, [match?.id, safeHomePlayers.length, safeAwayPlayers.length, hasAttemptedLoad])

  // Initialize lineups with all players as substitutes ONLY if no lineups exist
  useEffect(() => {
    if (safeHomePlayers.length > 0 && !existingLineups?.HOME && !lineupsExist && hasAttemptedLoad) {
      setHomeLineup((prev) => ({
        ...prev,
        substitutes: [...safeHomePlayers],
        startingXI: [],
      }))
    }
  }, [safeHomePlayers, existingLineups?.HOME, lineupsExist, hasAttemptedLoad])

  useEffect(() => {
    if (safeAwayPlayers.length > 0 && !existingLineups?.AWAY && !lineupsExist && hasAttemptedLoad) {
      setAwayLineup((prev) => ({
        ...prev,
        substitutes: [...safeAwayPlayers],
        startingXI: [],
      }))
    }
  }, [safeAwayPlayers, existingLineups?.AWAY, lineupsExist, hasAttemptedLoad])

  const loadExistingLineups = async () => {
    if (!match?.id) return

    try {
      setIsLoadingLineups(true)
      setIsCheckingLineups(true)
      setErrorMessage("")

      const lineups = await fetchBothLineups(match.id.toString())
      setExistingLineups(lineups)
      setLineupsExist(true)
      setHasAttemptedLoad(true)

      // Parse and populate the lineups if they exist
      if (lineups.HOME && lineups.AWAY) {
        console.log("Loaded existing lineups:", lineups)

        // Parse home lineup
        if (lineups.HOME.startingXI && lineups.HOME.substitutes) {
          const homeStartingXI = lineups.HOME.startingXI
            .map((playerOnField) => safeHomePlayers.find((p) => p.id === playerOnField.playerId))
            .filter(Boolean) as FutsalPlayer[]

          const homeSubstitutes = lineups.HOME.substitutes
            .map((playerOnField) => safeHomePlayers.find((p) => p.id === playerOnField.playerId))
            .filter(Boolean) as FutsalPlayer[]

          setHomeLineup({
            formation: lineups.HOME.formation || homeLineup.formation,
            coach: lineups.HOME.coach || safeHomeTeam.manager || "",
            startingXI: homeStartingXI,
            substitutes: homeSubstitutes,
          })
        }

        // Parse away lineup
        if (lineups.AWAY.startingXI && lineups.AWAY.substitutes) {
          const awayStartingXI = lineups.AWAY.startingXI
            .map((playerOnField) => safeAwayPlayers.find((p) => p.id === playerOnField.playerId))
            .filter(Boolean) as FutsalPlayer[]

          const awaySubstitutes = lineups.AWAY.substitutes
            .map((playerOnField) => safeAwayPlayers.find((p) => p.id === playerOnField.playerId))
            .filter(Boolean) as FutsalPlayer[]

          setAwayLineup({
            formation: lineups.AWAY.formation || awayLineup.formation,
            coach: lineups.AWAY.coach || safeAwayTeam.manager || "",
            startingXI: awayStartingXI,
            substitutes: awaySubstitutes,
          })
        }

        setSuccessMessage("Existing lineups loaded and populated successfully!")
        setTimeout(() => setSuccessMessage(""), 3000)
      }
    } catch (error: any) {
      console.error("Failed to load existing lineups:", error)
      setExistingLineups(null)
      setLineupsExist(false)
      setHasAttemptedLoad(true)

      // Only show error if it's not a 404 (lineups don't exist)
      if (error.response?.status !== 404) {
        setErrorMessage("Failed to load existing lineups")
      } else {
        console.log("No existing lineups found - will create new ones")
      }
    } finally {
      setIsLoadingLineups(false)
      setIsCheckingLineups(false)
    }
  }

  // Helper function to get position name by ID
  const getPositionName = (positionId: string): string => {
    if (!positionId) return "Unknown"
    const position = positions.find((p) => String(p.id) === String(positionId))
    return position?.name || "Unknown"
  }

  const autoSelectPlayers = (team: "home" | "away") => {
    const players = team === "home" ? safeHomePlayers : safeAwayPlayers
    const lineup = team === "home" ? homeLineup : awayLineup
    const teamName = team === "home" ? safeHomeTeam.teamName : safeAwayTeam.teamName

    if (!players || players.length === 0) {
      setErrorMessage(`No players available for ${teamName}`)
      return
    }

    // Ensure we have at least one goalkeeper
    const goalkeepers = players.filter((p) => getPositionName(p.positionId) === "Goalkeeper")
    const outfieldPlayers = players.filter((p) => getPositionName(p.positionId) !== "Goalkeeper")

    const startingXI = [
      goalkeepers[0], // Always start with a goalkeeper
      ...outfieldPlayers.slice(0, safeMatch.teamSize - 1), // Fill remaining positions
    ].filter(Boolean) // Remove any undefined values

    const substitutes = players.filter((p) => !startingXI.includes(p))

    const newLineup = {
      ...lineup,
      startingXI,
      substitutes,
    }

    if (team === "home") {
      setHomeLineup(newLineup)
    } else {
      setAwayLineup(newLineup)
    }

    setErrorMessage("")
    setSuccessMessage(`Auto-selected players for ${teamName}`)
    setTimeout(() => setSuccessMessage(""), 3000)
  }

  const handlePlayerChange = (team: "home" | "away", position: number, playerId: string) => {
    const players = team === "home" ? safeHomePlayers : safeAwayPlayers
    const lineup = team === "home" ? homeLineup : awayLineup
    const setLineup = team === "home" ? setHomeLineup : setAwayLineup

    // Handle removing a player (empty selection or default)
    if (playerId === "default") {
      const oldPlayer = lineup.startingXI[position]
      if (oldPlayer) {
        // Create new starting XI without the removed player
        const newStartingXI = [...lineup.startingXI]
        newStartingXI.splice(position, 1) // Remove player at position

        // Add old player back to substitutes
        const newSubstitutes = [...lineup.substitutes, oldPlayer]

        setLineup({
          ...lineup,
          startingXI: newStartingXI,
          substitutes: newSubstitutes,
        })
      }
      setErrorMessage("")
      return
    }

    // Handle adding/changing a player
    const player = players.find((p) => p.id === playerId)
    if (!player) return

    const newStartingXI = [...lineup.startingXI]
    const oldPlayer = newStartingXI[position]

    // Ensure the array is long enough
    while (newStartingXI.length <= position) {
      newStartingXI.push(undefined as any)
    }

    newStartingXI[position] = player

    // Move old player to substitutes if exists
    let newSubstitutes = [...lineup.substitutes]
    if (oldPlayer) {
      newSubstitutes.push(oldPlayer)
    }

    // Remove new player from substitutes
    newSubstitutes = newSubstitutes.filter((p) => p.id !== playerId)

    setLineup({
      ...lineup,
      startingXI: newStartingXI,
      substitutes: newSubstitutes,
    })

    setErrorMessage("")
  }

  const handleFormationChange = (team: "home" | "away", formation: string) => {
    const lineup = team === "home" ? homeLineup : awayLineup
    const newLineup = { ...lineup, formation }

    if (team === "home") {
      setHomeLineup(newLineup)
    } else {
      setAwayLineup(newLineup)
    }
  }

  const handleSave = async () => {
    if (!match?.id) {
      setErrorMessage("No match selected")
      return
    }

    setErrorMessage("")
    setSuccessMessage("")

    // Validate lineups
    if (homeLineup.startingXI.length !== safeMatch.teamSize) {
      setErrorMessage(`Home team needs exactly ${safeMatch.teamSize} players in starting XI`)
      return
    }

    if (awayLineup.startingXI.length !== safeMatch.teamSize) {
      setErrorMessage(`Away team needs exactly ${safeMatch.teamSize} players in starting XI`)
      return
    }

    // Check for goalkeepers
    const homeHasGK = homeLineup.startingXI.some((p) => getPositionName(p.positionId) === "Goalkeeper")
    const awayHasGK = awayLineup.startingXI.some((p) => getPositionName(p.positionId) === "Goalkeeper")

    if (!homeHasGK || !awayHasGK) {
      setErrorMessage("Both teams must have a goalkeeper in their starting XI")
      return
    }

    try {
      setIsSaving(true)

      // Prepare the lineup requests
      const homeLineupRequest: TeamLineupSaveRequest = {
        formation: homeLineup.formation,
        coach: homeLineup.coach || safeHomeTeam.manager || "Unknown Coach",
        startingXIIds: homeLineup.startingXI.map((player) => player.id),
        substituteIds: homeLineup.substitutes.map((player) => player.id),
      }

      const awayLineupRequest: TeamLineupSaveRequest = {
        formation: awayLineup.formation,
        coach: awayLineup.coach || safeAwayTeam.manager || "Unknown Coach",
        startingXIIds: awayLineup.startingXI.map((player) => player.id),
        substituteIds: awayLineup.substitutes.map((player) => player.id),
      }

      // Save both lineups in parallel
      await Promise.all([
        saveTeamLineup(match.id.toString(), "HOME", homeLineupRequest),
        saveTeamLineup(match.id.toString(), "AWAY", awayLineupRequest),
      ])

      setSuccessMessage(lineupsExist ? "Lineups updated successfully!" : "Lineups created successfully!")
      setLineupsExist(true)
      setHasAttemptedLoad(true)

      // Update existing lineups state to reflect the save
      setExistingLineups({
        HOME: {
          formation: homeLineup.formation,
          coach: homeLineup.coach || safeHomeTeam.manager || "",
          startingXI: homeLineup.startingXI.map((player, index) => ({
            playerId: player.id,
            name: player.name,
            number: player.number,
            position: getPositionName(player.positionId),
            teamName: safeHomeTeam.teamName,
            isStarting: true,
            rowIndex: 0, // These would be calculated by the backend
            colIndex: index,
          })),
          substitutes: homeLineup.substitutes.map((player, index) => ({
            playerId: player.id,
            name: player.name,
            number: player.number,
            position: getPositionName(player.positionId),
            teamName: safeHomeTeam.teamName,
            isStarting: false,
            rowIndex: 0,
            colIndex: index,
          })),
        },
        AWAY: {
          formation: awayLineup.formation,
          coach: awayLineup.coach || safeAwayTeam.manager || "",
          startingXI: awayLineup.startingXI.map((player, index) => ({
            playerId: player.id,
            name: player.name,
            number: player.number,
            position: getPositionName(player.positionId),
            teamName: safeAwayTeam.teamName,
            isStarting: true,
            rowIndex: 0,
            colIndex: index,
          })),
          substitutes: awayLineup.substitutes.map((player, index) => ({
            playerId: player.id,
            name: player.name,
            number: player.number,
            position: getPositionName(player.positionId),
            teamName: safeAwayTeam.teamName,
            isStarting: false,
            rowIndex: 0,
            colIndex: index,
          })),
        },
      })

      // Call the optional callback
      if (onSaveLineups) {
        await onSaveLineups(homeLineup, awayLineup)
      }

      setTimeout(() => setSuccessMessage(""), 5000)
    } catch (error: any) {
      console.error("Failed to save lineups:", error)
      const errorMessage = error.response?.data?.message || error.message || "Unknown error"
      setErrorMessage(`Failed to save lineups: ${errorMessage}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteLineups = async () => {
    if (!match?.id || !existingLineups) {
      setErrorMessage("No lineups to delete")
      return
    }

    if (!confirm("Are you sure you want to delete the lineups for this match?")) {
      return
    }

    try {
      setIsDeleting(true)
      setErrorMessage("")

      // Delete both lineups in parallel
      await Promise.all([deleteTeamLineup(match.id.toString(), "HOME"), deleteTeamLineup(match.id.toString(), "AWAY")])

      setExistingLineups(null)
      setLineupsExist(false)
      setSuccessMessage("Lineups deleted successfully!")

      // Reset lineups to initial state
      setHomeLineup({
        formation: futsalFormations[safeMatch.teamSize]?.[0] || "1-3-1", // Changed default
        startingXI: [],
        substitutes: [...safeHomePlayers],
        coach: safeHomeTeam.manager || "",
      })

      setAwayLineup({
        formation: futsalFormations[safeMatch.teamSize]?.[0] || "1-3-1", // Changed default
        startingXI: [],
        substitutes: [...safeAwayPlayers],
        coach: safeAwayTeam.manager || "",
      })

      setTimeout(() => setSuccessMessage(""), 5000)
    } catch (error: any) {
      console.error("Failed to delete lineups:", error)
      const errorMessage = error.response?.data?.message || error.message || "Unknown error"
      setErrorMessage(`Failed to delete lineups: ${errorMessage}`)
    } finally {
      setIsDeleting(false)
    }
  }

  const getAvailablePlayers = (team: "home" | "away", currentPosition: number) => {
    const players = team === "home" ? safeHomePlayers : safeAwayPlayers
    const lineup = team === "home" ? homeLineup : awayLineup
    const currentPlayer = lineup.startingXI[currentPosition]

    if (!players || players.length === 0) return []

    return players.filter((p) => {
      // Include current player
      if (currentPlayer && p.id === currentPlayer.id) return true
      // Exclude players already in starting XI
      return !lineup.startingXI.some((sp) => sp?.id === p.id)
    })
  }

  // Early return if essential data is missing
  if (!match) {
    return (
      <div className="flex items-center justify-center p-8">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>No match selected. Please select a match first.</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!homeTeam || !awayTeam) {
    return (
      <div className="flex items-center justify-center p-8">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>Team data not available. Please ensure both teams exist for this match.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Lineup Status Card */}
      <Card
        className={`p-4 border-2 ${
          isCheckingLineups
            ? "border-yellow-500 bg-yellow-500/10 dark:border-yellow-400 dark:bg-yellow-400/10"
            : lineupsExist
              ? "border-blue-500 bg-blue-500/10 dark:border-blue-400 dark:bg-blue-400/10"
              : "border-green-500 bg-green-500/10 dark:border-green-400 dark:bg-green-400/10"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isCheckingLineups ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin text-yellow-600 dark:text-yellow-400" />
                <div>
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">Checking Lineup Status</h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Please wait while we check for existing lineups...
                  </p>
                </div>
              </>
            ) : lineupsExist ? (
              <>
                <CheckCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <div>
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200">Lineups Exist - Update Mode</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Lineups are already set for this match. You can modify and update them.
                  </p>
                </div>
              </>
            ) : hasAttemptedLoad ? (
              <>
                <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
                <div>
                  <h3 className="font-semibold text-green-800 dark:text-green-200">No Lineups - Create Mode</h3>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    No lineups found for this match. Set up players and create new lineups.
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertTriangle className="h-6 w-6 text-muted-foreground" />
                <div>
                  <h3 className="font-semibold text-foreground">Status Unknown</h3>
                  <p className="text-sm text-muted-foreground">
                    Click "Load Lineups" to check if lineups exist for this match.
                  </p>
                </div>
              </>
            )}
          </div>

          {hasAttemptedLoad && (
            <Badge
              variant="outline"
              className={`${
                lineupsExist
                  ? "border-blue-500 text-blue-700 bg-blue-500/10 dark:border-blue-400 dark:text-blue-300 dark:bg-blue-400/10"
                  : "border-green-500 text-green-700 bg-green-500/10 dark:border-green-400 dark:text-green-300 dark:bg-green-400/10"
              } font-medium`}
            >
              {lineupsExist ? "UPDATE MODE" : "CREATE MODE"}
            </Badge>
          )}
        </div>
      </Card>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-orange-600">Futsal Lineup Manager</h2>
          <p className="text-muted-foreground">
            {safeHomeTeam.teamName} vs {safeAwayTeam.teamName} • {safeMatch.teamSize}-a-side • {safeMatch.matchDuration}{" "}
            minutes
          </p>

          {/* Lineup Status Indicator */}
          <div className="mt-2">
            {isCheckingLineups ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
                <p className="text-sm text-blue-600 dark:text-blue-400">Checking for existing lineups...</p>
              </div>
            ) : hasAttemptedLoad && lineupsExist ? (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <p className="text-sm text-green-600 dark:text-green-300 font-medium">
                  ✓ Lineups exist for this match - Ready to update
                </p>
              </div>
            ) : hasAttemptedLoad && !lineupsExist ? (
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <p className="text-sm text-blue-600 dark:text-blue-300 font-medium">
                  ℹ No lineups set - Ready to create new lineups
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <p className="text-sm text-yellow-600 dark:text-yellow-300">
                  Lineup status unknown - Click "Load Lineups" to check
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={loadExistingLineups} disabled={isLoadingLineups || isCheckingLineups}>
            <Download className="h-4 w-4 mr-2" />
            {isLoadingLineups ? "Checking..." : "Load Lineups"}
          </Button>
          <Button variant="outline" onClick={() => autoSelectPlayers("home")}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Auto Home
          </Button>
          <Button variant="outline" onClick={() => autoSelectPlayers("away")}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Auto Away
          </Button>
          {lineupsExist && (
            <Button variant="destructive" onClick={handleDeleteLineups} disabled={isDeleting}>
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? "Deleting..." : "Delete Lineups"}
            </Button>
          )}

          {/* Main Action Button with Clear State */}
          <Button
            onClick={handleSave}
            disabled={isSaving || isCheckingLineups}
            className={`${
              lineupsExist ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"
            } min-w-[140px]`}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {lineupsExist ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {lineupsExist ? "Update Lineups" : "Create Lineups"}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error/Success Messages */}
      {errorMessage && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="border-green-500 bg-green-500/10 dark:border-green-400 dark:bg-green-400/10">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Info Alert */}
      <Alert
        className={`${
          lineupsExist
            ? "border-blue-500 bg-blue-500/10 dark:border-blue-400 dark:bg-blue-400/10"
            : "border-green-500 bg-green-500/10 dark:border-green-400 dark:bg-green-400/10"
        }`}
      >
        <Info className="h-4 w-4 text-muted-foreground" />
        <AlertDescription className="text-foreground">
          <div className="space-y-1">
            <p>
              Each team needs exactly {safeMatch.teamSize} players including 1 goalkeeper. Remaining players will be
              substitutes.
            </p>
            {!hasAttemptedLoad ? (
              <p className="font-medium text-yellow-700 dark:text-yellow-300">⏳ Loading lineup status...</p>
            ) : lineupsExist ? (
              <p className="font-medium text-blue-700 dark:text-blue-300">
                🔄 Lineups exist and will be UPDATED when you save.
              </p>
            ) : (
              <p className="font-medium text-green-700 dark:text-green-300">
                ✨ New lineups will be CREATED when you save.
              </p>
            )}
          </div>
        </AlertDescription>
      </Alert>

      {/* Team Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 bg-card border-border">
          <h3 className="font-semibold mb-2 text-foreground">{safeHomeTeam.teamName}</h3>
          <div className="space-y-1 text-sm text-foreground">
            <div>Total Players: {safeHomePlayers.length}</div>
            <div>
              Goalkeepers: {safeHomePlayers.filter((p) => getPositionName(p.positionId) === "Goalkeeper").length}
            </div>
            <div>
              Starting XI: {homeLineup.startingXI.length}/{safeMatch.teamSize}
            </div>
            <div>Substitutes: {homeLineup.substitutes.length}</div>
          </div>
        </Card>
        <Card className="p-4 bg-card border-border">
          <h3 className="font-semibold mb-2 text-foreground">{safeAwayTeam.teamName}</h3>
          <div className="space-y-1 text-sm text-foreground">
            <div>Total Players: {safeAwayPlayers.length}</div>
            <div>
              Goalkeepers: {safeAwayPlayers.filter((p) => getPositionName(p.positionId) === "Goalkeeper").length}
            </div>
            <div>
              Starting XI: {awayLineup.startingXI.length}/{safeMatch.teamSize}
            </div>
            <div>Substitutes: {awayLineup.substitutes.length}</div>
          </div>
        </Card>
      </div>

      {/* Formation Selection */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 bg-card border-border">
          <h3 className="font-semibold mb-2 text-foreground">Home Formation</h3>
          <Select value={homeLineup.formation} onValueChange={(value) => handleFormationChange("home", value)}>
            <SelectTrigger className="bg-background border-input">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {(futsalFormations[safeMatch.teamSize] || futsalFormations[5]).map((formation) => (
                <SelectItem key={formation} value={formation}>
                  {formation}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>
        <Card className="p-4 bg-card border-border">
          <h3 className="font-semibold mb-2 text-foreground">Away Formation</h3>
          <Select value={awayLineup.formation} onValueChange={(value) => handleFormationChange("away", value)}>
            <SelectTrigger className="bg-background border-input">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {(futsalFormations[safeMatch.teamSize] || futsalFormations[5]).map((formation) => (
                <SelectItem key={formation} value={formation}>
                  {formation}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>
      </div>

      {/* Player Selection */}
      <div className="grid grid-cols-2 gap-6">
        {/* Home Team */}
        <Card className="p-4 bg-card border-border">
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-foreground">
            <Users className="h-5 w-5 text-blue-600" />
            {safeHomeTeam.teamName} - Starting XI
          </h3>
          <div className="space-y-3">
            {Array.from({ length: safeMatch.teamSize }).map((_, index) => (
              <div key={index} className="flex items-center gap-2">
                <Badge variant="outline" className="w-8 text-center bg-background text-foreground border-border">
                  {index + 1}
                </Badge>
                <Select
                  value={homeLineup.startingXI[index]?.id || "default"}
                  onValueChange={(value) => handlePlayerChange("home", index, value)}
                >
                  <SelectTrigger className="flex-1 bg-background border-input">
                    <SelectValue placeholder="Select player" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="default">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <X className="h-4 w-4" />
                        Remove player
                      </div>
                    </SelectItem>
                    {getAvailablePlayers("home", index).map((player) => (
                      <SelectItem key={player.id} value={player.id}>
                        <div className="flex items-center gap-2">
                          {getPositionName(player.positionId) === "Goalkeeper" ? (
                            <Shield className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Target className="h-4 w-4 text-green-600" />
                          )}
                          #{player.number} {player.name} ({getPositionName(player.positionId)})
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </Card>

        {/* Away Team */}
        <Card className="p-4 bg-card border-border">
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-foreground">
            <Users className="h-5 w-5 text-red-600" />
            {safeAwayTeam.teamName} - Starting XI
          </h3>
          <div className="space-y-3">
            {Array.from({ length: safeMatch.teamSize }).map((_, index) => (
              <div key={index} className="flex items-center gap-2">
                <Badge variant="outline" className="w-8 text-center bg-background text-foreground border-border">
                  {index + 1}
                </Badge>
                <Select
                  value={awayLineup.startingXI[index]?.id || "default"}
                  onValueChange={(value) => handlePlayerChange("away", index, value)}
                >
                  <SelectTrigger className="flex-1 bg-background border-input">
                    <SelectValue placeholder="Select player" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="default">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <X className="h-4 w-4" />
                        Remove player
                      </div>
                    </SelectItem>
                    {getAvailablePlayers("away", index).map((player) => (
                      <SelectItem key={player.id} value={player.id}>
                        <div className="flex items-center gap-2">
                          {getPositionName(player.positionId) === "Goalkeeper" ? (
                            <Shield className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Target className="h-4 w-4 text-green-600" />
                          )}
                          #{player.number} {player.name} ({getPositionName(player.positionId)})
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Field Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FutsalFieldDisplay
          formation={homeLineup.formation}
          startingXI={homeLineup.startingXI}
          substitutes={homeLineup.substitutes}
          teamName={safeHomeTeam.teamName}
          isHome={true}
          teamSize={safeMatch.teamSize}
        />
        <FutsalFieldDisplay
          formation={awayLineup.formation}
          startingXI={awayLineup.startingXI}
          substitutes={awayLineup.substitutes}
          teamName={safeAwayTeam.teamName}
          isHome={false}
          teamSize={safeMatch.teamSize}
        />
      </div>

      {/* Substitutes Lists */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="p-4 bg-card border-border">
          <h3 className="font-semibold mb-4 text-foreground">Home Substitutes</h3>
          <div className="space-y-2">
            {homeLineup.substitutes.map((player) => (
              <div
                key={player.id}
                className="flex items-center gap-2 p-2 bg-muted/50 dark:bg-muted rounded border border-border"
              >
                {getPositionName(player.positionId) === "Goalkeeper" ? (
                  <Shield className="h-4 w-4 text-blue-600" />
                ) : (
                  <Target className="h-4 w-4 text-green-600" />
                )}
                <span>
                  #{player.number} {player.name}
                </span>
                <Badge variant="outline" className="ml-auto">
                  {getPositionName(player.positionId)}
                </Badge>
              </div>
            ))}
            {homeLineup.substitutes.length === 0 && (
              <p className="text-muted-foreground text-sm">No substitutes available</p>
            )}
          </div>
        </Card>
        <Card className="p-4 bg-card border-border">
          <h3 className="font-semibold mb-4 text-foreground">Away Substitutes</h3>
          <div className="space-y-2">
            {awayLineup.substitutes.map((player) => (
              <div
                key={player.id}
                className="flex items-center gap-2 p-2 bg-muted/50 dark:bg-muted rounded border border-border"
              >
                {getPositionName(player.positionId) === "Goalkeeper" ? (
                  <Shield className="h-4 w-4 text-blue-600" />
                ) : (
                  <Target className="h-4 w-4 text-green-600" />
                )}
                <span>
                  #{player.number} {player.name}
                </span>
                <Badge variant="outline" className="ml-auto">
                  {getPositionName(player.positionId)}
                </Badge>
              </div>
            ))}
            {awayLineup.substitutes.length === 0 && (
              <p className="text-muted-foreground text-sm">No substitutes available</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
