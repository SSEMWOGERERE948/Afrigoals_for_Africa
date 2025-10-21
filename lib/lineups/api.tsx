import axios from "axios"

export interface TeamLineupSaveRequest {
  formation: string
  coach?: string
  startingXIIds: string[]   // or number[]
  substituteIds: string[]
}

export interface PlayerOnField {
  playerId: string
  name: string
  number: number
  position: string
  teamName: string
  isStarting: boolean
  rowIndex: number
  colIndex: number
}

export interface TeamLineupFullResponse {
  formation: string
  coach: string
  startingXI: PlayerOnField[]
  substitutes: PlayerOnField[]
}

export type LineupSide = "HOME" | "AWAY"


const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:8080/api/futsalmatches"

/* ------------- LINE-UP HELPERS --------------- */

/** PUT = create or update a single side’s line-up */
export async function saveTeamLineup(
  matchId: string,
  side: LineupSide,
  payload: TeamLineupSaveRequest,
): Promise<void> {
  await axios.put(`${API_BASE}/${matchId}/lineups/${side}`, payload)
}

/** GET one side’s line-up (players already enriched with row/col) */
export async function fetchTeamLineup(
  matchId: string,
  side: LineupSide,
): Promise<TeamLineupFullResponse> {
  const { data } = await axios.get(
    `${API_BASE}/${matchId}/lineups/${side}`,
  )
  return data
}

/** Convenience: fetch both sides in parallel */
export async function fetchBothLineups(
  matchId: string,
): Promise<{ HOME: TeamLineupFullResponse; AWAY: TeamLineupFullResponse }> {
  const [home, away] = await Promise.all([
    fetchTeamLineup(matchId, "HOME"),
    fetchTeamLineup(matchId, "AWAY"),
  ])
  return { HOME: home, AWAY: away }
}

/** DELETE a single side’s line-up */
export async function deleteTeamLineup(
  matchId: string,
  side: LineupSide,
): Promise<void> {
  await axios.delete(`${API_BASE}/${matchId}/lineups/${side}`)
}
