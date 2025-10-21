import axios from "axios"
import type { FutsalPlayer, FutsalPosition } from "@/app/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/futsalplayers"
const API_BASE_URL_POS = "http://localhost:8080/api/players"

// Configure axios defaults
axios.defaults.headers.common["Content-Type"] = "application/json"
axios.defaults.headers.common["Accept"] = "application/json"

// Define the player data structure for API requests
interface FutsalPlayerCreateData {
  name: string
  number: number
  nationality: string
  age: number
  image: string
  height: number
  weight: number
  preferredFoot: "left" | "right" | "both"
  studentId?: string
  course?: string
  yearOfStudy?: string
  stats: {
    matchesPlayed: number
    goals: number
    assists: number
    yellowCards: number
    redCards: number
    cleanSheets: number
  }
}

interface FutsalPlayerRequest {
  player: FutsalPlayerCreateData
  teamId?: string
  positionId?: string
}

// Create a futsal player
export async function createFutsalPlayer(playerReq: FutsalPlayerRequest): Promise<FutsalPlayer> {
  const response = await axios.post(`${API_BASE_URL}/create`, playerReq)
  return response.data
}

// Get all futsal players
export async function fetchFutsalPlayers(): Promise<FutsalPlayer[]> {
  const response = await axios.get(`${API_BASE_URL}/`)
  return response.data
}

// Delete a futsal player
export async function deleteFutsalPlayer(id: string): Promise<void> {
  await axios.delete(`${API_BASE_URL}/${id}`)
}

// Update a futsal player
export async function updateFutsalPlayer(id: string, playerReq: FutsalPlayerRequest): Promise<FutsalPlayer> {
  const response = await axios.put(`${API_BASE_URL}/${id}`, playerReq)
  return response.data
}

// Get players by team ID
export async function fetchFutsalPlayersByTeamId(teamId: string): Promise<FutsalPlayer[]> {
  const response = await axios.get(`${API_BASE_URL}/team/${teamId}`)
  return response.data
}

// Get futsal positions
export async function fetchFutsalPositions(): Promise<FutsalPosition[]> {
  const response = await axios.get(`${API_BASE_URL_POS}/positions`)
  return response.data
}
