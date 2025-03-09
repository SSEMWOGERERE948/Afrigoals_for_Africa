"use client";

import { useState } from "react";
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
import { Plus, Search, Users } from "lucide-react";
import type { Fixture, Team } from "@/app/types";

export default function FixturesAdmin() {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [teams] = useState<Team[]>([
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
    }
  ]);

  const handleCreateFixture = (fixture: Partial<Fixture>) => {
    const newFixture: Fixture = {
      id: Date.now().toString(),
      league: fixture.league || "",
      homeTeam: fixture.homeTeam || "",
      awayTeam: fixture.awayTeam || "",
      date: fixture.date || "",
      time: fixture.time || "",
      stadium: fixture.stadium || "",
      status: "Scheduled"
    };

    setFixtures([...fixtures, newFixture]);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Fixture Management</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Fixture
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Schedule New Fixture</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label>League</label>
                <Input />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label>Home Team</label>
                  <select className="rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="">Select team</option>
                    {teams.map(team => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <label>Away Team</label>
                  <select className="rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="">Select team</option>
                    {teams.map(team => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                  </select>
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
                <label>Stadium</label>
                <Input />
              </div>
              <div className="grid gap-2">
                <label>Referee</label>
                <Input />
              </div>
            </div>
            <Button className="w-full">Schedule Fixture</Button>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search fixtures..."
              className="pl-9"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Teams</TableHead>
              <TableHead>League</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Stadium</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fixtures.map((fixture) => (
              <TableRow key={fixture.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{fixture.homeTeam}</div>
                    <div className="text-muted-foreground">vs</div>
                    <div className="font-medium">{fixture.awayTeam}</div>
                  </div>
                </TableCell>
                <TableCell>{fixture.league}</TableCell>
                <TableCell>
                  <div>
                    <div>{fixture.date}</div>
                    <div className="text-muted-foreground">{fixture.time}</div>
                  </div>
                </TableCell>
                <TableCell>{fixture.stadium}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    fixture.status === 'Live' 
                      ? 'bg-green-600/10 text-green-600'
                      : fixture.status === 'Finished'
                      ? 'bg-gray-600/10 text-gray-600'
                      : 'bg-yellow-600/10 text-yellow-600'
                  }`}>
                    {fixture.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm">
                    <Users className="h-4 w-4 mr-2" />
                    Set Lineup
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}