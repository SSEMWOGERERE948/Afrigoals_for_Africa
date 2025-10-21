import axios from "axios"
import type { Goal } from "@/app/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/futsal"

// Create a goal
export async function createFutsalGoal(goal: Omit<Goal, "id">): Promise<Goal> {
  const response = await axios.post(`${API_BASE_URL}/goals`, goal)
  return response.data
}

// Get goals for a match
export async function fetchFutsalMatchGoals(matchId: string): Promise<Goal[]> {
  const response = await axios.get(`${API_BASE_URL}/matches/${matchId}/goals`)
  return response.data
}

// Update a goal
export async function updateFutsalGoal(id: string, goal: Partial<Goal>): Promise<Goal> {
  const response = await axios.put(`${API_BASE_URL}/goals/${id}`, goal)
  return response.data
}

// Delete a goal
export async function deleteFutsalGoal(id: string): Promise<void> {
  await axios.delete(`${API_BASE_URL}/goals/${id}`)
}
