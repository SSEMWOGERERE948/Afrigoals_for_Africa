"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, Target, ArrowUpDown, Clock, AlertTriangle } from "lucide-react"
import type { FutsalPlayer, FutsalPosition, FutsalTeamLineup } from "@/app/types"

interface SubstitutesPanelProps {
  team: "home" | "away"
  teamName: string
  lineup: FutsalTeamLineup
  positions: FutsalPosition[]
  isLive?: boolean
  onSubstitution?: (playerOut: FutsalPlayer, playerIn: FutsalPlayer) => void
}

export function SubstitutesPanel({
  team,
  teamName,
  lineup,
  positions,
  isLive = false,
  onSubstitution,
}: SubstitutesPanelProps) {
  const getPositionName = (positionId: string): string => {
    if (!positionId) return "Unknown"
    const position = positions.find((p) => String(p.id) === String(positionId))
    return position?.name || "Unknown"
  }

  const handleSubstitution = (playerIn: FutsalPlayer) => {
    if (onSubstitution && lineup.startingXI.length > 0) {
      // For demo purposes, substitute with the first player in starting XI
      onSubstitution(lineup.startingXI[0], playerIn)
    }
  }

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <ArrowUpDown className={`h-5 w-5 ${team === "home" ? "text-blue-600" : "text-red-600"}`} />
          {teamName} Substitutes
        </h3>
        <Badge variant="outline" className="font-mono">
          {lineup.substitutes.length} available
        </Badge>
      </div>

      {lineup.substitutes.length === 0 ? (
        <div className="text-center py-8">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No substitutes available</p>
        </div>
      ) : (
        <div className="space-y-3">
          {lineup.substitutes.map((player) => (
            <div
              key={player.id}
              className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {getPositionName(player.positionId) === "Goalkeeper" ? (
                    <Shield className="h-4 w-4 text-blue-600" />
                  ) : (
                    <Target className="h-4 w-4 text-green-600" />
                  )}
                  <Badge variant="outline" className="w-8 h-6 text-center text-xs">
                    {player.number}
                  </Badge>
                </div>
                <div>
                  <p className="font-medium text-foreground">{player.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {getPositionName(player.positionId)} • Age {player.age}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {getPositionName(player.positionId)}
                </Badge>

                {player.isInjured && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Injured
                  </Badge>
                )}

                {player.isSuspended && (
                  <Badge variant="destructive" className="text-xs">
                    Suspended
                  </Badge>
                )}

                {isLive && !player.isInjured && !player.isSuspended && (
                  <Button size="sm" variant="outline" onClick={() => handleSubstitution(player)} className="text-xs">
                    <ArrowUpDown className="h-3 w-3 mr-1" />
                    Sub In
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isLive && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
            <Clock className="h-4 w-4" />
            <span>Live Match: Click "Sub In" to make substitutions</span>
          </div>
        </div>
      )}
    </Card>
  )
}
