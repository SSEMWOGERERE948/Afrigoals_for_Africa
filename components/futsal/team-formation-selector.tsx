"use client"

import { Card } from "@/components/ui/card"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { TangentIcon as Tactics } from "lucide-react"
import type { FutsalTeamLineup } from "@/app/types"

interface TeamFormationSelectorProps {
  team: "home" | "away"
  teamName: string
  lineup: FutsalTeamLineup
  teamSize: number
  onFormationChange: (formation: string) => void
}

const futsalFormations = {
  5: [
    { value: "1-2-1", label: "1-2-1 (Diamond)", description: "Balanced formation" },
    { value: "1-1-2", label: "1-1-2 (Attacking)", description: "More attacking play" },
    { value: "2-2", label: "2-2 (Square)", description: "Defensive stability" },
    { value: "1-3", label: "1-3 (Ultra Attack)", description: "All-out attack" },
  ],
  6: [
    { value: "1-2-2", label: "1-2-2 (Classic)", description: "Traditional setup" },
    { value: "1-3-1", label: "1-3-1 (Wide)", description: "Wing play focus" },
    { value: "2-2-1", label: "2-2-1 (Defensive)", description: "Solid defense" },
    { value: "1-1-3", label: "1-1-3 (Attack)", description: "High pressing" },
  ],
  7: [
    { value: "1-2-3", label: "1-2-3 (Standard)", description: "Balanced approach" },
    { value: "1-3-2", label: "1-3-2 (Control)", description: "Midfield control" },
    { value: "2-3-1", label: "2-3-1 (Defensive)", description: "Counter-attack" },
    { value: "1-4-1", label: "1-4-1 (Wide)", description: "Width in attack" },
  ],
}

export function TeamFormationSelector({
  team,
  teamName,
  lineup,
  teamSize,
  onFormationChange,
}: TeamFormationSelectorProps) {
  const formations = futsalFormations[teamSize as keyof typeof futsalFormations] || futsalFormations[5]
  const currentFormation = formations.find((f) => f.value === lineup.formation)

  return (
    <Card className="p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-2">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Tactics className={`h-5 w-5 ${team === "home" ? "text-blue-600" : "text-red-600"}`} />
            <h3 className="font-semibold text-lg">{teamName}</h3>
          </div>
          <Badge variant="outline" className="font-mono">
            {lineup.formation}
          </Badge>
        </div>

        <Select value={lineup.formation} onValueChange={onFormationChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select formation" />
          </SelectTrigger>
          <SelectContent>
            {formations.map((formation) => (
              <SelectItem key={formation.value} value={formation.value}>
                <div className="flex flex-col">
                  <span className="font-medium">{formation.label}</span>
                  <span className="text-xs text-muted-foreground">{formation.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {currentFormation && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">{currentFormation.description}</p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="text-center">
            <div className="font-medium">Starting XI</div>
            <div className="text-muted-foreground">
              {lineup.startingXI.length}/{teamSize}
            </div>
          </div>
          <div className="text-center">
            <div className="font-medium">Substitutes</div>
            <div className="text-muted-foreground">{lineup.substitutes.length}</div>
          </div>
          <div className="text-center">
            <div className="font-medium">Formation</div>
            <div className="text-muted-foreground font-mono">{lineup.formation}</div>
          </div>
        </div>
      </div>
    </Card>
  )
}
