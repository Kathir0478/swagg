export type Role = "USER" | "CUSTOMER" | "RESTAURANT" | "RIDER" | "ADMIN"

export type Gender = "MALE" | "FEMALE" | "OTHER"

export type FoodCategory =
  | "VEG"
  | "NON_VEG"
  | "STARTER"
  | "BEVERAGE"
  | "DESSERT"
  | "SALAD"
  | "SOUP"
  | "MAIN_COURSE"
  | "SIDE_DISH"
  | "APPETIZER"

export const FOOD_CATEGORIES: FoodCategory[] = [
  "VEG",
  "NON_VEG",
  "STARTER",
  "BEVERAGE",
  "DESSERT",
  "SALAD",
  "SOUP",
  "MAIN_COURSE",
  "SIDE_DISH",
  "APPETIZER",
]

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY_FOR_PICKUP"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"

export type CartStatus = "ACTIVE" | "ABANDONED" | "ORDERED"

export interface ApiResponse<T = unknown> {
  success?: boolean
  message?: string
  data?: T
  count?: number
  // auth-specific
  accessToken?: string
  refreshToken?: string
  tempUserId?: string
  tempCustomerId?: string
  tempRestaurantId?: string
  tempRiderId?: string
  customerId?: string
  restaurantId?: string
  riderId?: string
  foodId?: string
}

export interface Food {
  foodId: string
  name: string
  description?: string
  price: number
  rating?: number
  reviewCount?: number
  category: FoodCategory
  restaurantId: string
  isAvailable: boolean
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface Restaurant {
  restaurantId: string
  id?: string
  username?: string
  description?: string
  lat?: number
  lng?: number
  opentime?: string
  closetime?: string
  imageurl?: string
}

export interface Customer {
  customerId: string
  username?: string
  address?: string
  dob?: string
  gender?: Gender
  lat?: number
  lng?: number
}

export interface Rider {
  riderId: string
  username?: string
  address?: string
  gender?: Gender
  lat?: number
  lng?: number
  vehicleNumber?: string
  dlNumber?: string
}

export interface Cart {
  cartId: string
  customerId: string
  restaurantId: string
  foodIds: string[]
  totalPrice: number
  status: CartStatus
  isActive: boolean
  itemCount: number
  createdAt?: string
  updatedAt?: string
}

export interface Order {
  orderId: string
  customerId: string
  riderId?: string
  restaurantId: string
  cartId: string
  status: OrderStatus
  instruction?: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}
