import { apiRequest } from "./api"
import { buildEndpointPath, getEndpointConfig } from "./api-endpoints"
import type { Cart, Customer, Food, FoodCategory, Order, Restaurant, Rider } from "./types"

// ---------- Restaurants ----------
export async function listRestaurants() {
    const config = getEndpointConfig('RESTAURANTS_LIST')
    const res = await apiRequest<Restaurant[]>(config.path, { method: config.method, auth: config.auth })
    return res.data ?? []
}

export async function getRestaurant(id: string) {
    const path = buildEndpointPath('RESTAURANTS_GET', { id })
    const config = getEndpointConfig('RESTAURANTS_GET')
    const res = await apiRequest<Restaurant>(path, { method: config.method, auth: config.auth })
    return res.data
}

export async function updateRestaurant(body: Record<string, unknown>) {
    const config = getEndpointConfig('RESTAURANTS_UPDATE')
    return apiRequest<Restaurant>(config.path, { method: config.method, body, auth: config.auth })
}

// ---------- Customers ----------
export async function getCustomer(id: string) {
    const path = buildEndpointPath('CUSTOMERS_GET', { id })
    const config = getEndpointConfig('CUSTOMERS_GET')
    const res = await apiRequest<Customer>(path, { method: config.method, auth: config.auth })
    return res.data
}

export async function updateCustomer(body: Record<string, unknown>) {
    const config = getEndpointConfig('CUSTOMERS_UPDATE')
    return apiRequest<Customer>(config.path, { method: config.method, body, auth: config.auth })
}

// ---------- Riders ----------
export async function getRider(id: string) {
    const path = buildEndpointPath('RIDERS_GET', { id })
    const config = getEndpointConfig('RIDERS_GET')
    const res = await apiRequest<Rider>(path, { method: config.method, auth: config.auth })
    return res.data
}

export async function updateRider(body: Record<string, unknown>) {
    const config = getEndpointConfig('RIDERS_UPDATE')
    return apiRequest<Rider>(config.path, { method: config.method, body, auth: config.auth })
}

export async function deleteRider(riderId: string) {
    const path = buildEndpointPath('RIDERS_DELETE', { id: riderId })
    const config = getEndpointConfig('RIDERS_DELETE')
    return apiRequest(path, { method: config.method, auth: config.auth })
}

// ---------- Foods ----------
export async function listFoodsByRestaurant(restaurantId: string, availableOnly = false) {
    const endpointKey = availableOnly ? 'FOODS_LIST_AVAILABLE' : 'FOODS_LIST_BY_RESTAURANT'
    const path = buildEndpointPath(endpointKey, { restaurantId })
    const config = getEndpointConfig(endpointKey)
    const res = await apiRequest<Food[]>(path, { method: config.method, auth: config.auth })
    return res.data ?? []
}

export async function createFood(body: Record<string, unknown>) {
    const config = getEndpointConfig('FOODS_CREATE')
    return apiRequest<Food>(config.path, { method: config.method, body, auth: config.auth })
}

export async function updateFood(foodId: string, body: Record<string, unknown>) {
    const path = buildEndpointPath('FOODS_UPDATE', { foodId })
    const config = getEndpointConfig('FOODS_UPDATE')
    return apiRequest<Food>(path, { method: config.method, body, auth: config.auth })
}

export async function deleteFood(foodId: string) {
    const path = buildEndpointPath('FOODS_DELETE', { foodId })
    const config = getEndpointConfig('FOODS_DELETE')
    return apiRequest(path, { method: config.method, auth: config.auth })
}

export async function setFoodAvailability(foodId: string, isAvailable: boolean) {
    const path = buildEndpointPath('FOODS_SET_AVAILABILITY', { foodId })
    const config = getEndpointConfig('FOODS_SET_AVAILABILITY')
    return apiRequest<Food>(`${path}?isAvailable=${isAvailable}`, {
        method: config.method,
        auth: config.auth,
    })
}

// ---------- Carts ----------
export async function getActiveCart() {
    const config = getEndpointConfig('CARTS_GET_ACTIVE')
    const res = await apiRequest<Cart>(config.path, { method: config.method, auth: config.auth })
    return res.data
}

export async function createCart(restaurantId: string) {
    const config = getEndpointConfig('CARTS_CREATE')
    const res = await apiRequest<Cart>(config.path, {
        method: config.method,
        body: { restaurantId },
        auth: config.auth,
    })
    return res.data
}

export async function addCartItem(cartId: string, foodId: string, quantity = 1) {
    const path = buildEndpointPath('CARTS_ADD_ITEM', { cartId })
    const config = getEndpointConfig('CARTS_ADD_ITEM')
    const res = await apiRequest<Cart>(path, {
        method: config.method,
        body: { foodId, quantity },
        auth: config.auth,
    })
    return res.data
}

export async function removeCartItem(cartId: string, foodId: string, quantity = 1) {
    const path = buildEndpointPath('CARTS_REMOVE_ITEM', { cartId, foodId })
    const config = getEndpointConfig('CARTS_REMOVE_ITEM')
    const res = await apiRequest<Cart>(`${path}?quantity=${quantity}`, {
        method: config.method,
        auth: config.auth,
    })
    return res.data
}

export async function deleteCart(cartId: string) {
    const path = buildEndpointPath('CARTS_DELETE', { cartId })
    const config = getEndpointConfig('CARTS_DELETE')
    return apiRequest(path, { method: config.method, auth: config.auth })
}

// ---------- Orders ----------
export async function createOrder(cartId: string, instruction?: string) {
    const config = getEndpointConfig('ORDERS_CREATE')
    const res = await apiRequest<Order>(config.path, {
        method: config.method,
        body: { cartId, instruction },
        auth: config.auth,
    })
    return res.data
}

export async function getCustomerOrders() {
    const config = getEndpointConfig('ORDERS_GET_CUSTOMER')
    const res = await apiRequest<Order[]>(config.path, { method: config.method, auth: config.auth })
    return res.data ?? []
}

export async function getRiderOrders() {
    const config = getEndpointConfig('ORDERS_GET_RIDER')
    const res = await apiRequest<Order[]>(config.path, { method: config.method, auth: config.auth })
    return res.data ?? []
}

export async function getRestaurantOrders() {
    const config = getEndpointConfig('ORDERS_GET_RESTAURANT')
    const res = await apiRequest<Order[]>(config.path, { method: config.method, auth: config.auth })
    return res.data ?? []
}

export async function getOrder(orderId: string) {
    const path = buildEndpointPath('ORDERS_GET', { orderId })
    const config = getEndpointConfig('ORDERS_GET')
    const res = await apiRequest<Order>(path, { method: config.method, auth: config.auth })
    return res.data
}

export async function assignRider(orderId: string, riderId: string) {
    const path = buildEndpointPath('ORDERS_ASSIGN_RIDER', { orderId, riderId })
    const config = getEndpointConfig('ORDERS_ASSIGN_RIDER')
    return apiRequest<Order>(path, {
        method: config.method,
        auth: config.auth,
    })
}

export const FOOD_CATEGORY_ENDPOINT = (restaurantId: string, category: FoodCategory) =>
    buildEndpointPath('FOODS_BY_CATEGORY', { restaurantId, category })
