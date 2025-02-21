"use client";

import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import Link from "next/link";
import type { League } from "../types";

export default function LeaguesPage() {
  const leagues: League[] = [
    {
      id: "1",
      name: "CAF Champions League",
      country: "Africa",
      logo: "https://images.unsplash.com/photo-1614632537239-e2258df80a7e?w=200",
      season: "2023/24",
      teams: 16,
      currentMatchday: 4
    },
    {
      id: "2",
      name: "Nigeria Premier League",
      country: "Nigeria",
      logo: "https://images.unsplash.com/photo-1614632537239-e2258df80a7e?w=200",
      season: "2023/24",
      teams: 20,
      currentMatchday: 26
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Leagues</h1>
      
      <Tabs defaultValue="all" className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Leagues</TabsTrigger>
          <TabsTrigger value="domestic">Domestic</TabsTrigger>
          <TabsTrigger value="continental">Continental</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-4">
        {leagues.map((league) => (
          <Link href={`/leagues/${league.id}`} key={league.id}>
            <Card className="p-4 hover:bg-accent transition-colors">
              <div className="flex items-center space-x-4">
                <div className="relative h-16 w-16">
                  <Image
                    src={league.logo}
                    alt={league.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-semibold">{league.name}</h3>
                  <p className="text-sm text-muted-foreground">{league.country}</p>
                  <p className="text-sm text-muted-foreground">
                    Season {league.season} • Matchday {league.currentMatchday}
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}