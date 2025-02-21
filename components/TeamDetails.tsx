"use client";

import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Team } from "../app/types";

export default function TeamDetails({ team }: { team: Team }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="p-6 mb-8">
        <div className="flex items-center space-x-6">
          <div className="relative h-32 w-32">
            <Image src={team.logo} alt={team.name} fill className="object-contain" />
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
                        <Image src={player.image} alt={player.name} fill className="object-cover rounded-full" />
                      </div>
                      <div>
                        <div className="font-medium">{player.name}</div>
                        <div className="text-sm text-muted-foreground">#{player.number}</div>
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
      </Tabs>
    </div>
  );
}
