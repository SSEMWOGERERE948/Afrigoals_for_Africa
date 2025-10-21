"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Settings, Clock, Save, AlertTriangle, Plus, Minus, X, Loader2 } from "lucide-react"
import type { FutsalMatch, MatchPeriod } from "@/app/types"

interface MatchDurationSettingsProps {
  match: FutsalMatch
  onUpdatePeriods: (matchId: string, periods: MatchPeriod[], totalMatchDuration: number) => Promise<void>
  disabled?: boolean
}

export default function MatchDurationSettings({
  match,
  onUpdatePeriods,
  disabled = false,
}: MatchDurationSettingsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [tempPeriods, setTempPeriods] = useState<MatchPeriod[]>(match.periods || [])
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [periodEditError, setPeriodEditError] = useState("")

  // Initialize tempPeriods when dialog opens or match prop changes
  useEffect(() => {
    if (isOpen) {
      setTempPeriods(match.periods || [])
      setError("")
      setSuccess("")
      setPeriodEditError("")
    }
  }, [isOpen, match.periods])

  const handleAddPeriod = (breakPeriod: boolean) => {
    setTempPeriods((prev) => [
      ...prev,
      {
        id: Date.now().toString(), // Simple unique ID for client-side management
        name: breakPeriod ? `Break ${prev.length + 1}` : `Period ${prev.length + 1}`,
        duration: breakPeriod ? 5 : 20, // Default durations
        orderIndex: prev.length,
        breakPeriod: breakPeriod,
      },
    ])
  }

  const handleRemovePeriod = (id: string) => {
    setTempPeriods((prev) => prev.filter((p) => p.id !== id).map((p, idx) => ({ ...p, orderIndex: idx })))
  }

  const handlePeriodChange = (id: string, field: keyof MatchPeriod, value: any) => {
    setTempPeriods((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)))
  }

  const handleSave = async () => {
    try {
      setError("")
      setPeriodEditError("")
      setIsSaving(true)

      // Validation
      if (tempPeriods.length === 0) {
        setPeriodEditError("At least one period is required.")
        return
      }
      for (const period of tempPeriods) {
        if (!period.name.trim()) {
          setPeriodEditError("Period name cannot be empty.")
          return
        }
        if (period.duration < 1 || period.duration > 120) {
          setPeriodEditError(`Period '${period.name}' duration must be between 1 and 120 minutes.`)
          return
        }
      }

      const totalPlayingDuration = tempPeriods.filter((p) => !p.breakPeriod).reduce((sum, p) => sum + p.duration, 0)

      await onUpdatePeriods(match.id, tempPeriods, totalPlayingDuration)
      setSuccess("Match periods updated successfully!")

      setTimeout(() => {
        setIsOpen(false)
        setSuccess("")
      }, 2000)
    } catch (err) {
      setError("Failed to update match periods")
      console.error("Error updating match periods:", err)
    } finally {
      setIsSaving(false)
    }
  }

  const totalCurrentPlayingDuration =
    match.periods?.filter((p) => !p.breakPeriod).reduce((sum, p) => sum + p.duration, 0) || 0
  const totalTempPlayingDuration = tempPeriods.filter((p) => !p.breakPeriod).reduce((sum, p) => sum + p.duration, 0) || 0

  const isChanged =
    JSON.stringify(tempPeriods.map(({ id, ...rest }) => rest)) !==
    JSON.stringify(match.periods?.map(({ id, ...rest }) => rest) || [])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled} className="flex items-center gap-2 bg-transparent">
          <Settings className="h-4 w-4" />
          Match Periods
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Match Period Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Error/Success Messages */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="borderIndex-green-200 bg-green-50 text-green-800">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          {periodEditError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{periodEditError}</AlertDescription>
            </Alert>
          )}

          {/* Current Settings Display */}
          <Card className="p-4 bg-muted/50">
            <div className="text-sm text-muted-foreground mb-2">Current Match Periods</div>
            {match.periods && match.periods.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                {match.periods.map((period) => (
                  <div key={period.id} className="flex items-center gap-2">
                    <span className="font-medium">{period.name}:</span> {period.duration} min{" "}
                    {period.breakPeriod && "(Break)"}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No periods defined for this match.</p>
            )}
            <div className="mt-2 text-sm">
              <span className="font-medium">Total Playing Duration:</span> {totalCurrentPlayingDuration} min
            </div>
          </Card>

          {/* Period List for Editing */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Edit Periods</h4>
            {tempPeriods.length === 0 && (
              <p className="text-center text-muted-foreground py-4">No periods added yet. Add one below!</p>
            )}
            {tempPeriods.map((period, idx) => (
              <div key={period.id} className="flex items-center gap-3 p-3 borderIndex rounded-lg bg-muted/20">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor={`period-name-${period.id}`} className="sr-only">
                      Period Name
                    </Label>
                    <Input
                      id={`period-name-${period.id}`}
                      value={period.name}
                      onChange={(e) => handlePeriodChange(period.id, "name", e.target.value)}
                      placeholder="Period Name"
                      className="bg-background borderIndex-input"
                      disabled={isSaving}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`period-duration-${period.id}`} className="sr-only">
                      Duration (min)
                    </Label>
                    <Input
                      id={`period-duration-${period.id}`}
                      type="number"
                      min="1"
                      max="120"
                      value={period.duration}
                      onChange={(e) => handlePeriodChange(period.id, "duration", Number(e.target.value))}
                      placeholder="Duration"
                      className="bg-background borderIndex-input"
                      disabled={isSaving}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      id={`is-break-${period.id}`}
                      type="checkbox"
                      checked={period.breakPeriod || false}
                      onChange={(e) => handlePeriodChange(period.id, "breakPeriod", e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 borderIndex-gray-300 rounded"
                      disabled={isSaving}
                    />
                    <Label htmlFor={`is-break-${period.id}`}>Is Break?</Label>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleRemovePeriod(period.id)}
                  disabled={isSaving || tempPeriods.length <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Add Period Buttons */}
          <div className="flex gap-2">
            <Button onClick={() => handleAddPeriod(false)} variant="outline" disabled={isSaving}>
              <Plus className="h-4 w-4 mr-2" /> Add Playing Period
            </Button>
            <Button onClick={() => handleAddPeriod(true)} variant="outline" disabled={isSaving}>
              <Plus className="h-4 w-4 mr-2" /> Add Break Period
            </Button>
          </div>

          {/* Preview */}
          <Card className="p-3 bg-blue-50 borderIndex-blue-200">
            <div className="text-sm text-blue-800">
              <div className="font-medium">New Total Playing Duration: {totalTempPlayingDuration} minutes</div>
              <div className="text-xs mt-1">
                Includes {tempPeriods.filter((p) => !p.breakPeriod).length} playing periods and{" "}
                {tempPeriods.filter((p) => p.breakPeriod).length} break periods.
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 borderIndex-t">
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSaving}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !isChanged || tempPeriods.length === 0 || !!periodEditError}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
