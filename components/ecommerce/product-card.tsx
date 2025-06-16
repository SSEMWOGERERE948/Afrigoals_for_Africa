"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, ShoppingCart, Star, Eye } from "lucide-react"
import { useCartStore } from "@/lib/cart-store"
import type { Product } from "@/app/types"

interface ProductCardProps {
  product: Product
  showTeamBadge?: boolean
}

export default function ProductCard({ product, showTeamBadge = true }: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const addItem = useCartStore((state) => state.addItem)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setIsLoading(true)
    try {
      addItem(product, 1)
      // You could add a toast notification here
    } catch (error) {
      console.error("Failed to add to cart:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsWishlisted(!isWishlisted)
    // Implement wishlist logic here
  }

  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  return (
    <Link href={`/store/products/${product.id}`}>
      <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
        <div className="relative overflow-hidden">
          <div className="aspect-square relative">
            <Image
              src={product.images[0] || "/placeholder.svg?height=300&width=300&query=product"}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {discountPercentage > 0 && (
                <Badge variant="destructive" className="text-xs">
                  -{discountPercentage}%
                </Badge>
              )}
              {product.isFeatured && (
                <Badge variant="secondary" className="text-xs">
                  Featured
                </Badge>
              )}
              {showTeamBadge && product.team && (
                <Badge variant="outline" className="text-xs">
                  {product.team.name}
                </Badge>
              )}
            </div>

            {/* Action buttons */}
            <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="sm" variant="secondary" className="h-8 w-8 p-0" onClick={handleWishlist}>
                <Heart className={`h-4 w-4 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
              <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                <Eye className="h-4 w-4" />
              </Button>
            </div>

            {/* Stock status */}
            {product.stock <= 0 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Badge variant="destructive">Out of Stock</Badge>
              </div>
            )}
          </div>
        </div>

        <CardContent className="p-4">
          <div className="space-y-2">
            {/* Category */}
            <div className="text-xs text-muted-foreground uppercase tracking-wide">{product.category.name}</div>

            {/* Product name */}
            <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">{product.name}</h3>

            {/* Rating */}
            <div className="flex items-center gap-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">${product.price.toFixed(2)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</span>
              )}
            </div>

            {/* Add to cart button */}
            <Button className="w-full" onClick={handleAddToCart} disabled={isLoading || product.stock <= 0}>
              {isLoading ? (
                "Adding..."
              ) : product.stock <= 0 ? (
                "Out of Stock"
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
