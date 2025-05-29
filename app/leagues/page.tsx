"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Loader2, Search, Trophy, Filter } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { League } from "@/app/types"
import { fetchLeagues } from "@/components/team_api"
import axios from "axios"

export default function LeaguesPage() {
  const [leagues, setLeagues] = useState<League[]>([])
  const [filteredLeagues, setFilteredLeagues] = useState<League[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    const loadLeagues = async () => {
      setLoading(true)
      setError(null)

      try {
        console.log("🌐 Fetching leagues from API...")
        const data = await fetchLeagues()
        console.log("✅ Leagues fetched successfully:", data.length, "leagues")
        console.log("📋 Leagues data:", data)

        setLeagues(data)
        setFilteredLeagues(data)
      } catch (err) {
        console.error("❌ Failed to load leagues:", err)
        if (axios.isAxiosError(err)) {
          console.error("📡 API Error details:", {
            status: err.response?.status,
            statusText: err.response?.statusText,
            data: err.response?.data,
            url: err.config?.url,
          })
          setError(`API Error: ${err.response?.status} - ${err.response?.statusText || err.message}`)
        } else {
          setError(err instanceof Error ? err.message : "Failed to load leagues")
        }
      } finally {
        setLoading(false)
      }
    }

    loadLeagues()
  }, [])

  // Filter leagues based on search term and tab
  useEffect(() => {
    let filtered = leagues

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (league) =>
          league.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          league.country.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply tab filter
    if (activeTab !== "all") {
      if (activeTab === "continental") {
        // Continental leagues typically have "Africa", "Champions", "Cup" in their names
        filtered = filtered.filter(
          (league) =>
            league.name.toLowerCase().includes("champions") ||
            league.name.toLowerCase().includes("cup") ||
            league.name.toLowerCase().includes("africa") ||
            league.name.toLowerCase().includes("caf") ||
            league.country.toLowerCase() === "africa",
        )
      } else if (activeTab === "domestic") {
        // Domestic leagues are country-specific (not continental)
        filtered = filtered.filter(
          (league) =>
            !league.name.toLowerCase().includes("champions") &&
            !league.name.toLowerCase().includes("cup") &&
            !league.name.toLowerCase().includes("africa") &&
            !league.name.toLowerCase().includes("caf") &&
            league.country.toLowerCase() !== "africa",
        )
      }
    }

    setFilteredLeagues(filtered)
  }, [leagues, searchTerm, activeTab])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading leagues...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2 text-red-600">Error Loading Leagues</h2>
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
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="h-6 w-6" />
          Leagues
        </h1>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leagues..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Leagues ({leagues.length})</TabsTrigger>
          <TabsTrigger value="domestic">
            Domestic (
            {
              leagues.filter(
                (l) =>
                  !l.name.toLowerCase().includes("champions") &&
                  !l.name.toLowerCase().includes("cup") &&
                  !l.name.toLowerCase().includes("africa") &&
                  !l.name.toLowerCase().includes("caf") &&
                  l.country.toLowerCase() !== "africa",
              ).length
            }
            )
          </TabsTrigger>
          <TabsTrigger value="continental">
            Continental (
            {
              leagues.filter(
                (l) =>
                  l.name.toLowerCase().includes("champions") ||
                  l.name.toLowerCase().includes("cup") ||
                  l.name.toLowerCase().includes("africa") ||
                  l.name.toLowerCase().includes("caf") ||
                  l.country.toLowerCase() === "africa",
              ).length
            }
            )
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {filteredLeagues.length === 0 ? (
        <div className="text-center py-12">
          <Filter className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No leagues found</h3>
          <p className="text-muted-foreground">
            {searchTerm
              ? "Try adjusting your search criteria"
              : "No leagues have been created yet. Create some leagues in the admin panel."}
          </p>
          {!searchTerm && (
            <Link
              href="/admin/matches"
              className="inline-block mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Go to Admin Panel
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredLeagues.map((league) => (
            <Link href={`/leagues/${league.id}`} key={league.id}>
              <Card className="p-6 hover:bg-accent transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="relative h-16 w-16 flex-shrink-0">
                    {league.logo ? (
                      <Image
                        src={league.logo || "/placeholder.svg"}
                        alt={league.name}
                        fill
                        className="object-contain rounded"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted rounded flex items-center justify-center">
                        <Trophy className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{league.name}</h3>
                    <p className="text-sm text-muted-foreground">{league.country}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>Season {league.season}</span>
                      <span>•</span>
                      <span>Matchday {league.currentMatchday}</span>
                      <span>•</span>
                      <span>{league.teams} teams</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                      {league.country.toLowerCase() === "africa" ||
                      league.name.toLowerCase().includes("champions") ||
                      league.name.toLowerCase().includes("cup") ||
                      league.name.toLowerCase().includes("caf")
                        ? "Continental"
                        : "Domestic"}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* League Statistics */}
      {leagues.length > 0 && (
        <Card className="p-6 mt-8">
          <h2 className="text-lg font-semibold mb-4">League Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{leagues.length}</div>
              <div className="text-sm text-muted-foreground">Total Leagues</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {leagues.reduce((sum, league) => sum + league.teams, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Teams</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(leagues.reduce((sum, league) => sum + league.currentMatchday, 0) / leagues.length)}
              </div>
              <div className="text-sm text-muted-foreground">Avg Matchday</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
