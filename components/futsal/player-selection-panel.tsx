"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Shield, Target, ArrowUpDown, AlertTriangle } from "lucide-react"
import type { FutsalPlayer, FutsalPosition, FutsalTeamLineup } from "@/app/types"

interface PlayerSelectionPanelProps {
  team: "home" | "away"
  teamName: string
  players: FutsalPlayer[]
  lineup: FutsalTeamLineup
  positions: FutsalPosition[]
  teamSize: number
  onLineupChange: (lineup: FutsalTeamLineup) => void
  isLive?: boolean
}

export function PlayerSelectionPanel({
  team,
  teamName,
  players,
  lineup,
  positions,
  teamSize,
  onLineupChange,
  isLive = false,
}: PlayerSelectionPanelProps) {
  const getPositionName = (positionId: string): string => {
    if (!positionId) return "Unknown"
    const position = positions.find((p) => String(p.id) === String(positionId))
    return position?.name || "Unknown"
  }

  const getAvailablePlayers = (currentPosition: number) => {
    const currentPlayer = lineup.startingXI[currentPosition]

    return players.filter((player) => {
      // Include current player
      if (currentPlayer && player.id === currentPlayer.id) return true
      // Exclude players already in starting XI
      return !lineup.startingXI.some((sp) => sp?.id === player.id)
    })
  }

  const handlePlayerChange = (position: number, playerId: string) => {
    const player = players.find((p) => p.id === playerId)
    if (!player) return

    const newStartingXI = [...lineup.startingXI]
    const oldPlayer = newStartingXI[position]
    newStartingXI[position] = player

    // Move old player to substitutes if exists
    let newSubstitutes = [...lineup.substitutes]
    if (oldPlayer) {
      newSubstitutes.push(oldPlayer)
    }

    // Remove new player from substitutes
    newSubstitutes = newSubstitutes.filter((p) => p.id !== playerId)

    onLineupChange({
      ...lineup,
      startingXI: newStartingXI,
      substitutes: newSubstitutes,
    })
  }

  const swapPlayers = (pos1: number, pos2: number) => {
    const newStartingXI = [...lineup.startingXI]
    const temp = newStartingXI[pos1]
    newStartingXI[pos1] = newStartingXI[pos2]
    newStartingXI[pos2] = temp

    onLineupChange({
      ...lineup,
      startingXI: newStartingXI,
    })
  }

  return (
    <Card className="p-6 bg-card border-border">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Users className={`h-5 w-5 ${team === "home" ? "text-blue-600" : "text-red-600"}`} />
            {teamName} - Starting XI
          </h3>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono">
              {lineup.startingXI.length}/{teamSize}
            </Badge>
            {isLive && (
              <Badge variant="destructive" className="animate-pulse">
                🔴 LIVE
              </Badge>
            )}
          </div>
        </div>

        {/* Validation Alert */}
        {lineup.startingXI.length !== teamSize && (
          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-orange-700 dark:text-orange-300">
              <AlertTriangle className="h-4 w-4" />
              <span>
                Need {teamSize - lineup.startingXI.length} more player
                {teamSize - lineup.startingXI.length !== 1 ? "s" : ""} to complete lineup
              </span>
            </div>
          </div>
        )}

        {/* Player Selection */}
        <div className="space-y-3">
          {Array.from({ length: teamSize }).map((_, index) => {
            const player = lineup.startingXI[index]
            const availablePlayers = getAvailablePlayers(index)

            return (
              <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <Badge
                  variant="outline"
                  className={`w-8 h-8 flex items-center justify-center text-sm font-bold ${
                    team === "home" ? "bg-blue-50 text-blue-700" : "bg-red-50 text-red-700"
                  }`}
                >
                  {index + 1}
                </Badge>

                <div className="flex-1">
                  <Select
                    value={player?.id || ""}
                    onValueChange={(value) => handlePlayerChange(index, value)}
                    disabled={isLive}
                  >
                    <SelectTrigger className="bg-background border-input">
                      <SelectValue placeholder="Select player" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {availablePlayers.map((availablePlayer) => (
                        <SelectItem key={availablePlayer.id} value={availablePlayer.id}>
                          <div className="flex items-center gap-2">
                            {getPositionName(availablePlayer.positionId) === "Goalkeeper" ? (
                              <Shield className="h-4 w-4 text-blue-600" />
                            ) : (
                              <Target className="h-4 w-4 text-green-600" />
                            )}
                            <span className="font-medium">#{availablePlayer.number}</span>
                            <span>{availablePlayer.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {getPositionName(availablePlayer.positionId)}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Player Info */}
                {player && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {getPositionName(player.positionId)}
                    </Badge>

                
                    {player.isInjured && (
                      <Badge variant="destructive" className="text-xs">
                        Injured
                      </Badge>
                    )}

                    {player.isSuspended && (
                      <Badge variant="destructive" className="text-xs">
                        Suspended
                      </Badge>
                    )}

                    {/* Quick swap buttons */}
                    {!isLive && index > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => swapPlayers(index, index - 1)}
                        className="h-6 w-6 p-0"
                      >
                        <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Quick Actions */}
        {!isLive && (
          <div className="flex gap-2 pt-4 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Auto-fill with available players
                const newStartingXI = [...lineup.startingXI]
                const availableForAuto = players.filter((p) => !lineup.startingXI.some((sp) => sp?.id === p.id))

                for (let i = 0; i < teamSize && i < availableForAuto.length; i++) {
                  if (!newStartingXI[i]) {
                    newStartingXI[i] = availableForAuto[i]
                  }
                }

                onLineupChange({
                  ...lineup,
                  startingXI: newStartingXI,
                  substitutes: players.filter((p) => !newStartingXI.some((sp) => sp?.id === p.id)),
                })
              }}
              disabled={players.length < teamSize}
            >
              Auto Fill
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onLineupChange({
                  ...lineup,
                  startingXI: [],
                  substitutes: players,
                })
              }}
            >
              Clear All
            </Button>
          </div>
        )}

        {/* Team Stats */}
        <div className="pt-4 border-t border-border">
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="font-medium text-foreground">{players.length}</div>
              <div className="text-muted-foreground">Total Players</div>
            </div>
            <div>
              <div className="font-medium text-foreground">
                {players.filter((p) => getPositionName(p.positionId) === "Goalkeeper").length}
              </div>
              <div className="text-muted-foreground">Goalkeepers</div>
            </div>
            <div>
              <div className="font-medium text-foreground">{lineup.substitutes.length}</div>
              <div className="text-muted-foreground">Substitutes</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
