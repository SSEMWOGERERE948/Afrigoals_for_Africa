"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import type { Team, Player, Position } from "@/app/types"
import { fetchTeamsByType } from "@/components/team_api"
import { createPlayer, fetchPlayers, deletePlayer, updatePlayer, fetchPositions } from "@/components/player_api"
import { Trash2, Pencil } from "lucide-react"

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
  x: number // Keep for frontend use
  y: number // Keep for frontend use
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
    const load = async () => {
      const [clubs, nationals, playerList, positionsList] = await Promise.all([
        fetchTeamsByType("club"),
        fetchTeamsByType("national"),
        fetchPlayers(),
        fetchPositions(),
      ])
      setClubTeams(clubs)
      setNationalTeams(nationals)
      setPlayers(playerList)
      setPositions(positionsList)
    }
    load()
  }, [])

  const handleAddPlayer = async () => {
    if (!playerForm.name || (!playerForm.clubTeamId && !playerForm.nationalTeamId)) {
      alert("Please fill in required fields and select at least one team.")
      return
    }

    try {
      const { id, clubTeamId, nationalTeamId, positionId, x, y, ...playerData } = playerForm

      const created = await createPlayer({
        player: playerData, // This now excludes x, y, and position
        clubTeamId: clubTeamId ? Number.parseInt(clubTeamId) : undefined,
        nationalTeamId: nationalTeamId ? Number.parseInt(nationalTeamId) : undefined,
        positionId: positionId ? Number.parseInt(positionId) : undefined,
      })

      setPlayers((prev) => [...prev, created])

      setPlayerForm({
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
      x: player.x || 50, // Use existing x or default
      y: player.y || 50, // Use existing y or default
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

    try {
      const { id, clubTeamId, nationalTeamId, positionId, x, y, ...playerData } = playerForm

      const updated = await updatePlayer(id, {
        player: playerData, // This now excludes x, y, and position
        clubTeamId: clubTeamId ? Number.parseInt(clubTeamId) : undefined,
        nationalTeamId: nationalTeamId ? Number.parseInt(nationalTeamId) : undefined,
        positionId: positionId ? Number.parseInt(positionId) : undefined,
      })

      setPlayers((prev) => prev.map((p) => (p.id === id ? updated : p)))

      // Reset form
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
      setIsEditing(false)
    } catch (error) {
      console.error("Failed to update player:", error)
      alert("Failed to update player.")
    }
  }

  const handleDeletePlayer = async (id: string) => {
    try {
      await deletePlayer(id)
      setPlayers((prev) => prev.filter((p) => p.id !== id))
    } catch (error) {
      console.error("Failed to delete player:", error)
      alert("Failed to delete player.")
    }
  }

  const getPositionName = (player: Player) => {
    return player.position?.name || "N/A"
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Add Players to Teams</h1>

      <Card className="p-4 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="Player Name"
            value={playerForm.name}
            onChange={(v) => setPlayerForm({ ...playerForm, name: v })}
          />
          <InputField
            label="Jersey Number"
            type="number"
            value={playerForm.number}
            onChange={(v) => setPlayerForm({ ...playerForm, number: Number.parseInt(v) })}
          />
          <div>
            <label className="text-sm font-medium mb-1 block">Position</label>
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
                    {position.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <InputField
            label="Nationality"
            value={playerForm.nationality}
            onChange={(v) => setPlayerForm({ ...playerForm, nationality: v })}
          />
          <InputField
            label="Age"
            type="number"
            value={playerForm.age}
            onChange={(v) => setPlayerForm({ ...playerForm, age: Number.parseInt(v) })}
          />
          <InputField
            label="Image URL"
            value={playerForm.image}
            onChange={(v) => setPlayerForm({ ...playerForm, image: v })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <TeamSelect
            label="Club Team"
            value={playerForm.clubTeamId || ""}
            teams={clubTeams}
            onChange={(val) => setPlayerForm({ ...playerForm, clubTeamId: val })}
          />
          <TeamSelect
            label="National Team"
            value={playerForm.nationalTeamId || ""}
            teams={nationalTeams}
            onChange={(val) => setPlayerForm({ ...playerForm, nationalTeamId: val })}
          />
        </div>

        <h3 className="font-semibold mt-4">Club Stats</h3>
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

        <h3 className="font-semibold mt-4">National Stats</h3>
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

        <div className="flex gap-2 mt-4">
          {isEditing ? (
            <>
              <Button onClick={handleUpdatePlayer}>Update Player</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false)
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
                }}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button onClick={handleAddPlayer}>Add Player</Button>
          )}
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="font-semibold mb-2">Players Added</h2>
        {players.length === 0 ? (
          <p className="text-sm text-muted-foreground">No players added yet.</p>
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
                      src={p.image || "/placeholder.svg"}
                      alt={p.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  </TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.number}</TableCell>
                  <TableCell>{getPositionName(p)}</TableCell>
                  <TableCell>{p.age}</TableCell>
                  <TableCell>{p.nationality}</TableCell>
                  <TableCell>{p.clubTeam?.name || "N/A"}</TableCell>
                  <TableCell>{p.nationalTeam?.name || "N/A"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEditPlayer(p)}>
                      <Pencil className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeletePlayer(p.id)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
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
        [field]: Number.parseInt(value),
      },
    }))
  }
}

// Reusable Input Field
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

// Reusable Team Select
function TeamSelect({
  label,
  value,
  teams,
  onChange,
}: {
  label: string
  value: string
  teams: Team[]
  onChange: (val: string) => void
}) {
  return (
    <div>
      <label className="text-sm font-medium mb-1 block">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={`Select ${label}`} />
        </SelectTrigger>
        <SelectContent>
          {teams.map((team) => (
            <SelectItem key={team.id} value={team.id.toString()}>
              {team.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

// Reusable Stat Input
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
      <Input type="number" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}
