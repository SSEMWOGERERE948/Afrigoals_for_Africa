const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/products"

export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  sku: string
  stock: number
  images: string[]
  categoryId: string
  teamId?: string
  tags: string[]
  featured: boolean
  active: boolean
  rating: number
  reviewCount: number
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  name: string
  slug: string
  active: boolean
}

export interface ProductsResponse {
  products: Product[]
  categories: Category[]
  teams: any[]
}

export const getAllProducts = async (): Promise<ProductsResponse> => {
  const res = await fetch(`${BASE_URL}/`)
  if (!res.ok) throw new Error("Failed to fetch products")
  return await res.json()
}

export const createProduct = async (product: any) => {
  const res = await fetch(`${BASE_URL}/createProduct`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  })
  if (!res.ok) throw new Error("Failed to create product")
  return await res.json()
}

export const updateProduct = async (id: string, product: any) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  })
  if (!res.ok) throw new Error("Failed to update product")
  return await res.json()
}

export const deleteProduct = async (id: string) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error("Failed to delete product")
  return await res.json()
}

export const getProductById = async (id: string) => {
  const res = await fetch(`${BASE_URL}/${id}`)
  if (!res.ok) throw new Error("Failed to fetch product")
  return await res.json()
}