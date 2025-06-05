"use client"

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Play } from "lucide-react"
import { League, Match } from "@/app/types"

interface MatchListProps {
  matches: Match[]
  leagues: League[]
  onSelectMatch: (matchId: string) => void
  onDeleteMatch: (matchId: string) => void
  onSelectLiveMatch?: (matchId: string) => void
}

const MatchList = ({ matches, leagues, onSelectMatch, onDeleteMatch, onSelectLiveMatch }: MatchListProps) => {
  return (
    <Table>
      <TableCaption>A list of your recent matches.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>League</TableHead>
          <TableHead>Home Team</TableHead>
          <TableHead>Away Team</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {matches.map((match) => {
          const league = leagues.find((league) => league.id === match.leagueId)
          return (
            <TableRow key={match.id}>
              <TableCell>{league?.name}</TableCell>
              <TableCell>{match.homeTeam}</TableCell>
              <TableCell>{match.awayTeam}</TableCell>
              <TableCell>{match.status}</TableCell>
              <TableCell className="text-right">
                <Button size="sm" onClick={() => onSelectMatch(match.id)} className="mr-2">
                  Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => onDeleteMatch(match.id)}>
                  Delete
                </Button>
                {match.status === "Lineup Set" || match.status === "Live" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onSelectLiveMatch?.(match.id)}
                    className="flex items-center gap-1"
                  >
                    <Play className="h-3 w-3" />
                    Live Control
                  </Button>
                ) : null}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

export default MatchList
