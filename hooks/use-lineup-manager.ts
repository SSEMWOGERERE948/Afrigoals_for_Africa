"use client"

import { useState, useCallback } from "react"
import type { FutsalTeam, FutsalPlayer, FutsalMatch, FutsalTeamLineup } from "@/app/types"

interface UseLineupManagerProps {
  match: FutsalMatch
  homeTeam: FutsalTeam
  awayTeam: FutsalTeam
  homePlayers: FutsalPlayer[]
  awayPlayers: FutsalPlayer[]
  onSaveLineups: (homeLineup: FutsalTeamLineup, awayLineup: FutsalTeamLineup) => Promise<void>
}

const futsalFormations = {
  5: ["1-2-1", "1-1-2", "2-2", "1-3"],
  6: ["1-2-2", "1-3-1", "2-2-1", "1-1-3"],
  7: ["1-2-3", "1-3-2", "2-3-1", "1-4-1"],
}

export function useLineupManager({
  match,
  homeTeam,
  awayTeam,
  homePlayers,
  awayPlayers,
  onSaveLineups,
}: UseLineupManagerProps) {
  const [homeLineup, setHomeLineup] = useState<FutsalTeamLineup>({
    formation: futsalFormations[match?.teamSize as keyof typeof futsalFormations]?.[0] || "1-2-1",
    startingXI: [],
    substitutes: [],
    coach: homeTeam?.manager || "",
  })

  const [awayLineup, setAwayLineup] = useState<FutsalTeamLineup>({
    formation: futsalFormations[match?.teamSize as keyof typeof futsalFormations]?.[0] || "1-2-1",
    startingXI: [],
    substitutes: [],
    coach: awayTeam?.manager || "",
  })

  const [errorMessage, setErrorMessage] = useState<string>("")
  const [successMessage, setSuccessMessage] = useState<string>("")
  const [isSaving, setIsSaving] = useState(false)

  const updateHomeLineup = useCallback((lineup: FutsalTeamLineup) => {
    setHomeLineup(lineup)
    setErrorMessage("")
  }, [])

  const updateAwayLineup = useCallback((lineup: FutsalTeamLineup) => {
    setAwayLineup(lineup)
    setErrorMessage("")
  }, [])

  const validateLineups = useCallback(() => {
    if (!match) return false

    if (homeLineup.startingXI.length !== match.teamSize) {
      setErrorMessage(`Home team needs exactly ${match.teamSize} players in starting XI`)
      return false
    }

    if (awayLineup.startingXI.length !== match.teamSize) {
      setErrorMessage(`Away team needs exactly ${match.teamSize} players in starting XI`)
      return false
    }

    // Check for goalkeepers (optional validation)
    const homeHasGK = homeLineup.startingXI.some((p) => p && p.positionId === "1") // Assuming GK position ID is 1
    const awayHasGK = awayLineup.startingXI.some((p) => p && p.positionId === "1")

    if (!homeHasGK || !awayHasGK) {
      setErrorMessage("Both teams should have a goalkeeper in their starting XI")
      // Don't return false - this is just a warning
    }

    return true
  }, [homeLineup, awayLineup, match])

  const autoSelectPlayers = useCallback(
    (team: "home" | "away") => {
      if (!match) return

      const players = team === "home" ? homePlayers : awayPlayers
      const teamName = team === "home" ? homeTeam?.teamName : awayTeam?.teamName

      if (!players || players.length === 0) {
        setErrorMessage(`No players available for ${teamName}`)
        return
      }

      // Sort players: goalkeepers first, then by position preference
      const goalkeepers = players.filter((p) => p.positionId === "1") // Assuming GK position ID is 1
      const outfieldPlayers = players.filter((p) => p.positionId !== "1")

      const startingXI = [
        ...(goalkeepers.length > 0 ? [goalkeepers[0]] : []),
        ...outfieldPlayers.slice(0, match.teamSize - (goalkeepers.length > 0 ? 1 : 0)),
      ].slice(0, match.teamSize)

      const substitutes = players.filter((p) => !startingXI.includes(p))

      const newLineup = {
        formation: futsalFormations[match.teamSize as keyof typeof futsalFormations]?.[0] || "1-2-1",
        startingXI,
        substitutes,
        coach: team === "home" ? homeTeam?.manager || "" : awayTeam?.manager || "",
      }

      if (team === "home") {
        setHomeLineup(newLineup)
      } else {
        setAwayLineup(newLineup)
      }

      setErrorMessage("")
      setSuccessMessage(`Auto-selected players for ${teamName}`)
      setTimeout(() => setSuccessMessage(""), 3000)
    },
    [match, homePlayers, awayPlayers, homeTeam, awayTeam],
  )

  const handleSave = useCallback(async () => {
    setErrorMessage("")
    setSuccessMessage("")

    if (!validateLineups()) {
      return
    }

    try {
      setIsSaving(true)
      await onSaveLineups(homeLineup, awayLineup)
      setSuccessMessage("Lineups saved successfully!")
      setTimeout(() => setSuccessMessage(""), 5000)
    } catch (error) {
      console.error("Failed to save lineups:", error)
      setErrorMessage("Failed to save lineups. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }, [homeLineup, awayLineup, validateLineups, onSaveLineups])

  const resetLineups = useCallback(() => {
    setHomeLineup({
      formation: futsalFormations[match?.teamSize as keyof typeof futsalFormations]?.[0] || "1-2-1",
      startingXI: [],
      substitutes: [],
      coach: homeTeam?.manager || "",
    })

    setAwayLineup({
      formation: futsalFormations[match?.teamSize as keyof typeof futsalFormations]?.[0] || "1-2-1",
      startingXI: [],
      substitutes: [],
      coach: awayTeam?.manager || "",
    })

    setErrorMessage("")
    setSuccessMessage("Lineups reset successfully")
    setTimeout(() => setSuccessMessage(""), 3000)
  }, [match, homeTeam, awayTeam])

  return {
    homeLineup,
    awayLineup,
    errorMessage,
    successMessage,
    isSaving,
    updateHomeLineup,
    updateAwayLineup,
    autoSelectPlayers,
    handleSave,
    validateLineups,
    resetLineups,
  }
}
