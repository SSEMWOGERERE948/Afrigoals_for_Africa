"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Percent as Soccer, Sun, Moon, Menu, X } from "lucide-react";
import { useTheme } from "next-themes";

export default function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          {/* Left Section: Logo & Links */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Soccer className="h-8 w-8 text-green-600" />
              <span className="text-xl font-bold text-green-600">Afrigoals</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-4">
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

          {/* Right Section: Theme Toggle & Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {/* Mobile Menu Button (Visible on small screens) */}
            <button
              className="md:hidden flex items-center justify-center p-2 rounded-md text-foreground hover:bg-green-600/10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown (Visible when toggled) */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-card border-t">
          <div className="px-4 py-3 space-y-2">
            {routes.map((route) => (
              <Link
                key={route.path}
                href={route.path}
                className={`block px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === route.path
                    ? "bg-green-600 text-white"
                    : "text-foreground hover:bg-green-600/10"
                }`}
                onClick={() => setMobileMenuOpen(false)} // Close menu on click
              >
                {route.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
