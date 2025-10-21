import axios from "axios"
import type { FutsalLeague } from "@/app/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://afrigoals-backend.onrender.com/api/futsalleagues"

// Get all futsal leagues
export async function fetchFutsalLeagues(): Promise<FutsalLeague[]> {
  const response = await axios.get(`${API_BASE_URL}/`)
  return response.data
}

// Get a specific futsal league
export async function fetchFutsalLeague(id: string): Promise<FutsalLeague> {
  const response = await axios.get(`${API_BASE_URL}/${id}`)
  return response.data
}

// Create a futsal league
export async function createFutsalLeague(league: Omit<FutsalLeague, "id">): Promise<FutsalLeague> {
  const response = await axios.post(`${API_BASE_URL}/create`, league)
  return response.data
}

// Update a futsal league
export async function updateFutsalLeague(id: string, league: Partial<FutsalLeague>): Promise<FutsalLeague> {
  const response = await axios.put(`${API_BASE_URL}/${id}`, league)
  return response.data
}

// Delete a futsal league
export async function deleteFutsalLeague(id: string): Promise<void> {
  await axios.delete(`${API_BASE_URL}/${id}`)
}
