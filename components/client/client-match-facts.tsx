"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Users, Calendar, MapPin } from "lucide-react"
import type { Match } from "@/app/types"

interface ClientMatchFactsProps {
  match: Match
}

export default function ClientMatchFacts({ match }: ClientMatchFactsProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-6">Match Facts</h3>

      <div className="space-y-6">
        {/* Match Information */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Match Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Date:</span>
              <span className="ml-2 font-medium">{match.date}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Time:</span>
              <span className="ml-2 font-medium">{match.time}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Stadium:</span>
              <span className="ml-2 font-medium">{match.stadium || "TBD"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Referee:</span>
              <span className="ml-2 font-medium">{match.referee || "TBD"}</span>
            </div>
          </div>
        </div>

        {/* Head to Head */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Head to Head
          </h4>
          <p className="text-sm text-muted-foreground mb-3">
            This is the 5th meeting between {match.homeTeam} and {match.awayTeam} in recent competitions.
          </p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">2</div>
              <div className="text-xs text-muted-foreground">{match.homeTeam} wins</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-600">1</div>
              <div className="text-xs text-muted-foreground">Draws</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">1</div>
              <div className="text-xs text-muted-foreground">{match.awayTeam} wins</div>
            </div>
          </div>
        </div>

        {/* Form Guide */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Recent Form (Last 5 matches)
          </h4>
          <div className="space-y-3">
            <div>
              <p className="text-sm mb-2 font-medium">{match.homeTeam}</p>
              <div className="flex gap-1">
                {["W", "W", "D", "W", "L"].map((result, i) => (
                  <Badge
                    key={i}
                    variant={result === "W" ? "default" : result === "D" ? "secondary" : "destructive"}
                    className="w-8 h-8 flex items-center justify-center text-xs font-bold"
                  >
                    {result}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm mb-2 font-medium">{match.awayTeam}</p>
              <div className="flex gap-1">
                {["W", "L", "W", "W", "W"].map((result, i) => (
                  <Badge
                    key={i}
                    variant={result === "W" ? "default" : result === "D" ? "secondary" : "destructive"}
                    className="w-8 h-8 flex items-center justify-center text-xs font-bold"
                  >
                    {result}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Key Players */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Key Players to Watch
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium mb-2">{match.homeTeam}</p>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>• Top scorer: 12 goals this season</p>
                <p>• Most assists: 8 assists</p>
                <p>• Key defender: 90% pass accuracy</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">{match.awayTeam}</p>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>• Top scorer: 10 goals this season</p>
                <p>• Most assists: 6 assists</p>
                <p>• Key midfielder: 85% pass accuracy</p>
              </div>
            </div>
          </div>
        </div>

        {/* Interesting Facts */}
        <div>
          <h4 className="font-semibold mb-3">Interesting Facts</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• {match.homeTeam} have won 3 of their last 4 home matches</p>
            <p>• {match.awayTeam} have scored in their last 6 away matches</p>
            <p>• This fixture has produced 15 goals in the last 4 meetings</p>
            <p>• Both teams have never met in a final before</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
