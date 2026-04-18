import express from "express";
import {
    addProduct,
    getProducts,
    getProductById,
    // getProductsByCategory,
    updateProduct,
    deleteProduct,
    getTotalProducts,
    searchProducts,        // New
    getFeaturedProducts,   // New
    getNewArrivals,       // New
    getOnSaleProducts      // New
} from "../controllers/product.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";
import adminMiddleware from "../middleware/admin.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = express.Router();

// --- Public Routes (Frontend Display ke liye) ---
router.get("/search", searchProducts);         // ?q=civic
router.get("/featured", getFeaturedProducts);
router.get("/new-arrivals", getNewArrivals);
router.get("/sale", getOnSaleProducts);
router.get("/count", getTotalProducts);
// router.get("/category/:category", getProductsByCategory);
router.get("/", getProducts);
router.get("/:id", getProductById); // Dynamic ID wala hamesha end mein

// --- Protected Routes (Sirf Admin ke liye) ---
// Note: upload.array("images", 5) use kar rahe hain kyunke hamari car covers ki multiple pics hongi
router.post("/", authMiddleware, adminMiddleware, upload.array("images", 5), addProduct);
router.patch("/:id", authMiddleware, adminMiddleware, upload.array("images", 5), updateProduct);
router.delete("/:id", authMiddleware, adminMiddleware, deleteProduct);

export default router;