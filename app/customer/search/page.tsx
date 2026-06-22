"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getAllFoods, listRestaurants } from "@/lib/services"
import type { Food, Restaurant } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, UtensilsCrossed, ArrowLeft, Store } from "lucide-react"
import { useCart } from "@/components/cart-provider"

export default function CustomerSearchPage() {
  const [loading, setLoading] = useState(true)
  const [foods, setFoods] = useState<Food[]>([])
  const [restaurants, setRestaurants] = useState<Record<string, Restaurant>>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("all")
  const [categories, setCategories] = useState<string[]>([])
  const { cart } = useCart()

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
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [foodsData, restaurantsData] = await Promise.all([
        getAllFoods(),
        listRestaurants()
      ])
      
      setFoods(foodsData)
      
      // Create restaurant lookup map
      const restaurantMap: Record<string, Restaurant> = {}
      restaurantsData.forEach((r: Restaurant) => {
        restaurantMap[r.restaurantId] = r
      })
      setRestaurants(restaurantMap)
      
      // Extract unique categories
      const uniqueCategories = Array.from(new Set(foodsData.map(food => food.category)))
      setCategories(uniqueCategories)
    } catch (err) {
      console.error("Failed to load data", err)
    } finally {
      setLoading(false)
    }
  }

  // Filter foods based on search, category, and restaurant
  const filteredFoods = foods.filter(food => {
    const matchesSearch = (food.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
                         (food.description?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || food.category === selectedCategory
    const matchesRestaurant = selectedRestaurant === "all" || food.restaurantId === selectedRestaurant
    const isAvailable = food.isAvailable && food.isActive
    return matchesSearch && matchesCategory && matchesRestaurant && isAvailable
  })

  // Group foods by restaurant
  const groupedFoods = filteredFoods.reduce((acc, food) => {
    if (!acc[food.restaurantId]) {
      acc[food.restaurantId] = []
    }
    acc[food.restaurantId].push(food)
    return acc
  }, {} as Record<string, Food[]>)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/customer">
          <Button variant="outline" size="icon">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold tracking-tight text-balance">Search Foods</h1>
          <p className="text-sm text-muted-foreground">Find your favorite dishes across all restaurants</p>
        </div>
        {cart && cart.itemCount > 0 && (
          <Link href="/customer/cart">
            <Badge className="gap-1">
              <UtensilsCrossed className="size-3" />
              {cart.itemCount} in cart
            </Badge>
          </Link>
        )}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="size-5" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Search Foods</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Restaurant Filter */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Restaurant</label>
              <Select value={selectedRestaurant} onValueChange={(value) => value && setSelectedRestaurant(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Restaurants" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Restaurants</SelectItem>
                  {Object.values(restaurants).map(restaurant => (
                    <SelectItem key={restaurant.restaurantId} value={restaurant.restaurantId}>
                      {restaurant.username || "Restaurant"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={selectedCategory} onValueChange={(value) => value && setSelectedCategory(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {foodCategories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {Object.keys(groupedFoods).length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No foods found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Found {filteredFoods.length} food item{filteredFoods.length !== 1 ? 's' : ''}
          </p>
          {Object.entries(groupedFoods).map(([restaurantId, restaurantFoods]) => {
            const restaurant = restaurants[restaurantId]
            return (
              <Card key={restaurantId}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="size-5" />
                    {restaurant?.username || "Restaurant"}
                  </CardTitle>
                  <CardDescription>{restaurantFoods.length} items</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {restaurantFoods.map(food => (
                      <Link key={food.foodId} href={`/customer/restaurant/${food.restaurantId}`}>
                        <Card className="h-full cursor-pointer hover:shadow-md transition-shadow">
                          <CardHeader>
                            <CardTitle className="text-lg">{food.name}</CardTitle>
                            <CardDescription className="line-clamp-2 text-xs">{food.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between">
                              <span className="text-xl font-bold">₹{food.price.toFixed(2)}</span>
                              <Badge variant="secondary" className="text-[10px]">
                                {food.category.replace(/_/g, " ")}
                              </Badge>
                            </div>
                            {food.rating && food.rating > 0 && (
                              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                                <span>⭐ {food.rating.toFixed(1)}</span>
                                <span>({food.reviewCount || 0} reviews)</span>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
