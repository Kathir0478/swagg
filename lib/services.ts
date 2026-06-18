import { apiRequest } from "./api"
import type { Cart, Customer, Food, FoodCategory, Order, Restaurant, Rider } from "./types"

// ---------- Restaurants ----------
export async function listRestaurants() {
    const res = await apiRequest<Restaurant[]>("/restaurants/list")
    return res.data ?? []
}

export async function getRestaurant(id: string) {
    const res = await apiRequest<Restaurant>(`/restaurants/${id}`, { auth: true })
    return res.data
}

export async function updateRestaurant(body: Record<string, unknown>) {
    return apiRequest<Restaurant>("/restaurants/update", { method: "PUT", body, auth: true })
}

// ---------- Customers ----------
export async function getCustomer(id: string) {
    const res = await apiRequest<Customer>(`/customers/${id}`, { auth: true })
    return res.data
}

export async function updateCustomer(body: Record<string, unknown>) {
    return apiRequest<Customer>("/customers/update", { method: "PUT", body, auth: true })
}

// ---------- Riders ----------
export async function getRider(id: string) {
    const res = await apiRequest<Rider>(`/riders/${id}`, { auth: true })
    return res.data
}

export async function updateRider(body: Record<string, unknown>) {
    return apiRequest<Rider>("/riders/update", { method: "PUT", body, auth: true })
}

export async function deleteRider(riderId: string) {
    return apiRequest(`/riders/${riderId}`, { method: "DELETE", auth: true })
}

// ---------- Foods ----------
export async function listFoodsByRestaurant(restaurantId: string, availableOnly = false) {
    const path = availableOnly
        ? `/foods/restaurant/${restaurantId}/available`
        : `/foods/restaurant/${restaurantId}`
    const res = await apiRequest<Food[]>(path, { auth: true })
    return res.data ?? []
}

export async function createFood(body: Record<string, unknown>) {
    return apiRequest<Food>("/foods/create", { method: "POST", body, auth: true })
}

export async function updateFood(foodId: string, body: Record<string, unknown>) {
    return apiRequest<Food>(`/foods/${foodId}/update`, { method: "PUT", body, auth: true })
}

export async function deleteFood(foodId: string) {
    return apiRequest(`/foods/${foodId}`, { method: "DELETE", auth: true })
}

export async function setFoodAvailability(foodId: string, isAvailable: boolean) {
    return apiRequest<Food>(`/foods/${foodId}/availability?isAvailable=${isAvailable}`, {
        method: "PATCH",
        auth: true,
    })
}

// ---------- Carts ----------
export async function getActiveCart() {
    const res = await apiRequest<Cart>("/carts/active", { auth: true })
    return res.data
}

export async function createCart(restaurantId: string) {
    const res = await apiRequest<Cart>("/carts/create", {
        method: "POST",
        body: { restaurantId },
        auth: true,
    })
    return res.data
}

export async function addCartItem(cartId: string, foodId: string, quantity = 1) {
    const res = await apiRequest<Cart>(`/carts/${cartId}/items/add`, {
        method: "POST",
        body: { foodId, quantity },
        auth: true,
    })
    return res.data
}

export async function removeCartItem(cartId: string, foodId: string, quantity = 1) {
    const res = await apiRequest<Cart>(`/carts/${cartId}/items/${foodId}?quantity=${quantity}`, {
        method: "DELETE",
        auth: true,
    })
    return res.data
}

export async function deleteCart(cartId: string) {
    return apiRequest(`/carts/${cartId}`, { method: "DELETE", auth: true })
}

// ---------- Orders ----------
export async function createOrder(cartId: string, instruction?: string) {
    const res = await apiRequest<Order>("/orders/create", {
        method: "POST",
        body: { cartId, instruction },
        auth: true,
    })
    return res.data
}

export async function getCustomerOrders() {
    const res = await apiRequest<Order[]>("/orders/customer", { auth: true })
    return res.data ?? []
}

export async function getRiderOrders() {
    const res = await apiRequest<Order[]>("/orders/rider", { auth: true })
    return res.data ?? []
}

export async function getRestaurantOrders() {
    const res = await apiRequest<Order[]>("/orders/restaurant", { auth: true })
    return res.data ?? []
}

export async function getOrder(orderId: string) {
    const res = await apiRequest<Order>(`/orders/${orderId}`, { auth: true })
    return res.data
}

export async function assignRider(orderId: string, riderId: string) {
    return apiRequest<Order>(`/orders/${orderId}/assign-rider/${riderId}`, {
        method: "POST",
        auth: true,
    })
}

export const FOOD_CATEGORY_ENDPOINT = (restaurantId: string, category: FoodCategory) =>
    `/foods/restaurant/${restaurantId}/category/${category}`
