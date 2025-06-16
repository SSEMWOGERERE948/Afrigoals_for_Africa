import { type NextRequest, NextResponse } from "next/server"

// Mock database - replace with your actual database
const products: any[] = [
  {
    id: "1",
    name: "KCCA FC Home Jersey 2024",
    description: "Official home jersey for the 2024 season",
    price: 30000,
    originalPrice: 45000,
    images: ["/placeholder.svg?height=400&width=400"],
    categoryId: "1",
    sku: "KCCA-HOME-2024",
    stock: 50,
    isActive: true,
    isFeatured: true,
    teamId: "1",
    tags: ["jersey", "home", "official"],
    rating: 4.5,
    reviewCount: 23,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

// GET /api/products/[id] - Fetch single product
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const product = products.find((p) => p.id === params.id)

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

// PUT /api/products/[id] - Update product
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const productIndex = products.findIndex((p) => p.id === params.id)

    if (productIndex === -1) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    products[productIndex] = {
      ...products[productIndex],
      ...body,
      updatedAt: new Date(),
    }

    return NextResponse.json({ product: products[productIndex] })
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

// DELETE /api/products/[id] - Delete product
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const productIndex = products.findIndex((p) => p.id === params.id)

    if (productIndex === -1) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    products.splice(productIndex, 1)

    return NextResponse.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
