"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trophy, Search, Filter } from "lucide-react"
import type { FutsalLeague } from "@/app/types"

export default function FutsalLeaguesPage() {
  const [leagues, setLeagues] = useState<FutsalLeague[]>([])
  const [filteredLeagues, setFilteredLeagues] = useState<FutsalLeague[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [teamSizeFilter, setTeamSizeFilter] = useState<string>("all")

  useEffect(() => {
    loadLeagues()
  }, [])

  useEffect(() => {
    filterLeagues()
  }, [leagues, searchTerm, statusFilter, teamSizeFilter])

  const loadLeagues = async () => {
    try {
      // Sample data - in production, this would come from your API
      const sampleLeagues: FutsalLeague[] = [
        {
          id: "1",
          name: "Inter-University Futsal Championship",
          country: "Uganda",
          logo: "/placeholder.svg?height=64&width=64",
          season: "2024",
          teamSize: 5,
          maxTeams: 16,
          matchDuration: 40,
          maxSubstitutions: 12,
          currentMatchday: 3,
          teams: 8,
          status: "active",
          description:
            "Annual futsal tournament for universities across Uganda featuring the best university teams competing in fast-paced indoor football action.",
        },
        {
          id: "2",
          name: "Schools Futsal League",
          country: "Uganda",
          logo: "/placeholder.svg?height=64&width=64",
          season: "2024",
          teamSize: 6,
          maxTeams: 12,
          matchDuration: 30,
          maxSubstitutions: 8,
          currentMatchday: 2,
          teams: 6,
          status: "active",
          description: "Secondary schools futsal competition promoting youth development and school sports excellence.",
        },
        {
          id: "3",
          name: "Community Futsal Cup",
          country: "Uganda",
          logo: "/placeholder.svg?height=64&width=64",
          season: "2024",
          teamSize: 7,
          maxTeams: 20,
          matchDuration: 35,
          maxSubstitutions: 10,
          currentMatchday: 1,
          teams: 12,
          status: "upcoming",
          description:
            "Open community tournament bringing together local clubs and community teams in competitive futsal action.",
        },
        {
          id: "4",
          name: "Women's Futsal Championship",
          country: "Uganda",
          logo: "/placeholder.svg?height=64&width=64",
          season: "2024",
          teamSize: 5,
          maxTeams: 10,
          matchDuration: 40,
          maxSubstitutions: 12,
          currentMatchday: 4,
          teams: 8,
          status: "active",
          description:
            "Dedicated women's futsal league promoting female participation in indoor football across Uganda.",
        },
        {
          id: "5",
          name: "Youth Futsal Development League",
          country: "Uganda",
          logo: "/placeholder.svg?height=64&width=64",
          season: "2024",
          teamSize: 6,
          maxTeams: 16,
          matchDuration: 25,
          maxSubstitutions: 15,
          currentMatchday: 5,
          teams: 14,
          status: "completed",
          description:
            "Youth development league focusing on skill development and competitive experience for young players.",
        },
      ]

      setLeagues(sampleLeagues)
    } catch (error) {
      console.error("Failed to load leagues:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterLeagues = () => {
    let filtered = leagues

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (league) =>
          league.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          league.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((league) => league.status === statusFilter)
    }

    // Team size filter
    if (teamSizeFilter !== "all") {
      filtered = filtered.filter((league) => league.teamSize.toString() === teamSizeFilter)
    }

    setFilteredLeagues(filtered)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p>Loading futsal leagues...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Futsal Leagues</h1>
            <p className="text-lg md:text-xl opacity-90">Discover and follow futsal competitions across Uganda</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Leagues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search leagues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={teamSizeFilter} onValueChange={setTeamSizeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by team size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Team Sizes</SelectItem>
                  <SelectItem value="5">5-a-side</SelectItem>
                  <SelectItem value="6">6-a-side</SelectItem>
                  <SelectItem value="7">7-a-side</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredLeagues.length} of {leagues.length} leagues
          </p>
        </div>

        {/* Leagues Grid */}
        {filteredLeagues.length === 0 ? (
          <Card className="p-8 text-center">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No leagues found</h3>
            <p className="text-muted-foreground">Try adjusting your search criteria or filters.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLeagues.map((league) => (
              <Link key={league.id} href={`/futsal/leagues/${league.id}`}>
                <Card className="hover:shadow-lg transition-shadow h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <img
                        src={league.logo || "/placeholder.svg"}
                        alt={league.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <CardTitle className="text-lg leading-tight">{league.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{league.season} Season</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">{league.description}</p>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="bg-orange-50 text-orange-700">
                        {league.teamSize}-a-side
                      </Badge>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {league.matchDuration}min
                      </Badge>
                      <Badge
                        variant={
                          league.status === "active"
                            ? "default"
                            : league.status === "upcoming"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {league.status}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Teams:</span>
                        <span className="font-medium">
                          {league.teams}/{league.maxTeams}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Matchday:</span>
                        <span className="font-medium">{league.currentMatchday}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Max Subs:</span>
                        <span className="font-medium">{league.maxSubstitutions}</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button className="w-full" variant="outline">
                        View League Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
