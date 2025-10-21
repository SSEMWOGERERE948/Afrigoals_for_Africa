"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Shield, Target } from "lucide-react"
import type { FutsalPlayer } from "@/app/types"

interface FutsalFieldDisplayProps {
  formation: string
  startingXI: FutsalPlayer[]
  substitutes: FutsalPlayer[]
  teamName: string
  isHome: boolean
  teamSize: 5 | 6 | 7
}

// Position mappings for different team sizes and formations
const getPlayerPositions = (formation: string, teamSize: number, isHome: boolean) => {
  const positions: { x: number; y: number }[] = []

  // Base positions for 5-a-side
  if (teamSize === 5) {
    switch (formation) {
      case "1-2-1":
        positions.push(
          { x: isHome ? 10 : 90, y: 50 }, // GK
          { x: isHome ? 25 : 75, y: 30 }, // Defender 1
          { x: isHome ? 25 : 75, y: 70 }, // Defender 2
          { x: isHome ? 50 : 50, y: 50 }, // Midfielder
          { x: isHome ? 75 : 25, y: 50 }, // Forward
        )
        break
      case "1-1-2":
        positions.push(
          { x: isHome ? 10 : 90, y: 50 }, // GK
          { x: isHome ? 30 : 70, y: 50 }, // Defender
          { x: isHome ? 60 : 40, y: 35 }, // Forward 1
          { x: isHome ? 60 : 40, y: 65 }, // Forward 2
          { x: isHome ? 80 : 20, y: 50 }, // Forward 3
        )
        break
      case "2-2":
        positions.push(
          { x: isHome ? 10 : 90, y: 50 }, // GK
          { x: isHome ? 30 : 70, y: 35 }, // Defender 1
          { x: isHome ? 30 : 70, y: 65 }, // Defender 2
          { x: isHome ? 70 : 30, y: 35 }, // Forward 1
          { x: isHome ? 70 : 30, y: 65 }, // Forward 2
        )
        break
      default:
        // Default 1-2-1 formation
        positions.push(
          { x: isHome ? 10 : 90, y: 50 },
          { x: isHome ? 25 : 75, y: 30 },
          { x: isHome ? 25 : 75, y: 70 },
          { x: isHome ? 50 : 50, y: 50 },
          { x: isHome ? 75 : 25, y: 50 },
        )
    }
  } else if (teamSize === 6) {
    // 6-a-side formations
    switch (formation) {
      case "1-2-2":
        positions.push(
          { x: isHome ? 10 : 90, y: 50 }, // GK
          { x: isHome ? 25 : 75, y: 30 }, // Defender 1
          { x: isHome ? 25 : 75, y: 70 }, // Defender 2
          { x: isHome ? 50 : 50, y: 30 }, // Midfielder 1
          { x: isHome ? 50 : 50, y: 70 }, // Midfielder 2
          { x: isHome ? 75 : 25, y: 50 }, // Forward
        )
        break
      default:
        positions.push(
          { x: isHome ? 10 : 90, y: 50 },
          { x: isHome ? 25 : 75, y: 25 },
          { x: isHome ? 25 : 75, y: 50 },
          { x: isHome ? 25 : 75, y: 75 },
          { x: isHome ? 60 : 40, y: 35 },
          { x: isHome ? 60 : 40, y: 65 },
        )
    }
  } else if (teamSize === 7) {
    // 7-a-side formations
    positions.push(
      { x: isHome ? 10 : 90, y: 50 }, // GK
      { x: isHome ? 25 : 75, y: 20 }, // Defender 1
      { x: isHome ? 25 : 75, y: 40 }, // Defender 2
      { x: isHome ? 25 : 75, y: 60 }, // Defender 3
      { x: isHome ? 25 : 75, y: 80 }, // Defender 4
      { x: isHome ? 60 : 40, y: 35 }, // Forward 1
      { x: isHome ? 60 : 40, y: 65 }, // Forward 2
    )
  }

  return positions
}

const getPositionName = (positionId: string): string => {
  const positions = [
    { id: "1", name: "Goalkeeper" },
    { id: "2", name: "Defender" },
    { id: "3", name: "Midfielder" },
    { id: "4", name: "Forward" },
    { id: "5", name: "Pivot" },
  ]

  const position = positions.find((p) => String(p.id) === String(positionId))
  return position?.name || "Unknown"
}

export default function FutsalFieldDisplay({
  formation,
  startingXI,
  substitutes,
  teamName,
  isHome,
  teamSize,
}: FutsalFieldDisplayProps) {
  const positions = getPlayerPositions(formation, teamSize, isHome)
  const teamColor = isHome ? "bg-blue-500" : "bg-red-500"

  return (
    <Card className="p-4 bg-card border-border">
      <div className="mb-4">
        <h3 className="font-semibold flex items-center gap-2 text-foreground">
          <Users className={`h-5 w-5 ${isHome ? "text-blue-600" : "text-red-600"}`} />
          {teamName}
        </h3>
        <p className="text-sm text-muted-foreground">
          Formation: {formation} • Players: {startingXI.length}/{teamSize}
        </p>
      </div>

      {/* Field Visualization */}
      <div className="relative bg-green-100 dark:bg-green-900/30 border-2 border-green-300 dark:border-green-700 rounded-lg h-64 mb-4 overflow-hidden">
        {/* Field markings */}
        <div className="absolute inset-0">
          {/* Center line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white dark:bg-green-200 transform -translate-x-0.5"></div>
          {/* Center circle */}
          <div className="absolute left-1/2 top-1/2 w-16 h-16 border-2 border-white dark:border-green-200 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
          {/* Goal areas */}
          <div className="absolute left-0 top-1/2 w-8 h-20 border-2 border-white dark:border-green-200 border-l-0 transform -translate-y-1/2"></div>
          <div className="absolute right-0 top-1/2 w-8 h-20 border-2 border-white dark:border-green-200 border-r-0 transform -translate-y-1/2"></div>
        </div>

        {/* Players */}
        {startingXI.map((player, index) => {
          const position = positions[index]
          if (!position) return null

          const isGoalkeeper = getPositionName(player.positionId) === "Goalkeeper"

          return (
            <div
              key={player.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
              }}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg ${
                  isGoalkeeper ? "bg-yellow-500" : teamColor
                }`}
              >
                {player.number}
              </div>
              <div className="text-xs mt-1 text-center max-w-16 truncate bg-white/90 dark:bg-black/90 text-black dark:text-white px-1 rounded">
                {player.name.split(" ")[0]}
              </div>
            </div>
          )
        })}

        {/* Empty positions */}
        {Array.from({ length: teamSize - startingXI.length }).map((_, index) => {
          const positionIndex = startingXI.length + index
          const position = positions[positionIndex]
          if (!position) return null

          return (
            <div
              key={`empty-${index}`}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
              }}
            >
              <div className="w-8 h-8 rounded-full border-2 border-dashed border-gray-400 dark:border-gray-500 flex items-center justify-center text-gray-400 dark:text-gray-500 text-xs">
                ?
              </div>
              <div className="text-xs mt-1 text-gray-400 dark:text-gray-500">Empty</div>
            </div>
          )
        })}
      </div>

      {/* Starting XI List */}
      <div className="space-y-2">
        <h4 className="font-medium text-sm text-foreground">Starting XI</h4>
        <div className="grid grid-cols-1 gap-1">
          {startingXI.map((player, index) => {
            const isGoalkeeper = getPositionName(player.positionId) === "Goalkeeper"
            return (
              <div key={player.id} className="flex items-center gap-2 p-2 rounded text-sm bg-muted/50 dark:bg-muted/30">
                <Badge
                  variant="outline"
                  className="w-6 h-6 p-0 flex items-center justify-center text-xs bg-background text-foreground border-border"
                >
                  {index + 1}
                </Badge>
                {isGoalkeeper ? (
                  <Shield className="h-4 w-4 text-yellow-600" />
                ) : (
                  <Target className="h-4 w-4 text-green-600" />
                )}
                <span className="font-medium text-foreground">#{player.number}</span>
                <span className="truncate text-foreground">{player.name}</span>
                <Badge variant="secondary" className="ml-auto text-xs bg-secondary text-secondary-foreground">
                  {getPositionName(player.positionId)}
                </Badge>
              </div>
            )
          })}
          {startingXI.length === 0 && <p className="text-muted-foreground text-sm py-2">No players selected</p>}
        </div>
      </div>

      {/* Substitutes */}
      {substitutes.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="font-medium text-sm text-foreground">Substitutes ({substitutes.length})</h4>
          <div className="flex flex-wrap gap-1">
            {substitutes.slice(0, 5).map((player) => (
              <Badge key={player.id} variant="outline" className="text-xs bg-background text-foreground border-border">
                #{player.number} {player.name.split(" ")[0]}
              </Badge>
            ))}
            {substitutes.length > 5 && (
              <Badge variant="outline" className="text-xs bg-background text-foreground border-border">
                +{substitutes.length - 5} more
              </Badge>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}
