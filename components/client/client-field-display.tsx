"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, ArrowUpDown } from "lucide-react"
import type { Player } from "@/app/types"

interface ClientFieldDisplayProps {
  formation: string
  startingXI: Player[]
  substitutes: Player[]
  teamName: string
  manager: string
  isHome: boolean
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
      { x: 50, y: 5, role: "GK" },
      { x: 20, y: 25, role: "LB" },
      { x: 40, y: 25, role: "CB" },
      { x: 60, y: 25, role: "CB" },
      { x: 80, y: 25, role: "RB" },
      { x: 20, y: 50, role: "LM" },
      { x: 40, y: 50, role: "CM" },
      { x: 60, y: 50, role: "CM" },
      { x: 80, y: 50, role: "RM" },
      { x: 35, y: 75, role: "ST" },
      { x: 65, y: 75, role: "ST" },
    ],
    "4-3-3": [
      { x: 50, y: 5, role: "GK" },
      { x: 20, y: 25, role: "LB" },
      { x: 40, y: 25, role: "CB" },
      { x: 60, y: 25, role: "CB" },
      { x: 80, y: 25, role: "RB" },
      { x: 30, y: 50, role: "CM" },
      { x: 50, y: 50, role: "CM" },
      { x: 70, y: 50, role: "CM" },
      { x: 25, y: 75, role: "LW" },
      { x: 50, y: 75, role: "ST" },
      { x: 75, y: 75, role: "RW" },
    ],
    "4-2-3-1": [
      { x: 50, y: 5, role: "GK" },
      { x: 20, y: 25, role: "LB" },
      { x: 40, y: 25, role: "CB" },
      { x: 60, y: 25, role: "CB" },
      { x: 80, y: 25, role: "RB" },
      { x: 35, y: 45, role: "CDM" },
      { x: 65, y: 45, role: "CDM" },
      { x: 25, y: 65, role: "LM" },
      { x: 50, y: 65, role: "CAM" },
      { x: 75, y: 65, role: "RM" },
      { x: 50, y: 80, role: "ST" },
    ],
    "3-5-2": [
      { x: 50, y: 5, role: "GK" },
      { x: 30, y: 25, role: "CB" },
      { x: 50, y: 25, role: "CB" },
      { x: 70, y: 25, role: "CB" },
      { x: 15, y: 50, role: "LWB" },
      { x: 30, y: 50, role: "CM" },
      { x: 50, y: 50, role: "CM" },
      { x: 70, y: 50, role: "CM" },
      { x: 85, y: 50, role: "RWB" },
      { x: 40, y: 75, role: "ST" },
      { x: 60, y: 75, role: "ST" },
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

export default function ClientFieldDisplay({
  formation,
  startingXI,
  substitutes,
  teamName,
  manager,
  isHome,
  substitutions = [],
}: ClientFieldDisplayProps) {
  const positions = getFormationPositions(formation)

  const isPlayerSubstituted = (player: Player) => {
    return substitutions.some((sub) => sub.playerOut.id === player.id || sub.playerIn.id === player.id)
  }

  const getSubstitutionInfo = (player: Player) => {
    return substitutions.find((sub) => sub.playerOut.id === player.id || sub.playerIn.id === player.id)
  }

  return (
    <Card className="p-4 bg-background border-border">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg flex items-center gap-2 text-foreground">
            {teamName} - {formation}
            <Badge variant={isHome ? "default" : "secondary"}>{isHome ? "Home" : "Away"}</Badge>
          </h3>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Manager: {manager}</span>
        </div>

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
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
              }}
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
                    )} group-hover:scale-110 transition-transform`}
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
    </Card>
  )
}
