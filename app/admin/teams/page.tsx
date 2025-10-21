"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash, Users, Trophy, Loader2, Building } from "lucide-react"
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
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      console.log("🔄 Loading teams...")

      const [teamsData] = await Promise.all([fetchAllTeams().catch(() => [])])

      setTeams(teamsData)

      console.log("✅ Data loaded successfully:", {
        teams: teamsData.length,
      })
    } catch (error) {
      console.error("❌ Failed to load data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveTeam = async () => {
    try {
      if (!newTeam.name.trim()) {
        alert("Please enter a team name")
        return
      }

      const payload = {
        ...newTeam,
        founded: Number(newTeam.founded) || 0,
      }

      console.log("💾 Saving team:", payload)

      if (editingTeam) {
        const updated = await updateTeam(editingTeam.id.toString(), payload)
        setTeams((prev) => prev.map((t) => (t.id === editingTeam.id ? updated : t)))
      } else {
        const created = await createTeam(payload)
        setTeams((prev) => [...prev, created])
      }

      resetForm()
      setIsDialogOpen(false)
    } catch (err) {
      console.error("❌ Failed to save team:", err)
      alert("Failed to save team. Please try again.")
    }
  }

  const handleEdit = (team: Team) => {
    setEditingTeam(team)
    setNewTeam({ ...team })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number | string) => {
    if (!confirm("Are you sure you want to delete this team?")) return

    try {
      await deleteTeam(id.toString())
      setTeams((prev) => prev.filter((t) => t.id !== id))
    } catch (err) {
      console.error("❌ Failed to delete team:", err)
      alert("Failed to delete team. Please try again.")
    }
  }

  const handleAddNew = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setEditingTeam(null)
    setNewTeam(createEmptyTeam("club"))
  }

  const filteredTeams = teams.filter(
    (team) =>
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.teamType.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const stats = {
    total: teams.length,
    clubs: teams.filter((t) => t.teamType === "club").length,
    national: teams.filter((t) => t.teamType === "national").length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading teams data...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-green-600">Teams Management</h1>
          <p className="text-muted-foreground">
            Create and manage your football teams. Assign managers and players separately.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Team
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingTeam ? "Edit Team" : "Create New Team"}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="name">Team Name *</Label>
                  <Input
                    id="name"
                    value={newTeam.name}
                    onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                    placeholder="e.g., KCCA FC, Vipers SC"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="logo">Logo URL</Label>
                  <Input
                    id="logo"
                    value={newTeam.logo}
                    onChange={(e) => setNewTeam({ ...newTeam, logo: e.target.value })}
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                <div>
                  <Label htmlFor="teamType">Team Type *</Label>
                  <Select
                    value={newTeam.teamType}
                    onValueChange={(value: "club" | "national") => setNewTeam({ ...newTeam, teamType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select team type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="club">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          Club Team
                        </div>
                      </SelectItem>
                      <SelectItem value="national">
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4" />
                          National Team
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="stadium">Stadium</Label>
                    <Input
                      id="stadium"
                      value={newTeam.stadium}
                      onChange={(e) => setNewTeam({ ...newTeam, stadium: e.target.value })}
                      placeholder="Home stadium"
                    />
                  </div>
                  <div>
                    <Label htmlFor="founded">Founded Year</Label>
                    <Input
                      id="founded"
                      type="number"
                      value={newTeam.founded.toString()}
                      onChange={(e) => setNewTeam({ ...newTeam, founded: Number(e.target.value) })}
                      placeholder="e.g., 1958"
                      min="1800"
                      max={new Date().getFullYear()}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSaveTeam} className="flex-1 bg-green-600 hover:bg-green-700">
                {editingTeam ? "Update Team" : "Create Team"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Total Teams</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-muted-foreground">Club Teams</p>
              <p className="text-2xl font-bold">{stats.clubs}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm text-muted-foreground">National Teams</p>
              <p className="text-2xl font-bold">{stats.national}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Table */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search teams by name or type..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Team</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Stadium</TableHead>
              <TableHead>Founded</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTeams.map((team) => (
              <TableRow key={team.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="relative h-10 w-10">
                      <Image
                        src={team.logo || "/placeholder.svg?height=40&width=40"}
                        alt={team.name}
                        fill
                        className="object-contain rounded"
                      />
                    </div>
                    <span className="font-medium">{team.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={team.teamType === "club" ? "default" : "secondary"}
                    className={team.teamType === "club" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}
                  >
                    {team.teamType === "club" ? "Club" : "National"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">{team.stadium || "-"}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">{team.founded || "-"}</span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(team)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(team.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredTeams.length === 0 && (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchQuery ? "No teams found matching your search." : "No teams created yet."}
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}
