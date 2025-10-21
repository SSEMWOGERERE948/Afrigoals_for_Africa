"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Clock, MapPin, Users, Trophy, Loader2, AlertCircle } from "lucide-react"
import { fetchFutsalTeams } from "@/lib/teams/api"
import { fetchFutsalLeagues } from "@/lib/leagues/api"
import { createFutsalMatch } from "@/lib/matches/api"
import type { FutsalTeam, FutsalLeague, FutsalMatch } from "@/app/types"

interface FutsalMatchFormProps {
  teams?: FutsalTeam[]
  leagues?: FutsalLeague[]
  onScheduleMatch?: (matchData: Omit<FutsalMatch, "id">) => Promise<void>
  isLoading?: boolean
}

export default function FutsalMatchForm({
  teams: propTeams,
  leagues: propLeagues,
  onScheduleMatch,
  isLoading: propIsLoading = false,
}: FutsalMatchFormProps = {}) {
  const [teams, setTeams] = useState<FutsalTeam[]>(propTeams || [])
  const [leagues, setLeagues] = useState<FutsalLeague[]>(propLeagues || [])
  const [isLoading, setIsLoading] = useState(!propTeams || !propLeagues)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")
  const [formData, setFormData] = useState({
    leagueId: "",
    homeTeam: "",
    awayTeam: "",
    date: "",
    time: "",
    venue: "",
    referee: "",
    teamSize: 5 as 5 | 6 | 7,
    matchDuration: 40,
    maxSubstitutions: 12,
    notes: "",
  })
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Load data on component mount if not provided via props
  useEffect(() => {
    if (!propTeams || !propLeagues) {
      loadData()
    } else {
      setIsLoading(false)
    }
  }, [propTeams, propLeagues])

  // Update local state when props change
  useEffect(() => {
    if (propTeams) setTeams(propTeams)
  }, [propTeams])

  useEffect(() => {
    if (propLeagues) setLeagues(propLeagues)
  }, [propLeagues])

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("")
        setSuccess("")
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, success])

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError("")
      console.log("Loading teams and leagues from backend...")

      const [teamsData, leaguesData] = await Promise.all([
        fetchFutsalTeams().catch((err) => {
          console.error("Failed to fetch teams:", err)
          return []
        }),
        fetchFutsalLeagues().catch((err) => {
          console.error("Failed to fetch leagues:", err)
          return []
        }),
      ])

      console.log("Teams loaded:", teamsData)
      console.log("Leagues loaded:", leaguesData)

      setTeams(Array.isArray(teamsData) ? teamsData : [])
      setLeagues(Array.isArray(leaguesData) ? leaguesData : [])
    } catch (err) {
      console.error("Failed to load data:", err)
      setError("Failed to load teams and leagues. Please check if the backend server is running.")
    } finally {
      setIsLoading(false)
    }
  }

  const selectedLeague = leagues.find((l) => l.id === formData.leagueId)
  const availableTeams = teams.filter((team) =>
    selectedLeague ? team.preferredTeamSize === selectedLeague.teamSize : true,
  )

  const handleLeagueChange = (leagueId: string) => {
    const league = leagues.find((l) => l.id === leagueId)
    if (league) {
      setFormData({
        ...formData,
        leagueId,
        teamSize: league.teamSize as 5 | 6 | 7,
        matchDuration: league.matchDuration,
        maxSubstitutions: league.maxSubstitutions,
        homeTeam: "",
        awayTeam: "",
        venue: "", // Reset venue when league changes
      })
      setValidationErrors({})
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    if (!formData.leagueId) errors.leagueId = "Please select a league"
    if (!formData.homeTeam) errors.homeTeam = "Please select a home team"
    if (!formData.awayTeam) errors.awayTeam = "Please select an away team"
    if (!formData.date) errors.date = "Please select a match date"
    if (!formData.time) errors.time = "Please select a match time"
    if (!formData.referee.trim()) errors.referee = "Please enter a referee name"

    if (formData.homeTeam === formData.awayTeam) {
      errors.awayTeam = "Away team must be different from home team"
    }

    // Validate date is not in the past
    if (formData.date) {
      const selectedDate = new Date(formData.date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (selectedDate < today) {
        errors.date = "Match date cannot be in the past"
      }
    }

    // Validate time format and reasonable hours
    if (formData.time) {
      const [hours] = formData.time.split(":").map(Number)
      if (hours < 6 || hours > 23) {
        errors.time = "Please select a time between 6:00 AM and 11:59 PM"
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async () => {
    setError("")
    setSuccess("")

    if (!validateForm()) {
      setError("Please fix the errors below")
      return
    }

    setIsSaving(true)
    try {
      const homeTeamData = teams.find((t) => t.teamName === formData.homeTeam)
      const awayTeamData = teams.find((t) => t.teamName === formData.awayTeam)
      const selectedLeagueData = leagues.find((l) => l.id === formData.leagueId)

      if (!homeTeamData || !awayTeamData || !selectedLeagueData) {
        setError("Invalid team or league selection")
        return
      }

      const matchData = {
        league: selectedLeagueData.name, // Use league name, not ID
        homeTeam: formData.homeTeam,
        awayTeam: formData.awayTeam,
        date: formData.date,
        time: formData.time,
        venue: formData.venue.trim() || homeTeamData.homeVenue,
        referee: formData.referee.trim(),
        teamSize: formData.teamSize,
        matchDuration: formData.matchDuration,
        maxSubstitutions: formData.maxSubstitutions,
        status: "Scheduled" as const,
        homeScore: 0,
        awayScore: 0,
      }

      console.log("=== CREATING MATCH ===")
      console.log("Match data to be sent:", matchData)
      console.log("API endpoint:", "http://localhost:8080/api/futsalmatches/create")

      // ALWAYS call the API directly, ignore callbacks for now
      console.log("Calling createFutsalMatch API directly...")

      try {
        const result = await createFutsalMatch(matchData)
        console.log("Match created successfully:", result)

        // Update parent component if callback provided
        if (onScheduleMatch) {
          console.log("Also calling onScheduleMatch callback for parent component")
          try {
            await onScheduleMatch(matchData)
          } catch (callbackError) {
            console.warn("Callback failed but API succeeded:", callbackError)
          }
        }

        setSuccess("Match scheduled successfully!")

        // Reset form
        setFormData({
          leagueId: "",
          homeTeam: "",
          awayTeam: "",
          date: "",
          time: "",
          venue: "",
          referee: "",
          teamSize: 5 as 5 | 6 | 7,
          matchDuration: 40,
          maxSubstitutions: 12,
          notes: "",
        })
        setValidationErrors({})
      } catch (apiError: any) {
        console.error("=== API CALL FAILED ===")
        console.error("API Error:", apiError)

        if (apiError.response) {
          console.error("Response status:", apiError.response.status)
          console.error("Response data:", apiError.response.data)
        } else if (apiError.request) {
          console.error("Request made but no response:", apiError.request)
        } else {
          console.error("Error setting up request:", apiError.message)
        }

        throw apiError
      }
    } catch (err: any) {
      console.error("=== MATCH CREATION ERROR ===")
      console.error("Failed to schedule match:", err)

      let errorMessage = "Unknown error occurred"

      if (err.code === "ECONNREFUSED") {
        errorMessage = "Cannot connect to backend server. Please ensure the server is running on http://localhost:8080"
      } else if (err.code === "NETWORK_ERROR") {
        errorMessage = "Network error. Please check your internet connection and server status."
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.message) {
        errorMessage = err.message
      }

      setError(`Failed to schedule match: ${errorMessage}`)

      // Additional debugging info
      console.log("=== DEBUGGING INFO ===")
      console.log("Backend URL:", "http://localhost:8080/api/futsalmatches")
      console.log("Teams available:", teams.length)
      console.log("Leagues available:", leagues.length)
      console.log("Form data:", formData)
    } finally {
      setIsSaving(false)
    }
  }

  const getTomorrowDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split("T")[0]
  }

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
          <span className="ml-2 text-foreground">Loading teams and leagues from backend...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Calendar className="h-5 w-5 text-orange-600" />
          Schedule Futsal Match
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Error Alert */}
        {error && (
          <Alert className="mb-4 border-red-200 bg-red-50 text-red-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Alert */}
        {success && (
          <Alert className="mb-4 border-green-200 bg-green-50 text-green-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* League Selection */}
          <div>
            <Label htmlFor="league" className="text-foreground">
              League <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.leagueId} onValueChange={handleLeagueChange}>
              <SelectTrigger
                className={`bg-background border-input ${validationErrors.leagueId ? "border-red-500" : ""}`}
              >
                <SelectValue placeholder="Select a league" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {leagues.map((league) => (
                  <SelectItem key={league.id} value={league.id}>
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      {league.name} ({league.teamSize}-a-side)
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {validationErrors.leagueId && <p className="text-red-500 text-sm mt-1">{validationErrors.leagueId}</p>}
            {/* Debug info */}
            <p className="text-xs text-muted-foreground mt-1">
              Leagues loaded: {leagues.length} | Teams loaded: {teams.length}
            </p>
          </div>

          {/* Team Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="homeTeam" className="text-foreground">
                Home Team <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.homeTeam}
                onValueChange={(value) => setFormData({ ...formData, homeTeam: value, venue: "" })}
                disabled={!formData.leagueId}
              >
                <SelectTrigger
                  className={`bg-background border-input ${validationErrors.homeTeam ? "border-red-500" : ""}`}
                >
                  <SelectValue
                    placeholder={
                      !formData.leagueId
                        ? "Select a league first"
                        : availableTeams.length === 0
                          ? "No teams available for this league"
                          : "Select home team"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {availableTeams
                    .filter((team) => team.teamName !== formData.awayTeam)
                    .map((team) => (
                      <SelectItem key={team.id} value={team.teamName}>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {team.teamName}
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {validationErrors.homeTeam && <p className="text-red-500 text-sm mt-1">{validationErrors.homeTeam}</p>}
              <p className="text-xs text-muted-foreground mt-1">
                Available teams: {availableTeams.length}
                {selectedLeague && ` (${selectedLeague.teamSize}-a-side teams only)`}
              </p>
            </div>
            <div>
              <Label htmlFor="awayTeam" className="text-foreground">
                Away Team <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.awayTeam}
                onValueChange={(value) => setFormData({ ...formData, awayTeam: value })}
                disabled={!formData.leagueId}
              >
                <SelectTrigger
                  className={`bg-background border-input ${validationErrors.awayTeam ? "border-red-500" : ""}`}
                >
                  <SelectValue
                    placeholder={
                      !formData.leagueId
                        ? "Select a league first"
                        : availableTeams.length === 0
                          ? "No teams available for this league"
                          : "Select away team"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {availableTeams
                    .filter((team) => team.teamName !== formData.homeTeam)
                    .map((team) => (
                      <SelectItem key={team.id} value={team.teamName}>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {team.teamName}
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {validationErrors.awayTeam && <p className="text-red-500 text-sm mt-1">{validationErrors.awayTeam}</p>}
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date" className="text-foreground">
                Match Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                min={getTomorrowDate()}
                className={`bg-background border-input ${validationErrors.date ? "border-red-500" : ""}`}
              />
              {validationErrors.date && <p className="text-red-500 text-sm mt-1">{validationErrors.date}</p>}
            </div>
            <div>
              <Label htmlFor="time" className="text-foreground">
                Match Time <span className="text-red-500">*</span>
              </Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className={`bg-background border-input ${validationErrors.time ? "border-red-500" : ""}`}
              />
              {validationErrors.time && <p className="text-red-500 text-sm mt-1">{validationErrors.time}</p>}
            </div>
          </div>

          {/* Venue and Referee */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="venue" className="text-foreground">
                Venue
              </Label>
              <Input
                id="venue"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                placeholder={
                  formData.homeTeam
                    ? teams.find((t) => t.teamName === formData.homeTeam)?.homeVenue || "Enter venue"
                    : "Enter venue"
                }
                className="bg-background border-input"
              />
              {formData.homeTeam && (
                <p className="text-xs text-muted-foreground mt-1">
                  Default: {teams.find((t) => t.teamName === formData.homeTeam)?.homeVenue}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="referee" className="text-foreground">
                Referee <span className="text-red-500">*</span>
              </Label>
              <Input
                id="referee"
                value={formData.referee}
                onChange={(e) => setFormData({ ...formData, referee: e.target.value })}
                placeholder="Enter referee name"
                className={`bg-background border-input ${validationErrors.referee ? "border-red-500" : ""}`}
              />
              {validationErrors.referee && <p className="text-red-500 text-sm mt-1">{validationErrors.referee}</p>}
            </div>
          </div>

          {/* Match Settings */}
          {selectedLeague && (
            <div className="bg-orange-50 dark:bg-orange-900/30 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
              <h4 className="font-medium mb-2 text-foreground">Match Settings (from {selectedLeague.name})</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-orange-600" />
                  <span className="text-foreground">{formData.teamSize} players on pitch</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <span className="text-foreground">{formData.matchDuration} minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-orange-600" />
                  <span className="text-foreground">{formData.maxSubstitutions} subs max</span>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="text-foreground">
              Match Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any special notes about this match..."
              rows={3}
              className="bg-background border-input"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="button"
            onClick={handleSubmit}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
            disabled={isSaving}
          >
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isSaving ? "Scheduling..." : "Schedule Match"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
