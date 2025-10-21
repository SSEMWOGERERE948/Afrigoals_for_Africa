"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  Users, 
  Newspaper, 
  ArrowLeftRight, 
  Trophy,
  Calendar,
  Settings,
  UserPlus,
  Store,
  UserCheck
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navigation = [
    { name: "Teams", href: "/admin/teams", icon: Users },
    { name: "Managers", href: "/admin/managers", icon: UserCheck },
    { name: "Players", href: "/admin/players", icon: UserPlus },
    { name: "News", href: "/admin/news", icon: Newspaper },
    { name: "Transfers", href: "/admin/transfers", icon: ArrowLeftRight },
    { name: "Futsal", href: "/admin/futsal", icon: Trophy },
    { name: "Fixtures", href: "/admin/matches", icon: Calendar },
      { name: "Store", href: "/admin/products", icon: Store },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-card border-r">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-green-600">Afrigoals Admin</h2>
          </div>
          <nav className="space-y-1 px-2">
            {navigation.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center px-3 py-2 text-sm font-medium rounded-md
                    ${active 
                      ? "bg-green-600 text-white" 
                      : "text-foreground hover:bg-accent"
                    }
                  `}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1">
          <main className="p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}