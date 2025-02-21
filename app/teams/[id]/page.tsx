"use client";

import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import type { Team, Player } from "../../types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function TeamPage({ params }: { params: { id: string } }) {
  const team: Team = {
    id: "1",
    name: "Al Ahly",
    logo: "https://images.unsplash.com/photo-1614632537239-e2258df80a7e?w=200",
    league: "Egyptian Premier League",
    founded: 1907,
    stadium: "Al Ahly Stadium",
    manager: "Marcel Koller",
    players: [
      {
        id: "1",
        name: "Mohamed El Shenawy",
        number: 1,
        position: "Goalkeeper",
        nationality: "Egypt",
        age: 35,
        image: "https://images.unsplash.com/photo-1614632537239-e2258df80a7e?w=200",
        stats: {
          matches: 20,
          goals: 0,
          assists: 0,
          yellowCards: 1,
          redCards: 0
        }
      },
      {
        id: "2",
        name: "Percy Tau",
        number: 10,
        position: "Forward",
        nationality: "South Africa",
        age: 29,
        image: "https://images.unsplash.com/photo-1614632537239-e2258df80a7e?w=200",
        stats: {
          matches: 18,
          goals: 12,
          assists: 8,
          yellowCards: 2,
          redCards: 0
        }
      }
    ],
    stats: {
      position: 1,
      played: 20,
      won: 15,
      drawn: 4,
      lost: 1,
      goalsFor: 45,
      goalsAgainst: 12,
      points: 49
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="p-6 mb-8">
        <div className="flex items-center space-x-6">
          <div className="relative h-32 w-32">
            <Image
              src={team.logo}
              alt={team.name}
              fill
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{team.name}</h1>
            <p className="text-lg text-muted-foreground">{team.league}</p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm text-muted-foreground">Founded</p>
                <p className="font-medium">{team.founded}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Stadium</p>
                <p className="font-medium">{team.stadium}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Manager</p>
                <p className="font-medium">{team.manager}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Position</p>
                <p className="font-medium text-green-600">{team.stats.position}st</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="squad">
        <TabsList className="mb-6">
          <TabsTrigger value="squad">Squad</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="matches">Matches</TabsTrigger>
        </TabsList>

        <TabsContent value="squad">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Player</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Matches</TableHead>
                <TableHead>Goals</TableHead>
                <TableHead>Assists</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {team.players.map((player) => (
                <TableRow key={player.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-3">
                      <div className="relative h-8 w-8">
                        <Image
                          src={player.image}
                          alt={player.name}
                          fill
                          className="object-cover rounded-full"
                        />
                      </div>
                      <div>
                        <div className="font-medium">{player.name}</div>
                        <div className="text-sm text-muted-foreground">
                          #{player.number}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{player.position}</TableCell>
                  <TableCell>{player.age}</TableCell>
                  <TableCell>{player.stats.matches}</TableCell>
                  <TableCell>{player.stats.goals}</TableCell>
                  <TableCell>{player.stats.assists}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="stats">
          <Card className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Matches Played</p>
                <p className="text-2xl font-bold">{team.stats.played}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Won</p>
                <p className="text-2xl font-bold text-green-600">{team.stats.won}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Drawn</p>
                <p className="text-2xl font-bold">{team.stats.drawn}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Lost</p>
                <p className="text-2xl font-bold text-red-600">{team.stats.lost}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Goals For</p>
                <p className="text-2xl font-bold">{team.stats.goalsFor}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Goals Against</p>
                <p className="text-2xl font-bold">{team.stats.goalsAgainst}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Goal Difference</p>
                <p className="text-2xl font-bold">
                  {team.stats.goalsFor - team.stats.goalsAgainst}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Points</p>
                <p className="text-2xl font-bold text-green-600">{team.stats.points}</p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}