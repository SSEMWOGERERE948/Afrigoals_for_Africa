"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import MatchClient from "@/components/client/match-client"
import type { Match } from "@/app/types"
import LiveMatchDisplay from "@/components/live-match-display"
import { fetchMatches } from "@/components/matches_api"

export default function MatchPage() {
  const params = useParams()
  const matchId = params.id as string

  const [matches, setMatches] = useState<{ [key: string]: Match }>({})
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadMatches = async () => {
      setLoading(true)
      setError(null)

      try {
        console.log("Loading matches for match ID:", matchId)

        const matchesList = await fetchMatches()
        console.log("Fetched matches:", matchesList.length)

        // Convert array to object for easier lookup
        const matchesMap = matchesList.reduce(
          (acc, match) => {
            acc[match.id] = match
            return acc
          },
          {} as { [key: string]: Match },
        )

        setMatches(matchesMap)

        // Find the current match
        const match = matchesMap[matchId]
        if (!match) {
          throw new Error(`Match with ID ${matchId} not found`)
        }

        setCurrentMatch(match)
        console.log("Current match set:", match)
      } catch (err) {
        console.error("Error loading matches:", err)
        setError(err instanceof Error ? err.message : "Failed to load match data")
      } finally {
        setLoading(false)
      }
    }

    if (matchId) {
      loadMatches()
    }
  }, [matchId])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="text-lg">Loading match data...</span>
          </div>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <h2 className="text-xl font-semibold mb-2">Error Loading Match</h2>
              <p>{error}</p>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Please check that the match ID is correct and try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </Card>
      </div>
    )
  }

  if (!currentMatch) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Match Not Found</h2>
            <p className="text-muted-foreground">The match you're looking for doesn't exist or has been removed.</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Live Match Display */}
      <LiveMatchDisplay matchId={matchId} />

      {/* Match Client Component */}
      <MatchClient match={currentMatch} allMatches={matches} currentMatchId={matchId} />
    </div>
  )
}
