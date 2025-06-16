import { type NextRequest, NextResponse } from "next/server"

// Mock database - replace with your actual database
const categories = [
  {
    id: "1",
    name: "Jerseys",
    slug: "jerseys",
    description: "Official team jerseys and kits",
    isActive: true,
    sortOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    name: "Training Gear",
    slug: "training-gear",
    description: "Training equipment and apparel",
    isActive: true,
    sortOrder: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    name: "Accessories",
    slug: "accessories",
    description: "Sports accessories and merchandise",
    isActive: true,
    sortOrder: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "4",
    name: "Equipment",
    slug: "equipment",
    description: "Sports equipment and gear",
    isActive: true,
    sortOrder: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "5",
    name: "Footwear",
    slug: "footwear",
    description: "Sports shoes and boots",
    isActive: true,
    sortOrder: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

// GET /api/categories - Fetch all categories
export async function GET() {
  try {
    return NextResponse.json({ categories })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}

// POST /api/categories - Create new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const newCategory = {
      id: Date.now().toString(),
      ...body,
      slug: body.name.toLowerCase().replace(/\s+/g, "-"),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    categories.push(newCategory)

    return NextResponse.json({ category: newCategory }, { status: 201 })
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
  }
}
