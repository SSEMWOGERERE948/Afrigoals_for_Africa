"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Search, Filter, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { Team } from "@/app/types"
import { fetchAllTeams } from "@/components/team_api"
import axios from "axios"

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [teamTypeFilter, setTeamTypeFilter] = useState<string>("all")

  useEffect(() => {
    const loadTeams = async () => {
      setLoading(true)
      setError(null)

      try {
        console.log("🌐 Fetching teams from API...")
        const data = await fetchAllTeams()
        console.log("✅ Teams fetched successfully:", data.length, "teams")
        console.log("📋 First team:", data[0])

        setTeams(data)
        setFilteredTeams(data)
      } catch (err) {
        console.error("❌ Failed to load teams:", err)
        if (axios.isAxiosError(err)) {
          console.error("📡 API Error details:", {
            status: err.response?.status,
            statusText: err.response?.statusText,
            data: err.response?.data,
            url: err.config?.url,
          })
          setError(`API Error: ${err.response?.status} - ${err.response?.statusText || err.message}`)
        } else {
          setError(err instanceof Error ? err.message : "Failed to load teams")
        }
      } finally {
        setLoading(false)
      }
    }

    loadTeams()
  }, [])

  // Filter teams based on search term and team type
  useEffect(() => {
    let filtered = teams

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (team) =>
          team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          team.league.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply team type filter
    if (teamTypeFilter !== "all") {
      filtered = filtered.filter((team) => team.teamType === teamTypeFilter)
    }

    setFilteredTeams(filtered)
  }, [teams, searchTerm, teamTypeFilter])

  // Function to get the ordinal suffix for position
  const getOrdinalSuffix = (position: number) => {
    if (position > 3 && position < 21) return "th"
    switch (position % 10) {
      case 1:
        return "st"
      case 2:
        return "nd"
      case 3:
        return "rd"
      default:
        return "th"
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading teams...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2 text-red-600">Error Loading Teams</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold">Teams</h1>

        <div className="flex flex-col md:flex-row gap-4 md:items-center">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search teams..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="w-full md:w-48">
            <Select value={teamTypeFilter} onValueChange={setTeamTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Teams" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                <SelectItem value="club">Club Teams</SelectItem>
                <SelectItem value="national">National Teams</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {filteredTeams.length === 0 ? (
        <div className="text-center py-12">
          <Filter className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No teams found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTeams.map((team) => (
            <Link href={`/teams/${team.id}`} key={team.id}>
              <Card className="p-6 hover:bg-accent transition-colors h-full">
                <div className="flex items-center space-x-4">
                  <div className="relative h-20 w-20 flex-shrink-0">
                    <Image
                      src={team.logo || "/placeholder.svg?height=80&width=80&query=football team logo"}
                      alt={team.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold">{team.name}</h3>
                    <p className="text-sm text-muted-foreground">{team.league || "No League"}</p>
                    <div className="mt-2 text-sm">
                      <span className={`${team.stats.position <= 3 ? "text-green-600" : "text-blue-600"} font-medium`}>
                        {team.stats.position}
                        {getOrdinalSuffix(team.stats.position)}
                      </span>
                      <span className="text-muted-foreground"> • {team.stats.points} pts</span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-accent-foreground/10 text-accent-foreground">
                        {team.teamType === "club" ? "Club" : "National"}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
