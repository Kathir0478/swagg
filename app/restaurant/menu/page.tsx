"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { apiRequest, getAccessToken } from "@/lib/api"
import { getEndpointConfig } from "@/lib/api-endpoints"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Utensils, Plus, Edit, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface FoodItem {
  foodId: string
  foodName: string
  description: string
  price: number
  rating: number
  reviewCount: number
  category: string
  restaurantId: string
  isAvailable: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function RestaurantMenuPage() {
  const router = useRouter()
  const { roles, activeRole } = useAuth()
  const [loading, setLoading] = useState(true)
  const [foods, setFoods] = useState<FoodItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 50000 })
  const [categories, setCategories] = useState<string[]>([])
  
  // Add/Edit food item state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null)
  const [originalFoodData, setOriginalFoodData] = useState<FoodItem | null>(null)
  const [foodForm, setFoodForm] = useState({
    foodName: "",
    description: "",
    price: "",
    category: "",
    isAvailable: true
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const foodCategories = [
    { value: "VEG", label: "Vegetarian" },
    { value: "NON_VEG", label: "Non-Vegetarian" },
    { value: "STARTER", label: "Starter" },
    { value: "BEVERAGE", label: "Beverage" },
    { value: "DESSERT", label: "Dessert" },
    { value: "SALAD", label: "Salad" },
    { value: "SOUP", label: "Soup" },
    { value: "MAIN_COURSE", label: "Main Course" },
    { value: "SIDE_DISH", label: "Side Dish" },
    { value: "APPETIZER", label: "Appetizer" }
  ]

  useEffect(() => {
    // Check if user is restaurant role
    if (activeRole && activeRole !== "RESTAURANT") {
      // Redirect to respective page based on role
      if (activeRole === "CUSTOMER") {
        router.push("/")
      } else if (activeRole === "RIDER") {
        router.push("/rider")
      }
      return
    }

    fetchFoods()
  }, [activeRole, router])

  const fetchFoods = async () => {
    const token = getAccessToken()
    if (!token) {
      router.push("/login")
      return
    }

    try {
      // Fetch foods for authenticated restaurant using JWT token
      const foodsConfig = getEndpointConfig('FOODS_LIST')
      const foodsResponse = await apiRequest<FoodItem[]>(foodsConfig.path, { method: foodsConfig.method, auth: foodsConfig.auth })

      if (foodsResponse.data) {
        // Sort foods by createdAt to maintain consistent order
        const sortedFoods = [...foodsResponse.data].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        setFoods(sortedFoods)
        // Extract unique categories
        const uniqueCategories = Array.from(new Set(sortedFoods.map(food => food.category)))
        setCategories(uniqueCategories)
      }
    } catch (err) {
      console.error("Failed to load foods", err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddFood = () => {
    setFoodForm({
      foodName: "",
      description: "",
      price: "",
      category: "",
      isAvailable: true
    })
    setIsAddDialogOpen(true)
  }

  const handleEditFood = (food: FoodItem) => {
    setSelectedFood(food)
    setOriginalFoodData(food)
    setFoodForm({
      foodName: food.foodName,
      description: food.description,
      price: food.price.toString(),
      category: food.category,
      isAvailable: food.isAvailable
    })
    setIsEditDialogOpen(true)
  }

  const handleDeleteFood = async (foodId: string) => {
    if (!confirm("Are you sure you want to delete this food item?")) {
      return
    }

    try {
      const config = getEndpointConfig('FOODS_DELETE')
      const path = config.path.replace(':foodId', foodId)
      await apiRequest(path, { method: config.method, auth: config.auth })
      toast.success("Food item deleted successfully")
      fetchFoods()
    } catch (err) {
      toast.error("Failed to delete food item")
    }
  }

  const handleToggleAvailability = async (food: FoodItem) => {
    try {
      const config = getEndpointConfig('FOODS_SET_AVAILABILITY')
      const path = config.path.replace(':foodId', food.foodId)
      await apiRequest(path, {
        method: config.method,
        body: { isAvailable: !food.isAvailable },
        auth: config.auth
      })
      toast.success(`Food item marked as ${food.isAvailable ? 'unavailable' : 'available'}`)
      fetchFoods()
    } catch (err) {
      toast.error("Failed to update availability")
    }
  }

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!foodForm.foodName || foodForm.foodName.length < 3 || foodForm.foodName.length > 100) {
      toast.error("Food name must be between 3 and 100 characters")
      return
    }
    if (foodForm.description && foodForm.description.length > 500) {
      toast.error("Description cannot exceed 500 characters")
      return
    }
    if (!foodForm.price || Number(foodForm.price) < 1) {
      toast.error("Price must be greater than 0")
      return
    }
    if (!foodForm.category) {
      toast.error("Category is required")
      return
    }

    setIsSubmitting(true)
    try {
      // First get restaurantId
      const profileConfig = getEndpointConfig('RESTAURANTS_GET_BY_USER')
      const profile = await apiRequest<{ restaurantId: string }>(profileConfig.path, { method: profileConfig.method, auth: profileConfig.auth })
      const profileData = (profile as any).data || profile
      
      if (!profileData?.restaurantId) {
        toast.error("Restaurant ID not found")
        return
      }

      const payload = {
        foodName: foodForm.foodName,
        description: foodForm.description,
        price: Number(foodForm.price),
        category: foodForm.category,
        restaurantId: profileData.restaurantId,
        isAvailable: foodForm.isAvailable
      }

      const config = getEndpointConfig('FOODS_CREATE')
      await apiRequest(config.path, {
        method: config.method,
        body: payload,
        auth: config.auth
      })

      toast.success("Food item added successfully")
      setIsAddDialogOpen(false)
      fetchFoods()
    } catch (err) {
      console.error("Error adding food item:", err)
      toast.error("Failed to add food item")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedFood || !originalFoodData) return

    // Validation
    if (!foodForm.foodName || foodForm.foodName.length < 3 || foodForm.foodName.length > 100) {
      toast.error("Food name must be between 3 and 100 characters")
      return
    }
    if (foodForm.description && foodForm.description.length > 500) {
      toast.error("Description cannot exceed 500 characters")
      return
    }
    if (!foodForm.price || Number(foodForm.price) < 1) {
      toast.error("Price must be greater than 0")
      return
    }
    if (!foodForm.category) {
      toast.error("Category is required")
      return
    }

    setIsSubmitting(true)
    try {
      const updateData: Record<string, unknown> = {}

      // Only include changed fields
      if (foodForm.foodName !== originalFoodData.foodName) {
        updateData.foodName = foodForm.foodName
      }
      if (foodForm.description !== originalFoodData.description) {
        updateData.description = foodForm.description
      }
      if (Number(foodForm.price) !== originalFoodData.price) {
        updateData.price = Number(foodForm.price)
      }
      if (foodForm.category !== originalFoodData.category) {
        updateData.category = foodForm.category
      }
      if (foodForm.isAvailable !== originalFoodData.isAvailable) {
        updateData.isAvailable = foodForm.isAvailable
      }

      // Check if there are any changes
      if (Object.keys(updateData).length === 0) {
        toast.info("No changes to update")
        setIsEditDialogOpen(false)
        setSelectedFood(null)
        setOriginalFoodData(null)
        return
      }

      const config = getEndpointConfig('FOODS_UPDATE')
      const path = config.path.replace(':foodId', selectedFood.foodId)
      await apiRequest(path, {
        method: config.method,
        body: updateData,
        auth: config.auth
      })

      toast.success("Food item updated successfully")
      setIsEditDialogOpen(false)
      setSelectedFood(null)
      setOriginalFoodData(null)
      fetchFoods()
    } catch (err) {
      toast.error("Failed to update food item")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter foods based on search, category, and price
  const filteredFoods = foods.filter(food => {
    const matchesSearch = (food.foodName?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
                         (food.description?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || food.category === selectedCategory
    const matchesPrice = food.price >= priceRange.min && food.price <= priceRange.max
    return matchesSearch && matchesCategory && matchesPrice
  })

  // Group foods by category
  const groupedFoods = filteredFoods.reduce((acc, food) => {
    if (!acc[food.category]) {
      acc[food.category] = []
    }
    acc[food.category].push(food)
    return acc
  }, {} as Record<string, FoodItem[]>)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">Restaurant Menu</h1>
          <p className="text-sm text-muted-foreground">Manage your restaurant menu items</p>
        </div>
        <Button onClick={handleAddFood}>
          <Plus className="size-4 mr-2" />
          Add Food Item
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="size-5" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="search">Search Foods</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="search"
                  placeholder="Search by name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="flex flex-col gap-2">
              <Label>Price Range</Label>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="minPrice" className="text-xs">Min</Label>
                  <Input
                    id="minPrice"
                    type="number"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                    placeholder="0"
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="maxPrice" className="text-xs">Max</Label>
                  <Input
                    id="maxPrice"
                    type="number"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                    placeholder="1000"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Menu Items Grouped by Category */}
      {Object.keys(groupedFoods).length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Utensils className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No food items found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(groupedFoods).map(([category, categoryFoods]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle>{category}</CardTitle>
              <CardDescription>{categoryFoods.length} items</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categoryFoods.map(food => (
                  <Card key={food.foodId}>
                    <CardHeader>
                      <CardTitle className="text-xl">{food.foodName}</CardTitle>
                      <CardDescription className="line-clamp-2 text-xs">{food.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl font-bold">₹{food.price.toFixed(2)}</span>
                        <Button
                          size="sm"
                          variant={food.isAvailable ? "default" : "outline"}
                          className={food.isAvailable ? "bg-green-600 hover:bg-green-700" : ""}
                          onClick={() => handleToggleAvailability(food)}
                        >
                          {food.isAvailable ? 'Available' : 'Unavailable'}
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleEditFood(food)}
                        >
                          <Edit className="size-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex-1"
                          onClick={() => handleDeleteFood(food.foodId)}
                        >
                          <Trash2 className="size-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {/* Add Food Item Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Food Item</DialogTitle>
            <DialogDescription>Add a new food item to your restaurant menu</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="foodName">Food Name *</Label>
              <Input
                id="foodName"
                value={foodForm.foodName}
                onChange={(e) => setFoodForm({ ...foodForm, foodName: e.target.value })}
                placeholder="Enter food name (3-100 characters)"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={foodForm.description}
                onChange={(e) => setFoodForm({ ...foodForm, description: e.target.value })}
                placeholder="Enter description (max 500 characters)"
                rows={3}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                value={foodForm.price}
                onChange={(e) => setFoodForm({ ...foodForm, price: e.target.value })}
                placeholder="Enter price (min 1)"
                required
                min="1"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={foodForm.category || ""}
                onValueChange={(value) => setFoodForm({ ...foodForm, category: value || "" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {foodCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isAvailable"
                checked={foodForm.isAvailable}
                onChange={(e) => setFoodForm({ ...foodForm, isAvailable: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="isAvailable">Available for ordering</Label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Food Item"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Food Item Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Food Item</DialogTitle>
            <DialogDescription>Edit the selected food item</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="editFoodName">Food Name *</Label>
              <Input
                id="editFoodName"
                value={foodForm.foodName}
                onChange={(e) => setFoodForm({ ...foodForm, foodName: e.target.value })}
                placeholder="Enter food name (3-100 characters)"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="editDescription">Description</Label>
              <Textarea
                id="editDescription"
                value={foodForm.description}
                onChange={(e) => setFoodForm({ ...foodForm, description: e.target.value })}
                placeholder="Enter description (max 500 characters)"
                rows={3}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="editPrice">Price *</Label>
              <Input
                id="editPrice"
                type="number"
                value={foodForm.price}
                onChange={(e) => setFoodForm({ ...foodForm, price: e.target.value })}
                placeholder="Enter price (min 1)"
                required
                min="1"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="editCategory">Category *</Label>
              <Select
                value={foodForm.category || ""}
                onValueChange={(value) => setFoodForm({ ...foodForm, category: value || "" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {foodCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="editIsAvailable"
                checked={foodForm.isAvailable}
                onChange={(e) => setFoodForm({ ...foodForm, isAvailable: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="editIsAvailable">Available for ordering</Label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false)
                  setSelectedFood(null)
                  setOriginalFoodData(null)
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Food Item"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
