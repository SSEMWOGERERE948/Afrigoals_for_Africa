"use client"

import type { Substitution } from "@/components/substitution-manager"

const API_BASE_URL = "https://afrigoals-backend.onrender.com/api/substitution"

export async function saveSubstitutions(matchId: string, substitutions: Substitution[]): Promise<void> {
  console.log("Saving substitutions for match:", matchId, substitutions)

  try {
    const response = await fetch(`${API_BASE_URL}/${matchId}/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ substitutions }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    console.log("Substitutions saved successfully")
  } catch (error) {
    console.error("Error saving substitutions:", error)
    throw error
  }
}

export async function fetchSubstitutions(matchId: string): Promise<Substitution[]> {
  console.log("Fetching substitutions for match:", matchId)

  try {
    const response = await fetch(`${API_BASE_URL}/${matchId}/fetch`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const substitutions = await response.json()
    console.log("Substitutions fetched:", substitutions)
    return substitutions
  } catch (error) {
    console.error("Error fetching substitutions:", error)
    return []
  }
}

export async function updateSubstitution(
  matchId: string,
  substitutionId: string,
  substitution: Partial<Substitution>,
): Promise<Substitution> {
  console.log("Updating substitution:", substitutionId, substitution)

  try {
    const response = await fetch(`${API_BASE_URL}/${matchId}/update/${substitutionId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(substitution),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const updatedSubstitution = await response.json()
    console.log("Substitution updated:", updatedSubstitution)
    return updatedSubstitution
  } catch (error) {
    console.error("Error updating substitution:", error)
    throw error
  }
}

export async function deleteSubstitution(matchId: string, substitutionId: string): Promise<void> {
  console.log("Deleting substitution:", substitutionId)

  try {
    const response = await fetch(`${API_BASE_URL}/matches/${matchId}/substitutions/${substitutionId}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    console.log("Substitution deleted successfully")
  } catch (error) {
    console.error("Error deleting substitution:", error)
    throw error
  }
}
