import express from "express";
import {
  getCategories,
  getAdminCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";
import adminMiddleware from "../middleware/admin.middleware.js";
import { uploadWithLimits } from "../middleware/multer.middleware.js";

const router = express.Router();

// --- Public Routes ---
router.get("/", getCategories);

// --- Admin Routes ---
// ⚠️ /admin/list ko /:slug se PEHLE rakhna zaroori hai, warna "admin" slug
// samjha jayega (wahi pattern jo product.route.js:41-42 follow karta hai)
router.get("/admin/list", authMiddleware, adminMiddleware, getAdminCategories);

// uploadWithLimits (8MB / 5 files) — bare `upload` ka koi size limit nahi hai
// (multer.middleware.js:12) aur Vercel ~4.5MB body edge pe reject kar deta hai
router.post("/", authMiddleware, adminMiddleware, uploadWithLimits.single("image"), createCategory);
router.patch("/:id", authMiddleware, adminMiddleware, uploadWithLimits.single("image"), updateCategory);
router.delete("/:id", authMiddleware, adminMiddleware, deleteCategory);

// hamesha sabse neeche
router.get("/:slug", getCategoryBySlug);

export default router;
