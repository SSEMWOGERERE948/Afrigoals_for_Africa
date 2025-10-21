import axios from "axios"
import type { FutsalTeam } from "@/app/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://afrigoals-backend.onrender.com/api/futsalteams"

// Get all futsal teams
export async function fetchFutsalTeams(): Promise<FutsalTeam[]> {
  const response = await axios.get(`${API_BASE_URL}/`)
  return response.data
}

// Get a specific futsal team
export async function fetchFutsalTeam(id: string): Promise<FutsalTeam> {
  const response = await axios.get(`${API_BASE_URL}/${id}`)
  return response.data
}

// Create a futsal team
export async function createFutsalTeam(team: Omit<FutsalTeam, "id">): Promise<FutsalTeam> {
  const response = await axios.post(`${API_BASE_URL}/create`, team)
  return response.data
}

// Update a futsal team
export async function updateFutsalTeam(id: string, team: Partial<FutsalTeam>): Promise<FutsalTeam> {
  const response = await axios.put(`${API_BASE_URL}/${id}`, team)
  return response.data
}

// Delete a futsal team
export async function deleteFutsalTeam(id: string): Promise<void> {
  await axios.delete(`${API_BASE_URL}/${id}`)
}
