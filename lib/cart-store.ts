"use client"

import { create } from "zustand"
import type { Product, ProductVariant } from "@/app/types"

export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  image: string
  variant?: {
    id: string
    name: string
    value: string
  }
  totalPrice: number
}

interface CartStore {
  items: CartItem[]
  isLoading: boolean

  // Actions
  addItem: (product: Product, quantity?: number, variant?: ProductVariant) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void

  // Calculation methods
  getCartTotal: () => number
  getCartSubtotal: () => number
  getCartTax: () => number
  getCartShipping: () => number
  getCartItemCount: () => number
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isLoading: false,

  addItem: (product: Product, quantity = 1, variant?: ProductVariant) => {
    set({ isLoading: true })

    const items = get().items
    const price = variant?.price || product.price
    const itemId = `${product.id}_${variant?.id || "default"}`

    const existingItemIndex = items.findIndex((item) => item.id === itemId)

    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedItems = [...items]
      updatedItems[existingItemIndex].quantity += quantity
      updatedItems[existingItemIndex].totalPrice =
        updatedItems[existingItemIndex].price * updatedItems[existingItemIndex].quantity

      set({ items: updatedItems, isLoading: false })
    } else {
      // Add new item
      const newItem: CartItem = {
        id: itemId,
        productId: product.id,
        name: product.name,
        price,
        quantity,
        image: product.images[0] || "/placeholder.svg?height=64&width=64",
        variant: variant
          ? {
              id: variant.id,
              name: variant.name,
              value: variant.value,
            }
          : undefined,
        totalPrice: price * quantity,
      }

      set({ items: [...items, newItem], isLoading: false })
    }
  },

  removeItem: (itemId: string) => {
    const items = get().items.filter((item) => item.id !== itemId)
    set({ items })
  },

  updateQuantity: (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeItem(itemId)
      return
    }

    const items = get().items.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          quantity,
          totalPrice: item.price * quantity,
        }
      }
      return item
    })

    set({ items })
  },

  clearCart: () => {
    set({ items: [] })
  },

  // Calculate subtotal (sum of all item totals)
  getCartSubtotal: () => {
    return get().items.reduce((subtotal, item) => subtotal + item.totalPrice, 0)
  },

  // Calculate tax (18% VAT for Uganda)
  getCartTax: () => {
    const subtotal = get().getCartSubtotal()
    return Math.round(subtotal * 0.18) // 18% VAT, rounded to nearest whole number
  },

  // Calculate shipping (free shipping over 100,000 UGX)
  getCartShipping: () => {
    const subtotal = get().getCartSubtotal()
    return subtotal >= 100000 ? 0 : 5000 // Free shipping over 100,000 UGX, otherwise 5,000 UGX
  },

  // Calculate final total (subtotal + tax + shipping)
  getCartTotal: () => {
    const subtotal = get().getCartSubtotal()
    const tax = get().getCartTax()
    const shipping = get().getCartShipping()
    return subtotal + tax + shipping
  },

  // Get total number of items in cart
  getCartItemCount: () => {
    return get().items.reduce((count, item) => count + item.quantity, 0)
  },
}))
