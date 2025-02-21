import TeamDetails from "@/components/TeamDetails";
import type { Team } from "../../types";

/** ✅ Ensures Next.js knows all possible team IDs at build time */
export function generateStaticParams() {
  return [
    { id: "1" },
    { id: "2" },
    { id: "3" },
    { id: "4" },
    { id: "5" }, // Add more team IDs as needed
  ];
}

export default function TeamPage({ params }: { params: { id: string } }) {
  // Sample teams data (replace with API call if needed)
  const teams: Team[] = [
    {
      id: "1",
      name: "Al Ahly",
      logo: "https://images.unsplash.com/photo-1614632537239-e2258df80a7e?w=200",
      league: "Egyptian Premier League",
      founded: 1907,
      stadium: "Al Ahly Stadium",
      manager: "Marcel Koller",
      players: [
        {
          id: "1",
          name: "Mohamed El Shenawy",
          number: 1,
          position: "Goalkeeper",
          nationality: "Egypt",
          age: 35,
          image: "https://images.unsplash.com/photo-1614632537239-e2258df80a7e?w=200",
          stats: { matches: 20, goals: 0, assists: 0, yellowCards: 1, redCards: 0 },
        },
        {
          id: "2",
          name: "Percy Tau",
          number: 10,
          position: "Forward",
          nationality: "South Africa",
          age: 29,
          image: "https://images.unsplash.com/photo-1614632537239-e2258df80a7e?w=200",
          stats: { matches: 18, goals: 12, assists: 8, yellowCards: 2, redCards: 0 },
        }
      ],
      stats: { position: 1, played: 20, won: 15, drawn: 4, lost: 1, goalsFor: 45, goalsAgainst: 12, points: 49 },
    }
  ];

  const team = teams.find((team) => team.id === params.id);

  if (!team) {
    return <div className="text-center text-red-500">Team not found</div>;
  }

  return <TeamDetails team={team} />;
}
