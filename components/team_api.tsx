"use client";

import axios from "axios";
import type { League, Team } from "@/app/types";

// Backend API base URL
const API_BASE_URL = "http://localhost:8080/api/teams";
const API_BASE_URL_LEAGUE = "http://localhost:8080/api/leagues";

// Get all teams
export async function fetchTeams(): Promise<Team[]> {
  const response = await axios.get<Team[]>(API_BASE_URL);
  return response.data;
}

export async function fetchAllTeams(): Promise<Team[]> {
  const response = await axios.get<Team[]>(`${API_BASE_URL}`)
  return response.data
}

// Get a team by ID
export async function fetchTeam(id: string): Promise<Team> {
  const response = await axios.get<Team>(`${API_BASE_URL}/${id}`);
  return response.data;
}

// Create a new team
export async function createTeam(team: Omit<Team, "id">): Promise<Team> {
  const response = await axios.post<Team>(`${API_BASE_URL}/create`, team);
  return response.data;
}

// Update a team
export async function updateTeam(id: string, team: Partial<Team>): Promise<Team> {
  const response = await axios.put<Team>(`${API_BASE_URL}/${id}`, team);
  return response.data;
}

// Delete a team
export async function deleteTeam(id: string): Promise<void> {
  await axios.delete(`${API_BASE_URL}/${id}`);
}

export async function fetchTeamsByType(teamType: "club" | "national"): Promise<Team[]> {
  const response = await axios.get<Team[]>(`${API_BASE_URL}?teamType=${teamType}`)
  return response.data
}


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