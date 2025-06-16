"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { ClubIcon as Soccer, Sun, Moon, Settings, ShoppingCart } from "lucide-react"
import { useCartStore } from "@/lib/cart-store"
import { CartSidebar } from "@/components/ecommerce/cart-sidebar"

export default function Navbar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const cartItemCount = useCartStore((state) => state.getCartItemCount())

  const [isCartOpen, setIsCartOpen] = useState(false)

  const routes = [
    { name: "Matches", path: "/" },
    { name: "News", path: "/news" },
    { name: "Leagues", path: "/leagues" },
    { name: "Teams", path: "/teams" },
    { name: "Store", path: "/store" },
  ]

  return (
    <nav className="border-b bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Side: Logo + Links */}
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

          {/* Right Side: Actions */}
          <div className="flex items-center space-x-4">
            {/* 🛒 Cart Button */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Button>

            {/* 🔒 Admin Link */}
            <Link
              href="/admin"
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                pathname.startsWith("/admin")
                  ? "bg-green-600 text-white"
                  : "text-foreground hover:bg-green-600/10"
              }`}
            >
              <Settings className="h-4 w-4 mr-2" />
              Admin
            </Link>

            {/* 🌞 Theme Toggle */}
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

      {/* 🧾 Cart Sidebar Drawer */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </nav>
  )
}
