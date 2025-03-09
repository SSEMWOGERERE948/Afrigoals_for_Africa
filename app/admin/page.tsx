import { Card } from "@/components/ui/card";
import {
  Users,
  Newspaper,
  ArrowLeftRight,
  Trophy,
  TrendingUp,
  Activity
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const stats = [
    { name: "Total Teams", value: "24", icon: Users },
    { name: "News Articles", value: "156", icon: Newspaper },
    { name: "Active Transfers", value: "12", icon: ArrowLeftRight },
    { name: "Live Matches", value: "3", icon: Trophy },
    { name: "Total Views", value: "24.5K", icon: TrendingUp },
    { name: "Active Users", value: "1.2K", icon: Activity },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name} className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-600/10">
                  <Icon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-muted-foreground">{stat.name}</p>
                  <p className="text-2xl font-semibold">{stat.value}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}