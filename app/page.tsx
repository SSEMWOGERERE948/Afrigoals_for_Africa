"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";
import { fetchMatches } from "@/components/matches_api"; // ✅ Ensure this exists
import type { Match } from "@/app/types";

export default function Home() {
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    fetchMatches().then(setMatches).catch(() => {
      console.error("Failed to load matches");
    });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-6">Live Matches</h1>

      <div className="grid gap-4">
        {matches.length === 0 ? (
          <p className="text-muted-foreground">No matches available.</p>
        ) : (
          matches.map((match) => (
            <Link
              key={match.id}
              href={`/matches/${match.id}?tab=${match.status === "Live" ? "lineups" : "stats"}`}
              passHref
            >
              <Card className="p-4 cursor-pointer hover:shadow-lg transition duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{match.league}</span>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    {match.date}
                    <Clock className="h-4 w-4 ml-3 mr-1" />
                    {match.time}
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold">{match.homeTeam}</p>
                  </div>
                  <div className="flex items-center justify-center space-x-3 px-4">
                    <span className="text-xl font-bold">{match.homeScore ?? "-"}</span>
                    <span className="text-muted-foreground">vs</span>
                    <span className="text-xl font-bold">{match.awayScore ?? "-"}</span>
                  </div>
                  <div className="flex-1 text-right">
                    <p className="font-semibold">{match.awayTeam}</p>
                  </div>
                </div>
                {match.status && (
                  <div className="mt-2 text-center">
                    <span className={`text-sm font-medium ${match.status === "Live" ? "text-red-600" : "text-green-600"}`}>
                      {match.status}
                    </span>
                  </div>
                )}
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
