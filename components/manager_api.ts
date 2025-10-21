import axios from "axios"

const API_BASE_URL = "http://localhost:8080/api/managers"

export interface Manager {
  clubTeam: any
  nationalTeam: any
  team_id: any
  id: string
  name: string
  nationality: string
  age: number
  image: string
  experience: number // years of coaching experience
  achievements: string[] // trophies, titles won
  tacticalStyle: string // e.g., "Attacking", "Defensive", "Possession-based"
  contractStart: string
  contractEnd: string
  role: "head_manager" | "assistant_manager" // NEW: Manager role
  specialization?: string // e.g., "Goalkeeping Coach", "Fitness Coach", "Tactical Analyst"
}

interface ManagerCreateData {
  name: string
  nationality: string
  age: number
  image: string
  experience: number
  achievements: string[]
  tacticalStyle: string
  contractStart: string
  contractEnd: string
  role: "head_manager" | "assistant_manager"
  specialization?: string
}

interface ManagerRequest {
  manager: ManagerCreateData
  clubTeamId?: number
  nationalTeamId?: number
}

// Create a manager
export async function createManager(managerReq: ManagerRequest): Promise<Manager> {
  const response = await axios.post(`${API_BASE_URL}/create`, managerReq)
  return response.data
}

// Get all managers
export async function fetchManagers(): Promise<Manager[]> {
  const response = await axios.get(API_BASE_URL)
  return response.data
}

// Delete a manager
export async function deleteManager(id: string): Promise<void> {
  await axios.delete(`${API_BASE_URL}/${id}`)
}

// Update a manager
export async function updateManager(id: string, managerReq: ManagerRequest): Promise<Manager> {
  const response = await axios.put(`${API_BASE_URL}/${id}`, managerReq)
  return response.data
}

// Get managers by team
export async function fetchManagersByTeamId(teamId: string | number): Promise<Manager[]> {
  const response = await axios.get(`${API_BASE_URL}/team/${teamId}`)
  return response.data
}

// Get head managers only
export async function fetchHeadManagers(): Promise<Manager[]> {
  const response = await axios.get(`${API_BASE_URL}/head-managers`)
  return response.data
}

// Get assistant managers only
export async function fetchAssistantManagers(): Promise<Manager[]> {
  const response = await axios.get(`${API_BASE_URL}/assistant-managers`)
  return response.data
}
