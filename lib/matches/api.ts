import axios from "axios"

import type { FutsalGoal, FutsalMatch, FutsalMatchEvent, Goal, MatchEvent, MatchPeriod } from "@/app/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://afrigoals-backend.onrender.com/api/futsalmatches"

// Configure axios defaults
axios.defaults.timeout = 10000 // 10 second timeout
axios.defaults.headers.common["Content-Type"] = "application/json"

// Add request interceptor for logging
axios.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`)
    return config
  },
  (error) => {
    console.error("Request error:", error)
    return Promise.reject(error)
  },
)

// Add response interceptor for logging
axios.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, response.status)
    return response
  },
  (error) => {
    console.error("Response error:", error.response?.status, error.response?.data)
    return Promise.reject(error)
  },
)

// Error handling wrapper
const handleApiError = (error: any, operation: string) => {
  console.error(`Error ${operation}:`, error)
  if (error.response) {
    // Server responded with error status
    throw new Error(`${operation} failed: ${error.response.data?.message || error.response.statusText}`)
  } else if (error.request) {
    // Request was made but no response received
    throw new Error(`${operation} failed: No response from server`)
  } else {
    // Something else happened
    throw new Error(`${operation} failed: ${error.message}`)
  }
}

// Interfaces for API requests
export interface AddGoalRequest {
  matchId?: string
  playerId: string
  playerName: string
  team: "home" | "away"
  minute: number
  type: "goal" | "penalty" | "own_goal"
  assistPlayerId?: string
  assistPlayerName?: string
}

export interface AddEventRequest {
  matchId: string
  type: string
  minute: number
  team?: "home" | "away"
  playerId?: string
  playerName?: string
  description: string
  additionalInfo?: {
    playerInId?: string
    playerInName?: string
    playerOutId?: string
    playerOutName?: string
    timeoutDuration?: number
    timeoutReason?: string
  }
}

export interface AddFutsalEventRequest {
  matchId: string
  type: string
  minute: number
  team?: "home" | "away"
  playerId?: string
  playerName?: string
  playerNumber?: number
  description: string
  additionalInfo?: {
    playerInId?: string
    playerInName?: string
    playerInNumber?: number
    playerOutId?: string
    playerOutName?: string
    playerOutNumber?: number
    assistPlayerId?: string
    assistPlayerName?: string
    assistPlayerNumber?: number
    goalType?: string
    foulType?: string
    cardReason?: string
    timeoutDuration?: number
    timeoutReason?: string
    injuryType?: string
    treatmentTime?: number
    position?: { x: number; y: number }
    notes?: string
  }
}

export interface UpdateMatchScoreRequest {
  homeScore: number
  awayScore: number
}

// Get all futsal matches
export async function fetchFutsalMatches(): Promise<FutsalMatch[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/`)
    return response.data
  } catch (error) {
    handleApiError(error, "fetching futsal matches")
    throw error
  }
}

// Get a specific futsal match
export async function fetchFutsalMatch(id: string): Promise<FutsalMatch> {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`)
    return response.data
  } catch (error) {
    handleApiError(error, "fetching futsal match")
    throw error
  }
}

// Create a futsal match
export async function createFutsalMatch(match: Omit<FutsalMatch, "id">): Promise<FutsalMatch> {
  try {
    const response = await axios.post(`${API_BASE_URL}/create`, match)
    return response.data
  } catch (error) {
    handleApiError(error, "creating futsal match")
    throw error
  }
}

// Update a futsal match
export async function updateFutsalMatch(id: string, match: Partial<FutsalMatch>): Promise<FutsalMatch> {
  try {
    const response = await axios.put(`${API_BASE_URL}/${id}`, match)
    return response.data
  } catch (error) {
    handleApiError(error, "updating futsal match")
    throw error
  }
}

export async function updateFutsalMatchPeriods(id: string, periods: MatchPeriod[]): Promise<FutsalMatch> {
  try {
    const response = await axios.put(`${API_BASE_URL}/${id}/periods`, periods)
    return response.data
  } catch (error) {
    handleApiError(error, "updating futsal match periods")
    throw error
  }
}

// Delete a futsal match
export async function deleteFutsalMatch(id: string): Promise<void> {
  try {
    await axios.delete(`${API_BASE_URL}/${id}`)
  } catch (error) {
    handleApiError(error, "deleting futsal match")
    throw error
  }
}

// Add a goal to a match
export async function addGoalToMatch(goalData: AddGoalRequest): Promise<FutsalGoal> {
  try {
    console.log("Adding goal to match:", goalData)
    // Remove matchId from the request body since it's in the URL path
    const { matchId, ...goalRequestBody } = goalData

    const response = await axios.post(`${API_BASE_URL}/${matchId}/goals`, goalRequestBody)
    console.log("Goal added successfully:", response.data)
    return response.data
  } catch (error) {
    handleApiError(error, "adding goal to match")
    throw error
  }
}

// Add an event to a match
export async function addEventToMatch(eventData: AddEventRequest): Promise<MatchEvent> {
  try {
    console.log("Adding event to match:", eventData)
    const { matchId, additionalInfo = {}, ...rest } = eventData
    const payload = { ...rest, ...additionalInfo }
    const response = await axios.post(`${API_BASE_URL}/${matchId}/events`, payload)
    console.log("Event added successfully:", response.data)
    return response.data
  } catch (error) {
    handleApiError(error, "adding event to match")
    throw error
  }
}

// Add a futsal event to a match
export async function addFutsalEventToMatch(eventData: AddFutsalEventRequest): Promise<MatchEvent> {
  try {
    console.log("Adding futsal event to match:", eventData)
    // Remove matchId from the request body since it's in the URL path
    const { matchId, ...eventRequestBody } = eventData

    const response = await axios.post(`${API_BASE_URL}/${matchId}/futsal-events`, eventRequestBody)
    console.log("Futsal event added successfully:", response.data)
    return response.data
  } catch (error) {
    handleApiError(error, "adding futsal event to match")
    throw error
  }
}

// Update match score
export async function updateMatchScore(matchId: string, homeScore: number, awayScore: number): Promise<FutsalMatch> {
  try {
    console.log("Updating match score:", matchId, { homeScore, awayScore })
    const response = await axios.put(`${API_BASE_URL}/${matchId}/score`, { homeScore, awayScore })
    console.log("Match score updated successfully:", response.data)
    return response.data
  } catch (error) {
    handleApiError(error, "updating match score")
    throw error
  }
}

// Get match details with goals and events
export async function getFutsalMatchDetails(matchId: string): Promise<FutsalMatch> {
  try {
    console.log("Fetching match details for:", matchId)
    const response = await axios.get(`${API_BASE_URL}/${matchId}/details`)
    console.log("Match details fetched successfully:", response.data)
    return response.data
  } catch (error) {
    handleApiError(error, "fetching match details")
    throw error
  }
}

// Get all goals for a match
export async function getMatchGoals(matchId: string): Promise<Goal[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/${matchId}/goals`)
    return response.data
  } catch (error) {
    handleApiError(error, "fetching match goals")
    throw error
  }
}

// Get all events for a match
export async function getMatchEvents(matchId: string): Promise<FutsalMatchEvent[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/${matchId}/events`)
    return response.data
  } catch (error) {
    handleApiError(error, "fetching match events")
    throw error
  }
}

// Update match status
export async function updateMatchStatus(matchId: string, status: FutsalMatch["status"]): Promise<FutsalMatch> {
  try {
    console.log("Updating match status:", matchId, status)
    const response = await axios.put(`${API_BASE_URL}/${matchId}/status`, { status })
    console.log("Match status updated successfully:", response.data)
    return response.data
  } catch (error) {
    handleApiError(error, "updating match status")
    throw error
  }
}

// Start a match (update status to Live and set start time)
export async function startFutsalMatch(
  matchId: string,
  data?: {
    status?: string // Made optional as it might be inferred or set by backend
    startTime?: Date
    currentMinute?: number // Made optional as periodState handles time
    periods?: MatchPeriod[]
    periodState?: FutsalMatch["periodState"] // Initial period state
  },
): Promise<FutsalMatch> {
  try {
    console.log("Starting match:", matchId, data)
    const response = await axios.post(`${API_BASE_URL}/${matchId}/start`, data)
    console.log("Match started successfully:", response.data)
    return response.data
  } catch (error) {
    handleApiError(error, "starting match")
    throw error
  }
}

// End a match (update status to Finished)
export async function endFutsalMatch(matchId: string): Promise<FutsalMatch> {
  try {
    console.log("Ending match:", matchId)
    const response = await axios.post(`${API_BASE_URL}/${matchId}/end`)
    console.log("Match ended successfully:", response.data)
    return response.data
  } catch (error) {
    handleApiError(error, "ending match")
    throw error
  }
}

// Reset a match (clear goals, events, reset scores)
export async function resetFutsalMatch(
  matchId: string,
  data?: {
    status?: string
    homeScore?: number
    awayScore?: number
    currentMinute?: number
    periodState?: FutsalMatch["periodState"] // Now accepts periodState to clear it
  },
): Promise<FutsalMatch> {
  try {
    console.log("Resetting match:", matchId, data)
    const response = await axios.post(`${API_BASE_URL}/${matchId}/reset`, data)
    console.log("Match reset successfully:", response.data)
    return response.data
  } catch (error) {
    handleApiError(error, "resetting match")
    throw error
  }
}

// Update current minute of a match
export async function updateMatchCurrentMinute(matchId: string, currentMinute: number): Promise<FutsalMatch> {
  try {
    console.log("Updating match current minute:", matchId, currentMinute)
    const response = await axios.put(`${API_BASE_URL}/${matchId}/current-minute`, { currentMinute })
    console.log("Match current minute updated successfully:", response.data)
    return response.data
  } catch (error) {
    handleApiError(error, "updating match current minute")
    throw error
  }
}
