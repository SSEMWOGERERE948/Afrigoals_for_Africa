"use client"

import axios from "axios"
import type { Match, MatchUpdateRequest } from "@/app/types"

const API_BASE_URL = "http://localhost:8080/api/matches"

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

// Update match state (live controls)
export async function updateMatchState(id: string, matchState: any): Promise<Match> {
  const response = await axios.put<Match>(`${API_BASE_URL}/${id}/state`, matchState)
  return response.data
}

// Add goal to match
export async function addGoal(matchId: string, goal: any): Promise<Match> {
  const response = await axios.post<Match>(`${API_BASE_URL}/${matchId}/goals`, goal)
  return response.data
}

// Add match event
export async function addMatchEvent(matchId: string, event: any): Promise<any> {
  const response = await axios.post(`${API_BASE_URL}/${matchId}/events`, event)
  return response.data
}

// Get match events
export async function fetchMatchEvents(matchId: string): Promise<any[]> {
  const response = await axios.get<any[]>(`${API_BASE_URL}/${matchId}/events`)
  return response.data
}

// Get match goals
export async function fetchMatchGoals(matchId: string): Promise<any[]> {
  const response = await axios.get<any[]>(`${API_BASE_URL}/${matchId}/goals`)
  return response.data
}

