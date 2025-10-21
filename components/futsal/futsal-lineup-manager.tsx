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
import {
  TeamLineupFullResponse,
  fetchBothLineups,
  TeamLineupSaveRequest,
  saveTeamLineup,
  deleteTeamLineup,
} from "@/lib/lineups/api"

// ✅ Define valid team sizes for futsal
type FutsalTeamSize = 4 | 5 | 6 | 7

// ✅ Typed formations map — fixes the implicit 'any' type issue
const futsalFormations: Record<FutsalTeamSize, string[]> = {
  4: ["1-2-1", "1-1-2", "2-2", "1-3"], // 4-a-side
  5: ["1-3-1", "1-2-2", "2-2-1", "1-4"], // 5-a-side
  6: ["1-4-1", "1-3-2", "2-3-1", "1-5"], // 6-a-side
  7: ["1-5-1", "1-4-2", "2-4-1", "1-6"], // 7-a-side
}

// ✅ Fetch available positions (fallback to defaults if backend unavailable)
async function fetchFutsalPositions(): Promise<FutsalPosition[]> {
  try {
    const response = await fetch("/api/futsal/positions")
    if (!response.ok) throw new Error("Failed to fetch positions")
    return await response.json()
  } catch (error) {
    console.error("Error fetching futsal positions:", error)
    return [
      { id: "1", name: "Goalkeeper", abbreviation: "GK", description: "Defends the goal" },
      { id: "2", name: "Defender", abbreviation: "DEF", description: "Defensive player" },
      { id: "3", name: "Midfielder", abbreviation: "MID", description: "Central player" },
      { id: "4", name: "Forward", abbreviation: "FWD", description: "Attacking player" },
      { id: "5", name: "Pivot", abbreviation: "PIV", description: "Target player" },
    ]
  }
}

interface FutsalLineupManagerProps {
  match: FutsalMatch
  homeTeam: FutsalTeam
  awayTeam: FutsalTeam
  homePlayers: FutsalPlayer[]
  awayPlayers: FutsalPlayer[]
  onSaveLineups?: (homeLineup: FutsalTeamLineup, awayLineup: FutsalTeamLineup) => Promise<void>
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

  const safeHomeTeam = homeTeam || { name: "Home Team", teamName: "Home Team", manager: "" }
  const safeAwayTeam = awayTeam || { name: "Away Team", teamName: "Away Team", manager: "" }
  const safeHomePlayers = homePlayers || []
  const safeAwayPlayers = awayPlayers || []
  const safeMatch = match || { teamSize: 5, matchDuration: 40 }

  const [positions, setPositions] = useState<FutsalPosition[]>([])
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [existingLineups, setExistingLineups] = useState<{
    HOME?: TeamLineupFullResponse
    AWAY?: TeamLineupFullResponse
  } | null>(null)
  const [isLoadingLineups, setIsLoadingLineups] = useState(false)
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false)
  const [lineupsExist, setLineupsExist] = useState(false)
  const [isCheckingLineups, setIsCheckingLineups] = useState(false)

  // ✅ Initial lineups with safe defaults (narrowed type cast at access)
  const [homeLineup, setHomeLineup] = useState<FutsalTeamLineup>({
    formation: futsalFormations[safeMatch.teamSize as FutsalTeamSize]?.[0] || "1-3-1",
    startingXI: [],
    substitutes: [],
    coach: safeHomeTeam.manager || "",
  })

  const [awayLineup, setAwayLineup] = useState<FutsalTeamLineup>({
    formation: futsalFormations[safeMatch.teamSize as FutsalTeamSize]?.[0] || "1-3-1",
    startingXI: [],
    substitutes: [],
    coach: safeAwayTeam.manager || "",
  })

  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // ✅ Load positions on mount
  useEffect(() => {
    ;(async () => {
      const positionsData = await fetchFutsalPositions()
      setPositions(positionsData)
      console.log("Positions loaded:", positionsData)
    })()
  }, [])

  // ✅ Load lineups when match changes
  useEffect(() => {
    if (match?.id) loadExistingLineups()
  }, [match?.id])

  // ✅ Load existing lineups
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

      if (lineups.HOME && lineups.AWAY) {
        console.log("Loaded lineups:", lineups)
        const homeStartingXI = lineups.HOME.startingXI
          .map((p) => safeHomePlayers.find((hp) => hp.id === p.playerId))
          .filter(Boolean) as FutsalPlayer[]
        const homeSubs = lineups.HOME.substitutes
          .map((p) => safeHomePlayers.find((hp) => hp.id === p.playerId))
          .filter(Boolean) as FutsalPlayer[]

        const awayStartingXI = lineups.AWAY.startingXI
          .map((p) => safeAwayPlayers.find((ap) => ap.id === p.playerId))
          .filter(Boolean) as FutsalPlayer[]
        const awaySubs = lineups.AWAY.substitutes
          .map((p) => safeAwayPlayers.find((ap) => ap.id === p.playerId))
          .filter(Boolean) as FutsalPlayer[]

        setHomeLineup({
          formation: lineups.HOME.formation || homeLineup.formation,
          coach: lineups.HOME.coach || safeHomeTeam.manager || "",
          startingXI: homeStartingXI,
          substitutes: homeSubs,
        })

        setAwayLineup({
          formation: lineups.AWAY.formation || awayLineup.formation,
          coach: lineups.AWAY.coach || safeAwayTeam.manager || "",
          startingXI: awayStartingXI,
          substitutes: awaySubs,
        })
        setSuccessMessage("Existing lineups loaded successfully!")
      }
    } catch (error: any) {
      console.error("Error loading lineups:", error)
      if (error.response?.status !== 404) setErrorMessage("Failed to load existing lineups")
      setExistingLineups(null)
      setLineupsExist(false)
    } finally {
      setIsLoadingLineups(false)
      setIsCheckingLineups(false)
    }
  }

  const getPositionName = (positionId: string): string => {
    const pos = positions.find((p) => String(p.id) === String(positionId))
    return pos?.name || "Unknown"
  }

  const autoSelectPlayers = (team: "home" | "away") => {
    const players = team === "home" ? safeHomePlayers : safeAwayPlayers
    const lineup = team === "home" ? homeLineup : awayLineup
    const setLineup = team === "home" ? setHomeLineup : setAwayLineup
    const teamName = team === "home" ? safeHomeTeam.teamName : safeAwayTeam.teamName

    if (!players.length) {
      setErrorMessage(`No players for ${teamName}`)
      return
    }

    const goalkeepers = players.filter((p) => getPositionName(p.positionId) === "Goalkeeper")
    const outfieldPlayers = players.filter((p) => getPositionName(p.positionId) !== "Goalkeeper")
    const startingXI = [goalkeepers[0], ...outfieldPlayers.slice(0, safeMatch.teamSize - 1)].filter(Boolean)
    const substitutes = players.filter((p) => !startingXI.includes(p))

    setLineup({ ...lineup, startingXI, substitutes })
    setSuccessMessage(`Auto-selected players for ${teamName}`)
  }

  const handlePlayerChange = (team: "home" | "away", position: number, playerId: string) => {
    const players = team === "home" ? safeHomePlayers : safeAwayPlayers
    const lineup = team === "home" ? homeLineup : awayLineup
    const setLineup = team === "home" ? setHomeLineup : setAwayLineup

    if (playerId === "default") {
      const old = lineup.startingXI[position]
      if (old) {
        const newXI = [...lineup.startingXI]
        newXI.splice(position, 1)
        const newSubs = [...lineup.substitutes, old]
        setLineup({ ...lineup, startingXI: newXI, substitutes: newSubs })
      }
      return
    }

    const player = players.find((p) => p.id === playerId)
    if (!player) return

    const newXI = [...lineup.startingXI]
    newXI[position] = player
    const newSubs = lineup.substitutes.filter((p) => p.id !== playerId)
    setLineup({ ...lineup, startingXI: newXI, substitutes: newSubs })
  }

  const handleFormationChange = (team: "home" | "away", formation: string) => {
    if (team === "home") setHomeLineup({ ...homeLineup, formation })
    else setAwayLineup({ ...awayLineup, formation })
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold text-orange-600 mb-4">Futsal Lineup Manager</h2>
      <p className="text-muted-foreground mb-4">
        {safeHomeTeam.teamName} vs {safeAwayTeam.teamName} • {safeMatch.teamSize}-a-side • {safeMatch.matchDuration} minutes
      </p>

      {/* Formation selectors */}
      <Card className="p-4 mb-4">
        <h3 className="font-semibold text-lg mb-2">Home Formation</h3>
        <Select value={homeLineup.formation} onValueChange={(v) => handleFormationChange("home", v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {futsalFormations[safeMatch.teamSize as FutsalTeamSize].map((f) => (
              <SelectItem key={f} value={f}>
                {f}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold text-lg mb-2">Away Formation</h3>
        <Select value={awayLineup.formation} onValueChange={(v) => handleFormationChange("away", v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {futsalFormations[safeMatch.teamSize as FutsalTeamSize].map((f) => (
              <SelectItem key={f} value={f}>
                {f}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>
    </div>
  )
}
