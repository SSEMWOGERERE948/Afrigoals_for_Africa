import axios from "axios"
import type { Player, Position } from "@/app/types"

const API_BASE_URL = "http://localhost:8080/api/players"

// Define the player data that we send to the backend (without x, y, and position object)
interface PlayerCreateData {
  name: string
  number: number
  nationality: string
  age: number
  image: string
  clubStats: {
    matches: number
    goals: number
    assists: number
    yellowCards: number
    redCards: number
  }
  nationalStats: {
    matches: number
    goals: number
    assists: number
    yellowCards: number
    redCards: number
  }
}

interface PlayerRequest {
  player: PlayerCreateData
  clubTeamId?: number
  nationalTeamId?: number
  positionId?: number
}

// Create a player
export async function createPlayer(playerReq: PlayerRequest): Promise<Player> {
  const response = await axios.post(`${API_BASE_URL}/create`, playerReq)
  return response.data
}

// Get all players
export async function fetchPlayers(): Promise<Player[]> {
  const response = await axios.get(API_BASE_URL)
  return response.data
}

// Delete a player
export async function deletePlayer(id: string): Promise<void> {
  await axios.delete(`${API_BASE_URL}/${id}`)
}

// Update a player
export async function updatePlayer(id: string, playerReq: PlayerRequest): Promise<Player> {
  const response = await axios.put(`${API_BASE_URL}/${id}`, playerReq)
  return response.data
}

export async function fetchPlayersByTeamId(teamId: string | number): Promise<Player[]> {
  const response = await axios.get(`${API_BASE_URL}/teams/${teamId}`)
  return response.data
}

export async function fetchPositions(): Promise<Position[]> {
  const response = await axios.get(`${API_BASE_URL}/positions`)
  return response.data
}
