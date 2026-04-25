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
//  Product Categories
export const CATEGORIES = {
  FLOOR_MAT: "floor_mat",
  TRUNK_TRAY: "trunk_tray",
  DASHBOARD_MAT: "dashboard_mat",
  SEAT_COVER: "seat_cover",
  STEERING_COVER: "steering_cover",
  TOP_COVER: "top_cover",  
  // Future mein bas yahan add karo
};