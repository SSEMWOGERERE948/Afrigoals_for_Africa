"use client"

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Play, Edit, Trash2, Zap } from "lucide-react" // Import Edit, Trash2, Zap for consistency
import type { League, Match } from "@/app/types"

interface MatchListProps {
  matches: Match[]
  leagues: League[]
  onSelectMatch: (matchId: string) => void
  onDeleteMatch: (matchId: string) => void
  onSelectLiveMatch?: (matchId: string) => void
  onStartMatch: (matchId: string) => void // Ensure this prop is present
}

const MatchList = ({
  matches,
  leagues,
  onSelectMatch,
  onDeleteMatch,
  onSelectLiveMatch,
  onStartMatch,
}: MatchListProps) => {
  const getLeagueName = (leagueId: string) => {
    return leagues.find((l) => l.id === leagueId)?.name || "Unknown League"
  }

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
          const league = leagues.find((league) => league.id === match.league)
          return (
            <TableRow key={match.id}>
              <TableCell>{league?.name}</TableCell>
              <TableCell>{match.homeTeam}</TableCell>
              <TableCell>{match.awayTeam}</TableCell>
              <TableCell>{match.status}</TableCell>
              <TableCell className="text-right flex items-center justify-end gap-2">
                {" "}
                {/* Added flex and gap for spacing */}
                {match.status === "Lineup Set" && (
                  <Button size="sm" onClick={() => onStartMatch(match.id)} className="bg-green-600 hover:bg-green-700">
                    <Play className="h-4 w-4 mr-1" /> Start Match
                  </Button>
                )}
                <Button size="sm" onClick={() => onSelectMatch(match.id)}>
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
                {/* Only show Live Control if it's a live or lineup set match and the prop is provided */}
                {(match.status === "Lineup Set" || match.status === "Live") && onSelectLiveMatch && (
                  <Button size="sm" onClick={() => onSelectLiveMatch(match.id)}>
                    <Zap className="h-4 w-4 mr-1" /> Live Control
                  </Button>
                )}
                <Button size="sm" variant="destructive" onClick={() => onDeleteMatch(match.id)}>
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

export default MatchList
