import { NextRequest, NextResponse } from "next/server"

const BASE_URL = "http://localhost:8080/api/products"

export const getProductById = async (id: string) => {
  const res = await fetch(`${BASE_URL}/${id}`)
  if (!res.ok) throw new Error("Failed to fetch product")
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
