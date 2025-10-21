"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Team, Player, Position } from "@/app/types"
import { Trash2, Pencil, AlertTriangle, UserCheck, Users, Info, Trophy, Crown } from "lucide-react"
import { Manager, fetchManagers } from "@/components/manager_api"
import { fetchPlayers, fetchPositions, createPlayer, updatePlayer, deletePlayer } from "@/components/player_api"
import { fetchTeamsByType } from "@/components/team_api"

interface PlayerFormData {
  id: string
  name: string
  number: number
  positionId: string
  nationality: string
  age: number
  image: string
  clubTeamId: string
  nationalTeamId: string
  x: number
  y: number
  clubStats: {
    matches: number
    goals: number
    assists: number
    yellowCards: number
    redCards: number
  }
  nationalStats: {
    matches: number
    goals: number
    assists: number
    yellowCards: number
    redCards: number
  }
}

export default function PlayersAdmin() {
  const [clubTeams, setClubTeams] = useState<Team[]>([])
  const [nationalTeams, setNationalTeams] = useState<Team[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [positions, setPositions] = useState<Position[]>([])
  const [managers, setManagers] = useState<Manager[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [playerForm, setPlayerForm] = useState<PlayerFormData>({
    id: "",
    name: "",
    number: 0,
    positionId: "",
    nationality: "",
    age: 18,
    image: "",
    clubTeamId: "",
    nationalTeamId: "",
    x: 50,
    y: 50,
    clubStats: {
      matches: 0,
      goals: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
    },
    nationalStats: {
      matches: 0,
      goals: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
    },
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [clubsData, nationalsData, playersData, positionsData, managersData] = await Promise.allSettled([
        fetchTeamsByType("club"),
        fetchTeamsByType("national"),
        fetchPlayers(),
        fetchPositions(),
        fetchManagers(),
      ])

      // Handle each data type
      if (clubsData.status === "fulfilled") {
        setClubTeams(clubsData.value)
      } else {
        console.error("Failed to load club teams:", clubsData.reason)
      }

      if (nationalsData.status === "fulfilled") {
        setNationalTeams(nationalsData.value)
      } else {
        console.error("Failed to load national teams:", nationalsData.reason)
      }

      if (playersData.status === "fulfilled") {
        setPlayers(playersData.value)
      } else {
        console.error("Failed to load players:", playersData.reason)
      }

      if (positionsData.status === "fulfilled") {
        setPositions(positionsData.value)
      } else {
        console.error("Failed to load positions:", positionsData.reason)
      }

      if (managersData.status === "fulfilled") {
        setManagers(managersData.value)
      } else {
        console.error("Failed to load managers:", managersData.reason)
      }

      // Set error if critical data failed to load
      if (
        clubsData.status === "rejected" &&
        nationalsData.status === "rejected" &&
        playersData.status === "rejected" &&
        positionsData.status === "rejected"
      ) {
        setError("Failed to load player management data. Please check your connection and try again.")
      }
    } catch (error) {
      console.error("Failed to load data:", error)
      setError("An unexpected error occurred while loading data.")
    } finally {
      setLoading(false)
    }
  }

  // Check if a position is "Manager"
  const isManagerPosition = (positionId: string) => {
    const position = positions.find((p) => p.id.toString() === positionId)
    return position?.name.toLowerCase() === "manager"
  }

  // Get teams that have managers (head managers specifically)
  const getTeamsWithManagers = (teamType: "club" | "national") => {
    const teams = teamType === "club" ? clubTeams : nationalTeams
    return teams.filter((team) => {
      return managers.some((manager) => {
        const managerTeamId =
          teamType === "club"
            ? (manager as any).clubTeam?.id?.toString()
            : (manager as any).nationalTeam?.id?.toString()
        return manager.role === "head_manager" && managerTeamId === team.id.toString()
      })
    })
  }

  // Get teams without managers
  const getTeamsWithoutManagers = (teamType: "club" | "national") => {
    const teams = teamType === "club" ? clubTeams : nationalTeams
    const teamsWithManagers = getTeamsWithManagers(teamType)
    return teams.filter((team) => !teamsWithManagers.some((t) => t.id === team.id))
  }

  // Check if team already has a manager (head manager specifically for player validation)
  const teamHasManager = (teamId: string, teamType: "club" | "national") => {
    return managers.some((manager) => {
      const managerTeamId =
        teamType === "club" ? (manager as any).clubTeam?.id?.toString() : (manager as any).nationalTeam?.id?.toString()
      // For player validation, we only care about head managers
      return manager.role === "head_manager" && managerTeamId === teamId
    })
  }

  const validatePlayerAddition = () => {
    const errors = []
    const selectedPosition = positions.find((p) => p.id.toString() === playerForm.positionId)
    const isAddingManager = selectedPosition?.name.toLowerCase() === "manager"

    // If adding a manager
    if (isAddingManager) {
      // Check if club team already has a manager
      if (playerForm.clubTeamId && teamHasManager(playerForm.clubTeamId, "club")) {
        const clubTeam = clubTeams.find((t) => t.id.toString() === playerForm.clubTeamId)
        errors.push(`Club team "${clubTeam?.name}" already has a manager.`)
      }
      // Check if national team already has a manager
      if (playerForm.nationalTeamId && teamHasManager(playerForm.nationalTeamId, "national")) {
        const nationalTeam = nationalTeams.find((t) => t.id.toString() === playerForm.nationalTeamId)
        errors.push(`National team "${nationalTeam?.name}" already has a manager.`)
      }
    } else {
      // If adding a regular player, team must have a manager
      if (playerForm.clubTeamId && !teamHasManager(playerForm.clubTeamId, "club")) {
        const clubTeam = clubTeams.find((t) => t.id.toString() === playerForm.clubTeamId)
        errors.push(`Club team "${clubTeam?.name}" needs a manager before adding players.`)
      }
      if (playerForm.nationalTeamId && !teamHasManager(playerForm.nationalTeamId, "national")) {
        const nationalTeam = nationalTeams.find((t) => t.id.toString() === playerForm.nationalTeamId)
        errors.push(`National team "${nationalTeam?.name}" needs a manager before adding players.`)
      }
    }

    return errors
  }

  const handleAddPlayer = async () => {
    if (!playerForm.name || !playerForm.positionId || (!playerForm.clubTeamId && !playerForm.nationalTeamId)) {
      alert("Please fill in required fields and select at least one team.")
      return
    }

    // Validate player addition
    const validationErrors = validatePlayerAddition()
    if (validationErrors.length > 0) {
      alert(`Cannot add player:\n${validationErrors.join("\n")}`)
      return
    }

    try {
      const { id, clubTeamId, nationalTeamId, positionId, x, y, ...playerData } = playerForm
      const created = await createPlayer({
        player: playerData,
        clubTeamId: clubTeamId ? Number.parseInt(clubTeamId) : undefined,
        nationalTeamId: nationalTeamId ? Number.parseInt(nationalTeamId) : undefined,
        positionId: positionId ? Number.parseInt(positionId) : undefined,
      })
      setPlayers((prev) => [...prev, created])
      resetForm()
    } catch (error) {
      console.error("Failed to add player:", error)
      alert("Failed to add player.")
    }
  }

  const handleEditPlayer = (player: Player) => {
    setPlayerForm({
      id: player.id,
      name: player.name,
      number: player.number,
      positionId: player.position?.id?.toString() || "",
      nationality: player.nationality,
      age: player.age,
      image: player.image,
      clubTeamId: player.clubTeam?.id?.toString() || "",
      nationalTeamId: player.nationalTeam?.id?.toString() || "",
      x: player.x || 50,
      y: player.y || 50,
      clubStats: {
        matches: player.clubStats?.matches ?? 0,
        goals: player.clubStats?.goals ?? 0,
        assists: player.clubStats?.assists ?? 0,
        yellowCards: player.clubStats?.yellowCards ?? 0,
        redCards: player.clubStats?.redCards ?? 0,
      },
      nationalStats: {
        matches: player.nationalStats?.matches ?? 0,
        goals: player.nationalStats?.goals ?? 0,
        assists: player.nationalStats?.assists ?? 0,
        yellowCards: player.nationalStats?.yellowCards ?? 0,
        redCards: player.nationalStats?.redCards ?? 0,
      },
    })
    setIsEditing(true)
  }

  const handleUpdatePlayer = async () => {
    if (!playerForm.id) return

    // Validate player update
    const validationErrors = validatePlayerAddition()
    if (validationErrors.length > 0) {
      alert(`Cannot update player:\n${validationErrors.join("\n")}`)
      return
    }

    try {
      const { id, clubTeamId, nationalTeamId, positionId, x, y, ...playerData } = playerForm
      const updated = await updatePlayer(id, {
        player: playerData,
        clubTeamId: clubTeamId ? Number.parseInt(clubTeamId) : undefined,
        nationalTeamId: nationalTeamId ? Number.parseInt(nationalTeamId) : undefined,
        positionId: positionId ? Number.parseInt(positionId) : undefined,
      })
      setPlayers((prev) => prev.map((p) => (p.id === id ? updated : p)))
      resetForm()
      setIsEditing(false)
    } catch (error) {
      console.error("Failed to update player:", error)
      alert("Failed to update player.")
    }
  }

  const handleDeletePlayer = async (id: string) => {
    const playerToDelete = players.find((p) => p.id === id)
    const isManager = playerToDelete?.position?.name.toLowerCase() === "manager"

    if (isManager) {
      const teamName = playerToDelete.clubTeam?.name || playerToDelete.nationalTeam?.name
      if (
        !confirm(
          `This will remove the manager from ${teamName}. Players cannot be added to this team until a new manager is assigned. Continue?`,
        )
      ) {
        return
      }
    } else {
      if (!confirm("Are you sure you want to delete this player?")) return
    }

    try {
      await deletePlayer(id)
      setPlayers((prev) => prev.filter((p) => p.id !== id))
    } catch (error) {
      console.error("Failed to delete player:", error)
      alert("Failed to delete player.")
    }
  }

  const resetForm = () => {
    setPlayerForm({
      id: "",
      name: "",
      number: 0,
      positionId: "",
      nationality: "",
      age: 18,
      image: "",
      x: 50,
      y: 50,
      clubTeamId: "",
      nationalTeamId: "",
      clubStats: {
        matches: 0,
        goals: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
      },
      nationalStats: {
        matches: 0,
        goals: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
      },
    })
  }

  const getPositionName = (player: Player) => {
    return player.position?.name || "N/A"
  }

  const getManagerForTeam = (team: Team, teamType: "club" | "national") => {
    return managers.find((manager) => {
      const managerTeamId =
        teamType === "club" ? (manager as any).clubTeam?.id?.toString() : (manager as any).nationalTeam?.id?.toString()
      return manager.role === "head_manager" && managerTeamId === team.id.toString()
    })
  }

  const clubTeamsWithManagers = getTeamsWithManagers("club")
  const nationalTeamsWithManagers = getTeamsWithManagers("national")
  const clubTeamsWithoutManagers = getTeamsWithoutManagers("club")
  const nationalTeamsWithoutManagers = getTeamsWithoutManagers("national")

  const selectedPosition = positions.find((p) => p.id.toString() === playerForm.positionId)
  const isAddingManager = selectedPosition?.name.toLowerCase() === "manager"

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>Loading player management...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-green-600">Player Management</h1>
        <p className="text-muted-foreground">Add managers first, then players to teams</p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button variant="outline" size="sm" onClick={loadData} className="ml-4 bg-transparent">
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Manager Requirement Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>How it works:</strong> First assign managers to teams using Manager Management. Then you can add
          players to teams that have managers.
        </AlertDescription>
      </Alert>

      {/* Teams Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Club Teams Status
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">With Managers:</span>
              <Badge variant="default" className="bg-green-100 text-green-800">
                {clubTeamsWithManagers.length}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Without Managers:</span>
              <Badge variant="destructive">{clubTeamsWithoutManagers.length}</Badge>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-purple-600" />
            National Teams Status
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">With Managers:</span>
              <Badge variant="default" className="bg-green-100 text-green-800">
                {nationalTeamsWithManagers.length}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Without Managers:</span>
              <Badge variant="destructive">{nationalTeamsWithoutManagers.length}</Badge>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 space-y-6">
        <h2 className="text-xl font-semibold">Add New Player</h2>
        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="Player Name *"
            value={playerForm.name}
            onChange={(v) => setPlayerForm({ ...playerForm, name: v })}
          />
          <InputField
            label="Jersey Number *"
            type="number"
            value={playerForm.number}
            onChange={(v) => setPlayerForm({ ...playerForm, number: Number.parseInt(v) || 0 })}
          />
          <div>
            <label className="text-sm font-medium mb-1 block">Position *</label>
            <Select
              value={playerForm.positionId}
              onValueChange={(val) => setPlayerForm({ ...playerForm, positionId: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Position" />
              </SelectTrigger>
              <SelectContent>
                {positions.map((position) => (
                  <SelectItem key={position.id} value={position.id.toString()}>
                    <div className="flex items-center gap-2">
                      {position.name.toLowerCase() === "manager" && <Crown className="h-4 w-4 text-yellow-600" />}
                      {position.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <InputField
            label="Nationality *"
            value={playerForm.nationality}
            onChange={(v) => setPlayerForm({ ...playerForm, nationality: v })}
          />
          <InputField
            label="Age *"
            type="number"
            value={playerForm.age}
            onChange={(v) => setPlayerForm({ ...playerForm, age: Number.parseInt(v) || 18 })}
          />
          <InputField
            label="Image URL"
            value={playerForm.image}
            onChange={(v) => setPlayerForm({ ...playerForm, image: v })}
          />
        </div>

        {isAddingManager && (
          <Alert>
            <Crown className="h-4 w-4" />
            <AlertDescription>
              <strong>Adding Manager:</strong> You can add this manager to any team. Each team can only have one
              manager.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-4">
          <SmartTeamSelect
            label="Club Team"
            value={playerForm.clubTeamId || "none"}
            teams={clubTeams}
            teamsWithManagers={clubTeamsWithManagers}
            isAddingManager={isAddingManager}
            onChange={(val) => setPlayerForm({ ...playerForm, clubTeamId: val })}
            getManagerForTeam={(team) => getManagerForTeam(team, "club")}
          />
          <SmartTeamSelect
            label="National Team"
            value={playerForm.nationalTeamId || "none"}
            teams={nationalTeams}
            teamsWithManagers={nationalTeamsWithManagers}
            isAddingManager={isAddingManager}
            onChange={(val) => setPlayerForm({ ...playerForm, nationalTeamId: val })}
            getManagerForTeam={(team) => getManagerForTeam(team, "national")}
          />
        </div>

        <h3 className="font-semibold mt-6">Club Statistics</h3>
        <div className="grid grid-cols-3 gap-4">
          <StatInput
            label="Matches"
            value={playerForm.clubStats.matches}
            onChange={(v) => updateStat("clubStats", "matches", v)}
          />
          <StatInput
            label="Goals"
            value={playerForm.clubStats.goals}
            onChange={(v) => updateStat("clubStats", "goals", v)}
          />
          <StatInput
            label="Assists"
            value={playerForm.clubStats.assists}
            onChange={(v) => updateStat("clubStats", "assists", v)}
          />
          <StatInput
            label="Yellow Cards"
            value={playerForm.clubStats.yellowCards}
            onChange={(v) => updateStat("clubStats", "yellowCards", v)}
          />
          <StatInput
            label="Red Cards"
            value={playerForm.clubStats.redCards}
            onChange={(v) => updateStat("clubStats", "redCards", v)}
          />
        </div>

        <h3 className="font-semibold mt-6">National Team Statistics</h3>
        <div className="grid grid-cols-3 gap-4">
          <StatInput
            label="Matches"
            value={playerForm.nationalStats.matches}
            onChange={(v) => updateStat("nationalStats", "matches", v)}
          />
          <StatInput
            label="Goals"
            value={playerForm.nationalStats.goals}
            onChange={(v) => updateStat("nationalStats", "goals", v)}
          />
          <StatInput
            label="Assists"
            value={playerForm.nationalStats.assists}
            onChange={(v) => updateStat("nationalStats", "assists", v)}
          />
          <StatInput
            label="Yellow Cards"
            value={playerForm.nationalStats.yellowCards}
            onChange={(v) => updateStat("nationalStats", "yellowCards", v)}
          />
          <StatInput
            label="Red Cards"
            value={playerForm.nationalStats.redCards}
            onChange={(v) => updateStat("nationalStats", "redCards", v)}
          />
        </div>

        <div className="flex gap-2 mt-6">
          {isEditing ? (
            <>
              <Button onClick={handleUpdatePlayer} className="bg-green-600 hover:bg-green-700">
                Update Player
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  resetForm()
                  setIsEditing(false)
                }}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button onClick={handleAddPlayer} className="bg-green-600 hover:bg-green-700">
              {isAddingManager ? "Add Manager" : "Add Player"}
            </Button>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Players & Managers List</h2>
        {players.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No players added yet.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Number</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Nationality</TableHead>
                <TableHead>Club</TableHead>
                <TableHead>National</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <img
                      src={p.image || "/placeholder.svg?height=40&width=40"}
                      alt={p.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">#{p.number}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {p.position?.name.toLowerCase() === "manager" && <Crown className="h-4 w-4 text-yellow-600" />}
                      {getPositionName(p)}
                    </div>
                  </TableCell>
                  <TableCell>{p.age}</TableCell>
                  <TableCell>{p.nationality}</TableCell>
                  <TableCell>
                    {p.clubTeam ? (
                      <span className="text-sm">{p.clubTeam.name}</span>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {p.nationalTeam ? (
                      <span className="text-sm">{p.nationalTeam.name}</span>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="icon" onClick={() => handleEditPlayer(p)}>
                        <Pencil className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeletePlayer(p.id)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  )

  function updateStat(block: "clubStats" | "nationalStats", field: keyof PlayerFormData["clubStats"], value: string) {
    setPlayerForm((prev) => ({
      ...prev,
      [block]: {
        ...prev[block],
        [field]: Number.parseInt(value) || 0,
      },
    }))
  }
}

// Enhanced Input Field Component
function InputField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string
  value: string | number
  onChange: (val: string) => void
  type?: string
}) {
  return (
    <div>
      <label className="text-sm font-medium mb-1 block">{label}</label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

// Smart Team Select that adapts based on whether adding manager or player
function SmartTeamSelect({
  label,
  value,
  teams,
  teamsWithManagers,
  isAddingManager,
  onChange,
  getManagerForTeam,
}: {
  label: string
  value: string
  teams: Team[]
  teamsWithManagers: Team[]
  isAddingManager: boolean
  onChange: (val: string) => void
  getManagerForTeam: (team: Team) => Manager | undefined
}) {
  return (
    <div>
      <label className="text-sm font-medium mb-1 block">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={`Select ${label}`} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No {label}</SelectItem>
          {isAddingManager ? (
            // When adding manager, show all teams but indicate which already have managers
            <>
              {teams
                .filter((team) => !getManagerForTeam(team))
                .map((team) => (
                  <SelectItem key={team.id} value={team.id.toString()}>
                    <div className="flex items-center gap-2">
                      <span>{team.name}</span>
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                        Available
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              {teams.filter((team) => getManagerForTeam(team)).length > 0 && (
                <>
                  <div className="px-2 py-1 text-xs text-muted-foreground border-t">
                    Teams with managers (cannot add another):
                  </div>
                  {teams
                    .filter((team) => getManagerForTeam(team))
                    .map((team) => {
                      const manager = getManagerForTeam(team)
                      return (
                        <SelectItem key={`has-manager-${team.id}`} value={team.id.toString()} disabled>
                          <div className="flex items-center gap-2 opacity-50">
                            <Crown className="h-4 w-4 text-yellow-600" />
                            <span>{team.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {manager?.name}
                            </Badge>
                          </div>
                        </SelectItem>
                      )
                    })}
                </>
              )}
            </>
          ) : (
            // When adding regular player, only show teams with managers
            <>
              {teamsWithManagers.map((team) => {
                const manager = getManagerForTeam(team)
                return (
                  <SelectItem key={team.id} value={team.id.toString()}>
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-green-600" />
                      <span>{team.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {manager?.name}
                      </Badge>
                    </div>
                  </SelectItem>
                )
              })}
              {teams.filter((team) => !getManagerForTeam(team)).length > 0 && (
                <>
                  <div className="px-2 py-1 text-xs text-muted-foreground border-t">
                    Teams without managers (add manager first):
                  </div>
                  {teams
                    .filter((team) => !getManagerForTeam(team))
                    .map((team) => (
                      <SelectItem key={`no-manager-${team.id}`} value={team.id.toString()} disabled>
                        <div className="flex items-center gap-2 opacity-50">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <span>{team.name}</span>
                          <Badge variant="destructive" className="text-xs">
                            No Manager
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                </>
              )}
            </>
          )}
        </SelectContent>
      </Select>
    </div>
  )
}

// Stat Input Component
function StatInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (val: string) => void
}) {
  return (
    <div>
      <label className="text-sm font-medium mb-1 block">{label}</label>
      <Input type="number" value={value} onChange={(e) => onChange(e.target.value)} min="0" />
    </div>
  )
}
