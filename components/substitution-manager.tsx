"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowUpDown, ArrowDown, ArrowUp, Save } from "lucide-react"
import type { Player } from "@/app/types"

export interface Substitution {
  id?: string
  matchId: string
  team: "home" | "away"
  playerOut: Player
  playerIn: Player
  minute: number
  reason?: string
  timestamp: string
}

interface SubstitutionManagerProps {
  matchId: string
  homeTeamName: string
  awayTeamName: string
  homeSubstitutions: Substitution[]
  awaySubstitutions: Substitution[]
  onSaveSubstitutions?: (substitutions: Substitution[]) => Promise<void>
}

export default function SubstitutionManager({
  matchId,
  homeTeamName,
  awayTeamName,
  homeSubstitutions,
  awaySubstitutions,
  onSaveSubstitutions,
}: SubstitutionManagerProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [editingSubstitution, setEditingSubstitution] = useState<Substitution | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const handleSaveSubstitutions = async () => {
    if (!onSaveSubstitutions) return

    setIsSaving(true)
    try {
      const allSubstitutions = [...homeSubstitutions, ...awaySubstitutions]
      await onSaveSubstitutions(allSubstitutions)
      alert("Substitutions saved successfully!")
    } catch (error) {
      console.error("Failed to save substitutions:", error)
      alert("Failed to save substitutions.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditSubstitution = (substitution: Substitution) => {
    setEditingSubstitution({ ...substitution })
    setIsEditDialogOpen(true)
  }

  const handleUpdateSubstitution = () => {
    if (!editingSubstitution) return

    // Update the substitution in the parent component
    // This would need to be passed as a prop function
    setIsEditDialogOpen(false)
    setEditingSubstitution(null)
  }

  if (homeSubstitutions.length === 0 && awaySubstitutions.length === 0) {
    return null
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <ArrowUpDown className="h-5 w-5" />
          Substitutions Made
        </h3>
        {onSaveSubstitutions && (
          <Button onClick={handleSaveSubstitutions} disabled={isSaving} size="sm">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Substitutions"}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Home Team Substitutions */}
        <div>
          <h4 className="font-medium mb-2">
            {homeTeamName} ({homeSubstitutions.length}/5)
          </h4>
          <div className="space-y-2">
            {homeSubstitutions.map((sub, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 bg-muted/50 rounded cursor-pointer hover:bg-muted/70"
                onClick={() => handleEditSubstitution(sub)}
              >
                <Badge variant="outline" className="text-xs">
                  {sub.minute}'
                </Badge>
                <span className="text-sm text-red-600">
                  {sub.playerOut.name} (#{sub.playerOut.number})
                </span>
                <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm text-green-600">
                  {sub.playerIn.name} (#{sub.playerIn.number})
                </span>
                {sub.reason && (
                  <Badge variant="secondary" className="text-xs ml-auto">
                    {sub.reason}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Away Team Substitutions */}
        <div>
          <h4 className="font-medium mb-2">
            {awayTeamName} ({awaySubstitutions.length}/5)
          </h4>
          <div className="space-y-2">
            {awaySubstitutions.map((sub, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 bg-muted/50 rounded cursor-pointer hover:bg-muted/70"
                onClick={() => handleEditSubstitution(sub)}
              >
                <Badge variant="outline" className="text-xs">
                  {sub.minute}'
                </Badge>
                <span className="text-sm text-red-600">
                  {sub.playerOut.name} (#{sub.playerOut.number})
                </span>
                <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm text-green-600">
                  {sub.playerIn.name} (#{sub.playerIn.number})
                </span>
                {sub.reason && (
                  <Badge variant="secondary" className="text-xs ml-auto">
                    {sub.reason}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Substitution Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Substitution</DialogTitle>
          </DialogHeader>

          {editingSubstitution && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <ArrowDown className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium">
                    {editingSubstitution.playerOut.name} (#{editingSubstitution.playerOut.number})
                  </span>
                </div>
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                <div className="flex items-center gap-2">
                  <ArrowUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">
                    {editingSubstitution.playerIn.name} (#{editingSubstitution.playerIn.number})
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Minute</label>
                <Input
                  type="number"
                  value={editingSubstitution.minute}
                  onChange={(e) =>
                    setEditingSubstitution({
                      ...editingSubstitution,
                      minute: Number.parseInt(e.target.value) || 0,
                    })
                  }
                  min="1"
                  max="120"
                  placeholder="45"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Reason (Optional)</label>
                <Input
                  value={editingSubstitution.reason || ""}
                  onChange={(e) =>
                    setEditingSubstitution({
                      ...editingSubstitution,
                      reason: e.target.value,
                    })
                  }
                  placeholder="Tactical, Injury, etc."
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateSubstitution}>Update</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
