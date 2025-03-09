"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Search, Timer } from "lucide-react";
import type { Match } from "@/app/types";

export default function MatchesAdmin() {
  const [matches, setMatches] = useState<Match[]>([
    {
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
      referee: "Victor Gomes",
      startTime: new Date(),
      currentMinute: 67,
      extraTime: 3
    }
  ]);

  // Update match time every minute for live matches
  useEffect(() => {
    const interval = setInterval(() => {
      setMatches(prevMatches => 
        prevMatches.map(match => {
          if (match.status === "Live" && match.startTime) {
            const elapsed = Math.floor(
              (Date.now() - match.startTime.getTime()) / 60000
            );
            return {
              ...match,
              currentMinute: elapsed
            };
          }
          return match;
        })
      );
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const startMatch = (matchId: string) => {
    setMatches(prevMatches =>
      prevMatches.map(match =>
        match.id === matchId
          ? {
              ...match,
              status: "Live",
              startTime: new Date(),
              currentMinute: 0
            }
          : match
      )
    );
  };

  const addExtraTime = (matchId: string, minutes: number) => {
    setMatches(prevMatches =>
      prevMatches.map(match =>
        match.id === matchId
          ? {
              ...match,
              extraTime: (match.extraTime || 0) + minutes
            }
          : match
      )
    );
  };

  const updateScore = (matchId: string, homeScore: number, awayScore: number) => {
    setMatches(prevMatches =>
      prevMatches.map(match =>
        match.id === matchId
          ? {
              ...match,
              homeScore,
              awayScore
            }
          : match
      )
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Live Match Management</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Match
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Match</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label>Home Team</label>
                  <Input />
                </div>
                <div className="grid gap-2">
                  <label>Away Team</label>
                  <Input />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label>Date</label>
                  <Input type="date" />
                </div>
                <div className="grid gap-2">
                  <label>Time</label>
                  <Input type="time" />
                </div>
              </div>
              <div className="grid gap-2">
                <label>League</label>
                <Input />
              </div>
              <div className="grid gap-2">
                <label>Stadium</label>
                <Input />
              </div>
              <div className="grid gap-2">
                <label>Referee</label>
                <Input />
              </div>
            </div>
            <Button className="w-full">Save Match</Button>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search matches..."
              className="pl-9"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Match</TableHead>
              <TableHead>League</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matches.map((match) => (
              <TableRow key={match.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{match.homeTeam}</div>
                    <div className="text-muted-foreground">{match.awayTeam}</div>
                  </div>
                </TableCell>
                <TableCell>{match.league}</TableCell>
                <TableCell>
                  {match.status === "Live" ? (
                    <div className="flex items-center text-green-600">
                      <Timer className="h-4 w-4 mr-1" />
                      {match.currentMinute}'
                      {match.extraTime ? `+${match.extraTime}` : ""}
                    </div>
                  ) : (
                    <div>
                      <div>{match.date}</div>
                      <div className="text-muted-foreground">{match.time}</div>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {match.homeScore} - {match.awayScore}
                </TableCell>
                <TableCell>
                  <span className="px-2 py-1 bg-green-600/10 text-green-600 rounded-full text-sm">
                    {match.status}
                  </span>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  {match.status === "Live" ? (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => addExtraTime(match.id, 1)}
                      >
                        +1 Min
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            Update Score
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Update Score</DialogTitle>
                          </DialogHeader>
                          <div className="grid grid-cols-2 gap-4 py-4">
                            <div className="grid gap-2">
                              <label>{match.homeTeam}</label>
                              <Input 
                                type="number" 
                                defaultValue={match.homeScore || 0}
                                onChange={(e) => updateScore(
                                  match.id,
                                  parseInt(e.target.value),
                                  match.awayScore || 0
                                )}
                              />
                            </div>
                            <div className="grid gap-2">
                              <label>{match.awayTeam}</label>
                              <Input 
                                type="number"
                                defaultValue={match.awayScore || 0}
                                onChange={(e) => updateScore(
                                  match.id,
                                  match.homeScore || 0,
                                  parseInt(e.target.value)
                                )}
                              />
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => startMatch(match.id)}
                    >
                      Start Match
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}