"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Target, Shield, Zap, TrendingUp, Users, MessageSquare, Save, RotateCcw, Lightbulb } from "lucide-react"
import type { FutsalTeamLineup, FutsalTeam } from "@/app/types"

interface TacticalBoardProps {
  homeLineup: FutsalTeamLineup
  awayLineup: FutsalTeamLineup
  homeTeam: FutsalTeam
  awayTeam: FutsalTeam
  onHomeLineupChange: (lineup: FutsalTeamLineup) => void
  onAwayLineupChange: (lineup: FutsalTeamLineup) => void
  teamSize: number
}

const tacticalInstructions = {
  attacking: [
    { id: "high_press", name: "High Press", description: "Press opponents high up the pitch" },
    { id: "quick_passing", name: "Quick Passing", description: "Focus on short, quick passes" },
    { id: "wing_play", name: "Wing Play", description: "Attack through the wings" },
    { id: "direct_play", name: "Direct Play", description: "Play direct balls to forwards" },
  ],
  defensive: [
    { id: "deep_block", name: "Deep Block", description: "Defend deep and compact" },
    { id: "man_marking", name: "Man Marking", description: "Mark opponents tightly" },
    { id: "zone_defense", name: "Zone Defense", description: "Defend in zones" },
    { id: "counter_attack", name: "Counter Attack", description: "Quick transitions to attack" },
  ],
  general: [
    { id: "possession", name: "Keep Possession", description: "Maintain ball control" },
    { id: "tempo_control", name: "Control Tempo", description: "Dictate the pace of the game" },
    { id: "set_pieces", name: "Set Piece Focus", description: "Emphasize set piece situations" },
    { id: "fitness", name: "High Intensity", description: "Maintain high work rate" },
  ],
}

export function TacticalBoard({
  homeLineup,
  awayLineup,
  homeTeam,
  awayTeam,
  onHomeLineupChange,
  onAwayLineupChange,
  teamSize,
}: TacticalBoardProps) {
  const [selectedTeam, setSelectedTeam] = useState<"home" | "away">("home")
  const [activeTab, setActiveTab] = useState<"instructions" | "notes" | "analysis">("instructions")

  const currentLineup = selectedTeam === "home" ? homeLineup : awayLineup
  const currentTeam = selectedTeam === "home" ? homeTeam : awayTeam
  const updateLineup = selectedTeam === "home" ? onHomeLineupChange : onAwayLineupChange

  const handleTacticalNoteChange = (notes: string) => {
    updateLineup({
      ...currentLineup,
      tacticalNotes: notes,
    })
  }

  const addTacticalInstruction = (instruction: string) => {
    const currentNotes = currentLineup.tacticalNotes || ""
    const newNotes = currentNotes ? `${currentNotes}\n• ${instruction}` : `• ${instruction}`
    handleTacticalNoteChange(newNotes)
  }

  const getKeyPlayers = () => {
    return currentLineup.startingXI.slice(0, 3) // Top 3 players as key players
  }

  const getFormationAnalysis = () => {
    const formation = currentLineup.formation
    const analysis: Record<string, string> = {
      "1-2-1": "Balanced formation with strong midfield presence. Good for possession play.",
      "1-1-2": "Attacking formation with two forwards. Vulnerable in defense but strong in attack.",
      "2-2": "Defensive formation with solid back line. Good for counter-attacking.",
      "1-3": "Ultra-attacking formation. High risk, high reward approach.",
      "1-2-2": "Classic formation with good balance between defense and attack.",
      "1-3-1": "Wide formation emphasizing wing play and crosses.",
      "2-2-1": "Defensive setup with quick counter-attack potential.",
    }
    return analysis[formation] || "Standard formation with balanced approach."
  }

  return (
    <Card className="p-6 bg-card border-border">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-600" />
            Tactical Board
          </h3>
          <Select value={selectedTeam} onValueChange={(value: "home" | "away") => setSelectedTeam(value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="home">{homeTeam.teamName}</SelectItem>
              <SelectItem value="away">{awayTeam.teamName}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Team Info */}
        <div className="p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-foreground">{currentTeam.teamName}</h4>
              <p className="text-sm text-muted-foreground">Formation: {currentLineup.formation}</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                {currentLineup.startingXI.length}/{teamSize} players
              </Badge>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                {currentLineup.substitutes.length} subs
              </Badge>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-muted rounded-lg">
          <Button
            variant={activeTab === "instructions" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("instructions")}
            className="flex-1"
          >
            <Zap className="h-4 w-4 mr-2" />
            Instructions
          </Button>
          <Button
            variant={activeTab === "notes" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("notes")}
            className="flex-1"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Notes
          </Button>
          <Button
            variant={activeTab === "analysis" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("analysis")}
            className="flex-1"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Analysis
          </Button>
        </div>

        {/* Content */}
        {activeTab === "instructions" && (
          <div className="space-y-4">
            <div>
              <h5 className="font-medium mb-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-red-600" />
                Attacking Instructions
              </h5>
              <div className="grid grid-cols-2 gap-2">
                {tacticalInstructions.attacking.map((instruction) => (
                  <Button
                    key={instruction.id}
                    variant="outline"
                    size="sm"
                    onClick={() => addTacticalInstruction(instruction.name)}
                    className="justify-start text-left h-auto p-3"
                  >
                    <div>
                      <div className="font-medium">{instruction.name}</div>
                      <div className="text-xs text-muted-foreground">{instruction.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h5 className="font-medium mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600" />
                Defensive Instructions
              </h5>
              <div className="grid grid-cols-2 gap-2">
                {tacticalInstructions.defensive.map((instruction) => (
                  <Button
                    key={instruction.id}
                    variant="outline"
                    size="sm"
                    onClick={() => addTacticalInstruction(instruction.name)}
                    className="justify-start text-left h-auto p-3"
                  >
                    <div>
                      <div className="font-medium">{instruction.name}</div>
                      <div className="text-xs text-muted-foreground">{instruction.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h5 className="font-medium mb-3 flex items-center gap-2">
                <Users className="h-4 w-4 text-green-600" />
                General Instructions
              </h5>
              <div className="grid grid-cols-2 gap-2">
                {tacticalInstructions.general.map((instruction) => (
                  <Button
                    key={instruction.id}
                    variant="outline"
                    size="sm"
                    onClick={() => addTacticalInstruction(instruction.name)}
                    className="justify-start text-left h-auto p-3"
                  >
                    <div>
                      <div className="font-medium">{instruction.name}</div>
                      <div className="text-xs text-muted-foreground">{instruction.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "notes" && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Tactical Notes</label>
              <Textarea
                value={currentLineup.tacticalNotes || ""}
                onChange={(e) => handleTacticalNoteChange(e.target.value)}
                placeholder="Add tactical instructions, player roles, set piece plans..."
                rows={8}
                className="bg-background border-input"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleTacticalNoteChange("")}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear Notes
              </Button>
              <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                <Save className="h-4 w-4 mr-2" />
                Save Notes
              </Button>
            </div>
          </div>
        )}

        {activeTab === "analysis" && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h5 className="font-medium mb-2 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-blue-600" />
                Formation Analysis
              </h5>
              <p className="text-sm text-muted-foreground">{getFormationAnalysis()}</p>
            </div>

            <div>
              <h5 className="font-medium mb-3">Key Players</h5>
              <div className="space-y-2">
                {getKeyPlayers().map((player, index) => (
                  <div key={player.id} className="flex items-center gap-3 p-2 bg-muted/30 rounded">
                    <Badge variant="outline" className="w-8 text-center">
                      {player.number}
                    </Badge>
                    <div>
                      <p className="font-medium text-sm">{player.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Key player #{index + 1} - Important for team strategy
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h6 className="font-medium text-sm text-green-700 dark:text-green-300 mb-1">Strengths</h6>
                <ul className="text-xs text-green-600 dark:text-green-400 space-y-1">
                  <li>• Strong formation balance</li>
                  <li>• Good player distribution</li>
                  <li>• Tactical flexibility</li>
                </ul>
              </div>
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <h6 className="font-medium text-sm text-orange-700 dark:text-orange-300 mb-1">Areas to Watch</h6>
                <ul className="text-xs text-orange-600 dark:text-orange-400 space-y-1">
                  <li>• Monitor player fitness</li>
                  <li>• Watch for tactical adjustments</li>
                  <li>• Consider substitutions</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
