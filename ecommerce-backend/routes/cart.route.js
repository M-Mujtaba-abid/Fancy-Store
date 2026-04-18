// routes/cart.route.js
import express from "express";
import { addToCart, updateCartItem, getCart } from "../controllers/cart.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// all routes require login
router.use(authMiddleware);

// Add product to cart
router.post("/add", addToCart);

// Update quantity / remove product
router.put("/update", updateCartItem);

// Get cart items
router.get("/", getCart);

export default router;
