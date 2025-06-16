"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { matchTimerManager } from "@/lib/match-timer-manager"

interface DebugInfo {
  activeTimers?: string[]
  allStates?: Record<
    string,
    {
      currentMinute: number
      period: string
      running: boolean
    }
  >
  callbackCounts?: Record<string, number>
}

export default function MatchTimerDebug() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({})
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setDebugInfo(matchTimerManager.getDebugInfo())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="bg-blue-50 border-blue-200 text-blue-700"
        >
          🐛 Debug Timers
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-blue-800">Timer Debug Panel</h3>
          <Button onClick={() => setIsVisible(false)} variant="ghost" size="sm" className="h-6 w-6 p-0">
            ✕
          </Button>
        </div>

        <div className="space-y-3 text-sm">
          <div>
            <div className="font-medium text-blue-700 mb-1">Active Timers:</div>
            {debugInfo.activeTimers && debugInfo.activeTimers.length > 0 ? (
              <div className="space-y-1">
                {debugInfo.activeTimers.map((matchId: string) => (
                  <Badge key={matchId} variant="secondary" className="mr-1">
                    Match {matchId}
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="text-gray-500">No active timers</div>
            )}
          </div>

          <div>
            <div className="font-medium text-blue-700 mb-1">Match States:</div>
            {debugInfo.allStates && Object.keys(debugInfo.allStates).length > 0 ? (
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {Object.entries(debugInfo.allStates).map(([matchId, state]) => (
                  <div key={matchId} className="text-xs bg-white p-2 rounded border">
                    <div className="font-medium">Match {matchId}:</div>
                    <div>Time: {state.currentMinute}'</div>
                    <div>Period: {state.period}</div>
                    <div>Running: {state.running ? "✅" : "❌"}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500">No match states</div>
            )}
          </div>

          <div>
            <div className="font-medium text-blue-700 mb-1">Callbacks:</div>
            {debugInfo.callbackCounts && Object.keys(debugInfo.callbackCounts).length > 0 ? (
              <div className="space-y-1">
                {Object.entries(debugInfo.callbackCounts).map(([matchId, count]) => (
                  <div key={matchId} className="text-xs">
                    Match {matchId}: {String(count)} callbacks
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500">No callbacks registered</div>
            )}
          </div>

          <Button
            onClick={() => {
              console.log("🐛 Full Debug Info:", debugInfo)
              alert("Debug info logged to console")
            }}
            variant="outline"
            size="sm"
            className="w-full"
          >
            Log to Console
          </Button>
        </div>
      </Card>
    </div>
  )
}
