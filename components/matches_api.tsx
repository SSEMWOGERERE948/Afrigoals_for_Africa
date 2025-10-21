"use client"
import axios from "axios"
import type { Match, MatchUpdateRequest, MatchStateUpdatePayload, Goal, MatchEvent } from "@/app/types"

const API_BASE_URL = "https://afrigoals-backend.onrender.com/api/matches"

// Create a new match
export async function createMatch(match: Omit<Match, "id">): Promise<Match> {
  const response = await axios.post<Match>(`${API_BASE_URL}`, match)
  return response.data
}

// Get all scheduled matches
export async function fetchMatches(): Promise<Match[]> {
  const response = await axios.get<Match[]>(`${API_BASE_URL}`)
  return response.data
}

// Get a match by ID
export async function fetchMatch(id: string): Promise<Match> {
  const response = await axios.get<Match>(`${API_BASE_URL}/${id}`)
  return response.data
}

// Update a match - now uses MatchUpdateRequest for proper typing
export async function updateMatch(id: string, match: MatchUpdateRequest): Promise<Match> {
  const response = await axios.put<Match>(`${API_BASE_URL}/${id}`, match)
  return response.data
}

// Delete a match
export async function deleteMatch(id: string): Promise<void> {
  await axios.delete(`${API_BASE_URL}/${id}`)
}

// Get a match with full lineup details
export async function fetchMatchWithLineups(id: string): Promise<any> {
  console.log("🌐 API Call: Fetching match with lineups for ID:", id)
  console.log("🔗 API URL:", `${API_BASE_URL}/lineups/${id}`)
  try {
    const response = await axios.get<any>(`${API_BASE_URL}/lineups/${id}`)
    console.log("✅ API Response received:", response.status, response.data)
    return response.data
  } catch (error) {
    console.error("❌ API Error in fetchMatchWithLineups:", error)
    if (axios.isAxiosError(error)) {
      console.error("📡 Request details:", {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      })
    }
    throw error
  }
}

export async function updateLineups(matchId: string, data: MatchUpdateRequest): Promise<Match> {
  const response = await axios.put<Match>(`${API_BASE_URL}/${matchId}/update-lineups`, data)
  return response.data
}

// ===== LIVE MATCH CONTROL APIs =====
// Update match state (live controls) - now accepts the flattened payload
export async function updateMatchState(id: string, payload: MatchStateUpdatePayload): Promise<Match> {
  try {
    console.log(`🔄 Updating match ${id} state with flat payload:`, payload)
    const response = await axios.put<Match>(`${API_BASE_URL}/${id}/state`, payload)
    console.log(`✅ Match state updated successfully:`, response.data)
    return response.data
  } catch (error) {
    console.error(`❌ Failed to update match ${id} state:`, error)
    if (axios.isAxiosError(error)) {
      console.error("📡 Request details:", {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      })
    }
    throw error
  
}

// Get match state
export async function fetchMatchState(id: string): Promise<any> {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}/state`)
    return response.data
  } catch (error) {
    console.error(`❌ Failed to fetch match ${id} state:`, error)
    throw error
  }
}

// ===== GOALS APIs =====
// Add goal to match
export async function addGoal(matchId: string, goal: Omit<Goal, "id">): Promise<Match> {
  try {
    console.log(`⚽ Adding goal to match ${matchId}:`, goal);
    const response = await axios.post<Match>(`${API_BASE_URL}/${matchId}/goals`, goal);
    return response.data;
  } catch (error) {
    console.error("❌ Failed to add goal:", error);
    throw error;
  }
}


// Get match goals
export async function fetchMatchGoals(matchId: string): Promise<Goal[]> {
  try {
    const response = await axios.get<Goal[]>(`${API_BASE_URL}/${matchId}/goals`)
    return response.data
  } catch (error) {
    console.error(`❌ Failed to fetch goals for match ${matchId}:`, error)
    throw error
  }
}

// Delete a goal
export async function deleteGoal(matchId: string, goalId: string): Promise<Match> {
  try {
    console.log(`🗑️ Deleting goal ${goalId} from match ${matchId}`)
    const response = await axios.delete<Match>(`${API_BASE_URL}/${matchId}/goals/${goalId}`)
    console.log(`✅ Goal deleted successfully:`, response.data)
    return response.data
  } catch (error) {
    console.error(`❌ Failed to delete goal ${goalId} from match ${matchId}:`, error)
    throw error
  }
}

// ===== EVENTS APIs =====
// Add match event
export async function addMatchEvent(matchId: string, event: Omit<MatchEvent, "id">): Promise<MatchEvent> {
  try {
    console.log(`📝 Adding event to match ${matchId}:`, event)
    const response = await axios.post<MatchEvent>(`${API_BASE_URL}/${matchId}/events`, event)
    console.log(`✅ Event added successfully:`, response.data)
    return response.data
  } catch (error) {
    console.error(`❌ Failed to add event to match ${matchId}:`, error)
    if (axios.isAxiosError(error)) {
      console.error("📡 Request details:", {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      })
    }
    throw error
  }
}

// Get match events
export async function fetchMatchEvents(matchId: string): Promise<MatchEvent[]> {
  try {
    const response = await axios.get<MatchEvent[]>(`${API_BASE_URL}/${matchId}/events`)
    return response.data
  } catch (error) {
    console.error(`❌ Failed to fetch events for match ${matchId}:`, error)
    throw error
  }
}

// Delete a match event
export async function deleteMatchEvent(matchId: string, eventId: string): Promise<void> {
  try {
    console.log(`🗑️ Deleting event ${eventId} from match ${matchId}`)
    await axios.delete(`${API_BASE_URL}/${matchId}/events/${eventId}`)
    console.log(`✅ Event deleted successfully`)
  } catch (error) {
    console.error(`❌ Failed to delete event ${eventId} from match ${matchId}:`, error)
    throw error
  }
}

// ===== COMPLETE GOALS CRUD =====
// Update a goal
export async function updateGoal(matchId: string, goalId: string, goalData: Partial<Goal>): Promise<Match> {
  try {
    console.log(`🔄 Updating goal ${goalId} in match ${matchId}:`, goalData)
    const response = await axios.put<Match>(`${API_BASE_URL}/${matchId}/goals/${goalId}`, goalData)
    console.log(`✅ Goal updated successfully:`, response.data)
    return response.data
  } catch (error) {
    console.error(`❌ Failed to update goal ${goalId} in match ${matchId}:`, error)
    throw error
  }
}

// Get a specific goal
export async function fetchGoal(matchId: string, goalId: string): Promise<Goal> {
  try {
    const response = await axios.get<Goal>(`${API_BASE_URL}/${matchId}/goals/${goalId}`)
    return response.data
  } catch (error) {
    console.error(`❌ Failed to fetch goal ${goalId} from match ${matchId}:`, error)
    throw error
  }
}

// ===== COMPLETE EVENTS CRUD =====
// Update a match event
export async function updateMatchEvent(
  matchId: string,
  eventId: string,
  eventData: Partial<MatchEvent>,
): Promise<MatchEvent> {
  try {
    console.log(`🔄 Updating event ${eventId} in match ${matchId}:`, eventData)
    const response = await axios.put<MatchEvent>(`${API_BASE_URL}/${matchId}/events/${eventId}`, eventData)
    console.log(`✅ Event updated successfully:`, response.data)
    return response.data
  } catch (error) {
    console.error(`❌ Failed to update event ${eventId} in match ${matchId}:`, error)
    throw error
  }
}

// Get a specific event
export async function fetchMatchEvent(matchId: string, eventId: string): Promise<MatchEvent> {
  try {
    const response = await axios.get<MatchEvent>(`${API_BASE_URL}/${matchId}/events/${eventId}`)
    return response.data
  } catch (error) {
    console.error(`❌ Failed to fetch event ${eventId} from match ${matchId}:`, error)
    throw error
  }
}

// Get events by type
export async function fetchEventsByType(matchId: string, eventType: string): Promise<MatchEvent[]> {
  try {
    const response = await axios.get<MatchEvent[]>(`${API_BASE_URL}/${matchId}/events?type=${eventType}`)
    return response.data
  } catch (error) {
    console.error(`❌ Failed to fetch ${eventType} events for match ${matchId}:`, error)
    throw error
  }
}

// ===== COMPLETE STATE CRUD =====
// Create match state
export async function createMatchState(id: string, stateData: MatchStateUpdatePayload): Promise<Match> {
  try {
    console.log(`🆕 Creating state for match ${id}:`, stateData)
    const response = await axios.post<Match>(`${API_BASE_URL}/${id}/state`, stateData)
    console.log(`✅ Match state created successfully:`, response.data)
    return response.data
  } catch (error) {
    console.error(`❌ Failed to create state for match ${id}:`, error)
    throw error
  }
}

// Reset match state (if backend has a specific reset endpoint)
export async function resetMatchState(id: string): Promise<Match> {
  try {
    console.log(`🔄 Resetting state for match ${id}`)
    // Assuming DELETE /api/matches/{id}/state resets the state on the backend
    const response = await axios.delete<Match>(`${API_BASE_URL}/${id}/state`)
    console.log(`✅ Match state reset successfully:`, response.data)
    return response.data
  } catch (error) {
    console.error(`❌ Failed to reset state for match ${id}:`, error)
    throw error
  }
}

// ===== LINEUPS CRUD =====
// Update lineups
export async function updateMatchLineups(matchId: string, lineupsData: any): Promise<any> {
  try {
    console.log(`🔄 Updating lineups for match ${matchId}:`, lineupsData)
    const response = await axios.put(`${API_BASE_URL}/${matchId}/lineups`, lineupsData)
    console.log(`✅ Lineups updated successfully:`, response.data)
    return response.data
  } catch (error) {
    console.error(`❌ Failed to update lineups for match ${matchId}:`, error)
    throw error
  }
}

// Get lineups
export async function fetchMatchLineups(matchId: string): Promise<any> {
  try {
    const response = await axios.get(`${API_BASE_URL}/${matchId}/lineups`)
    return response.data
  } catch (error) {
    console.error(`❌ Failed to fetch lineups for match ${matchId}:`, error)
    throw error
  }
}

// ===== STATISTICS CRUD =====
// Get match statistics
export async function fetchMatchStats(matchId: string): Promise<any> {
  try {
    const response = await axios.get(`${API_BASE_URL}/${matchId}/stats`)
    return response.data
  } catch (error) {
    console.error(`❌ Failed to fetch stats for match ${matchId}:`, error)
    throw error
  }
}

// Update match statistics
export async function updateMatchStats(matchId: string, statsData: any): Promise<any> {
  try {
    console.log(`📊 Updating stats for match ${matchId}:`, statsData)
    const response = await axios.put(`${API_BASE_URL}/${matchId}/stats`, statsData)
    console.log(`✅ Stats updated successfully:`, response.data)
    return response.data
  } catch (error) {
    console.error(`❌ Failed to update stats for match ${matchId}:`, error)
    throw error
  }
}

// Increment specific stat
export async function incrementMatchStat(
  matchId: string,
  statType: string,
  team: "home" | "away",
  value = 1,
): Promise<any> {
  try {
    console.log(`📈 Incrementing ${statType} for ${team} team in match ${matchId} by ${value}`)
    const response = await axios.post(`${API_BASE_URL}/${matchId}/stats`, {
      statType,
      team,
      value,
    })
    console.log(`✅ Stat incremented successfully:`, response.data)
    return response.data
  } catch (error) {
    console.error(`❌ Failed to increment ${statType} for match ${matchId}:`, error)
    throw error
  }
}

// ===== UTILITY FUNCTIONS =====
// Check if API is available
export async function checkApiHealth(): Promise<boolean> {
  try {
    await axios.get(`${API_BASE_URL}`)
    return true
  } catch (error) {
    console.error("❌ API health check failed:", error)
    return false
  }
}

// Get complete live match data
export async function fetchLiveMatchData(matchId: string): Promise<{
  match: Match
  goals: Goal[]
  events: MatchEvent[]
  liveState: any // Enhanced live state with precise timing
  stats: any
}> {
  try {
    console.log(`📡 Fetching complete live data for match ${matchId}`)
    const [match, goals, events, liveState, stats] = await Promise.all([
      fetchMatch(matchId),
      fetchMatchGoals(matchId),
      fetchMatchEvents(matchId),
      fetchLiveState(matchId), // Use new live state endpoint
      fetchMatchStats(matchId),
    ])
    console.log(`✅ Live data fetched successfully for match ${matchId}`)
    return { match, goals, events, liveState, stats }
  } catch (error) {
    console.error(`❌ Failed to fetch live data for match ${matchId}:`, error)
    throw error
  }
}

// Bulk update match data
export async function bulkUpdateMatch(
  matchId: string,
  updates: {
    matchData?: Partial<Match>
    stateData?: MatchStateUpdatePayload // Changed to MatchStateUpdatePayload
    newGoals?: Omit<Goal, "id">[] // Changed to Omit<Goal, "id">
    newEvents?: Omit<MatchEvent, "id">[] // Changed to Omit<MatchEvent, "id">
    statsData?: any
  },
): Promise<Match> {
  try {
    console.log(`🔄 Bulk updating match ${matchId}:`, updates)
    let updatedMatch = await fetchMatch(matchId)
    // Update match data if provided
    if (updates.matchData) {
      updatedMatch = await updateMatch(matchId, updates.matchData as MatchUpdateRequest)
    }
    // Update state if provided
    if (updates.stateData) {
      updatedMatch = await updateMatchState(matchId, updates.stateData) // Pass flat payload
    }
    // Add new goals if provided
    if (updates.newGoals && updates.newGoals.length > 0) {
      for (const goal of updates.newGoals) {
        updatedMatch = await addGoal(matchId, goal)
      }
    }
    // Add new events if provided
    if (updates.newEvents && updates.newEvents.length > 0) {
      for (const event of updates.newEvents) {
        await addMatchEvent(matchId, event)
      }
    }
    // Update stats if provided
    if (updates.statsData) {
      await updateMatchStats(matchId, updates.statsData)
    }
    console.log(`✅ Bulk update completed for match ${matchId}`)
    return updatedMatch
  } catch (error) {
    console.error(`❌ Bulk update failed for match ${matchId}:`, error)
    throw error
  }
}

// Get recent match activity (last 10 events)
export async function fetchRecentActivity(matchId: string): Promise<MatchEvent[]> {
  try {
    const response = await axios.get<MatchEvent[]>(`${API_BASE_URL}/${matchId}/events?limit=10&sort=desc`)
    return response.data
  } catch (error) {
    console.error(`❌ Failed to fetch recent activity for match ${matchId}:`, error)
    throw error
  }
}

// Search events by description
export async function searchEvents(matchId: string, query: string): Promise<MatchEvent[]> {
  try {
    const response = await axios.get<MatchEvent[]>(
      `${API_BASE_URL}/${matchId}/events?search=${encodeURIComponent(query)}`,
    )
    return response.data
  } catch (error) {
    console.error(`❌ Failed to search events for match ${matchId}:`, error)
    throw error
  }
}

export async function updateMatchTimer(matchId: string): Promise<Match> {
  try {
    console.log(`⏱️ Updating timer for match ${matchId} (deprecated)`)
    const response = await axios.put<Match>(`${API_BASE_URL}/${matchId}/timer`)
    console.log(`✅ Timer updated successfully:`, response.data)
    return response.data
  } catch (error) {
    console.error(`❌ Failed to update timer for match ${matchId}:`, error)
    if (axios.isAxiosError(error)) {
      console.error("📡 Request details:", {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      })
    }
    throw error
  }
}


// Get real-time match state with computed time
export async function fetchLiveState(matchId: string): Promise<Match> {
  try {
    console.log(`🔴 Fetching live state for match ${matchId}`)
    const response = await axios.get<Match>(`${API_BASE_URL}/${matchId}/live-state`)
    console.log(`✅ Live state fetched successfully:`, response.data)
    return response.data
  } catch (error) {
    console.error(`❌ Failed to fetch live state for match ${matchId}:`, error)
    if (axios.isAxiosError(error)) {
      console.error("📡 Request details:", {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      })
    }
    throw error
  }
}

  
// Adjust match time manually (for corrections)
  export async function adjustMatchTime(matchId: string, seconds: number): Promise<Match> {
  try {
    console.log(`⏱️ Adjusting match ${matchId} time by ${seconds} seconds`)
    const response = await axios.post<Match>(`${API_BASE_URL}/${matchId}/adjust-time?seconds=${seconds}`)
    console.log(`✅ Time adjusted successfully:`, response.data)
    return response.data
  } catch (error) {
    console.error(`❌ Failed to adjust time for match ${matchId}:`, error)
    throw error
  }
}