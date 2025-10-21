import axios from "axios"
import type { MatchEvent } from "@/app/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://afrigoals-backend.onrender.com/api/futsal"

// Create a match event
export async function createFutsalMatchEvent(event: Omit<MatchEvent, "id">): Promise<MatchEvent> {
  const response = await axios.post(`${API_BASE_URL}/events`, event)
  return response.data
}

// Get events for a match
export async function fetchFutsalMatchEvents(matchId: string): Promise<MatchEvent[]> {
  const response = await axios.get(`${API_BASE_URL}/matches/${matchId}/events`)
  return response.data
}

// Update a match event
export async function updateFutsalMatchEvent(id: string, event: Partial<MatchEvent>): Promise<MatchEvent> {
  const response = await axios.put(`${API_BASE_URL}/events/${id}`, event)
  return response.data
}

// Delete a match event
export async function deleteFutsalMatchEvent(id: string): Promise<void> {
  await axios.delete(`${API_BASE_URL}/events/${id}`)
}
