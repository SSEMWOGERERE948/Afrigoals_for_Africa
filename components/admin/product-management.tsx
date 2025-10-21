"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Package, DollarSign, TrendingUp, Eye, Search, Save, X } from "lucide-react"
import Image from "next/image"
import { fetchAllTeams } from "@/components/team_api"
import { toast } from "sonner"
import { createProduct, deleteProduct, getAllProducts, getProductById, updateProduct } from "@/lib/products/api"

interface Product {
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

interface Category {
  id: string
  name: string
  slug: string
  active: boolean
}

interface Team {
  id: string
  name: string
  logo: string
  league: string
}

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    sku: "",
    stock: "",
    categoryId: "",
    teamId: "",
    tags: "",
    featured: false,
    active: true,
    images: [""],
  })

  useEffect(() => {
    fetchProducts()
    fetchTeamsData()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const data = await getAllProducts()
      setProducts(data.products || [])
      setCategories(data.categories || [])

      // Don't overwrite teams if we already loaded them from fetchAllTeams
      if (data.teams && data.teams.length > 0 && teams.length === 0) {
        setTeams(data.teams || [])
      }

      console.log("✅ Products loaded:", data.products?.length || 0)
    } catch (error) {
      console.error("❌ Error fetching products:", error)
      toast.error("Failed to load products")
    } finally {
      setLoading(false)
    }
  }

  const fetchTeamsData = async () => {
    try {
      const teamData = await fetchAllTeams()
      setTeams(teamData)
      console.log("✅ Teams loaded:", teamData.length)
    } catch (error) {
      console.error("❌ Failed to fetch teams:", error)
      toast.error("Failed to load teams")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const productData = {
        ...formData,
        teamId: formData.teamId === "none" ? "" : formData.teamId,
        price: Number.parseFloat(formData.price),
        originalPrice: formData.originalPrice ? Number.parseFloat(formData.originalPrice) : undefined,
        stock: Number.parseInt(formData.stock),
        tags: formData.tags.split(",").map((tag) => tag.trim()),
        images: formData.images.filter((img) => img.trim() !== ""),
      }

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData)
        toast.success("Product updated successfully")
      } else {
        await createProduct(productData)
        toast.success("Product created successfully")
      }

      await fetchProducts()
      resetForm()
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error saving product:", error)
      toast.error(editingProduct ? "Failed to update product" : "Failed to create product")
    }
  }

  const handleEdit = async (productOrId: Product | string) => {
    let product: Product

    if (typeof productOrId === "string") {
      try {
        const response = await getProductById(productOrId)
        product = response.product
      } catch (error) {
        console.error("Failed to fetch product by ID", error)
        toast.error("Failed to load product details")
        return
      }
    } else {
      product = productOrId
    }

    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || "",
      sku: product.sku,
      stock: product.stock.toString(),
      categoryId: product.categoryId,
      teamId: product.teamId || "",
      tags: product.tags.join(", "),
      featured: product.featured,
      active: product.active,
      images: product.images.length > 0 ? product.images : [""],
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      await deleteProduct(productId)
      await fetchProducts()
      toast.success("Product deleted successfully")
    } catch (error) {
      console.error("Error deleting product:", error)
      toast.error("Failed to delete product")
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      originalPrice: "",
      sku: "",
      stock: "",
      categoryId: "",
      teamId: "",
      tags: "",
      featured: false,
      active: true,
      images: [""],
    })
    setEditingProduct(null)
  }

  const addImageField = () => {
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ""],
    }))
  }

  const updateImageField = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => (i === index ? value : img)),
    }))
  }

  const removeImageField = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.categoryId === selectedCategory
    return matchesSearch && matchesCategory
  })

  const stats = {
    total: products.length,
    active: products.filter((p) => p.active).length,
    featured: products.filter((p) => p.featured).length,
    lowStock: products.filter((p) => p.stock < 10).length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-green-600">Product Management</h1>
          <p className="text-muted-foreground">Manage your store products and inventory</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700" onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="sku">SKU *</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => setFormData((prev) => ({ ...prev, sku: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="price">Price (UGX) *</Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="originalPrice">Original Price (UGX)</Label>
                      <Input
                        id="originalPrice"
                        type="number"
                        value={formData.originalPrice}
                        onChange={(e) => setFormData((prev) => ({ ...prev, originalPrice: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="stock">Stock Quantity *</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData((prev) => ({ ...prev, stock: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                {/* Categories and Teams */}
                <div className="space-y-4">
                  {/* <div>
                    <Label htmlFor="categoryId">Category *</Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, categoryId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div> */}

                  <div>
                    <Label htmlFor="teamId">Team (Optional)</Label>
                    <Select
                      value={formData.teamId}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, teamId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a team" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="none">No Team</SelectItem>

                        {teams && teams.length > 0 ? (
                          teams.map((team) => (
                            <SelectItem key={team.id} value={String(team.id)}>
                              {team.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="loading" disabled>
                            Loading teams...
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    {teams.length === 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Loading teams... If teams don't appear, please refresh.
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
                      placeholder="jersey, official, home"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="featured"
                        checked={formData.featured}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({ ...prev, featured: checked as boolean }))
                        }
                      />
                      <Label htmlFor="featured">Featured Product</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="active"
                        checked={formData.active}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({ ...prev, active: checked as boolean }))
                        }
                      />
                      <Label htmlFor="active">Active</Label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  required
                />
              </div>

              {/* Images */}
              <div>
                <Label>Product Images</Label>
                <div className="space-y-2">
                  {formData.images.map((image, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={image}
                        onChange={(e) => updateImageField(index, e.target.value)}
                        placeholder="Image URL or path"
                      />
                      {formData.images.length > 1 && (
                        <Button type="button" variant="outline" size="sm" onClick={() => removeImageField(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addImageField}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Image
                  </Button>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  <Save className="h-4 w-4 mr-2" />
                  {editingProduct ? "Update Product" : "Create Product"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Featured</p>
                <p className="text-2xl font-bold">{stats.featured}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold">{stats.lowStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products ({filteredProducts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading products...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  {/* <TableHead>Category</TableHead> */}
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 flex-shrink-0">
                            <Image
                              src={product.images[0] || "/placeholder.svg?height=48&width=48"}
                              alt={product.name}
                              fill
                              className="object-cover rounded"
                            />
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">{product.sku}</p>
                          </div>
                        </div>
                      </TableCell>
                      {/* <TableCell>{categories.find((c) => c.id === product.categoryId)?.name || "Unknown"}</TableCell> */}
                      <TableCell>
                        <div>
                          <p className="font-semibold">UGX {product.price.toLocaleString()}</p>
                          {product.originalPrice && (
                            <p className="text-sm text-muted-foreground line-through">
                              UGX {product.originalPrice.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.stock < 10 ? "destructive" : "secondary"}>{product.stock} units</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {product.active && <Badge variant="secondary">Active</Badge>}
                          {product.featured && <Badge variant="default">Featured</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No products found. Add your first product using the button above.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
