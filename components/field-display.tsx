"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState } from "react"
import { ArrowUpDown, ArrowDown, ArrowUp } from "lucide-react"
import type { Player } from "@/app/types"

interface FieldDisplayProps {
  formation: string
  startingXI: Player[]
  substitutes: Player[]
  teamName: string
  isHome: boolean
  onSubstitution?: (playerOut: Player, playerIn: Player) => void
  substitutions?: Array<{ playerOut: Player; playerIn: Player; minute?: number }>
}

interface Position {
  x: number // percentage from left
  y: number // percentage from top
  role: string // position role like "GK", "CB", "CM", etc.
}

const getFormationPositions = (formation: string): Position[] => {
  const formations: Record<string, Position[]> = {
    "4-4-2": [
      // Goalkeeper
      { x: 50, y: 5, role: "GK" },
      // Defenders
      { x: 20, y: 25, role: "LB" },
      { x: 40, y: 25, role: "CB" },
      { x: 60, y: 25, role: "CB" },
      { x: 80, y: 25, role: "RB" },
      // Midfielders
      { x: 20, y: 50, role: "LM" },
      { x: 40, y: 50, role: "CM" },
      { x: 60, y: 50, role: "CM" },
      { x: 80, y: 50, role: "RM" },
      // Forwards
      { x: 35, y: 75, role: "ST" },
      { x: 65, y: 75, role: "ST" },
    ],
    "4-3-3": [
      // Goalkeeper
      { x: 50, y: 5, role: "GK" },
      // Defenders
      { x: 20, y: 25, role: "LB" },
      { x: 40, y: 25, role: "CB" },
      { x: 60, y: 25, role: "CB" },
      { x: 80, y: 25, role: "RB" },
      // Midfielders
      { x: 30, y: 50, role: "CM" },
      { x: 50, y: 50, role: "CM" },
      { x: 70, y: 50, role: "CM" },
      // Forwards
      { x: 25, y: 75, role: "LW" },
      { x: 50, y: 75, role: "ST" },
      { x: 75, y: 75, role: "RW" },
    ],
    "3-5-2": [
      // Goalkeeper
      { x: 50, y: 5, role: "GK" },
      // Defenders
      { x: 30, y: 25, role: "CB" },
      { x: 50, y: 25, role: "CB" },
      { x: 70, y: 25, role: "CB" },
      // Midfielders
      { x: 15, y: 50, role: "LWB" },
      { x: 30, y: 50, role: "CM" },
      { x: 50, y: 50, role: "CM" },
      { x: 70, y: 50, role: "CM" },
      { x: 85, y: 50, role: "RWB" },
      // Forwards
      { x: 40, y: 75, role: "ST" },
      { x: 60, y: 75, role: "ST" },
    ],
    "4-2-3-1": [
      // Goalkeeper
      { x: 50, y: 5, role: "GK" },
      // Defenders
      { x: 20, y: 25, role: "LB" },
      { x: 40, y: 25, role: "CB" },
      { x: 60, y: 25, role: "CB" },
      { x: 80, y: 25, role: "RB" },
      // Defensive Midfielders
      { x: 35, y: 45, role: "CDM" },
      { x: 65, y: 45, role: "CDM" },
      // Attacking Midfielders
      { x: 25, y: 65, role: "LM" },
      { x: 50, y: 65, role: "CAM" },
      { x: 75, y: 65, role: "RM" },
      // Forward
      { x: 50, y: 80, role: "ST" },
    ],
    "3-4-3": [
      // Goalkeeper
      { x: 50, y: 5, role: "GK" },
      // Defenders
      { x: 30, y: 25, role: "CB" },
      { x: 50, y: 25, role: "CB" },
      { x: 70, y: 25, role: "CB" },
      // Midfielders
      { x: 20, y: 50, role: "LM" },
      { x: 40, y: 50, role: "CM" },
      { x: 60, y: 50, role: "CM" },
      { x: 80, y: 50, role: "RM" },
      // Forwards
      { x: 25, y: 75, role: "LW" },
      { x: 50, y: 75, role: "ST" },
      { x: 75, y: 75, role: "RW" },
    ],
    "5-3-2": [
      // Goalkeeper
      { x: 50, y: 5, role: "GK" },
      // Defenders
      { x: 15, y: 25, role: "LWB" },
      { x: 30, y: 25, role: "CB" },
      { x: 50, y: 25, role: "CB" },
      { x: 70, y: 25, role: "CB" },
      { x: 85, y: 25, role: "RWB" },
      // Midfielders
      { x: 30, y: 50, role: "CM" },
      { x: 50, y: 50, role: "CM" },
      { x: 70, y: 50, role: "CM" },
      // Forwards
      { x: 40, y: 75, role: "ST" },
      { x: 60, y: 75, role: "ST" },
    ],
    "4-5-1": [
      // Goalkeeper
      { x: 50, y: 5, role: "GK" },
      // Defenders
      { x: 20, y: 25, role: "LB" },
      { x: 40, y: 25, role: "CB" },
      { x: 60, y: 25, role: "CB" },
      { x: 80, y: 25, role: "RB" },
      // Midfielders
      { x: 15, y: 50, role: "LM" },
      { x: 30, y: 50, role: "CM" },
      { x: 50, y: 50, role: "CM" },
      { x: 70, y: 50, role: "CM" },
      { x: 85, y: 50, role: "RM" },
      // Forward
      { x: 50, y: 75, role: "ST" },
    ],
    "3-4-2-1": [
      // Goalkeeper
      { x: 50, y: 5, role: "GK" },
      // Defenders
      { x: 30, y: 25, role: "CB" },
      { x: 50, y: 25, role: "CB" },
      { x: 70, y: 25, role: "CB" },
      // Midfielders
      { x: 20, y: 45, role: "LM" },
      { x: 40, y: 45, role: "CM" },
      { x: 60, y: 45, role: "CM" },
      { x: 80, y: 45, role: "RM" },
      // Attacking Midfielders
      { x: 35, y: 65, role: "CAM" },
      { x: 65, y: 65, role: "CAM" },
      // Forward
      { x: 50, y: 80, role: "ST" },
    ],
  }

  return formations[formation] || formations["4-4-2"]
}

const getPlayerColor = (position: string | undefined): string => {
  if (!position) return "bg-gray-500"

  const pos = position.toLowerCase()
  if (pos.includes("goalkeeper") || pos.includes("gk")) return "bg-yellow-500"
  if (pos.includes("defender") || pos.includes("back")) return "bg-blue-500"
  if (pos.includes("midfielder") || pos.includes("mid")) return "bg-green-500"
  if (pos.includes("forward") || pos.includes("striker") || pos.includes("winger")) return "bg-red-500"
  return "bg-gray-500"
}

export default function FieldDisplay({
  formation,
  startingXI,
  substitutes = [],
  teamName,
  isHome,
  onSubstitution,
  substitutions = [],
}: FieldDisplayProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [isSubstitutionDialogOpen, setIsSubstitutionDialogOpen] = useState(false)
  const positions = getFormationPositions(formation)

  const handlePlayerClick = (player: Player) => {
    if (onSubstitution && substitutes.length > 0) {
      setSelectedPlayer(player)
      setIsSubstitutionDialogOpen(true)
    }
  }

  const handleSubstitution = (playerIn: Player) => {
    if (selectedPlayer && onSubstitution) {
      onSubstitution(selectedPlayer, playerIn)
      setIsSubstitutionDialogOpen(false)
      setSelectedPlayer(null)
    }
  }

  const isPlayerSubstituted = (player: Player) => {
    return substitutions.some((sub) => sub.playerOut.id === player.id || sub.playerIn.id === player.id)
  }

  const getSubstitutionInfo = (player: Player) => {
    return substitutions.find((sub) => sub.playerOut.id === player.id || sub.playerIn.id === player.id)
  }

  return (
    <Card className="p-4 bg-background border-border">
      <div className="mb-4">
        <h3 className="font-semibold text-lg flex items-center gap-2 text-foreground">
          {teamName} - {formation}
          <Badge variant={isHome ? "default" : "secondary"}>{isHome ? "Home" : "Away"}</Badge>
        </h3>
        <p className="text-sm text-muted-foreground">
          Players on field: {startingXI.length}/11 | Substitutions: {substitutions.length}/5
        </p>
      </div>

      <div className="relative w-full h-96 bg-green-900/80 rounded-lg border-2 border-gray-700 overflow-hidden">
        {/* Field markings */}
        <div className="absolute inset-0">
          {/* Center circle */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 border-2 border-gray-400/60 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-gray-400/60 rounded-full"></div>

          {/* Center line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-400/60 transform -translate-y-1/2"></div>

          {/* Goal areas */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-8 border-2 border-gray-400/60 border-t-0"></div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-8 border-2 border-gray-400/60 border-b-0"></div>

          {/* Penalty areas */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-16 border-2 border-gray-400/60 border-t-0"></div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-16 border-2 border-gray-400/60 border-b-0"></div>

          {/* Corner arcs */}
          <div className="absolute top-0 left-0 w-4 h-4 border-2 border-gray-400/60 border-t-0 border-l-0 rounded-br-full"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-2 border-gray-400/60 border-t-0 border-r-0 rounded-bl-full"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-2 border-gray-400/60 border-b-0 border-l-0 rounded-tr-full"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-2 border-gray-400/60 border-b-0 border-r-0 rounded-tl-full"></div>
        </div>

        {/* Formation positions */}
        {positions.map((position, index) => {
          const player = index < startingXI.length ? startingXI[index] : null
          const substitutionInfo = player ? getSubstitutionInfo(player) : null
          const wasSubstituted = player ? isPlayerSubstituted(player) : false

          return (
            <div
              key={`position-${index}`}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
              }}
              onClick={() => player && handlePlayerClick(player)}
            >
              {player ? (
                <>
                  {/* Player name above circle */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 text-center">
                    <span className="text-xs font-medium text-white bg-black/70 px-1 py-0.5 rounded whitespace-nowrap">
                      {player.name}
                      {wasSubstituted && <ArrowUpDown className="inline-block w-3 h-3 ml-1 text-orange-400" />}
                    </span>
                  </div>

                  <div
                    className={`relative w-8 h-8 rounded-full border-2 ${
                      wasSubstituted ? "border-orange-400" : "border-white"
                    } flex items-center justify-center text-white text-xs font-bold shadow-lg ${getPlayerColor(
                      player.position?.name,
                    )} group-hover:scale-110 transition-transform ${
                      onSubstitution && substitutes.length > 0 ? "hover:ring-2 hover:ring-blue-400" : ""
                    }`}
                  >
                    {player.number}

                    {/* Substitution indicator */}
                    {wasSubstituted && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full flex items-center justify-center">
                        <ArrowUpDown className="w-2 h-2 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Position tooltip on hover */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {player.position?.name || "No Position"}
                    {onSubstitution && substitutes.length > 0 && (
                      <div className="text-blue-300">Click to substitute</div>
                    )}
                    {substitutionInfo && (
                      <div className="text-orange-300">
                        {substitutionInfo.playerOut.id === player.id ? "Substituted out" : "Substituted in"}
                        {substitutionInfo.minute && ` (${substitutionInfo.minute}')`}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Empty position */
                <div className="w-8 h-8 rounded-full border-2 border-dashed border-gray-400 bg-gray-700/40 flex items-center justify-center text-gray-300 text-xs">
                  <span className="text-xs">{position.role}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-300">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span>GK</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span>DEF</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>MID</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span>FWD</span>
        </div>
        {substitutions.length > 0 && (
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-orange-400"></div>
            <span>SUB</span>
          </div>
        )}
      </div>

      {/* Substitution Dialog */}
      <Dialog open={isSubstitutionDialogOpen} onOpenChange={setIsSubstitutionDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowUpDown className="h-5 w-5" />
              Make Substitution
            </DialogTitle>
          </DialogHeader>

          {selectedPlayer && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border">
                <ArrowDown className="h-4 w-4 text-red-600" />
                <div>
                  <p className="font-medium text-red-700 dark:text-red-400">Player Out</p>
                  <p className="text-sm">
                    {selectedPlayer.name} (#{selectedPlayer.number}) - {selectedPlayer.position?.name}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <ArrowUp className="h-4 w-4 text-green-600" />
                  <p className="font-medium text-green-700 dark:text-green-400">Select Player In</p>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {substitutes.map((substitute) => (
                    <Button
                      key={substitute.id}
                      variant="outline"
                      className="w-full justify-start h-auto p-3"
                      onClick={() => handleSubstitution(substitute)}
                    >
                      <div className="text-left">
                        <p className="font-medium">
                          {substitute.name} (#{substitute.number})
                        </p>
                        <p className="text-sm text-muted-foreground">{substitute.position?.name || "No Position"}</p>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {substitutes.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No substitute players available</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
