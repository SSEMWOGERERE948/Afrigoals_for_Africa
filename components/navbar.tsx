"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Percent as Soccer, Sun, Moon, Settings } from "lucide-react";
import { useTheme } from "next-themes";

export default function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const routes = [
    { name: "Matches", path: "/" },
    { name: "News", path: "/news" },
    { name: "Leagues", path: "/leagues" },
    { name: "Teams", path: "/teams" },
  ];

  return (
    <nav className="border-b bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Soccer className="h-8 w-8 text-green-600" />
              <span className="text-xl font-bold text-green-600">Afrigoals</span>
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-center space-x-4">
                {routes.map((route) => (
                  <Link
                    key={route.path}
                    href={route.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      pathname === route.path
                        ? "bg-green-600 text-white"
                        : "text-foreground hover:bg-green-600/10"
                    }`}
                  >
                    {route.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/admin"
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                pathname.startsWith('/admin')
                  ? "bg-green-600 text-white"
                  : "text-foreground hover:bg-green-600/10"
              }`}
            >
              <Settings className="h-4 w-4 mr-2" />
              Admin
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}