/**
 * Centralized API Endpoints Configuration
 * 
 * This file contains all API endpoint definitions with their HTTP methods,
 * authentication requirements, and descriptions for better code maintainability.
 */

export interface ApiEndpointConfig {
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  auth: boolean
  description: string
}

export const API_ENDPOINTS: Record<string, ApiEndpointConfig> = {
  // Authentication
  AUTH_REFRESH: {
    path: '/auth/refresh',
    method: 'POST',
    auth: false,
    description: 'Refresh access token using refresh token'
  },
  AUTH_ME: {
    path: '/auth/me',
    method: 'GET',
    auth: true,
    description: 'Get current authenticated user profile'
  },

  // User Signup
  USERS_SIGNUP_REQUEST: {
    path: '/users/signup/request',
    method: 'POST',
    auth: false,
    description: 'Request OTP for user signup'
  },
  USERS_SIGNUP_VERIFY: {
    path: '/users/signup/verify',
    method: 'POST',
    auth: false,
    description: 'Verify OTP and complete user signup'
  },

  // User Deletion
  USERS_DELETE_REQUEST: {
    path: '/users/delete/request',
    method: 'POST',
    auth: true,
    description: 'Request OTP for account deletion'
  },
  USERS_DELETE_COMPLETE: {
    path: '/users/delete/complete',
    method: 'POST',
    auth: true,
    description: 'Verify OTP and complete account deletion'
  },

  // Restaurants
  RESTAURANTS_LIST: {
    path: '/restaurants/list',
    method: 'GET',
    auth: false,
    description: 'List all restaurants'
  },
  RESTAURANTS_GET: {
    path: '/restaurants/:id',
    method: 'GET',
    auth: true,
    description: 'Get restaurant details by ID'
  },
  RESTAURANTS_GET_BY_USER: {
    path: '/restaurants/user/',
    method: 'GET',
    auth: true,
    description: 'Get restaurant details by authenticated user'
  },
  RESTAURANTS_UPDATE: {
    path: '/restaurants/update',
    method: 'PUT',
    auth: true,
    description: 'Update restaurant details'
  },
  RESTAURANTS_REGISTER_REQUEST: {
    path: '/restaurants/register/request',
    method: 'POST',
    auth: true,
    description: 'Request OTP for restaurant registration'
  },
  RESTAURANTS_REGISTER_VERIFY: {
    path: '/restaurants/register/verify',
    method: 'POST',
    auth: true,
    description: 'Verify OTP and complete restaurant registration'
  },
  RESTAURANTS_DELETE_REQUEST: {
    path: '/restaurants/delete/request',
    method: 'POST',
    auth: true,
    description: 'Request OTP for restaurant account deletion'
  },
  RESTAURANTS_DELETE_COMPLETE: {
    path: '/restaurants/delete/complete',
    method: 'POST',
    auth: true,
    description: 'Verify OTP and complete restaurant account deletion'
  },

  // Customers
  CUSTOMERS_GET: {
    path: '/customers/:id',
    method: 'GET',
    auth: true,
    description: 'Get customer details by ID'
  },
  CUSTOMERS_UPDATE: {
    path: '/customers/update',
    method: 'PUT',
    auth: true,
    description: 'Update customer details'
  },
  CUSTOMERS_REGISTER_REQUEST: {
    path: '/customers/register/request',
    method: 'POST',
    auth: true,
    description: 'Request OTP for customer registration'
  },
  CUSTOMERS_REGISTER_VERIFY: {
    path: '/customers/register/verify',
    method: 'POST',
    auth: true,
    description: 'Verify OTP and complete customer registration'
  },

  // Riders
  RIDERS_GET: {
    path: '/riders/:id',
    method: 'GET',
    auth: true,
    description: 'Get rider details by ID'
  },
  RIDERS_UPDATE: {
    path: '/riders/update',
    method: 'PUT',
    auth: true,
    description: 'Update rider details'
  },
  RIDERS_DELETE: {
    path: '/riders/:id',
    method: 'DELETE',
    auth: true,
    description: 'Delete rider by ID'
  },
  RIDERS_DELETE_REQUEST: {
    path: '/riders/delete/request',
    method: 'POST',
    auth: true,
    description: 'Request OTP for rider account deletion'
  },
  RIDERS_DELETE_COMPLETE: {
    path: '/riders/delete/complete',
    method: 'POST',
    auth: true,
    description: 'Verify OTP and complete rider account deletion'
  },
  RIDERS_REGISTER_REQUEST: {
    path: '/riders/register/request',
    method: 'POST',
    auth: true,
    description: 'Request OTP for rider registration'
  },
  RIDERS_REGISTER_VERIFY: {
    path: '/riders/register/verify',
    method: 'POST',
    auth: true,
    description: 'Verify OTP and complete rider registration'
  },

  // Foods
  FOODS_LIST_BY_RESTAURANT: {
    path: '/foods/restaurant/:restaurantId',
    method: 'GET',
    auth: true,
    description: 'List all foods for a restaurant'
  },
  FOODS_LIST_AVAILABLE: {
    path: '/foods/restaurant/:restaurantId/available',
    method: 'GET',
    auth: true,
    description: 'List available foods for a restaurant'
  },
  FOODS_CREATE: {
    path: '/foods/create',
    method: 'POST',
    auth: true,
    description: 'Create a new food item'
  },
  FOODS_UPDATE: {
    path: '/foods/:foodId/update',
    method: 'PUT',
    auth: true,
    description: 'Update food item details'
  },
  FOODS_DELETE: {
    path: '/foods/:foodId',
    method: 'DELETE',
    auth: true,
    description: 'Delete food item by ID'
  },
  FOODS_SET_AVAILABILITY: {
    path: '/foods/:foodId/availability',
    method: 'PATCH',
    auth: true,
    description: 'Set food item availability'
  },
  FOODS_BY_CATEGORY: {
    path: '/foods/restaurant/:restaurantId/category/:category',
    method: 'GET',
    auth: true,
    description: 'List foods by category for a restaurant'
  },

  // Carts
  CARTS_GET_ACTIVE: {
    path: '/carts/active',
    method: 'GET',
    auth: true,
    description: 'Get active cart for current user'
  },
  CARTS_CREATE: {
    path: '/carts/create',
    method: 'POST',
    auth: true,
    description: 'Create a new cart'
  },
  CARTS_ADD_ITEM: {
    path: '/carts/:cartId/items/add',
    method: 'POST',
    auth: true,
    description: 'Add item to cart'
  },
  CARTS_REMOVE_ITEM: {
    path: '/carts/:cartId/items/:foodId',
    method: 'DELETE',
    auth: true,
    description: 'Remove item from cart'
  },
  CARTS_DELETE: {
    path: '/carts/:cartId',
    method: 'DELETE',
    auth: true,
    description: 'Delete cart by ID'
  },

  // Orders
  ORDERS_CREATE: {
    path: '/orders/create',
    method: 'POST',
    auth: true,
    description: 'Create a new order from cart'
  },
  ORDERS_GET_CUSTOMER: {
    path: '/orders/customer',
    method: 'GET',
    auth: true,
    description: 'Get orders for current customer'
  },
  ORDERS_GET_RIDER: {
    path: '/orders/rider',
    method: 'GET',
    auth: true,
    description: 'Get orders for current rider'
  },
  ORDERS_GET_RESTAURANT: {
    path: '/orders/restaurant',
    method: 'GET',
    auth: true,
    description: 'Get orders for current restaurant'
  },
  ORDERS_GET: {
    path: '/orders/:orderId',
    method: 'GET',
    auth: true,
    description: 'Get order details by ID'
  },
  ORDERS_ASSIGN_RIDER: {
    path: '/orders/:orderId/assign-rider/:riderId',
    method: 'POST',
    auth: true,
    description: 'Assign rider to order'
  },
}

/**
 * Helper function to build endpoint path with parameters
 * @param endpointKey - Key from API_ENDPOINTS
 * @param params - Object containing path parameters
 * @returns Full endpoint path with parameters replaced
 */
export function buildEndpointPath(endpointKey: string, params: Record<string, string | number> = {}): string {
  const endpoint = API_ENDPOINTS[endpointKey]
  if (!endpoint) {
    throw new Error(`Endpoint ${endpointKey} not found in API_ENDPOINTS`)
  }

  let path = endpoint.path
  Object.entries(params).forEach(([key, value]) => {
    path = path.replace(`:${key}`, String(value))
  })

  return path
}

/**
 * Helper function to get endpoint config
 * @param endpointKey - Key from API_ENDPOINTS
 * @returns Endpoint configuration
 */
export function getEndpointConfig(endpointKey: string): ApiEndpointConfig {
  const endpoint = API_ENDPOINTS[endpointKey]
  if (!endpoint) {
    throw new Error(`Endpoint ${endpointKey} not found in API_ENDPOINTS`)
  }
  return endpoint
}
