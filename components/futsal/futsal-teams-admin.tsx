"use client"

import React from "react"
import type { ReactElement } from "react"
import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Edit, Trash2, Users, MapPin, Calendar, Info, Loader2, AlertTriangle } from "lucide-react"
import type { FutsalTeam } from "@/app/types"
import { fetchFutsalTeams, updateFutsalTeam, createFutsalTeam, deleteFutsalTeam } from "@/lib/teams/api"

interface FutsalTeamsAdminProps {
  teams?: FutsalTeam[]
  onAddTeam?: (teamData: Omit<FutsalTeam, "id">) => Promise<void>
  onUpdateTeam?: (id: string, teamData: Partial<FutsalTeam>) => Promise<void>
  onDeleteTeam?: (id: string) => Promise<void>
}

export default function FutsalTeamsAdmin({
  teams: propTeams,
  onAddTeam,
  onUpdateTeam,
  onDeleteTeam,
}: FutsalTeamsAdminProps = {}): ReactElement {
  const [teams, setTeams] = useState<FutsalTeam[]>(propTeams || [])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingTeam, setEditingTeam] = useState<FutsalTeam | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<Omit<FutsalTeam, "id">>({
    teamName: "",
    logo: "/placeholder.svg?height=64&width=64",
    institution: "",
    category: "school",
    preferredTeamSize: 5,
    homeVenue: "",
    founded: new Date().getFullYear(),
    manager: "",
    players: [],
    stats: {
      matchesPlayed: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0,
    },
    description: "",
    contactEmail: "",
    contactPhone: "",
  })

  // Load teams on component mount
  useEffect(() => {
    if (!propTeams) {
      loadTeams()
    } else {
      setIsLoading(false)
    }
  }, [propTeams])

  // Update teams when props change
  useEffect(() => {
    if (propTeams) {
      setTeams(propTeams)
    }
  }, [propTeams])

  const loadTeams = async () => {
    try {
      setIsLoading(true)
      console.log("Attempting to fetch teams from API...")
      const data = await fetchFutsalTeams()
      console.log("Teams fetched successfully:", data)
      setTeams(Array.isArray(data) ? data : [])
    } catch (error: any) {
      console.error("Failed to load teams:", error)
      setError(`Failed to load teams: ${error.message || "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = useCallback(() => {
    setFormData({
      teamName: "",
      logo: "/placeholder.svg?height=64&width=64",
      institution: "",
      category: "school",
      preferredTeamSize: 5,
      homeVenue: "",
      founded: new Date().getFullYear(),
      manager: "",
      players: [],
      stats: {
        matchesPlayed: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        points: 0,
      },
      description: "",
      contactEmail: "",
      contactPhone: "",
    })
    setEditingTeam(null)
    setError(null)
  }, [])

  const handleFormChange = useCallback((field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      console.log("=== TEAM FORM SUBMISSION STARTED ===")

      // Validation
      if (!formData.teamName.trim()) {
        setError("Team name is required")
        return
      }

      if (!formData.institution.trim()) {
        setError("Institution/Club is required")
        return
      }

      if (!formData.homeVenue.trim()) {
        setError("Home venue is required")
        return
      }

      setIsSaving(true)
      setError(null)

      try {
        console.log("Submitting team data:", formData)

        if (editingTeam) {
          console.log("=== UPDATING EXISTING TEAM ===")
          if (onUpdateTeam) {
            await onUpdateTeam(editingTeam.id, formData)
          } else {
            await updateFutsalTeam(editingTeam.id, formData)
            await loadTeams()
          }
        } else {
          console.log("=== CREATING NEW TEAM ===")
          // Always call the API directly
          try {
            console.log("Making API call now...")
            const result = await createFutsalTeam(formData)
            console.log("API call completed successfully!")
            console.log("API result received:", result)

            // Update local state
            setTeams((prev) => [...prev, result])

            // Also call callback if provided
            if (onAddTeam) {
              console.log("Also calling onAddTeam callback for parent component")
              try {
                await onAddTeam(formData)
              } catch (callbackError) {
                console.warn("Callback failed but API succeeded:", callbackError)
              }
            }
          } catch (apiError) {
            console.error("API call failed:", apiError)
            throw apiError
          }
        }

        setIsAddDialogOpen(false)
        resetForm()
        console.log("=== TEAM OPERATION COMPLETED SUCCESSFULLY ===")
      } catch (error: any) {
        console.error("=== TEAM FORM SUBMISSION ERROR ===")
        console.error("Failed to save team:", error)

        const errorMessage = error.response?.data?.message || error.message || "Unknown error"
        setError(`Failed to save team: ${errorMessage}`)

        if (error.code === "ECONNREFUSED") {
          setError("Cannot connect to backend server. Please ensure the server is running on http://localhost:8080")
        } else if (error.code === "NETWORK_ERROR") {
          setError("Network error. Please check your internet connection and server status.")
        }
      } finally {
        setIsSaving(false)
        console.log("=== TEAM FORM SUBMISSION ENDED ===")
      }
    },
    [formData, editingTeam, onAddTeam, onUpdateTeam, resetForm],
  )

  const handleEdit = useCallback((team: FutsalTeam) => {
    setFormData({ ...team })
    setEditingTeam(team)
    setIsAddDialogOpen(true)
  }, [])

  const handleDelete = useCallback(
    async (id: string, teamName: string) => {
      if (confirm(`Are you sure you want to delete ${teamName}? This will also remove all associated players.`)) {
        try {
          if (onDeleteTeam) {
            await onDeleteTeam(id)
          } else {
            await deleteFutsalTeam(id)
            await loadTeams()
          }
        } catch (error: any) {
          console.error("Failed to delete team:", error)
          setError(`Failed to delete team: ${error.message || "Unknown error"}`)
        }
      }
    },
    [onDeleteTeam],
  )

  const handleCancel = useCallback(() => {
    setIsAddDialogOpen(false)
    resetForm()
  }, [resetForm])

  const handleOpenDialog = useCallback(() => {
    resetForm()
    setIsAddDialogOpen(true)
  }, [resetForm])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
        <span className="ml-2 text-foreground">Loading teams...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-orange-600">Futsal Teams</h2>
          <p className="text-muted-foreground">Manage schools, clubs, and community futsal teams</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenDialog} className="bg-orange-600 hover:bg-orange-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Team
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">{editingTeam ? "Edit Team" : "Add New Futsal Team"}</DialogTitle>
            </DialogHeader>
            <TeamForm
              formData={formData}
              onFormChange={handleFormChange}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isSaving={isSaving}
              editingTeam={editingTeam}
              error={error}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Info Alert */}
      <Alert className="border-border bg-card">
        <Info className="h-4 w-4" />
        <AlertDescription className="text-foreground">
          Teams can participate in leagues matching their preferred team size. Players can be added after creating the
          team.
        </AlertDescription>
      </Alert>

      {/* Teams Grid */}
      {teams.length === 0 ? (
        <Card className="p-8 text-center bg-card border-border">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2 text-foreground">No Teams Yet</h3>
          <p className="text-muted-foreground mb-4">Create your first futsal team to get started.</p>
          <Button onClick={handleOpenDialog} className="bg-orange-600 hover:bg-orange-700">
            <Plus className="h-4 w-4 mr-2" />
            Add First Team
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <Card key={team.id} className="p-6 bg-card border-border">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={team.logo || "/placeholder.svg"}
                    alt={`${team.teamName} logo`}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-foreground">{team.teamName}</h3>
                    <p className="text-sm text-muted-foreground">{team.institution}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(team)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(team.id, team.teamName)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Badge
                    variant="outline"
                    className="bg-orange-50 text-orange-700 dark:bg-orange-900 dark:text-orange-200"
                  >
                    {team.category}
                  </Badge>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                    {team.preferredTeamSize}-a-side
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{team.homeVenue}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">Founded {team.founded}</span>
                  </div>
                  {team.manager && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{team.manager}</span>
                    </div>
                  )}
                </div>
                {team.description && <p className="text-sm text-muted-foreground line-clamp-2">{team.description}</p>}
                <div className="pt-2 border-t border-border">
                  <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <div>
                      <p className="font-medium text-foreground">{team.players?.length ?? 0}</p>
                      <p className="text-muted-foreground">Players</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{team.stats.wins}</p>
                      <p className="text-muted-foreground">Wins</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{team.stats.points}</p>
                      <p className="text-muted-foreground">Points</p>
                    </div>
                  </div>
                </div>
                {(team.contactEmail || team.contactPhone) && (
                  <div className="pt-2 border-t border-border text-xs text-muted-foreground">
                    {team.contactEmail && <div>📧 {team.contactEmail}</div>}
                    {team.contactPhone && <div>📞 {team.contactPhone}</div>}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// Separate TeamForm component to prevent re-creation
interface TeamFormProps {
  formData: Omit<FutsalTeam, "id">
  onFormChange: (field: string, value: any) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  isSaving: boolean
  editingTeam: FutsalTeam | null
  error: string | null
}

const TeamForm = React.memo(
  ({ formData, onFormChange, onSubmit, onCancel, isSaving, editingTeam, error }: TeamFormProps) => (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name" className="text-foreground">
              Team Name *
            </Label>
            <Input
              id="name"
              value={formData.teamName}
              onChange={(e) => onFormChange("teamName", e.target.value)}
              className="bg-background border-input"
              required
              autoComplete="off"
            />
          </div>
          <div>
            <Label htmlFor="institution" className="text-foreground">
              Institution/Club *
            </Label>
            <Input
              id="institution"
              value={formData.institution}
              onChange={(e) => onFormChange("institution", e.target.value)}
              className="bg-background border-input"
              required
              autoComplete="off"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category" className="text-foreground">
              Category
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value: "school" | "club" | "community") => onFormChange("category", value)}
            >
              <SelectTrigger className="bg-background border-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="school">School</SelectItem>
                <SelectItem value="club">Club</SelectItem>
                <SelectItem value="community">Community</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="teamSize" className="text-foreground">
              Preferred Team Size
            </Label>
            <Select
              value={formData.preferredTeamSize.toString()}
              onValueChange={(value) => onFormChange("preferredTeamSize", Number.parseInt(value) as 5 | 6 | 7)}
            >
              <SelectTrigger className="bg-background border-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="5">5-a-side</SelectItem>
                <SelectItem value="6">6-a-side</SelectItem>
                <SelectItem value="7">7-a-side</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="homeVenue" className="text-foreground">
              Home Venue *
            </Label>
            <Input
              id="homeVenue"
              value={formData.homeVenue}
              onChange={(e) => onFormChange("homeVenue", e.target.value)}
              className="bg-background border-input"
              required
              autoComplete="off"
            />
          </div>
          <div>
            <Label htmlFor="founded" className="text-foreground">
              Founded Year
            </Label>
            <Input
              id="founded"
              type="number"
              value={formData.founded}
              onChange={(e) => onFormChange("founded", Number.parseInt(e.target.value) || 2024)}
              min="1900"
              max={new Date().getFullYear()}
              className="bg-background border-input"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="manager" className="text-foreground">
            Manager/Coach
          </Label>
          <Input
            id="manager"
            value={formData.manager}
            onChange={(e) => onFormChange("manager", e.target.value)}
            className="bg-background border-input"
            autoComplete="off"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contactEmail" className="text-foreground">
              Contact Email
            </Label>
            <Input
              id="contactEmail"
              type="email"
              value={formData.contactEmail}
              onChange={(e) => onFormChange("contactEmail", e.target.value)}
              className="bg-background border-input"
              autoComplete="off"
            />
          </div>
          <div>
            <Label htmlFor="contactPhone" className="text-foreground">
              Contact Phone
            </Label>
            <Input
              id="contactPhone"
              value={formData.contactPhone}
              onChange={(e) => onFormChange("contactPhone", e.target.value)}
              className="bg-background border-input"
              autoComplete="off"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="description" className="text-foreground">
            Description
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => onFormChange("description", e.target.value)}
            rows={3}
            className="bg-background border-input"
          />
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} className="border-input bg-transparent">
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving} className="bg-orange-600 hover:bg-orange-700">
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {editingTeam ? "Update" : "Create"} Team
          </Button>
        </div>
      </form>
    </div>
  ),
)

TeamForm.displayName = "TeamForm"
