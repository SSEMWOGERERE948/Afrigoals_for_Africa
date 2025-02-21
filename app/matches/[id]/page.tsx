import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { Calendar, Clock, MapPin, User } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Type definitions
type Player = {
  number: number;
  name: string;
  position: string;
  x: number;
  y: number;
};

type Lineup = {
  formation: string;
  players: Player[];
};

type Event = {
  time: string;
  team: "home" | "away";
  type: string;
  player: string;
};

type Stats = {
  possession: { home: number; away: number };
  shots: { home: number; away: number };
  shotsOnTarget: { home: number; away: number };
  corners: { home: number; away: number };
  fouls: { home: number; away: number };
  yellowCards: { home: number; away: number };
  redCards: { home: number; away: number };
  offsides: { home: number; away: number };
  expectedGoals: { home: number; away: number };
};

type TableRow = {
  position: number;
  team: string;
  played: number;
  gd: number;
  points: number;
};

type Match = {
  id: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  time: string;
  date: string;
  homeScore: number;
  awayScore: number;
  status: string;
  stadium: string;
  referee: string;
};

// Generate static paths
export async function generateStaticParams() {
  // In a real application, you would fetch this data from an API
  const matches = [
    { id: "1" },
    { id: "2" }
  ];

  return matches.map((match) => ({
    id: match.id,
  }));
}

export default function MatchPage({ params }: { params: { id: string } }) {
  // Match data
  const match: Match = {
    id: "1",
    league: "CAF Champions League",
    homeTeam: "Al Ahly",
    awayTeam: "Mamelodi Sundowns",
    time: "19:00",
    date: "2024-02-23",
    homeScore: 2,
    awayScore: 1,
    status: "Live",
    stadium: "Al Ahly WE Al Salam Stadium",
    referee: "Victor Gomes"
  };

  // Match events
  const events: Event[] = [
    { time: "23'", team: "home", type: "goal", player: "Percy Tau" },
    { time: "45'", team: "away", type: "goal", player: "Peter Shalulile" },
    { time: "67'", team: "home", type: "goal", player: "Hussein El Shahat" }
  ];

  // Team lineups
  const lineups: { home: Lineup; away: Lineup } = {
    home: {
      formation: "4-2-3-1",
      players: [
        { number: 1, name: "El Shenawy", position: "GK", x: 50, y: 90 },
        { number: 3, name: "Hany", position: "RB", x: 85, y: 75 },
        { number: 4, name: "Ibrahim", position: "CB", x: 65, y: 75 },
        { number: 5, name: "Abdelmonem", position: "CB", x: 35, y: 75 },
        { number: 2, name: "Maaloul", position: "LB", x: 15, y: 75 },
        { number: 8, name: "Dieng", position: "CM", x: 35, y: 55 },
        { number: 6, name: "Attia", position: "CM", x: 65, y: 55 },
        { number: 19, name: "Tau", position: "RW", x: 85, y: 35 },
        { number: 10, name: "El Shahat", position: "CAM", x: 50, y: 35 },
        { number: 11, name: "Kahraba", position: "LW", x: 15, y: 35 },
        { number: 9, name: "Fathi", position: "ST", x: 50, y: 15 }
      ]
    },
    away: {
      formation: "4-3-3",
      players: [
        { number: 1, name: "Williams", position: "GK", x: 50, y: 90 },
        { number: 2, name: "Mudau", position: "RB", x: 85, y: 75 },
        { number: 4, name: "Kekana", position: "CB", x: 65, y: 75 },
        { number: 5, name: "Mvala", position: "CB", x: 35, y: 75 },
        { number: 3, name: "Modiba", position: "LB", x: 15, y: 75 },
        { number: 8, name: "Mokoena", position: "CM", x: 50, y: 55 },
        { number: 6, name: "Jali", position: "CM", x: 35, y: 45 },
        { number: 7, name: "Zwane", position: "CM", x: 65, y: 45 },
        { number: 11, name: "Sirino", position: "RW", x: 85, y: 25 },
        { number: 9, name: "Shalulile", position: "ST", x: 50, y: 15 },
        { number: 10, name: "Mkhulise", position: "LW", x: 15, y: 25 }
      ]
    }
  };

  // Match statistics
  const stats: Stats = {
    possession: { home: 55, away: 45 },
    shots: { home: 15, away: 12 },
    shotsOnTarget: { home: 7, away: 5 },
    corners: { home: 6, away: 4 },
    fouls: { home: 12, away: 14 },
    yellowCards: { home: 2, away: 3 },
    redCards: { home: 0, away: 0 },
    offsides: { home: 2, away: 3 },
    expectedGoals: { home: 2.3, away: 1.8 }
  };

  // League table
  const leagueTable: TableRow[] = [
    { position: 1, team: "Al Ahly", played: 20, gd: 33, points: 49 },
    { position: 2, team: "Mamelodi Sundowns", played: 19, gd: 25, points: 46 },
    { position: 3, team: "Wydad AC", played: 20, gd: 20, points: 42 },
    { position: 4, team: "ES Tunis", played: 20, gd: 15, points: 38 },
    { position: 5, team: "TP Mazembe", played: 20, gd: 12, points: 35 }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="p-6 mb-8">
        <div className="text-center mb-6">
          <p className="text-sm text-muted-foreground">{match.league}</p>
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground mt-1">
            <Calendar className="h-4 w-4" />
            <span>{match.date}</span>
            <Clock className="h-4 w-4 ml-2" />
            <span>{match.time}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 items-center gap-4">
          <div className="text-center">
            <div className="relative h-24 w-24 mx-auto mb-4">
              <Image
                src="/api/placeholder/96/96"
                alt={match.homeTeam}
                fill
                className="object-contain"
              />
            </div>
            <h2 className="font-semibold text-lg">{match.homeTeam}</h2>
          </div>

          <div className="text-center">
            <div className="text-4xl font-bold mb-2">
              {match.homeScore} - {match.awayScore}
            </div>
            <span className="px-3 py-1 bg-green-600 text-white rounded-full text-sm">
              {match.status}
            </span>
          </div>

          <div className="text-center">
            <div className="relative h-24 w-24 mx-auto mb-4">
              <Image
                src="/api/placeholder/96/96"
                alt={match.awayTeam}
                fill
                className="object-contain"
              />
            </div>
            <h2 className="font-semibold text-lg">{match.awayTeam}</h2>
          </div>
        </div>

        <div className="flex items-center justify-center space-x-8 mt-6 text-sm text-muted-foreground">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            {match.stadium}
          </div>
          <div className="flex items-center">
            <User className="h-4 w-4 mr-1" />
            {match.referee}
          </div>
        </div>
      </Card>

      <Tabs defaultValue="lineups">
        <TabsList className="mb-6">
          <TabsTrigger value="lineups">Lineups</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="table">Table</TabsTrigger>
          <TabsTrigger value="facts">Facts</TabsTrigger>
        </TabsList>

        <TabsContent value="lineups">
          <div className="grid md:grid-cols-2 gap-6">
            {["home", "away"].map((team) => (
              <Card key={team} className="p-6 relative">
                <h3 className="font-semibold mb-2">
                  {team === "home" ? match.homeTeam : match.awayTeam}
                  <span className="text-sm text-muted-foreground ml-2">
                    {team === "home" ? lineups.home.formation : lineups.away.formation}
                  </span>
                </h3>
                <div className="relative h-[400px] bg-green-900/10 rounded-lg">
                  {(team === "home" ? lineups.home.players : lineups.away.players).map((player) => (
                    <div
                      key={player.number}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2"
                      style={{
                        left: `${player.x}%`,
                        top: `${player.y}%`,
                      }}
                    >
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-background border-2 border-green-600 flex items-center justify-center text-sm font-medium">
                          {player.number}
                        </div>
                        <span className="text-xs font-medium mt-1 whitespace-nowrap">
                          {player.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="stats">
          <Card className="p-6">
            <div className="space-y-4">
              {Object.entries(stats).map(([key, value]) => (
                <div key={key} className="grid grid-cols-7 items-center gap-4">
                  <div className="col-span-2 text-right">{value.home}</div>
                  <div className="col-span-3">
                    <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full bg-green-600"
                        style={{ width: `${(value.home / (value.home + value.away)) * 100}%` }}
                      />
                    </div>
                    <div className="text-center text-sm text-muted-foreground mt-1">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                  </div>
                  <div className="col-span-2">{value.away}</div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card className="p-6">
            {events.map((event, index) => (
              <div
                key={index}
                className={`flex items-center ${
                  event.team === "home" ? "justify-start" : "justify-end"
                } mb-4`}
              >
                <div className={`flex items-center ${
                  event.team === "away" && "flex-row-reverse"
                } space-x-2`}>
                  <span className="text-sm font-medium">{event.time}</span>
                  <div className="px-3 py-1 bg-accent rounded-full">
                    <span className="text-sm">
                      ⚽ {event.player}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </Card>
        </TabsContent>

        <TabsContent value="table">
          <Card className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead className="text-right">P</TableHead>
                  <TableHead className="text-right">GD</TableHead>
                  <TableHead className="text-right">Pts</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leagueTable.map((row) => (
                  <TableRow key={row.position} className={row.team === match.homeTeam || row.team === match.awayTeam ? "bg-accent" : ""}>
                    <TableCell>{row.position}</TableCell>
                    <TableCell className="font-medium">{row.team}</TableCell>
                    <TableCell className="text-right">{row.played}</TableCell>
                    <TableCell className="text-right">{row.gd > 0 ? `+${row.gd}` : row.gd}</TableCell>
                    <TableCell className="text-right font-bold">{row.points}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="facts">
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Head to Head</h3>
                <p className="text-sm text-muted-foreground">
                  This is the 5th meeting between {match.homeTeam} and {match.awayTeam} in the CAF Champions League.
                  {match.homeTeam} have won 2, {match.awayTeam} have won 1, with 1 draw.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Form Guide</h3>
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="text-sm mb-1">{match.homeTeam}</p>
                    <div className="flex space-x-1">
                      {["W", "W", "D", "W", "L"].map((result, i) => (
                        <span
                          key={i}
                          className={`w-6 h-6 flex items-center justify-center text-xs font-medium rounded ${
                            result === "W"
                              ? "bg-green-600 text-white"
                              : result === "D"
                              ? "bg-yellow-500 text-white"
                              : "bg-red-600 text-white"
                          }`}
                        >
                          {result}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm mb-1">{match.awayTeam}</p>
                    <div className="flex space-x-1">
                      {["W", "L", "W", "W", "W"].map((result, i) => (
                        <span
                          key={i}
                          className={`w-6 h-6 flex items-center justify-center text-xs font-medium rounded ${
                            result === "W"
                              ? "bg-green-600 text-white"
                              : result === "D"
                              ? "bg-yellow-500 text-white"
                              : "bg-red-600 text-white"
                          }`}
                        >
                          {result}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}