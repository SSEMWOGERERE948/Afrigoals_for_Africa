"use client"

import axios from "axios"
import type { League, Team } from "@/app/types"

// Backend API base URL
const API_BASE_URL = "https://afrigoals-backend.onrender.com/api/teams"
const API_BASE_URL_LEAGUE = "https://afrigoals-backend.onrender.com/api/leagues"
const API_BASE_URL_MANAGERS = "https://afrigoals-backend.onrender.com/api/managers"

// Manager interface
export interface Manager {
  id: string
  name: string
  nationality: string
  age: number
  experience: number
  specialization: string
  isAvailable: boolean
  currentTeam?: string
  achievements: string[]
  image?: string
}

// Get all teams
export async function fetchTeams(): Promise<Team[]> {
  const response = await axios.get<Team[]>(API_BASE_URL)
  return response.data
}

export async function fetchAllTeams(): Promise<Team[]> {
  const response = await axios.get<Team[]>(`${API_BASE_URL}`)
  return response.data
}

// Get a team by ID
export async function fetchTeam(id: string): Promise<Team> {
  const response = await axios.get<Team>(`${API_BASE_URL}/${id}`)
  return response.data
}

// Create a new team
export async function createTeam(team: Omit<Team, "id">): Promise<Team> {
  const response = await axios.post<Team>(`${API_BASE_URL}/create`, team)
  return response.data
}

// Update a team
export async function updateTeam(id: string, team: Partial<Team>): Promise<Team> {
  const response = await axios.put<Team>(`${API_BASE_URL}/${id}`, team)
  return response.data
}

// Delete a team
export async function deleteTeam(id: string): Promise<void> {
  await axios.delete(`${API_BASE_URL}/${id}`)
}

export async function fetchTeamsByType(teamType: "club" | "national"): Promise<Team[]> {
  const response = await axios.get<Team[]>(`${API_BASE_URL}?teamType=${teamType}`)
  return response.data
}

// League functions
export async function fetchLeagues(): Promise<League[]> {
  const response = await axios.get<League[]>(`${API_BASE_URL_LEAGUE}/all`)
  return response.data
}

export async function createLeague(league: Omit<League, "id">): Promise<League> {
  const response = await axios.post<League>(`${API_BASE_URL_LEAGUE}/create`, league)
  return response.data
}

export async function updateLeague(id: string, league: Partial<League>): Promise<League> {
  const response = await axios.put<League>(`${API_BASE_URL_LEAGUE}/${id}`, league)
  return response.data
}

export async function deleteLeague(id: string): Promise<void> {
  await axios.delete(`${API_BASE_URL_LEAGUE}/${id}`)
}

// Manager functions
export async function fetchManagers(): Promise<Manager[]> {
  try {
    const response = await axios.get<Manager[]>(`${API_BASE_URL_MANAGERS}/all`)
    return response.data
  } catch (error) {
    console.error("Failed to fetch managers:", error)
    return []
  }
}

export async function fetchAvailableManagers(): Promise<Manager[]> {
  try {
    const response = await axios.get<Manager[]>(`${API_BASE_URL_MANAGERS}/available`)
    return response.data
  } catch (error) {
    console.error("Failed to fetch available managers:", error)
    return []
  }
}

export async function fetchManager(id: string): Promise<Manager> {
  const response = await axios.get<Manager>(`${API_BASE_URL_MANAGERS}/${id}`)
  return response.data
}

export async function createManager(manager: Omit<Manager, "id">): Promise<Manager> {
  const response = await axios.post<Manager>(`${API_BASE_URL_MANAGERS}/create`, manager)
  return response.data
}

export async function updateManager(id: string, manager: Partial<Manager>): Promise<Manager> {
  const response = await axios.put<Manager>(`${API_BASE_URL_MANAGERS}/${id}`, manager)
  return response.data
}

export async function deleteManager(id: string): Promise<void> {
  await axios.delete(`${API_BASE_URL_MANAGERS}/${id}`)
}

// Assign manager to team
export async function assignManagerToTeam(managerId: string, teamId: string): Promise<void> {
  await axios.post(`${API_BASE_URL_MANAGERS}/${managerId}/assign`, { teamId })
}

// Remove manager from team
export async function removeManagerFromTeam(managerId: string): Promise<void> {
  await axios.post(`${API_BASE_URL_MANAGERS}/${managerId}/unassign`)
}
