"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Calendar, Clock } from "lucide-react"
import { fetchMatches } from "@/components/matches_api" 
import type { Match } from "@/app/types"

export default function Home() {
  const [matches, setMatches] = useState<Match[]>([])

  useEffect(() => {
    fetchMatches()
      .then(setMatches)
      .catch(() => {
        console.error("Failed to load matches")
      })
  }, [])

  const formatDate = (date: number[] | string) => {
    if (Array.isArray(date)) {
      // date = [year, month, day]
      const [year, month, day] = date
      return `${day.toString().padStart(2, "0")}/${month
        .toString()
        .padStart(2, "0")}/${year}`
    }

    if (typeof date === "string" && date.length === 8) {
      const year = date.substring(0, 4)
      const month = date.substring(4, 6)
      const day = date.substring(6, 8)
      return `${day}/${month}/${year}`
    }

    return date.toString()
  }

  const formatTime = (time: number[] | string) => {
    if (Array.isArray(time)) {
      // time = [hour, minute]
      const [hour, minute] = time
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
      const ampm = hour >= 12 ? "PM" : "AM"
      return `${hour12}:${minute.toString().padStart(2, "0")} ${ampm}`
    }

    if (typeof time === "string") {
      if (time.includes(":")) {
        const [h, m] = time.split(":")
        const hour24 = parseInt(h)
        const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24
        const ampm = hour24 >= 12 ? "PM" : "AM"
        return `${hour12}:${m ?? "00"} ${ampm}`
      }

      const hour24 = parseInt(time)
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24
      const ampm = hour24 >= 12 ? "PM" : "AM"
      return `${hour12}:00 ${ampm}`
    }

    return time
  }

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
                    {formatDate(match.date)}
                    <Clock className="h-4 w-4 ml-3 mr-1" />
                    {formatTime(match.time)}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold">{match.homeTeam}</p>
                  </div>
                  <div className="flex items-center justify-center space-x-3 px-4">
                    <span className="text-xl font-bold">
                      {match.status === "Scheduled"
                        ? "0"
                        : match.homeScore ?? (match.status === "Finished" || match.status === "Live" ? "0" : "-")}
                    </span>
                    <span className="text-muted-foreground">vs</span>
                    <span className="text-xl font-bold">
                      {match.status === "Scheduled"
                        ? "0"
                        : match.awayScore ?? (match.status === "Finished" || match.status === "Live" ? "0" : "-")}
                    </span>
                  </div>
                  <div className="flex-1 text-right">
                    <p className="font-semibold">{match.awayTeam}</p>
                  </div>
                </div>

                {match.status && (
                  <div className="mt-2 text-center">
                    <span
                      className={`text-sm font-medium ${
                        match.status === "Live" ? "text-red-600" : "text-green-600"
                      }`}
                    >
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
  )
}
