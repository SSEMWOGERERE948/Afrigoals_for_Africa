export interface Match {
  id: string
  league: string
  homeTeam: string
  awayTeam: string
  time: string
  date: string
  venue?: string
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
  periodState?: PeriodState
}

export interface PeriodState {
  startTime: string
  elapsedTimeInCurrentPeriodMs: number
  elapsedSeconds: number // ✅ matches backend
  elapsedMinutes: number // ✅ matches backend
  totalPlayingTimeMs: number
  lastUpdatedTimestamp: number
  matchPaused: boolean
  breakPeriod: boolean
  currentPeriodId: number
  currentPeriodOrder: number
}

export interface MatchStateUpdatePayload {
  status: "Scheduled" | "Lineup Set" | "Live" | "Finished" | "Cancelled"
  homeScore?: number | null // From Match
  awayScore?: number | null // From Match
  elapsedSeconds: number
  currentMinute?: number
  period?:
    | "First Half"
    | "Half Time"
    | "Second Half"
    | "Full Time"
    | "Extra Time First"
    | "Extra Time Second"
    | "Extra Time Break"
    | "Penalty Shootout"
    | "Finished"
  running?: boolean
  addedTime?: {
    firstHalf: number
    secondHalf: number
    extraTimeFirst: number
    extraTimeSecond: number
  }
  startTime?: string // As ISO string
  halfTimeStart?: string // As ISO string
  secondHalfStart?: string // As ISO string
  extraTimeStart?: string // As ISO string
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
  stats: any
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
  status: "Scheduled" | "Lineup Set" | "Live" | "Finished" | "Cancelled"
  currentMinute: number // Total seconds elapsed in the match (internal representation)
  period:
    | "First Half"
    | "Half Time"
    | "Second Half"
    | "Full Time"
    | "Extra Time First"
    | "Extra Time Break"
    | "Extra Time Second"
    | "Penalty Shootout"
    | "Finished"
  running: boolean
  elapsedSeconds: number
  addedTime: {
    firstHalf: number
    secondHalf: number
    extraTimeFirst: number
    extraTimeSecond: number
  }
  startTime?: Date // When the match actually started (Date object)
  halfTimeStart?: Date // When half time started (Date object)
  secondHalfStart?: Date // When second half started (Date object)
  extraTimeStart?: Date // When extra time started (Date object)
  // These fields are for backend communication if it sends minutes and seconds separately
  // They will be converted to `currentMinute` (total seconds) on the client.
  backendMinute?: number // The minute part from backend
  backendSecond?: number // The second part from backend
}

export interface Goal {
  id: string
  matchId?: string // Added matchId to associate goals with matches
  playerId: string
  playerName: string
  team: "home" | "away"
  minute: number
  type: "goal" | "penalty" | "own_goal"
  assistPlayerId?: string
  assistPlayerName?: string
}

// Ecommerce Types
export interface ProductCategory {
  id: string
  name: string
  description?: string
  slug: string
  parentId?: string
  imageUrl?: string
  isActive: boolean
  sortOrders?: number
  createdAt: Date
  updatedAt: Date
}

export interface ProductVariant {
  id: string
  name: string
  value: string
  price?: number
  stock?: number
  sku?: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  sku: string
  stock: number
  images: string[]
  category: ProductCategory
  variants?: ProductVariant[]
  tags: string[]
  isFeatured: boolean
  isActive: boolean
  rating: number
  reviewCount: number
  teamId?: string
  team?: Team
  createdAt: Date
  updatedAt: Date
}

export interface CartItem {
  id: string
  productId: string
  product: Product
  quantity: number
  variantId?: string
  variant?: ProductVariant
  price: number
  totalPrice: number
}

export interface Cart {
  id: string
  sessionId: string
  items: CartItem[]
  totalItems: number
  subtotal: number
  tax: number
  shipping: number
  total: number
  createdAt: Date
  updatedAt: Date
}

export interface Order {
  id: string
  orderIndexNumber: string
  customerId?: string
  customerEmail: string
  customerName: string
  customerPhone?: string
  items: CartItem[]
  subtotal: number
  tax: number
  shipping: number
  total: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  paymentStatus: "pending" | "paid" | "failed" | "refunded"
  paymentMethod?: string
  paymentReference?: string
  shippingAddress: Address
  billingAddress?: Address
  createdAt: Date
  updatedAt: Date
}

// Checkout Types
export interface CustomerInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
}

export interface Address {
  street: string
  city: string
  state: string
  country: string
  postalCode: string
}

// New Futsal Types
export interface FutsalLeague {
  id: string
  name: string
  country: string
  logo: string
  season: string
  teamSize: 5 | 6 | 7
  maxTeams: number
  matchDuration: number // in minutes
  maxSubstitutions: number
  currentMatchday: number
  teams: number
  status: "upcoming" | "active" | "completed"
  description?: string
}

export interface FutsalTeam {
  id: string
  teamName: string
  logo: string
  institution: string
  category: "school" | "club" | "community"
  preferredTeamSize: 5 | 6 | 7
  homeVenue: string
  founded: number
  manager?: string
  players: FutsalPlayer[]
  stats: {
    matchesPlayed: number
    wins: number
    draws: number
    losses: number
    goalsFor: number
    goalsAgainst: number
    points: number
  }
  description?: string
  contactEmail?: string
  contactPhone?: string
}

export interface FutsalPlayer {
  goals: any
  assists: any
  isInjured: any
  isSuspended: any
  yellowCards: boolean
  id: string
  name: string
  number: number
  positionId: string
  position?: FutsalPosition
  teamId: string
  teamName?: string
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

export interface FutsalPosition {
  id: string
  name: string
  abbreviation: string
  description?: string
}

export interface FutsalMatch {
  id: string
  league: string
  homeTeam: string
  awayTeam: string
  date: string
  time: string
  venue: string
  referee: string
  teamSize: 5 | 6 | 7
  matchDuration: number
  maxSubstitutions: number
  status: string
  homeScore: number
  awayScore: number
  periods?: MatchPeriod[] | string[] // ✅ backward-compatible
  periodState?: FutsalMatchPeriodState
  startTime?: Date // ✅ for timer
  homeLineup?: FutsalTeamLineup
  awayLineup?: FutsalTeamLineup
  events?: FutsalMatchEvent[]
  goals?: Goal[]
}

export interface FutsalMatchPeriodState {
  currentPeriodId: string
  currentPeriodOrder: number
  elapsedTimeInCurrentPeriodMs: number
  totalPlayingTimeMs: number
  lastUpdatedTimestamp: number
  matchPaused: boolean
  breakPeriod: boolean
  breakTimeRemaining?: number
}

export interface FutsalTeamLineup {
  players?: any
  captain?: string
  tacticalNotes?: string
  formation: string
  startingXI: FutsalPlayer[]
  substitutes: FutsalPlayer[]
  coach?: string
}

export interface FutsalMatchState {
  status: "Scheduled" | "Lineup Set" | "Live" | "Half Time" | "Second Half" | "Finished"
  currentMinute: number
  period: "First Half" | "Half Time" | "Second Half" | "Full Time" | "Finished"
  running: boolean
  startTime?: Date
  halfTimeStart?: Date
  secondHalfStart?: Date
  currentHalfDuration?: number
  currentHalf: 1 | 2
}

export interface MatchPeriod {
  id: string
  name: string
  duration: number // in minutes
  orderIndex: number
  breakPeriod: boolean // true if this is a break (e.g., half-time)
  breakDuration?: number // duration of break after this period (optional)
}

export interface MatchPeriodState {
  currentPeriodId: string
  currentPeriodOrder: number
  currentMinute: number
  currentSecond: number
  breakPeriod: boolean
  breakTimeRemaining?: number
}

export interface MatchEvent {
  id: string
  matchId?: string // Added matchId as it's crucial for API calls
  type:
    | "goal"
    | "yellow_card"
    | "red_card"
    | "substitution"
    | "half_time"
    | "full_time"
    | "kick_off"
    | "second_half_start"
    | "extra_time_start"
    | "extra_time_second_start"
    | "final_whistle"
    | "pause"
    | "resume"
    | "timeout"
    | "period_start"
    | "foul"
    | "free_kick"
    | "penalty_kick"
    | "corner_kick"
    | "throw_in"
    | "injury"
    | "technical_foul"
    | "accumulated_foul"
    | "direct_free_kick"
    | "indirect_free_kick"
    | "goalkeeper_throw"
    | "kick_in"
    | "time_penalty"
    | "blue_card"
    | "sin_bin"
  minute: number
  second?: number
  team?: "home" | "away"
  playerId?: string
  playerName?: string
  playerNumber?: number
  description: string
  additionalInfo?: {
    playerInId?: string
    playerInName?: string
    playerInNumber?: number
    playerOutId?: string
    playerOutName?: string
    playerOutNumber?: number
    assistPlayerId?: string
    assistPlayerName?: string
    assistPlayerNumber?: number
    goalType?: "regular" | "penalty" | "own_goal" | "direct_free_kick"
    foulType?: "technical" | "personal" | "unsporting" | "dissent" | "accumulated"
    cardReason?: string
    timeoutDuration?: number
    timeoutReason?: string
    injuryType?: "minor" | "serious" | "head"
    treatmentTime?: number
    position?: { x: number; y: number }
    notes?: string
  }
}

export interface FutsalMatchEvent {
  id: string
  matchId: string
  type:
    | "goal"
    | "yellow_card"
    | "red_card"
    | "substitution"
    | "timeout"
    | "half_time"
    | "full_time"
    | "kick_off"
    | "second_half_start"
    | "final_whistle"
    | "pause"
    | "resume"
    | "period_start"
    | "foul"
    | "free_kick"
    | "penalty_kick"
    | "corner_kick"
    | "throw_in"
    | "injury"
    | "technical_foul"
    | "accumulated_foul"
    | "direct_free_kick"
    | "indirect_free_kick"
    | "goalkeeper_throw"
    | "kick_in"
    | "time_penalty"
    | "blue_card"
    | "sin_bin"
  minute: number
  second?: number
  team?: "home" | "away"
  playerId?: string
  playerName?: string
  playerNumber?: number
  description: string
  additionalInfo?: {
    playerInId?: string
    playerInName?: string
    playerInNumber?: number
    playerOutId?: string
    playerOutName?: string
    playerOutNumber?: number
    assistPlayerId?: string
    assistPlayerName?: string
    assistPlayerNumber?: number
    goalType?: "regular" | "penalty" | "own_goal" | "direct_free_kick"
    foulType?: "technical" | "personal" | "unsporting" | "dissent" | "accumulated"
    cardReason?: string
    timeoutDuration?: number
    timeoutReason?: string
    injuryType?: "minor" | "serious" | "head"
    treatmentTime?: number
    position?: { x: number; y: number }
    notes?: string
  }
}

export interface FutsalGoal {
  id: string
  playerId: string
  playerName: string
  team: "home" | "away"
  minute: number
  type: "goal" | "penalty" | "own_goal"
  assistPlayerId?: string
  assistPlayerName?: string
}

export interface UpdateMatchDurationRequest {
  firstHalfDuration: number
  secondHalfDuration: number
  matchDuration?: number
}
