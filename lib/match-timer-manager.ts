"use client"

import type { MatchState } from "@/app/types" // Import MatchState type

class MatchTimerManager {
  private static instance: MatchTimerManager
  private timers: Map<string, NodeJS.Timeout> = new Map()
  private matchStates: Map<string, MatchState> = new Map() // Use MatchState type
  private callbacks: Map<string, Set<(state: MatchState) => void>> = new Map() // Support multiple callbacks per match

  private constructor() {
    // Singleton pattern
    console.log("🏗️ MatchTimerManager: Initialized")
  }

  static getInstance(): MatchTimerManager {
    if (!MatchTimerManager.instance) {
      MatchTimerManager.instance = new MatchTimerManager()
    }
    return MatchTimerManager.instance
  }

  // Internal tick function to update state based on real time
  private tick = (matchId: string) => {
    const state = this.matchStates.get(matchId)
    if (!state || !state.running || !state.startTime || isNaN(state.startTime.getTime())) {
      if (!state) console.warn(`MatchTimerManager: Tick for ${matchId}: No state found.`)
      else if (!state.running) console.warn(`MatchTimerManager: Tick for ${matchId}: Not running.`)
      else if (!state.startTime) console.warn(`MatchTimerManager: Tick for ${matchId}: No startTime.`)
      else if (isNaN(state.startTime.getTime()))
        console.warn(`MatchTimerManager: Tick for ${matchId}: Invalid startTime.`, state.startTime)
      return
    }

    const now = Date.now()
    const elapsedSinceStart = now - state.startTime.getTime()
    const totalSecondsElapsed = Math.floor(elapsedSinceStart / 1000)

    const updatedState: MatchState = {
      ...state,
      currentMinute: totalSecondsElapsed, // Store total elapsed seconds
    }

    // Auto-transition periods based on total elapsed seconds
    const firstHalfEndSeconds = 45 * 60 + state.addedTime.firstHalf * 60
    const secondHalfEndSeconds = 90 * 60 + state.addedTime.secondHalf * 60
    const extraTimeFirstEndSeconds = 105 * 60 + state.addedTime.extraTimeFirst * 60
    const extraTimeSecondEndSeconds = 120 * 60 + state.addedTime.extraTimeSecond * 60

    if (state.period === "First Half" && totalSecondsElapsed >= firstHalfEndSeconds) {
      updatedState.period = "Half Time"
      updatedState.running = false
      updatedState.halfTimeStart = new Date()
      this.stopTimer(matchId) // Stop the timer when period ends
      console.log(`⏰ MatchTimerManager: Match ${matchId} - Half Time reached`)
    } else if (state.period === "Second Half" && totalSecondsElapsed >= secondHalfEndSeconds) {
      updatedState.period = "Full Time"
      updatedState.running = false
      this.stopTimer(matchId)
      console.log(`🏁 MatchTimerManager: Match ${matchId} - Full Time reached`)
    } else if (state.period === "Extra Time First" && totalSecondsElapsed >= extraTimeFirstEndSeconds) {
      updatedState.period = "Extra Time Break"
      updatedState.running = false
      this.stopTimer(matchId)
      console.log(`⏰ MatchTimerManager: Match ${matchId} - Extra Time First Half complete`)
    } else if (state.period === "Extra Time Second" && totalSecondsElapsed >= extraTimeSecondEndSeconds) {
      updatedState.period = "Finished"
      updatedState.running = false
      updatedState.status = "Finished"
      this.stopTimer(matchId)
      console.log(`🏁 MatchTimerManager: Match ${matchId} - Match Finished`)
    }

    // Update stored state for THIS SPECIFIC MATCH
    this.matchStates.set(matchId, updatedState)
    console.log(
      `MatchTimerManager: Ticking for ${matchId}. Current totalSeconds: ${updatedState.currentMinute}, running: ${updatedState.running}`,
    )

    // Notify ALL callbacks for THIS SPECIFIC MATCH
    const matchCallbacks = this.callbacks.get(matchId)
    if (matchCallbacks && matchCallbacks.size > 0) {
      matchCallbacks.forEach((callback) => {
        try {
          callback(updatedState)
        } catch (error) {
          console.error(`❌ MatchTimerManager: Error in callback for match ${matchId}:`, error)
        }
      })
    }
  }

  // Start a timer for a specific match
  startTimer(matchId: string, initialState: MatchState, updateCallback?: (state: MatchState) => void) {
    console.log(`🚀 MatchTimerManager: Starting ISOLATED timer for match ${matchId} with initial state:`, initialState)
    this.stopTimer(matchId) // Stop existing timer if any

    let effectiveStartTime: Date
    let effectiveCurrentMinute: number

    if (initialState.running) {
      // If the match is running, the backend's startTime is the authoritative source for when the clock started.
      // We use this startTime to calculate the current elapsed time.
      if (initialState.startTime && !isNaN(initialState.startTime.getTime())) {
        effectiveStartTime = initialState.startTime
        // Calculate currentMinute based on the backend's startTime and current time
        effectiveCurrentMinute = Math.floor((Date.now() - effectiveStartTime.getTime()) / 1000)
        console.log(
          `MatchTimerManager: Calculated effectiveCurrentMinute for running match: ${effectiveCurrentMinute} based on backend startTime: ${effectiveStartTime.toISOString()}`,
        )
      } else {
        // If startTime is missing or invalid for a running match, reconstruct it
        // based on the currentMinute (total elapsed seconds) from the backend.
        // This assumes currentMinute is the authoritative elapsed time.
        effectiveStartTime = new Date(Date.now() - (initialState.currentMinute || 0) * 1000)
        effectiveCurrentMinute = initialState.currentMinute || 0
        console.warn(
          `MatchTimerManager: Match ${matchId}: Running match has no valid startTime from backend. Reconstructing startTime based on currentMinute (${effectiveCurrentMinute}s).`,
        )
      }
    } else {
      // This branch should ideally not be hit if LiveMatchControl correctly calls updateMatchState for paused matches.
      effectiveStartTime = initialState.startTime || new Date()
      effectiveCurrentMinute = initialState.currentMinute || 0
      console.warn(
        `MatchTimerManager: startTimer called for non-running match. Using provided startTime or new Date().`,
      )
    }

    const stateToStore: MatchState = {
      ...initialState,
      running: true, // Always set to true when starting the timer
      startTime: effectiveStartTime,
      currentMinute: effectiveCurrentMinute,
    }
    this.matchStates.set(matchId, stateToStore)

    if (updateCallback) {
      this.registerCallback(matchId, updateCallback)
    }

    const timer = setInterval(() => this.tick(matchId), 1000)
    this.timers.set(matchId, timer)
    this.tick(matchId) // Initial tick immediately
    console.log(`✅ MatchTimerManager: ISOLATED timer started for match ${matchId}`)
  }

  // Stop a timer for a specific match
  stopTimer(matchId: string) {
    const timer = this.timers.get(matchId)
    if (timer) {
      clearInterval(timer)
      this.timers.delete(matchId)
      console.log(`⏹️ MatchTimerManager: ISOLATED timer stopped for match ${matchId}`)
    }
  }

  // Update match state (called from components)
  updateMatchState(matchId: string, newState: MatchState) {
    console.log(`📝 MatchTimerManager: Updating ISOLATED state for match ${matchId}:`, newState)
    this.matchStates.set(matchId, { ...newState })
    // Notify callbacks of the state change
    const matchCallbacks = this.callbacks.get(matchId)
    if (matchCallbacks && matchCallbacks.size > 0) {
      matchCallbacks.forEach((callback) => {
        try {
          callback(newState)
        } catch (error) {
          console.error(`❌ MatchTimerManager: Error in callback for match ${matchId}:`, error)
        }
      })
    }
  }

  // Get current match state
  getMatchState(matchId: string): MatchState | undefined {
    const state = this.matchStates.get(matchId)
    console.log(`📖 MatchTimerManager: Getting state for match ${matchId}:`, state)
    return state
  }

  // Register a callback for state updates (supports multiple callbacks per match)
  registerCallback(matchId: string, callback: (state: MatchState) => void) {
    if (!this.callbacks.has(matchId)) {
      this.callbacks.set(matchId, new Set())
    }
    const matchCallbacks = this.callbacks.get(matchId)!
    matchCallbacks.add(callback)
    console.log(`📞 MatchTimerManager: Callback registered for match ${matchId} (total: ${matchCallbacks.size})`)
    // Immediately send current state if available
    const currentState = this.matchStates.get(matchId)
    if (currentState) {
      console.log(`MatchTimerManager: Immediately sending current state to new callback for ${matchId}:`, currentState)
      callback(currentState)
    }
  }

  // Unregister callback (when component unmounts)
  unregisterCallback(matchId: string, callback?: (state: MatchState) => void) {
    const matchCallbacks = this.callbacks.get(matchId)
    if (matchCallbacks) {
      if (callback) {
        matchCallbacks.delete(callback)
        console.log(
          `📞 MatchTimerManager: Specific callback unregistered for match ${matchId} (remaining: ${matchCallbacks.size})`,
        )
      } else {
        // Clear all callbacks for this match
        matchCallbacks.clear()
        console.log(`📞 MatchTimerManager: All callbacks cleared for match ${matchId}`)
      }
      // Clean up empty callback sets
      if (matchCallbacks.size === 0) {
        this.callbacks.delete(matchId)
      }
    }
  }

  // Get all active timers (for debugging)
  getActiveTimers() {
    const activeTimers = Array.from(this.timers.keys())
    console.log(`🔍 MatchTimerManager: Active timers:`, activeTimers)
    return activeTimers
  }

  // Get all match states (for debugging)
  getAllStates() {
    const allStates = Object.fromEntries(this.matchStates)
    console.log(`🔍 MatchTimerManager: All match states:`, allStates)
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
    console.log(`🧹 MatchTimerManager: Cleaning up ALL timers and states`)
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
