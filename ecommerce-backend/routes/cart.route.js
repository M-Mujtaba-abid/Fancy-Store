// routes/cart.route.js
import express from "express";
import {
  addToCart,
  updateCartItem,
  getCart,
  clearCart,
} from "../controllers/cart.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// all routes require login
router.use(authMiddleware);

// Add product to cart
router.post("/add", addToCart);

// Update quantity / remove product
router.patch("/update", updateCartItem);

// Get cart items
router.get("/", getCart);

// Get cart items
router.get("/clear", clearCart);

export default router;
