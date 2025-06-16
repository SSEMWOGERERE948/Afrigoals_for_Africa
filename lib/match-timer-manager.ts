// Enhanced Global Match Timer Manager with better isolation
class MatchTimerManager {
  private static instance: MatchTimerManager
  private timers: Map<string, NodeJS.Timeout> = new Map()
  private matchStates: Map<string, any> = new Map()
  private callbacks: Map<string, Set<(state: any) => void>> = new Map() // Support multiple callbacks per match

  private constructor() {
    // Singleton pattern
    console.log("🏗️ MatchTimerManager initialized")
  }

  static getInstance(): MatchTimerManager {
    if (!MatchTimerManager.instance) {
      MatchTimerManager.instance = new MatchTimerManager()
    }
    return MatchTimerManager.instance
  }

  // Start a timer for a specific match
  startTimer(matchId: string, initialState: any, updateCallback?: (state: any) => void) {
    console.log(`🚀 Starting ISOLATED timer for match ${matchId}`)

    // Stop existing timer if any
    this.stopTimer(matchId)

    // Store the state
    this.matchStates.set(matchId, { ...initialState })

    // Register callback if provided
    if (updateCallback) {
      this.registerCallback(matchId, updateCallback)
    }

    // Create the timer with match-specific isolation
    const timer = setInterval(() => {
      const currentState = this.matchStates.get(matchId)
      if (!currentState || !currentState.running) {
        console.log(`⏸️ Timer for match ${matchId} not running, skipping tick`)
        return
      }

      const newMinute = currentState.currentMinute + 1
      const updatedState = { ...currentState, currentMinute: newMinute }

      console.log(`⏰ ISOLATED timer tick for match ${matchId}: ${newMinute} minutes`)

      // Auto-transition periods
      if (newMinute === 45 && currentState.period === "First Half") {
        updatedState.period = "Half Time"
        updatedState.running = false
        console.log(`⏰ Match ${matchId} - Half Time reached`)
      } else if (newMinute === 90 && currentState.period === "Second Half") {
        updatedState.period = "Full Time"
        updatedState.running = false
        console.log(`🏁 Match ${matchId} - Full Time reached`)
      } else if (newMinute === 105 && currentState.period === "Extra Time First") {
        updatedState.period = "Extra Time Break"
        updatedState.running = false
        console.log(`⏰ Match ${matchId} - Extra Time First Half complete`)
      } else if (newMinute === 120 && currentState.period === "Extra Time Second") {
        updatedState.period = "Finished"
        updatedState.running = false
        updatedState.status = "Finished"
        console.log(`🏁 Match ${matchId} - Match Finished`)
      }

      // Update stored state for THIS SPECIFIC MATCH
      this.matchStates.set(matchId, updatedState)

      // Notify ALL callbacks for THIS SPECIFIC MATCH
      const matchCallbacks = this.callbacks.get(matchId)
      if (matchCallbacks && matchCallbacks.size > 0) {
        console.log(`📡 Notifying ${matchCallbacks.size} callbacks for match ${matchId}`)
        matchCallbacks.forEach((callback) => {
          try {
            callback(updatedState)
          } catch (error) {
            console.error(`❌ Error in callback for match ${matchId}:`, error)
          }
        })
      }
    }, 60000) // 1 minute intervals

    this.timers.set(matchId, timer)
    console.log(`✅ ISOLATED timer started for match ${matchId}`)
  }

  // Stop a timer for a specific match
  stopTimer(matchId: string) {
    const timer = this.timers.get(matchId)
    if (timer) {
      clearInterval(timer)
      this.timers.delete(matchId)
      console.log(`⏹️ ISOLATED timer stopped for match ${matchId}`)
    }
  }

  // Update match state (called from components)
  updateMatchState(matchId: string, newState: any) {
    console.log(`📝 Updating ISOLATED state for match ${matchId}:`, newState)
    this.matchStates.set(matchId, { ...newState })

    // Notify callbacks of the state change
    const matchCallbacks = this.callbacks.get(matchId)
    if (matchCallbacks && matchCallbacks.size > 0) {
      matchCallbacks.forEach((callback) => {
        try {
          callback(newState)
        } catch (error) {
          console.error(`❌ Error in callback for match ${matchId}:`, error)
        }
      })
    }
  }

  // Get current match state
  getMatchState(matchId: string) {
    const state = this.matchStates.get(matchId)
    console.log(`📖 Getting state for match ${matchId}:`, state)
    return state
  }

  // Register a callback for state updates (supports multiple callbacks per match)
  registerCallback(matchId: string, callback: (state: any) => void) {
    if (!this.callbacks.has(matchId)) {
      this.callbacks.set(matchId, new Set())
    }

    const matchCallbacks = this.callbacks.get(matchId)!
    matchCallbacks.add(callback)
    console.log(`📞 Callback registered for match ${matchId} (total: ${matchCallbacks.size})`)
  }

  // Unregister callback (when component unmounts)
  unregisterCallback(matchId: string, callback?: (state: any) => void) {
    const matchCallbacks = this.callbacks.get(matchId)
    if (matchCallbacks) {
      if (callback) {
        matchCallbacks.delete(callback)
        console.log(`📞 Specific callback unregistered for match ${matchId} (remaining: ${matchCallbacks.size})`)
      } else {
        // Clear all callbacks for this match
        matchCallbacks.clear()
        console.log(`📞 All callbacks cleared for match ${matchId}`)
      }

      // Clean up empty callback sets
      if (matchCallbacks.size === 0) {
        this.callbacks.delete(matchId)
      }
    }
  }

  // Pause a match timer
  pauseMatch(matchId: string) {
    const state = this.matchStates.get(matchId)
    if (state) {
      const updatedState = { ...state, running: false }
      this.updateMatchState(matchId, updatedState)
      console.log(`⏸️ Match ${matchId} paused globally`)
    }
  }

  // Resume a match timer
  resumeMatch(matchId: string) {
    const state = this.matchStates.get(matchId)
    if (state) {
      const updatedState = { ...state, running: true }
      this.updateMatchState(matchId, updatedState)
      console.log(`▶️ Match ${matchId} resumed globally`)
    }
  }

  // Get all active timers (for debugging)
  getActiveTimers() {
    const activeTimers = Array.from(this.timers.keys())
    console.log(`🔍 Active timers:`, activeTimers)
    return activeTimers
  }

  // Get all match states (for debugging)
  getAllStates() {
    const allStates = Object.fromEntries(this.matchStates)
    console.log(`🔍 All match states:`, allStates)
    return allStates
  }

  // Get detailed status for debugging
  getDebugInfo() {
    return {
      activeTimers: this.getActiveTimers(),
      allStates: this.getAllStates(),
      callbackCounts: Object.fromEntries(
        Array.from(this.callbacks.entries()).map(([matchId, callbacks]) => [matchId, callbacks.size]),
      ),
    }
  }

  // Clean up everything (for app shutdown)
  cleanup() {
    console.log(`🧹 Cleaning up ALL timers and states`)
    this.timers.forEach((timer, matchId) => {
      clearInterval(timer)
      console.log(`⏹️ Stopped timer for match ${matchId}`)
    })
    this.timers.clear()
    this.matchStates.clear()
    this.callbacks.clear()
  }
}

export const matchTimerManager = MatchTimerManager.getInstance()

// Debug helper for development
if (typeof window !== "undefined") {
  ;(window as any).matchTimerManager = matchTimerManager
}
