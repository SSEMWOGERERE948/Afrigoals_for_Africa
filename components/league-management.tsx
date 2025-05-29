"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Trophy } from "lucide-react"
import type { League } from "@/app/types"

interface LeagueManagementProps {
  leagues: League[]
  onAddLeague: (league: Omit<League, "id">) => Promise<void>
  onDeleteLeague: (id: string) => Promise<void>
}

interface LeagueForm {
  name: string
  country: string
  logo: string
  season: string
  teams: number
  currentMatchday: number
}

export default function LeagueManagement({ leagues, onAddLeague, onDeleteLeague }: LeagueManagementProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [leagueForm, setLeagueForm] = useState<LeagueForm>({
    name: "",
    country: "",
    logo: "",
    season: "",
    teams: 20,
    currentMatchday: 1,
  })

  const handleAddLeague = async () => {
    if (!leagueForm.name || !leagueForm.country || !leagueForm.season) {
      alert("Please fill in all required fields")
      return
    }

    try {
      await onAddLeague(leagueForm)
      setLeagueForm({
        name: "",
        country: "",
        logo: "",
        season: "",
        teams: 20,
        currentMatchday: 1,
      })
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Failed to add league:", error)
      alert("Failed to add league.")
    }
  }

  const handleDeleteLeague = async (id: string) => {
    if (!confirm("Are you sure you want to delete this league?")) return
    try {
      await onDeleteLeague(id)
    } catch (error) {
      console.error("Failed to delete league:", error)
      alert("Failed to delete league.")
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          League Management
        </h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add League
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New League</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <label className="text-sm font-medium mb-1 block">League Name *</label>
                <Input
                  value={leagueForm.name}
                  onChange={(e) => setLeagueForm({ ...leagueForm, name: e.target.value })}
                  placeholder="Premier League, La Liga, etc."
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Country *</label>
                <Input
                  value={leagueForm.country}
                  onChange={(e) => setLeagueForm({ ...leagueForm, country: e.target.value })}
                  placeholder="England, Spain, etc."
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Season *</label>
                <Input
                  value={leagueForm.season}
                  onChange={(e) => setLeagueForm({ ...leagueForm, season: e.target.value })}
                  placeholder="2024/25, 2024, etc."
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Logo URL</label>
                <Input
                  value={leagueForm.logo}
                  onChange={(e) => setLeagueForm({ ...leagueForm, logo: e.target.value })}
                  placeholder="https://example.com/logo.png"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Number of Teams</label>
                  <Input
                    type="number"
                    value={leagueForm.teams}
                    onChange={(e) => setLeagueForm({ ...leagueForm, teams: Number.parseInt(e.target.value) })}
                    min="2"
                    max="50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Current Matchday</label>
                  <Input
                    type="number"
                    value={leagueForm.currentMatchday}
                    onChange={(e) => setLeagueForm({ ...leagueForm, currentMatchday: Number.parseInt(e.target.value) })}
                    min="1"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddLeague}>Add League</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {leagues.length === 0 ? (
        <p className="text-muted-foreground">No leagues created yet. Add a league to get started.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Logo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Season</TableHead>
              <TableHead>Teams</TableHead>
              <TableHead>Matchday</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leagues.map((league) => (
              <TableRow key={league.id}>
                <TableCell>
                  {league.logo ? (
                    <img
                      src={league.logo || "/placeholder.svg"}
                      alt={league.name}
                      className="h-8 w-8 rounded object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded bg-gray-200 flex items-center justify-center">
                      <Trophy className="h-4 w-4 text-gray-500" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{league.name}</TableCell>
                <TableCell>{league.country}</TableCell>
                <TableCell>{league.season}</TableCell>
                <TableCell>{league.teams}</TableCell>
                <TableCell>{league.currentMatchday}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteLeague(league.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  )
}
