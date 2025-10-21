"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Save, RotateCcw, Users, Clock, MapPin } from "lucide-react"
import type { FutsalMatch, FutsalTeam } from "@/app/types"

interface LineupHeaderProps {
  match: FutsalMatch
  homeTeam: FutsalTeam
  awayTeam: FutsalTeam
  isLive?: boolean
  onAutoSelect: (team: "home" | "away") => void
  onSave: () => void
  onReset: () => void
  isSaving: boolean
}

export function LineupHeader({
  match,
  homeTeam,
  awayTeam,
  isLive = false,
  onAutoSelect,
  onSave,
  onReset,
  isSaving,
}: LineupHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
      {/* Match Info */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-orange-600">Futsal Lineup Manager</h2>
          {isLive && (
            <Badge variant="destructive" className="animate-pulse">
              🔴 LIVE
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span className="font-medium text-foreground">
              {homeTeam.teamName} vs {awayTeam.teamName}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{match.teamSize}-a-side</span>
          </div>

          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{match.matchDuration} minutes</span>
          </div>

          {match.venue && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{match.venue}</span>
            </div>
          )}
        </div>

        {/* Match Status */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            {match.status}
          </Badge>
          {match.date && (
            <Badge variant="outline">
              {match.date} {match.time && `at ${match.time}`}
            </Badge>
          )}
        </div>
      </div>

      {/* Actions */}
      {!isLive && (
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => onAutoSelect("home")} className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Auto Home
          </Button>

          <Button variant="outline" size="sm" onClick={() => onAutoSelect("away")} className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Auto Away
          </Button>

          <Button variant="outline" size="sm" onClick={onReset} className="flex items-center gap-2 bg-transparent">
            <RotateCcw className="h-4 w-4" />
            Reset All
          </Button>

          <Button
            onClick={onSave}
            disabled={isSaving}
            className="bg-orange-600 hover:bg-orange-700 flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Lineups"}
          </Button>
        </div>
      )}
    </div>
  )
}
