"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Maximize2, RotateCw, Eye } from "lucide-react"
import type { FutsalTeamLineup, FutsalTeam, FutsalPosition, MatchEvent } from "@/app/types"

interface FieldVisualizationProps {
  homeLineup: FutsalTeamLineup
  awayLineup: FutsalTeamLineup
  homeTeam: FutsalTeam
  awayTeam: FutsalTeam
  positions: FutsalPosition[]
  teamSize: number
  isLive?: boolean
  matchEvents?: MatchEvent[]
}

export function FieldVisualization({
  homeLineup,
  awayLineup,
  homeTeam,
  awayTeam,
  positions,
  teamSize,
  isLive = false,
  matchEvents = [],
}: FieldVisualizationProps) {
  const [viewMode, setViewMode] = useState<"home" | "away" | "both">("both")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [fieldRotation, setFieldRotation] = useState(0)

  const getPositionName = (positionId: string): string => {
    if (!positionId) return "Unknown"
    const position = positions.find((p) => String(p.id) === String(positionId))
    return position?.name || "Unknown"
  }

  const getFormationPositions = (formation: string, teamSize: number) => {
    // Simplified formation positioning for visualization
    const formations: Record<string, number[][]> = {
      "1-2-1": [[2.5], [1, 4], [2.5]],
      "1-1-2": [[2.5], [2.5], [1.5, 3.5]],
      "2-2": [
        [1.5, 3.5],
        [1.5, 3.5],
      ],
      "1-3": [[2.5], [1, 2.5, 4]],
      "1-2-2": [[3], [1.5, 4.5], [1.5, 4.5]],
      "1-3-1": [[3], [1, 3, 5], [3]],
      "2-2-1": [[1.5, 4.5], [1.5, 4.5], [3]],
      "1-2-3": [[3.5], [2, 5], [1.5, 3.5, 5.5]],
    }
    return formations[formation] || formations["1-2-1"]
  }

  const renderTeamOnField = (lineup: FutsalTeamLineup, team: FutsalTeam, isHome: boolean) => {
    if (viewMode !== "both" && viewMode !== (isHome ? "home" : "away")) {
      return null
    }

    const positions = getFormationPositions(lineup.formation, teamSize)
    let playerIndex = 0

    return (
      <div className={`absolute inset-0 ${isHome ? "top-0" : "bottom-0"} h-1/2`}>
        {positions.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="absolute flex justify-center items-center w-full"
            style={{
              top: isHome ? `${(rowIndex + 1) * 20}%` : `${80 - (rowIndex + 1) * 20}%`,
            }}
          >
            <div className="flex justify-between w-4/5">
              {row.map((position, posIndex) => {
                const player = lineup.startingXI[playerIndex]
                playerIndex++
                if (!player) return null

                return (
                  <div
                    key={`${rowIndex}-${posIndex}`}
                    className="relative group cursor-pointer"
                    style={{ left: `${(position - 1) * 15}%` }}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg transform hover:scale-110 transition-transform ${
                        isHome ? "bg-blue-600 hover:bg-blue-700" : "bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      {player.number}
                    </div>

                    {/* Player tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      <div className="font-medium">{player.name}</div>
                      <div className="text-gray-300">{getPositionName(player.positionId)}</div>
                    </div>

                    {/* Player name below */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 text-xs font-medium text-center whitespace-nowrap">
                      {player.name.split(" ").pop()}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Card className={`${isFullscreen ? "fixed inset-4 z-50" : ""} bg-card border-border`}>
      <div className="p-6">
        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Eye className="h-5 w-5 text-green-600" />
              Field Visualization
            </h3>
            {isLive && (
              <Badge variant="destructive" className="animate-pulse">
                🔴 LIVE
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Select value={viewMode} onValueChange={(value: "home" | "away" | "both") => setViewMode(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="both">Both Teams</SelectItem>
                <SelectItem value="home">{homeTeam.teamName}</SelectItem>
                <SelectItem value="away">{awayTeam.teamName}</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" onClick={() => setFieldRotation((prev) => (prev + 90) % 360)}>
              <RotateCw className="h-4 w-4" />
            </Button>

            <Button variant="outline" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Field */}
        <div
          className="relative bg-green-100 dark:bg-green-900 rounded-lg mx-auto"
          style={{
            aspectRatio: "2/1",
            maxWidth: "800px",
            transform: `rotate(${fieldRotation}deg)`,
            transition: "transform 0.3s ease",
          }}
        >
          {/* Field markings */}
          <div className="absolute inset-2 border-2 border-white dark:border-green-200 rounded">
            {/* Center line */}
            <div className="absolute top-0 left-1/2 w-0.5 h-full bg-white dark:bg-green-200 transform -translate-x-0.5"></div>

            {/* Center circle */}
            <div className="absolute top-1/2 left-1/2 w-20 h-20 border-2 border-white dark:border-green-200 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>

            {/* Goal areas */}
            <div className="absolute top-1/4 left-0 w-8 h-1/2 border-2 border-white dark:border-green-200 border-l-0 rounded-r"></div>
            <div className="absolute top-1/4 right-0 w-8 h-1/2 border-2 border-white dark:border-green-200 border-r-0 rounded-l"></div>

            {/* Goals */}
            <div className="absolute top-1/3 left-0 w-2 h-1/3 bg-white dark:bg-green-200"></div>
            <div className="absolute top-1/3 right-0 w-2 h-1/3 bg-white dark:bg-green-200"></div>
          </div>

          {/* Team labels */}
          <div className="absolute top-4 left-4 text-sm font-medium text-white bg-blue-600 px-2 py-1 rounded">
            {homeTeam.teamName}
          </div>
          <div className="absolute bottom-4 right-4 text-sm font-medium text-white bg-red-600 px-2 py-1 rounded">
            {awayTeam.teamName}
          </div>

          {/* Players */}
          {renderTeamOnField(homeLineup, homeTeam, true)}
          {renderTeamOnField(awayLineup, awayTeam, false)}
        </div>

        {/* Formation info */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="text-center">
            <h4 className="font-medium text-blue-600">{homeTeam.teamName}</h4>
            <p className="text-sm text-muted-foreground">Formation: {homeLineup.formation}</p>
            <p className="text-xs text-muted-foreground">
              {homeLineup.startingXI.length}/{teamSize} players
            </p>
          </div>
          <div className="text-center">
            <h4 className="font-medium text-red-600">{awayTeam.teamName}</h4>
            <p className="text-sm text-muted-foreground">Formation: {awayLineup.formation}</p>
            <p className="text-xs text-muted-foreground">
              {awayLineup.startingXI.length}/{teamSize} players
            </p>
          </div>
        </div>

        {/* Recent events for live matches */}
        {isLive && matchEvents.length > 0 && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <h5 className="font-medium mb-2 text-sm">Recent Events</h5>
            <div className="space-y-1">
              {matchEvents.slice(-3).map((event, index) => (
                <div key={index} className="text-xs text-muted-foreground">
                  {event.minute}' - {event.description}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
