"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ClubIcon as Soccer, Sun, Moon, Settings, ShoppingCart, Menu } from "lucide-react"
import { useCartStore } from "@/lib/cart-store"
import { CartSidebar } from "@/components/ecommerce/cart-sidebar"

export default function Navbar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const cartItemCount = useCartStore((state) => state.getCartItemCount())

  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const routes = [
    { name: "Matches", path: "/" },
    { name: "News", path: "/news" },
    { name: "Leagues", path: "/leagues" },
    { name: "Teams", path: "/teams" },
    { name: "Futsal", path: "/futsal" },
    { name: "Store", path: "/store" },
  ]

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <nav className="border-b bg-card sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Side: Logo + Desktop Links */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Soccer className="h-8 w-8 text-green-600" />
              <span className="text-xl font-bold text-green-600">Afrigoals</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:block ml-10">
              <div className="flex items-center space-x-4">
                {routes.map((route) => (
                  <Link
                    key={route.path}
                    href={route.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname === route.path ? "bg-green-600 text-white" : "text-foreground hover:bg-green-600/10"
                    }`}
                  >
                    {route.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side: Actions */}
          <div className="flex items-center space-x-2">
            {/* Cart Button */}
            <Button variant="ghost" size="icon" className="relative" onClick={() => setIsCartOpen(true)}>
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Button>

            {/* Admin Link - Hidden on mobile */}
            <Link
              href="/admin"
              className={`hidden sm:flex px-3 py-2 rounded-md text-sm font-medium items-center transition-colors ${
                pathname.startsWith("/admin") ? "bg-green-600 text-white" : "text-foreground hover:bg-green-600/10"
              }`}
            >
              <Settings className="h-4 w-4 mr-2" />
              Admin
            </Link>

            {/* Theme Toggle */}
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {/* Mobile Menu Button */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col h-full">
                  {/* Mobile Menu Header */}
                  <div className="flex items-center justify-between pb-4 border-b">
                    <Link href="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
                      <Soccer className="h-6 w-6 text-green-600" />
                      <span className="text-lg font-bold text-green-600">Afrigoals</span>
                    </Link>
                  </div>

                  {/* Mobile Navigation Links */}
                  <div className="flex flex-col space-y-2 py-6">
                    {routes.map((route) => (
                      <Link
                        key={route.path}
                        href={route.path}
                        onClick={closeMobileMenu}
                        className={`px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                          pathname === route.path ? "bg-green-600 text-white" : "text-foreground hover:bg-green-600/10"
                        }`}
                      >
                        {route.name}
                      </Link>
                    ))}
                  </div>

                  {/* Mobile Admin Link */}
                  <div className="border-t pt-4">
                    <Link
                      href="/admin"
                      onClick={closeMobileMenu}
                      className={`flex items-center px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                        pathname.startsWith("/admin")
                          ? "bg-green-600 text-white"
                          : "text-foreground hover:bg-green-600/10"
                      }`}
                    >
                      <Settings className="h-5 w-5 mr-3" />
                      Admin Panel
                    </Link>
                  </div>

                  {/* Mobile Menu Footer */}
                  <div className="mt-auto pt-6 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Theme</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="flex items-center gap-2"
                      >
                        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="ml-2">{theme === "dark" ? "Light" : "Dark"}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </nav>
  )
}
