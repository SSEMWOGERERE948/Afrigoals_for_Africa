"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Loader2, Users } from "lucide-react"
import type { FutsalTeam, FutsalPlayer, FutsalPosition } from "@/app/types"
import axios from "axios"
import { fetchFutsalPlayers, fetchFutsalPositions, updateFutsalPlayer, createFutsalPlayer, deleteFutsalPlayer } from "@/lib/players/api"

// Base URL for the API
// Base URL for the API
const API_BASE_URL = "http://localhost:8080"

interface FutsalPlayersAdminProps {
  teams?: FutsalTeam[]
  players?: FutsalPlayer[]
  positions?: FutsalPosition[]
  onAddPlayer?: (player: FutsalPlayer) => void
  onUpdatePlayer?: (player: FutsalPlayer) => void
  onDeletePlayer?: (playerId: string) => void
}

export default function FutsalPlayersAdmin({
  teams: propTeams,
  players: propPlayers,
  positions: propPositions,
  onAddPlayer,
  onUpdatePlayer,
  onDeletePlayer,
}: FutsalPlayersAdminProps = {}) {
  const [players, setPlayers] = useState<FutsalPlayer[]>(propPlayers || [])
  const [teams, setTeams] = useState<FutsalTeam[]>(propTeams || [])
  const [positions, setPositions] = useState<FutsalPosition[]>(propPositions || [])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState<FutsalPlayer | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "checking">("checking")

  const [formData, setFormData] = useState({
    name: "",
    number: 0,
    nationality: "",
    age: 0,
    image: "",
    height: 0,
    weight: 0,
    preferredFoot: "right" as "left" | "right" | "both",
    teamName: "",
    positionId: "",
    studentId: "",
    course: "",
    yearOfStudy: "",
    stats: {
      matchesPlayed: 0,
      goals: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
      cleanSheets: 0,
    },
  })

  // Check API connection status
  const checkConnection = async () => {
    try {
      setConnectionStatus("checking")
      await axios.get(`http://localhost:8080/api/health`)
      setConnectionStatus("connected")
    } catch (error) {
      console.error("Connection check failed:", error)
      setConnectionStatus("disconnected")
    }
  }

  // Update local state when props change
  useEffect(() => {
    if (propPlayers) setPlayers(propPlayers)
  }, [propPlayers])

  useEffect(() => {
    if (propTeams) setTeams(propTeams)
  }, [propTeams])

  // Load data when component mounts - always fetch positions from backend
  useEffect(() => {
    loadData()
  }, []) // Remove dependency on props to always fetch on mount

  // Update local state when props change (but still fetch positions from backend)
  useEffect(() => {
    if (propPlayers) setPlayers(propPlayers)
  }, [propPlayers])

  useEffect(() => {
    if (propTeams) setTeams(propTeams)
  }, [propTeams])

  // Don't update positions from props since we always fetch from backend
  // useEffect(() => {
  //   if (propPositions) setPositions(propPositions)
  // }, [propPositions])

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Always fetch positions from backend, load players only if not provided via props
      const [playersData, positionsData] = await Promise.all([
        propPlayers
          ? Promise.resolve(propPlayers)
          : fetchFutsalPlayers().catch((err) => {
              console.error("Failed to fetch players:", err)
              return []
            }),
        // Always fetch positions from backend
        fetchFutsalPositions().catch((err) => {
          console.error("Failed to fetch positions:", err)
          // Return default positions if API fails
          return [
            { id: "1", name: "Goalkeeper", abbreviation: "GK", description: "Defends the goal" },
            { id: "2", name: "Defender", abbreviation: "DEF", description: "Defensive player" },
            { id: "3", name: "Midfielder", abbreviation: "MID", description: "Central player" },
            { id: "4", name: "Forward", abbreviation: "FWD", description: "Attacking player" },
            { id: "5", name: "Pivot", abbreviation: "PIV", description: "Target player" },
          ]
        }),
      ])

      setPlayers(Array.isArray(playersData) ? playersData : [])
      setPositions(Array.isArray(positionsData) ? positionsData : [])

      console.log("Data loaded successfully:", {
        players: playersData.length,
        positions: positionsData.length,
      })
    } catch (error) {
      console.error("Failed to load data:", error)
      setError("Failed to load data. Please check if the server is running.")
      setPlayers([])
      setPositions([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenDialog = () => {
    resetForm()
    setIsAddDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsAddDialogOpen(false)
    setEditingPlayer(null)
    resetForm()
  }

  const handleChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleStatsChange = (statName: string, value: number) => {
    setFormData((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        [statName]: value,
      },
    }))
  }

  const handleEdit = (player: FutsalPlayer) => {
    setEditingPlayer(player)
    let teamId = player.teamId || ""
    const teamName = player.teamName || ""
    if (!teamId && player.teamName) {
      const team = teams.find((t) => t.teamName === player.teamName)
      teamId = team?.id || ""
    }

    setFormData({
      name: player.name,
      number: player.number,
      nationality: player.nationality,
      age: player.age,
      image: player.image,
      height: player.height,
      weight: player.weight,
      preferredFoot: player.preferredFoot,
      teamName: teamName,
      positionId: player.positionId,
      studentId: player.studentId || "",
      course: player.course || "",
      yearOfStudy: player.yearOfStudy?.toString() || "",
      stats: player.stats || {
        matchesPlayed: 0,
        goals: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
        cleanSheets: 0,
      },
    })
    setIsAddDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      if (!formData.teamName) {
        setError("Please select a team for this player.")
        setIsSaving(false)
        return
      }

      if (!formData.positionId) {
        setError("Please select a position for this player.")
        setIsSaving(false)
        return
      }

      // Check for duplicate jersey numbers within the same team
      const existingPlayer = players.find(
        (p) =>
          p.teamId === formData.teamName &&
          p.number === formData.number &&
          (!editingPlayer || p.id !== editingPlayer.id),
      )

      if (existingPlayer) {
        setError(`Jersey number ${formData.number} is already taken by ${existingPlayer.name} in this team.`)
        setIsSaving(false)
        return
      }

      const playerRequest = {
        player: {
          name: formData.name,
          number: formData.number,
          nationality: formData.nationality,
          age: formData.age,
          image: formData.image || "/placeholder.svg?height=64&width=64",
          height: formData.height,
          weight: formData.weight,
          preferredFoot: formData.preferredFoot,
          studentId: formData.studentId,
          course: formData.course,
          yearOfStudy: formData.yearOfStudy,
          stats: formData.stats,
        },
        teamId: formData.teamName,
        positionId: formData.positionId,
      }

      if (editingPlayer) {
        const updatedPlayer = await updateFutsalPlayer(editingPlayer.id, playerRequest)
        setPlayers((prev) => prev.map((player) => (player.id === editingPlayer.id ? updatedPlayer : player)))
        onUpdatePlayer?.(updatedPlayer)
      } else {
        const newPlayer = await createFutsalPlayer(playerRequest)
        setPlayers((prev) => [...prev, newPlayer])
        onAddPlayer?.(newPlayer)
      }

      setIsAddDialogOpen(false)
      resetForm()
      setError(null)
    } catch (error:any) {
      console.error("Failed to save player:", error)
      const errorMessage = error.response?.data?.message || error.message || "Unknown error"
      setError(`Failed to save player: ${errorMessage}. Please try again.`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string, playerName: string) => {
    if (confirm(`Are you sure you want to delete ${playerName}?`)) {
      try {
        await deleteFutsalPlayer(id)
        setPlayers((prev) => prev.filter((player) => player.id !== id))
        onDeletePlayer?.(id)
      } catch (error:any) {
        console.error("Failed to delete player:", error)
        const errorMessage = error.response?.data?.message || error.message || "Unknown error"
        setError(`Failed to delete player: ${errorMessage}. Please try again.`)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      number: 0,
      nationality: "",
      age: 0,
      image: "",
      height: 0,
      weight: 0,
      preferredFoot: "right" as "left" | "right" | "both",
      teamName: "",
      positionId: "",
      studentId: "",
      course: "",
      yearOfStudy: "",
      stats: {
        matchesPlayed: 0,
        goals: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
        cleanSheets: 0,
      },
    })
    setEditingPlayer(null)
    setError(null)
  }

  // Helper function to get team name by ID
  const getTeamName = (teamId: string): string => {
    if (!teamId) return "Unknown Team"
    const team = teams.find((t) => t.id === teamId)
    return team?.teamName || "Unknown Team"
  }

  // Helper function to get position name by ID
  const getPositionName = (positionId: string): string => {
    if (!positionId) {
      console.log("No positionId provided")
      return "Unknown Position"
    }

    console.log("Looking for position with ID:", positionId, "in positions:", positions)
    const position = positions.find((p) => String(p.id) === String(positionId))
    console.log("Found position:", position)

    if (!position) {
      console.warn(`Position with ID ${positionId} not found in positions array`)
    }

    return position?.name || "Unknown Position"
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
        <span className="ml-2 text-foreground">Loading players from http://localhost:8080...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Users className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2 text-foreground">Error Loading Players</h3>
          <p className="text-muted-foreground mb-2">{error}</p>
          <p className="text-sm text-muted-foreground mb-4">
            API Endpoint: <code className="bg-muted px-2 py-1 rounded">{API_BASE_URL}</code>
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={checkConnection} variant="outline">
              Check Connection
            </Button>
            <Button onClick={loadData} className="bg-orange-600 hover:bg-orange-700">
              Try Again
            </Button>
          </div>
          <div className="mt-4">
            <span className="text-sm">
              Connection Status:
              <span
                className={`ml-2 px-2 py-1 rounded text-xs ${
                  connectionStatus === "connected"
                    ? "bg-green-100 text-green-800"
                    : connectionStatus === "disconnected"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {connectionStatus}
              </span>
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Futsal Players</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Players API: <code className="bg-muted px-2 py-1 rounded">http://localhost:8080/api/futsalplayers</code>
            </p>
            <p className="text-sm text-muted-foreground">
              Positions API: <code className="bg-muted px-2 py-1 rounded">http://localhost:8080/api/players</code>
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default" onClick={handleOpenDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Add Player
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">
                  {editingPlayer ? "Edit Player" : "Add New Player"}
                </DialogTitle>
              </DialogHeader>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6 py-4">
                {/* Basic Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-foreground border-b pb-2">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">
                        Player Name *
                      </Label>
                      <Input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter player name"
                        className="w-full"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="number" className="text-sm font-medium">
                        Jersey Number *
                      </Label>
                      <Input
                        type="number"
                        id="number"
                        name="number"
                        value={formData.number}
                        onChange={handleChange}
                        placeholder="e.g., 10"
                        className="w-full"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nationality" className="text-sm font-medium">
                        Nationality
                      </Label>
                      <Input
                        type="text"
                        id="nationality"
                        name="nationality"
                        value={formData.nationality}
                        onChange={handleChange}
                        placeholder="e.g., Uganda"
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age" className="text-sm font-medium">
                        Age
                      </Label>
                      <Input
                        type="number"
                        id="age"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        placeholder="e.g., 20"
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Team & Position Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-foreground border-b pb-2">Team & Position</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="teamSelect" className="text-sm font-medium">
                        Team *
                      </Label>
                      <div className="relative">
                        <select
                          id="teamSelect"
                          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          value={formData.teamName}
                          onChange={(e) => setFormData((prev) => ({ ...prev, teamName: e.target.value }))}
                          required
                        >
                          <option value="" disabled>
                            Select a team
                          </option>
                          {Array.isArray(teams) && teams.length > 0 ? (
                            teams.map((team) => (
                              <option key={team.id} value={team.id}>
                                {team.teamName}
                              </option>
                            ))
                          ) : (
                            <option value="" disabled>
                              No teams available
                            </option>
                          )}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="positionSelect" className="text-sm font-medium">
                        Position *
                      </Label>
                      <div className="relative">
                        <select
                          id="positionSelect"
                          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          value={formData.positionId}
                          onChange={(e) => setFormData((prev) => ({ ...prev, positionId: e.target.value }))}
                          required
                        >
                          <option value="" disabled>
                            Select a position
                          </option>
                          {Array.isArray(positions) && positions.length > 0 ? (
                            positions.map((position) => (
                              <option key={position.id} value={position.id}>
                                {position.name}
                              </option>
                            ))
                          ) : (
                            <option value="" disabled>
                              No positions available
                            </option>
                          )}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Physical Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-foreground border-b pb-2">Physical Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="height" className="text-sm font-medium">
                        Height (cm)
                      </Label>
                      <Input
                        type="number"
                        id="height"
                        name="height"
                        value={formData.height}
                        onChange={handleChange}
                        placeholder="e.g., 175"
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weight" className="text-sm font-medium">
                        Weight (kg)
                      </Label>
                      <Input
                        type="number"
                        id="weight"
                        name="weight"
                        value={formData.weight}
                        onChange={handleChange}
                        placeholder="e.g., 70"
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="preferredFootSelect" className="text-sm font-medium">
                        Preferred Foot
                      </Label>
                      <div className="relative">
                        <select
                          id="preferredFootSelect"
                          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          value={formData.preferredFoot}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              preferredFoot: e.target.value as "left" | "right" | "both",
                            }))
                          }
                        >
                          <option value="right">Right</option>
                          <option value="left">Left</option>
                          <option value="both">Both</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Student Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-foreground border-b pb-2">Student Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="studentId" className="text-sm font-medium">
                        Student ID
                      </Label>
                      <Input
                        type="text"
                        id="studentId"
                        name="studentId"
                        value={formData.studentId}
                        onChange={handleChange}
                        placeholder="e.g., 2023/BSE/001"
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="course" className="text-sm font-medium">
                        Course
                      </Label>
                      <Input
                        type="text"
                        id="course"
                        name="course"
                        value={formData.course}
                        onChange={handleChange}
                        placeholder="e.g., Computer Science"
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="yearOfStudy" className="text-sm font-medium">
                        Year of Study
                      </Label>
                      <Input
                        type="text"
                        id="yearOfStudy"
                        name="yearOfStudy"
                        value={formData.yearOfStudy}
                        onChange={handleChange}
                        placeholder="e.g., Year 2"
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Player Statistics Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-foreground border-b pb-2">Player Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="matchesPlayed" className="text-sm font-medium">
                        Matches Played
                      </Label>
                      <Input
                        type="number"
                        id="matchesPlayed"
                        value={formData.stats.matchesPlayed}
                        onChange={(e) => handleStatsChange("matchesPlayed", Number.parseInt(e.target.value) || 0)}
                        min="0"
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="goals" className="text-sm font-medium">
                        Goals
                      </Label>
                      <Input
                        type="number"
                        id="goals"
                        value={formData.stats.goals}
                        onChange={(e) => handleStatsChange("goals", Number.parseInt(e.target.value) || 0)}
                        min="0"
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="assists" className="text-sm font-medium">
                        Assists
                      </Label>
                      <Input
                        type="number"
                        id="assists"
                        value={formData.stats.assists}
                        onChange={(e) => handleStatsChange("assists", Number.parseInt(e.target.value) || 0)}
                        min="0"
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="yellowCards" className="text-sm font-medium">
                        Yellow Cards
                      </Label>
                      <Input
                        type="number"
                        id="yellowCards"
                        value={formData.stats.yellowCards}
                        onChange={(e) => handleStatsChange("yellowCards", Number.parseInt(e.target.value) || 0)}
                        min="0"
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="redCards" className="text-sm font-medium">
                        Red Cards
                      </Label>
                      <Input
                        type="number"
                        id="redCards"
                        value={formData.stats.redCards}
                        onChange={(e) => handleStatsChange("redCards", Number.parseInt(e.target.value) || 0)}
                        min="0"
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cleanSheets" className="text-sm font-medium">
                        Clean Sheets
                      </Label>
                      <Input
                        type="number"
                        id="cleanSheets"
                        value={formData.stats.cleanSheets}
                        onChange={(e) => handleStatsChange("cleanSheets", Number.parseInt(e.target.value) || 0)}
                        min="0"
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-6 border-t">
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSaving || !formData.teamName || !formData.positionId || !formData.name}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>{editingPlayer ? "Update Player" : "Add Player"}</>
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {players.length === 0 ? (
          <div className="flex items-center justify-center py-10">
            <div className="text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Players Yet</h3>
              <p className="text-muted-foreground mb-4">Add your first futsal player to get started.</p>
              <Button onClick={handleOpenDialog} className="bg-orange-600 hover:bg-orange-700">
                <Plus className="h-4 w-4 mr-2" />
                Add First Player
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative mt-6 overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Number</th>
                  <th className="px-6 py-3">Nationality</th>
                  <th className="px-6 py-3">Age</th>
                  <th className="px-6 py-3">Team</th>
                  <th className="px-6 py-3">Position</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player) => (
                  <tr
                    key={player.id}
                    className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600"
                  >
                    <th scope="row" className="whitespace-nowrap px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {player.name}
                    </th>
                    <td className="px-6 py-4">{player.number}</td>
                    <td className="px-6 py-4">{player.nationality}</td>
                    <td className="px-6 py-4">{player.age}</td>
                    <td className="px-6 py-4">
                      {typeof player.teamName === "string"
                        ? player.teamName
                        : typeof player.teamId === "string"
                          ? getTeamName(player.teamId)
                          : "Unknown Team"}
                    </td>
                    <td className="px-6 py-4">{getPositionName(player.positionId)}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(player)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(player.id, player.name)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
