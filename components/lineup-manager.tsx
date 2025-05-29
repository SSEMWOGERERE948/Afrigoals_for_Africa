"use client"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { User } from "lucide-react"
import type { Player, TeamLineup } from "@/app/types"

interface LineupManagerProps {
  teamName: string
  lineup: TeamLineup
  availablePlayers: Player[]
  formations: string[]
  onLineupChange: (lineup: TeamLineup) => void
  onPlayerSelection: (player: Player, type: "starting" | "substitute") => void
  onRemovePlayer: (playerId: string) => void
}

export default function LineupManager({
  teamName,
  lineup,
  availablePlayers,
  formations,
  onLineupChange,
  onPlayerSelection,
  onRemovePlayer,
}: LineupManagerProps) {
  const organizePlayersByPosition = (players: Player[]) => {
    const positions = {
      Goalkeeper: players.filter(
        (p) => p.position?.name?.toLowerCase().includes("goalkeeper") || p.position?.name?.toLowerCase().includes("gk"),
      ),
      Defender: players.filter(
        (p) => p.position?.name?.toLowerCase().includes("defender") || p.position?.name?.toLowerCase().includes("back"),
      ),
      Midfielder: players.filter(
        (p) =>
          p.position?.name?.toLowerCase().includes("midfielder") || p.position?.name?.toLowerCase().includes("mid"),
      ),
      Forward: players.filter(
        (p) =>
          p.position?.name?.toLowerCase().includes("forward") ||
          p.position?.name?.toLowerCase().includes("striker") ||
          p.position?.name?.toLowerCase().includes("winger"),
      ),
      Other: players.filter(
        (p) =>
          !p.position?.name ||
          (!p.position.name.toLowerCase().includes("goalkeeper") &&
            !p.position.name.toLowerCase().includes("gk") &&
            !p.position.name.toLowerCase().includes("defender") &&
            !p.position.name.toLowerCase().includes("back") &&
            !p.position.name.toLowerCase().includes("midfielder") &&
            !p.position.name.toLowerCase().includes("mid") &&
            !p.position.name.toLowerCase().includes("forward") &&
            !p.position.name.toLowerCase().includes("striker") &&
            !p.position.name.toLowerCase().includes("winger")),
      ),
    }

    return positions
  }

  const organizedPlayers = organizePlayersByPosition(availablePlayers)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">{teamName}</h3>
        <Select
          value={lineup.formation}
          onValueChange={(val) =>
            onLineupChange({
              ...lineup,
              formation: val,
            })
          }
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {formations.map((formation) => (
              <SelectItem key={formation} value={formation}>
                {formation}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Manager Display (Read-only) */}
      <div>
        <label className="text-sm font-medium mb-1 block">Manager</label>
        <div className="flex items-center gap-2 p-2 border rounded bg-muted/50">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{lineup.coach || "No manager assigned"}</span>
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-2">Starting XI ({lineup.startingXI.length}/11)</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto border rounded p-2 bg-background border-border">
          {lineup.startingXI.map((player) => (
            <div key={player.id} className="flex items-center justify-between bg-green-900/20 p-2 rounded">
              <span className="text-sm">
                {player.name} (#{player.number}) - {player.position?.name || "No Position"}
              </span>
              <Button variant="ghost" size="sm" onClick={() => onRemovePlayer(player.id)}>
                Remove
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-2">Substitutes ({lineup.substitutes.length}/7)</h4>
        <div className="space-y-2 max-h-32 overflow-y-auto border rounded p-2 bg-background border-border">
          {lineup.substitutes.map((player) => (
            <div key={player.id} className="flex items-center justify-between bg-amber-900/20 p-2 rounded">
              <span className="text-sm">
                {player.name} (#{player.number}) - {player.position?.name || "No Position"}
              </span>
              <Button variant="ghost" size="sm" onClick={() => onRemovePlayer(player.id)}>
                Remove
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-2">Available Players</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto border rounded p-2 bg-background border-border">
          {availablePlayers.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">All players are already selected</div>
          ) : (
            Object.entries(organizedPlayers).map(
              ([positionGroup, players]) =>
                players.length > 0 && (
                  <div key={positionGroup} className="mb-3">
                    <h5 className="text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">
                      {positionGroup}S
                    </h5>
                    {players.map((player) => (
                      <div
                        key={player.id}
                        className="flex items-center justify-between p-2 border border-border rounded mb-1 bg-background/40"
                      >
                        <span className="text-sm">
                          {player.name} (#{player.number}) - {player.position?.name || "No Position"}
                        </span>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPlayerSelection(player, "starting")}
                            disabled={lineup.startingXI.length >= 11}
                          >
                            Start
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPlayerSelection(player, "substitute")}
                            disabled={lineup.substitutes.length >= 7}
                          >
                            Sub
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ),
            )
          )}
        </div>
      </div>
    </div>
  )
}
