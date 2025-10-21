"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Target, Shield, Users, Award, Activity } from "lucide-react"
import type { FutsalMatch, FutsalTeam, FutsalTeamLineup, FutsalPlayer, FutsalPosition, MatchEvent } from "@/app/types"

interface MatchStatisticsProps {
  match: FutsalMatch
  homeTeam: FutsalTeam
  awayTeam: FutsalTeam
  homeLineup: FutsalTeamLineup
  awayLineup: FutsalTeamLineup
  homePlayers: FutsalPlayer[]
  awayPlayers: FutsalPlayer[]
  positions: FutsalPosition[]
  matchEvents?: MatchEvent[]
}

export function MatchStatistics({
  match,
  homeTeam,
  awayTeam,
  homeLineup,
  awayLineup,
  homePlayers,
  awayPlayers,
  positions,
  matchEvents = [],
}: MatchStatisticsProps) {
  const getPositionName = (positionId: string): string => {
    if (!positionId) return "Unknown"
    const position = positions.find((p) => String(p.id) === String(positionId))
    return position?.name || "Unknown"
  }

  const getTopScorers = (players: FutsalPlayer[]) => {
    return players
      .filter((p) => p.goals && p.goals > 0)
      .sort((a, b) => (b.goals || 0) - (a.goals || 0))
      .slice(0, 3)
  }

  const getPositionDistribution = (lineup: FutsalTeamLineup) => {
    const distribution: Record<string, number> = {}
    lineup.startingXI.forEach((player) => {
      const position = getPositionName(player.positionId)
      distribution[position] = (distribution[position] || 0) + 1
    })
    return distribution
  }

  const calculateTeamStats = (players: FutsalPlayer[]) => {
    return {
      totalGoals: players.reduce((sum, p) => sum + (p.goals || 0), 0),
      totalAssists: players.reduce((sum, p) => sum + (p.assists || 0), 0),
      averageAge: Math.round(players.reduce((sum, p) => sum + p.age, 0) / players.length),
      totalExperience: players.reduce((sum, p) => sum + (p.stats?.matchesPlayed || 0), 0),
    }
  }

  const homeStats = calculateTeamStats(homePlayers)
  const awayStats = calculateTeamStats(awayPlayers)
  const homeTopScorers = getTopScorers(homePlayers)
  const awayTopScorers = getTopScorers(awayPlayers)
  const homePositions = getPositionDistribution(homeLineup)
  const awayPositions = getPositionDistribution(awayLineup)

  return (
    <div className="space-y-6">
      {/* Match Overview */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-orange-600" />
          Match Overview
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{match.teamSize}</div>
            <div className="text-sm text-muted-foreground">Players per side</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{match.matchDuration}</div>
            <div className="text-sm text-muted-foreground">Minutes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{match.maxSubstitutions}</div>
            <div className="text-sm text-muted-foreground">Max Substitutions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{matchEvents.length}</div>
            <div className="text-sm text-muted-foreground">Match Events</div>
          </div>
        </div>
      </Card>

      {/* Team Comparison */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          Team Comparison
        </h3>
        <div className="space-y-6">
          {/* Goals Comparison */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">{homeTeam.teamName}</span>
              <span className="text-sm text-muted-foreground">Total Goals</span>
              <span className="text-sm font-medium">{awayTeam.teamName}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold text-blue-600">{homeStats.totalGoals}</div>
              <div className="flex-1">
                <Progress
                  value={(homeStats.totalGoals / Math.max(homeStats.totalGoals + awayStats.totalGoals, 1)) * 100}
                  className="h-2"
                />
              </div>
              <div className="text-2xl font-bold text-red-600">{awayStats.totalGoals}</div>
            </div>
          </div>

          {/* Average Age */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">{homeTeam.teamName}</span>
              <span className="text-sm text-muted-foreground">Average Age</span>
              <span className="text-sm font-medium">{awayTeam.teamName}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-xl font-bold text-blue-600">{homeStats.averageAge}</div>
              <div className="flex-1">
                <Progress
                  value={(homeStats.averageAge / Math.max(homeStats.averageAge + awayStats.averageAge, 1)) * 100}
                  className="h-2"
                />
              </div>
              <div className="text-xl font-bold text-red-600">{awayStats.averageAge}</div>
            </div>
          </div>

          {/* Experience */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">{homeTeam.teamName}</span>
              <span className="text-sm text-muted-foreground">Total Experience</span>
              <span className="text-sm font-medium">{awayTeam.teamName}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-xl font-bold text-blue-600">{homeStats.totalExperience}</div>
              <div className="flex-1">
                <Progress
                  value={
                    (homeStats.totalExperience / Math.max(homeStats.totalExperience + awayStats.totalExperience, 1)) *
                    100
                  }
                  className="h-2"
                />
              </div>
              <div className="text-xl font-bold text-red-600">{awayStats.totalExperience}</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Lineup Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2 text-blue-600">
            <Shield className="h-5 w-5" />
            {homeTeam.teamName} Lineup
          </h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Formation</span>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                {homeLineup.formation}
              </Badge>
            </div>
            <div>
              <span className="text-sm text-muted-foreground mb-2 block">Position Distribution</span>
              <div className="space-y-2">
                {Object.entries(homePositions).map(([position, count]) => (
                  <div key={position} className="flex justify-between items-center">
                    <span className="text-sm">{position}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground mb-2 block">Starting XI</span>
              <div className="space-y-1">
                {homeLineup.startingXI.slice(0, 5).map((player) => (
                  <div key={player.id} className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="w-6 h-6 text-xs">
                      {player.number}
                    </Badge>
                    <span>{player.name}</span>
                    <span className="text-muted-foreground">({getPositionName(player.positionId)})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2 text-red-600">
            <Target className="h-5 w-5" />
            {awayTeam.teamName} Lineup
          </h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Formation</span>
              <Badge variant="outline" className="bg-red-50 text-red-700">
                {awayLineup.formation}
              </Badge>
            </div>
            <div>
              <span className="text-sm text-muted-foreground mb-2 block">Position Distribution</span>
              <div className="space-y-2">
                {Object.entries(awayPositions).map(([position, count]) => (
                  <div key={position} className="flex justify-between items-center">
                    <span className="text-sm">{position}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground mb-2 block">Starting XI</span>
              <div className="space-y-1">
                {awayLineup.startingXI.slice(0, 5).map((player) => (
                  <div key={player.id} className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="w-6 h-6 text-xs">
                      {player.number}
                    </Badge>
                    <span>{player.name}</span>
                    <span className="text-muted-foreground">({getPositionName(player.positionId)})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Top Scorers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-600" />
            {homeTeam.teamName} Top Scorers
          </h4>
          {homeTopScorers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No goals recorded yet</p>
          ) : (
            <div className="space-y-3">
              {homeTopScorers.map((player, index) => (
                <div key={player.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                    <span className="text-sm font-bold text-yellow-700 dark:text-yellow-300">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{player.name}</p>
                    <p className="text-xs text-muted-foreground">{getPositionName(player.positionId)}</p>
                  </div>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                    {player.goals} goals
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-600" />
            {awayTeam.teamName} Top Scorers
          </h4>
          {awayTopScorers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No goals recorded yet</p>
          ) : (
            <div className="space-y-3">
              {awayTopScorers.map((player, index) => (
                <div key={player.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                    <span className="text-sm font-bold text-yellow-700 dark:text-yellow-300">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{player.name}</p>
                    <p className="text-xs text-muted-foreground">{getPositionName(player.positionId)}</p>
                  </div>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                    {player.goals} goals
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Match Events Timeline */}
      {matchEvents.length > 0 && (
        <Card className="p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-600" />
            Match Events Timeline
          </h4>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {matchEvents.map((event, index) => (
              <div key={index} className="flex items-center gap-3 p-2 bg-muted/30 rounded">
                <Badge variant="outline" className="w-12 text-center">
                  {event.minute}'
                </Badge>
                <div className="flex-1">
                  <p className="text-sm font-medium">{event.description}</p>
                  {event.playerName && <p className="text-xs text-muted-foreground">{event.playerName}</p>}
                </div>
                {event.team && (
                  <Badge variant={event.team === "home" ? "default" : "secondary"}>
                    {event.team === "home" ? homeTeam.teamName : awayTeam.teamName}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
