export interface Match {
  id: string
  league: string
  homeTeam: string
  awayTeam: string
  time: string
  date: string
  homeScore: number | null
  awayScore: number | null
  status?: string
  stadium?: string
  referee?: string
  extraTime?: number
  homeLineup?: TeamLineup
  awayLineup?: TeamLineup
  startTime?: Date
  currentMinute?: number
  matchState?: MatchState
  goals?: Goal[]
  events?: MatchEvent[]
}

export interface TeamLineup {
  formation: string
  startingXI: Player[]
  substitutes: Player[]
  coach: string // This will be populated from team.manager
}

// New interface for API requests - only IDs
export interface TeamLineupRequest {
  formation: string
  startingXIIds: string[]
  substituteIds: string[]
  coach: string // This will be the team's manager
}

// New interface for match update requests
export interface MatchUpdateRequest {
  status?: string
  homeLineup?: TeamLineupRequest
  awayLineup?: TeamLineupRequest
  homeScore?: number | null
  awayScore?: number | null
  stadium?: string
  referee?: string
  extraTime?: number
  startTime?: Date
  currentMinute?: number
}

export interface Position {
  id: number
  name: string
}

export interface Player {
  x: any
  y: any
  id: string
  name: string
  number: number
  position?: Position // Changed to Position object, made optional
  nationality: string
  age: number
  image: string
  clubTeamId?: string
  nationalTeamId?: string
  clubTeam?: Team
  nationalTeam?: Team
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

export interface Team {
  teamType: string
  id: string
  name: string
  logo: string
  league: string
  founded: number
  stadium: string
  manager: string // This is the coach/manager
  players: Player[]
  stats: {
    position: number
    played: number
    won: number
    drawn: number
    lost: number
    goalsFor: number
    goalsAgainst: number
    points: number
  }
}

export interface News {
  id: string
  title: string
  summary: string
  content: string
  image: string
  date: string
  category: string
}

export interface League {
  id: string
  name: string
  country: string
  logo: string
  season: string
  teams: number
  currentMatchday: number
}

export interface Fixture {
  id: string
  league: string
  homeTeam: string
  awayTeam: string
  date: string
  time: string
  stadium: string
  referee?: string
  status: "Scheduled" | "Lineup Set" | "Live" | "Finished"
}

// Backend response types
export interface TeamLineupResponse {
  formation: string
  coach: string
  startingXI: Player[]
  substitutes: Player[]
}

export interface MatchWithLineups {
  id: string
  league: string
  homeTeam: string
  awayTeam: string
  status: string
  stadium: string
  referee: string
  date: string
  time: string
  homeScore: number | null
  awayScore: number | null
  homeLineup: TeamLineupResponse | null
  awayLineup: TeamLineupResponse | null
}

export interface MatchState {
  status: "Scheduled" | "Lineup Set" | "Live" | "Half Time" | "Second Half" | "Extra Time" | "Finished"
  currentMinute: number
  period:
    | "First Half"
    | "Half Time"
    | "Second Half"
    | "Extra Time First"
    | "Extra Time Second"
    | "Penalty Shootout"
    | "Finished"
  isRunning: boolean
  startTime?: Date
  halfTimeStart?: Date
  secondHalfStart?: Date
  extraTimeStart?: Date
  addedTime: {
    firstHalf: number
    secondHalf: number
    extraTimeFirst: number
    extraTimeSecond: number
  }
}

export interface Goal {
  id: string
  matchId: string
  playerId: string
  playerName: string
  team: "home" | "away"
  minute: number
  type: "goal" | "penalty" | "own_goal"
  assistPlayerId?: string
  assistPlayerName?: string
}

export interface MatchEvent {
  id: string
  matchId: string
  type: "goal" | "yellow_card" | "red_card" | "substitution" | "half_time" | "full_time"
  minute: number
  team?: "home" | "away"
  playerId?: string
  playerName?: string
  description: string
}
