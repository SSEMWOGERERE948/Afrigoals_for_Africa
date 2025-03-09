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
import { Plus, Search, Edit, Trash } from "lucide-react";
import Image from "next/image";
import type { Team } from "@/app/types";

export default function TeamsAdmin() {
  const [teams, setTeams] = useState<Team[]>([
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Teams Management</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Team
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Team</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="name">Team Name</label>
                <Input id="name" />
              </div>
              <div className="grid gap-2">
                <label htmlFor="league">League</label>
                <Input id="league" />
              </div>
              <div className="grid gap-2">
                <label htmlFor="manager">Manager</label>
                <Input id="manager" />
              </div>
              <div className="grid gap-2">
                <label htmlFor="stadium">Stadium</label>
                <Input id="stadium" />
              </div>
            </div>
            <Button className="w-full">Save Team</Button>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search teams..."
              className="pl-9"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Team</TableHead>
              <TableHead>League</TableHead>
              <TableHead>Manager</TableHead>
              <TableHead>Stadium</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map((team) => (
              <TableRow key={team.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="relative h-10 w-10">
                      <Image
                        src={team.logo}
                        alt={team.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="font-medium">{team.name}</span>
                  </div>
                </TableCell>
                <TableCell>{team.league}</TableCell>
                <TableCell>{team.manager}</TableCell>
                <TableCell>{team.stadium}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-red-600">
                    <Trash className="h-4 w-4" />
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