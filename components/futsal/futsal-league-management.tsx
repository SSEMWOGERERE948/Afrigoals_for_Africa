"use client"

import React from "react"

import type { ReactElement } from "react"
import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Trophy, Plus, Edit, Trash2, Users, Calendar, Clock, Target, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { fetchFutsalLeagues, createFutsalLeague, updateFutsalLeague, deleteFutsalLeague } from "@/lib/leagues/api"
import type { FutsalLeague } from "@/app/types"

interface FutsalLeagueManagementProps {
  leagues?: FutsalLeague[]
  onAddLeague?: (leagueData: Omit<FutsalLeague, "id">) => Promise<void>
  onUpdateLeague?: (id: string, leagueData: Partial<FutsalLeague>) => Promise<void>
  onDeleteLeague?: (id: string) => Promise<void>
}

export default function FutsalLeagueManagement({
  leagues: propLeagues,
  onAddLeague,
  onUpdateLeague,
  onDeleteLeague,
}: FutsalLeagueManagementProps = {}): ReactElement {
  const [leagues, setLeagues] = useState<FutsalLeague[]>(propLeagues || [])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingLeague, setEditingLeague] = useState<FutsalLeague | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    country: "Uganda",
    season: new Date().getFullYear().toString(),
    teamSize: 5 as 5 | 6 | 7,
    maxTeams: 16,
    matchDuration: 40,
    maxSubstitutions: 12,
    description: "",
    status: "upcoming" as "upcoming" | "active" | "completed",
  })

  // Load leagues on component mount
  useEffect(() => {
    if (!propLeagues) {
      loadLeagues()
    } else {
      setIsLoading(false)
    }
  }, [propLeagues])

  // Update leagues when props change
  useEffect(() => {
    if (propLeagues) {
      setLeagues(propLeagues)
    }
  }, [propLeagues])

  const loadLeagues = async () => {
    try {
      setIsLoading(true)
      console.log("Attempting to fetch leagues from API...")
      const data = await fetchFutsalLeagues()
      console.log("Leagues fetched successfully:", data)
      setLeagues(Array.isArray(data) ? data : [])
    } catch (error: any) {
      console.error("Failed to load leagues:", error)
      setError(`Failed to load leagues: ${error.message || "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = useCallback(() => {
    setFormData({
      name: "",
      country: "Uganda",
      season: new Date().getFullYear().toString(),
      teamSize: 5 as 5 | 6 | 7,
      maxTeams: 16,
      matchDuration: 40,
      maxSubstitutions: 12,
      description: "",
      status: "upcoming" as "upcoming" | "active" | "completed",
    })
  }, [])

  const handleFormChange = useCallback((field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      console.log("=== FORM SUBMISSION STARTED ===")

      // Add validation check
      if (!formData.name.trim()) {
        console.log("Validation failed: Name is required")
        setError("League name is required")
        return
      }

      if (!formData.country.trim()) {
        console.log("Validation failed: Country is required")
        setError("Country is required")
        return
      }

      console.log("Validation passed, proceeding with submission...")

      setIsSaving(true)
      setError(null)

      try {
        const leagueData = {
          ...formData,
          logo: "/placeholder.svg?height=64&width=64",
          currentMatchday: 1,
          teams: 0,
        }

        console.log("Submitting league data:", leagueData)

        if (editingLeague) {
          console.log("=== UPDATING EXISTING LEAGUE ===")
          console.log("Updating existing league:", editingLeague.id)
          if (onUpdateLeague) {
            console.log("Using onUpdateLeague callback")
            await onUpdateLeague(editingLeague.id, leagueData)
          } else {
            console.log("Calling updateFutsalLeague API")
            await updateFutsalLeague(editingLeague.id, leagueData)
            await loadLeagues()
          }
          setIsEditDialogOpen(false)
          setEditingLeague(null)
        } else {
          console.log("=== CREATING NEW LEAGUE ===")
          console.log("Creating new league...")

          // ALWAYS call the API directly, ignore callbacks for now
          console.log("Calling createFutsalLeague API directly (bypassing callbacks)")
          console.log("About to call API with data:", leagueData)

          try {
            console.log("Making API call now...")
            const result = await createFutsalLeague(leagueData)
            console.log("API call completed successfully!")
            console.log("API result received:", result)

            // Update local state
            setLeagues((prev) => [...prev, result])

            // Also call callback if provided (for parent component updates)
            if (onAddLeague) {
              console.log("Also calling onAddLeague callback for parent component")
              try {
                await onAddLeague(leagueData)
              } catch (callbackError) {
                console.warn("Callback failed but API succeeded:", callbackError)
              }
            }
          } catch (apiError) {
            console.error("API call failed:", apiError)
            throw apiError
          }

          setIsAddDialogOpen(false)
        }

        resetForm()
        console.log("=== LEAGUE OPERATION COMPLETED SUCCESSFULLY ===")
      } catch (error: any) {
        console.error("=== FORM SUBMISSION ERROR ===")
        console.error("Failed to save league:", error)

        const errorMessage = error.response?.data?.message || error.message || "Unknown error"
        setError(`Failed to save league: ${errorMessage}`)

        // Additional debugging info
        if (error.code === "ECONNREFUSED") {
          setError("Cannot connect to backend server. Please ensure the server is running on https://afrigoals-backend.onrender.com")
        } else if (error.code === "NETWORK_ERROR") {
          setError("Network error. Please check your internet connection and server status.")
        }
      } finally {
        setIsSaving(false)
        console.log("=== FORM SUBMISSION ENDED ===")
      }
    },
    [formData, editingLeague, onAddLeague, onUpdateLeague, resetForm],
  )

  const handleEdit = useCallback((league: FutsalLeague) => {
    setEditingLeague(league)
    setFormData({
      name: league.name,
      country: league.country,
      season: league.season,
      teamSize: league.teamSize,
      maxTeams: league.maxTeams,
      matchDuration: league.matchDuration,
      maxSubstitutions: league.maxSubstitutions,
      description: league.description || "",
      status: league.status,
    })
    setIsEditDialogOpen(true)
  }, [])

  const handleDelete = useCallback(
    async (id: string) => {
      if (confirm("Are you sure you want to delete this league?")) {
        try {
          if (onDeleteLeague) {
            await onDeleteLeague(id)
          } else {
            await deleteFutsalLeague(id)
            await loadLeagues()
          }
        } catch (error) {
          console.error("Failed to delete league:", error)
          alert("Failed to delete league. Please try again.")
        }
      }
    },
    [onDeleteLeague],
  )

  const handleCancel = useCallback(() => {
    if (editingLeague) {
      setIsEditDialogOpen(false)
      setEditingLeague(null)
    } else {
      setIsAddDialogOpen(false)
    }
    resetForm()
  }, [editingLeague, resetForm])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "completed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
      case "upcoming":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
  }

  const filteredLeagues = leagues.filter(
    (league) =>
      league.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      league.country.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
        <span className="ml-2 text-foreground">Loading leagues...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Futsal League Management</h2>
          <p className="text-muted-foreground">Create and manage futsal leagues with different formats</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Plus className="h-4 w-4 mr-2" />
                Add League
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground">Create New Futsal League</DialogTitle>
              </DialogHeader>
              <LeagueForm
                formData={formData}
                onFormChange={handleFormChange}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isSaving={isSaving}
                editingLeague={editingLeague}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setError(null)
                loadLeagues()
              }}
              className="ml-4 bg-transparent"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Search */}
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter leagues..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Leagues Grid */}
      {filteredLeagues.length === 0 ? (
        <Card className="p-8 text-center bg-card border-border">
          <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2 text-foreground">No Leagues Created</h3>
          <p className="text-muted-foreground mb-4">Create your first futsal league to start organizing tournaments</p>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Plus className="h-4 w-4 mr-2" />
                Create First League
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground">Create New Futsal League</DialogTitle>
              </DialogHeader>
              <LeagueForm
                formData={formData}
                onFormChange={handleFormChange}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isSaving={isSaving}
                editingLeague={editingLeague}
              />
            </DialogContent>
          </Dialog>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeagues.map((league) => (
            <Card key={league.id} className="hover:shadow-lg transition-shadow bg-card border-border">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                      <Trophy className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-foreground">{league.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {league.country} • {league.season}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(league.status)}>{league.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{league.teamSize}-a-side</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">
                      {league.teams}/{league.maxTeams} teams
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{league.matchDuration}min</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">MD {league.currentMatchday}</span>
                  </div>
                </div>
                {league.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{league.description}</p>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(league)}
                    className="flex-1 border-input"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(league.id)}
                    className="text-red-600 hover:text-red-700 border-input"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit League</DialogTitle>
          </DialogHeader>
          <LeagueForm
            formData={formData}
            onFormChange={handleFormChange}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSaving={isSaving}
            editingLeague={editingLeague}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Separate LeagueForm component to prevent re-creation
interface LeagueFormProps {
  formData: {
    name: string
    country: string
    season: string
    teamSize: 5 | 6 | 7
    maxTeams: number
    matchDuration: number
    maxSubstitutions: number
    description: string
    status: "upcoming" | "active" | "completed"
  }
  onFormChange: (field: string, value: any) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  isSaving: boolean
  editingLeague: any
}

const LeagueForm = React.memo(
  ({ formData, onFormChange, onSubmit, onCancel, isSaving, editingLeague }: LeagueFormProps) => (
    <div className="space-y-4">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name" className="text-foreground">
              League Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => onFormChange("name", e.target.value)}
              placeholder="Inter-University Futsal Championship"
              className="bg-background border-input"
              required
              autoComplete="off"
            />
          </div>
          <div>
            <Label htmlFor="country" className="text-foreground">
              Country
            </Label>
            <Input
              id="country"
              value={formData.country}
              onChange={(e) => onFormChange("country", e.target.value)}
              placeholder="Uganda"
              className="bg-background border-input"
              required
              autoComplete="off"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="season" className="text-foreground">
              Season
            </Label>
            <Input
              id="season"
              value={formData.season}
              onChange={(e) => onFormChange("season", e.target.value)}
              placeholder="2024"
              className="bg-background border-input"
              required
            />
          </div>
          <div>
            <Label htmlFor="status" className="text-foreground">
              Status
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value: "upcoming" | "active" | "completed") => onFormChange("status", value)}
            >
              <SelectTrigger className="bg-background border-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="teamSize" className="text-foreground">
              Team Size
            </Label>
            <Select
              value={formData.teamSize.toString()}
              onValueChange={(value) => onFormChange("teamSize", Number.parseInt(value) as 5 | 6 | 7)}
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
          <div>
            <Label htmlFor="maxTeams" className="text-foreground">
              Max Teams
            </Label>
            <Input
              id="maxTeams"
              type="number"
              value={formData.maxTeams}
              onChange={(e) => onFormChange("maxTeams", Number.parseInt(e.target.value))}
              min="4"
              max="32"
              className="bg-background border-input"
              required
            />
          </div>
          <div>
            <Label htmlFor="matchDuration" className="text-foreground">
              Match Duration (min)
            </Label>
            <Input
              id="matchDuration"
              type="number"
              value={formData.matchDuration}
              onChange={(e) => onFormChange("matchDuration", Number.parseInt(e.target.value))}
              min="20"
              max="90"
              className="bg-background border-input"
              required
            />
          </div>
          <div>
            <Label htmlFor="maxSubstitutions" className="text-foreground">
              Max Substitutions
            </Label>
            <Input
              id="maxSubstitutions"
              type="number"
              value={formData.maxSubstitutions}
              onChange={(e) => onFormChange("maxSubstitutions", Number.parseInt(e.target.value))}
              min="3"
              max="20"
              className="bg-background border-input"
              required
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
            placeholder="Annual futsal tournament for universities..."
            className="bg-background border-input"
            rows={3}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" className="border-input bg-transparent" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving} className="bg-orange-600 hover:bg-orange-700">
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {editingLeague ? "Update League" : "Create League"}
          </Button>
        </div>
      </form>
    </div>
  ),
)

LeagueForm.displayName = "LeagueForm"
  