"use client"

import { Card } from "@/components/ui/card"
import type { Match } from "@/app/types"

interface ClientMatchStatsProps {
  match: Match
}

interface Stats {
  possession: { home: number; away: number }
  shots: { home: number; away: number }
  shotsOnTarget: { home: number; away: number }
  corners: { home: number; away: number }
  fouls: { home: number; away: number }
  yellowCards: { home: number; away: number }
  redCards: { home: number; away: number }
  offsides: { home: number; away: number }
  expectedGoals: { home: number; away: number }
}

export default function ClientMatchStats({ match }: ClientMatchStatsProps) {
  // Mock stats - in a real app, this would come from the API
  const stats: Stats = {
    possession: { home: 55, away: 45 },
    shots: { home: 15, away: 12 },
    shotsOnTarget: { home: 7, away: 5 },
    corners: { home: 6, away: 4 },
    fouls: { home: 12, away: 14 },
    yellowCards: { home: 2, away: 3 },
    redCards: { home: 0, away: 0 },
    offsides: { home: 2, away: 3 },
    expectedGoals: { home: 2.3, away: 1.8 },
  }

  const formatStatName = (key: string) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim()
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-6 text-center">Match Statistics</h3>
      <div className="space-y-6">
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} className="space-y-2">
            <div className="grid grid-cols-7 items-center gap-4">
              <div className="col-span-2 text-right font-medium">{value.home}</div>
              <div className="col-span-3">
                <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${(value.home / (value.home + value.away)) * 100}%` }}
                  />
                  <div
                    className="absolute right-0 top-0 h-full bg-red-600 transition-all duration-300"
                    style={{ width: `${(value.away / (value.home + value.away)) * 100}%` }}
                  />
                </div>
              </div>
              <div className="col-span-2 font-medium">{value.away}</div>
            </div>
            <div className="text-center text-sm text-muted-foreground font-medium">{formatStatName(key)}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{match.homeScore || 0}</div>
            <div className="text-sm text-muted-foreground">{match.homeTeam}</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">{match.awayScore || 0}</div>
            <div className="text-sm text-muted-foreground">{match.awayTeam}</div>
          </div>
        </div>
      </div>
    </Card>
  )
}
