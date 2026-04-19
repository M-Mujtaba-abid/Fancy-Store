// ============== ORDER ==============
export const ORDER_STATUSES = [
  "pending",
  "accepted",
  "cancelled",
  "ready_to_ship",
  "shipped",
  "delivered",
];

// ============== PAYMENT ==============
export const PAYMENT_METHODS = ["COD", "Bank Transfer", "Card"];

// ============== ROLES ==============
export const ROLES = {
  USER: "user",
  ADMIN: "admin",
};

// ============== REVIEW ==============
export const RATING_MIN = 1;
export const RATING_MAX = 5;

// ============== PAGINATION ==============
export const DEFAULT_LIMITS = {
  PRODUCTS: 12,
  FEATURED: 4,
  NEW_ARRIVALS: 8,
  ON_SALE: 10,
  SEARCH: 10,
};
// vehicles types
export const VEHICLE_TYPES = {
  CAR: "car",
  BIKE: "bike",
};