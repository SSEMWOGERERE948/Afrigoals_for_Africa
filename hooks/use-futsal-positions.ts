"use client"

import { useState, useEffect } from "react"
import type { FutsalPosition } from "@/app/types"

const defaultPositions: FutsalPosition[] = [
  { id: "1", name: "Goalkeeper", abbreviation: "GK", description: "Defends the goal" },
  { id: "2", name: "Defender", abbreviation: "DEF", description: "Defensive player" },
  { id: "3", name: "Midfielder", abbreviation: "MID", description: "Central player" },
  { id: "4", name: "Forward", abbreviation: "FWD", description: "Attacking player" },
  { id: "5", name: "Pivot", abbreviation: "PIV", description: "Target player" },
]

export function useFutsalPositions() {
  const [positions, setPositions] = useState<FutsalPosition[]>(defaultPositions)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/futsal/positions")

        if (!response.ok) {
          throw new Error("Failed to fetch positions")
        }

        const data = await response.json()
        setPositions(data)
      } catch (err) {
        console.error("Error fetching futsal positions:", err)
        setError("Failed to load positions")
        // Keep default positions on error
        setPositions(defaultPositions)
      } finally {
        setLoading(false)
      }
    }

    fetchPositions()
  }, [])

  return { positions, loading, error }
}
