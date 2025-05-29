"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Search, Edit, Trash } from "lucide-react"
import Image from "next/image"
import type { Team } from "@/app/types"
import { createTeam, fetchAllTeams, updateTeam, deleteTeam } from "@/components/team_api"

const emptyStats = {
  position: 0,
  played: 0,
  won: 0,
  drawn: 0,
  lost: 0,
  goalsFor: 0,
  goalsAgainst: 0,
  points: 0,
}

const createEmptyTeam = (type: "club" | "national"): Omit<Team, "id"> => ({
  name: "",
  logo: "",
  league: "",
  founded: 0,
  stadium: "",
  manager: "",
  teamType: type,
  players: [],
  stats: { ...emptyStats },
})

export default function TeamsAdmin() {
  const [teams, setTeams] = useState<Team[]>([])
  const [newTeam, setNewTeam] = useState(createEmptyTeam("club"))
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    const loadTeams = async () => {
      const data = await fetchAllTeams()
      setTeams(data)
    }
    loadTeams()
  }, [])

  const handleSaveTeam = async () => {
    try {
      const payload = {
        ...newTeam,
        founded: Number(newTeam.founded),
      }

      if (editingTeam) {
        const updated = await updateTeam(editingTeam.id.toString(), payload)
        setTeams((prev) => prev.map((t) => (t.id === editingTeam.id ? updated : t)))
      } else {
        const created = await createTeam(payload)
        setTeams((prev) => [...prev, created])
      }

      setNewTeam(createEmptyTeam("club"))
      setEditingTeam(null)
      setIsDialogOpen(false)
    } catch (err) {
      console.error("Failed to save team:", err)
    }
  }

  const handleEdit = (team: Team) => {
    setEditingTeam(team)
    setNewTeam({ ...team })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number | string) => {
    try {
      await deleteTeam(id.toString())
      setTeams((prev) => prev.filter((t) => t.id !== id))
    } catch (err) {
      console.error("Failed to delete team:", err)
    }
  }

  const handleAddNew = () => {
    setEditingTeam(null)
    setNewTeam(createEmptyTeam("club"))
    setIsDialogOpen(true)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Teams Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              Add Team
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingTeam ? "Edit Team" : "Add New Team"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                value={newTeam.name}
                onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                placeholder="Team Name"
              />

              <Input
                value={newTeam.logo}
                onChange={(e) => setNewTeam({ ...newTeam, logo: e.target.value })}
                placeholder="Logo URL"
              />

              <div>
                <label className="text-sm font-medium mb-1 block">Team Type</label>
                <Select
                  value={newTeam.teamType}
                  onValueChange={(value: "club" | "national") => setNewTeam({ ...newTeam, teamType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select team type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="club">Club</SelectItem>
                    <SelectItem value="national">National</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Input
                value={newTeam.league}
                onChange={(e) => setNewTeam({ ...newTeam, league: e.target.value })}
                placeholder="League"
              />

              <Input
                value={newTeam.manager}
                onChange={(e) => setNewTeam({ ...newTeam, manager: e.target.value })}
                placeholder="Manager"
              />

              <Input
                value={newTeam.stadium}
                onChange={(e) => setNewTeam({ ...newTeam, stadium: e.target.value })}
                placeholder="Stadium"
              />

              <Input
                type="number"
                placeholder="Founded Year"
                value={newTeam.founded.toString()}
                onChange={(e) => setNewTeam({ ...newTeam, founded: Number(e.target.value) })}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSaveTeam} className="flex-1">
                {editingTeam ? "Update" : "Save"} Team
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search teams..." className="pl-9" />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Team</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>League</TableHead>
              <TableHead>Manager</TableHead>
              <TableHead>Stadium</TableHead>
              <TableHead>Founded</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map((team) => (
              <TableRow key={team.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="relative h-10 w-10">
                      <Image src={team.logo || "/placeholder.svg"} alt={team.name} fill className="object-contain" />
                    </div>
                    <span className="font-medium">{team.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      team.teamType === "club" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                    }`}
                  >
                    {team.teamType === "club" ? "Club" : "National"}
                  </span>
                </TableCell>
                <TableCell>{team.league || "-"}</TableCell>
                <TableCell>{team.manager}</TableCell>
                <TableCell>{team.stadium || "-"}</TableCell>
                <TableCell>{team.founded || "-"}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(team)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-red-600" onClick={() => handleDelete(team.id)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
