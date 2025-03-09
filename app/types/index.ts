export interface Match {
  id: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  time: string;
  date: string;
  homeScore: number | null;
  awayScore: number | null;
  status?: string;
  stadium?: string;
  referee?: string;
  extraTime?: number;
  homeLineup?: TeamLineup;
  awayLineup?: TeamLineup;
  startTime?: Date;
  currentMinute?: number;
}

export interface TeamLineup {
  formation: string;
  startingXI: Player[];
  substitutes: Player[];
  coach: string;
}

export interface Player {
  id: string;
  name: string;
  number: number;
  position: string;
  nationality: string;
  age: number;
  image: string;
  stats: {
    matches: number;
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
  };
}

export interface Team {
  id: string;
  name: string;
  logo: string;
  league: string;
  founded: number;
  stadium: string;
  manager: string;
  players: Player[];
  stats: {
    position: number;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    points: number;
  };
}

export interface News {
  id: string;
  title: string;
  summary: string;
  content: string;
  image: string;
  date: string;
  category: string;
}

export interface League {
  id: string;
  name: string;
  country: string;
  logo: string;
  season: string;
  teams: number;
  currentMatchday: number;
}

export interface Fixture {
  id: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  stadium: string;
  referee?: string;
  status: 'Scheduled' | 'Lineup Set' | 'Live' | 'Finished';
}