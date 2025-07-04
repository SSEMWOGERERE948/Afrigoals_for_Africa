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
    | "Full Time"
    | "Extra Time First"
    | "Extra Time Second"
    | "Extra Time Break"
    | "Penalty Shootout"
    | "Finished"
  running: boolean
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
  minute: number
  team?: "home" | "away"
  playerId?: string
  playerName?: string
  description: string
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
  createdAt: Date
  updatedAt: Date
  sortOrder: number
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
  image?:string
  name?:string
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
  orderNumber: string
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
  shippingAddress: {
    street: string
    city: string
    state: string
    country: string
    postalCode: string
  }
  billingAddress?: {
    street: string
    city: string
    state: string
    country: string
    postalCode: string
  }
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
