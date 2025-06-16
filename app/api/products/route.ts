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
  {
    id: "2",
    name: "Vipers SC Away Jersey 2024",
    description: "Official away jersey for the 2024 season",
    price: 30000,
    images: ["/placeholder.svg?height=400&width=400"],
    categoryId: "1",
    sku: "VIP-AWAY-2024",
    stock: 35,
    isActive: true,
    isFeatured: true,
    teamId: "2",
    tags: ["jersey", "away", "official"],
    rating: 4.3,
    reviewCount: 18,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

const categories = [
  { id: "1", name: "Jerseys", slug: "jerseys", isActive: true, sortOrder: 1 },
  { id: "2", name: "Training Gear", slug: "training-gear", isActive: true, sortOrder: 2 },
  { id: "3", name: "Accessories", slug: "accessories", isActive: true, sortOrder: 3 },
  { id: "4", name: "Equipment", slug: "equipment", isActive: true, sortOrder: 4 },
  { id: "5", name: "Footwear", slug: "footwear", isActive: true, sortOrder: 5 },
]

const teams = [
  {
    id: "1",
    name: "KCCA FC",
    logo: "/placeholder.svg?height=40&width=40",
    league: "Uganda Premier League",
  },
  {
    id: "2",
    name: "Vipers SC",
    logo: "/placeholder.svg?height=40&width=40",
    league: "Uganda Premier League",
  },
]

// GET /api/products - Fetch all products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const team = searchParams.get("team")
    const featured = searchParams.get("featured")
    const search = searchParams.get("search")

    let filteredProducts = [...products]

    // Apply filters
    if (category && category !== "all") {
      filteredProducts = filteredProducts.filter((p) => p.categoryId === category)
    }

    if (team && team !== "all") {
      filteredProducts = filteredProducts.filter((p) => p.teamId === team)
    }

    if (featured === "true") {
      filteredProducts = filteredProducts.filter((p) => p.isFeatured)
    }

    if (search) {
      const searchLower = search.toLowerCase()
      filteredProducts = filteredProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          p.tags.some((tag: string) => tag.toLowerCase().includes(searchLower)),
      )
    }

    // Add category and team details
    const productsWithDetails = filteredProducts.map((product) => ({
      ...product,
      category: categories.find((c) => c.id === product.categoryId),
      team: teams.find((t) => t.id === product.teamId),
    }))

    return NextResponse.json({
      products: productsWithDetails,
      categories,
      teams,
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

// POST /api/products - Create new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const newProduct = {
      id: Date.now().toString(),
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
      rating: 0,
      reviewCount: 0,
    }

    products.push(newProduct)

    return NextResponse.json({ product: newProduct }, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
