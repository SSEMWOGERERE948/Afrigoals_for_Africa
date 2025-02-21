"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Team } from "../types";

export default function TeamsPage() {
  const teams: Team[] = [
    {
      id: "1",
      name: "Al Ahly",
      logo: "https://images.unsplash.com/photo-1614632537239-e2258df80a7e?w=200",
      league: "Egyptian Premier League",
      founded: 1907,
      stadium: "Al Ahly Stadium",
      manager: "Marcel Koller",
      players: [],
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
    },
    {
      id: "2",
      name: "Mamelodi Sundowns",
      logo: "https://images.unsplash.com/photo-1614632537239-e2258df80a7e?w=200",
      league: "South African Premier Division",
      founded: 1970,
      stadium: "Loftus Versfeld Stadium",
      manager: "Rulani Mokwena",
      players: [],
      stats: {
        position: 1,
        played: 19,
        won: 14,
        drawn: 4,
        lost: 1,
        goalsFor: 35,
        goalsAgainst: 10,
        points: 46
      }
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Teams</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search teams..."
            className="pl-9"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <Link href={`/teams/${team.id}`} key={team.id}>
            <Card className="p-6 hover:bg-accent transition-colors">
              <div className="flex items-center space-x-4">
                <div className="relative h-20 w-20">
                  <Image
                    src={team.logo}
                    alt={team.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-semibold">{team.name}</h3>
                  <p className="text-sm text-muted-foreground">{team.league}</p>
                  <div className="mt-2 text-sm">
                    <span className="text-green-600 font-medium">
                      {team.stats.position}st
                    </span>
                    <span className="text-muted-foreground">
                      {" "}• {team.stats.points} pts
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}