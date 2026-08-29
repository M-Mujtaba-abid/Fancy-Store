import express from "express";
import {
  getBlogPosts,
  getBlogPostBySlug,
  getAdminBlogPosts,
  getAdminBlogPostById,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
} from "../controllers/blog.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import adminMiddleware from "../middleware/admin.middleware.js";
import { uploadWithLimits } from "../middleware/multer.middleware.js";

const router = express.Router();

// --- Public routes ---
router.get("/", getBlogPosts);

// --- Admin routes ---
// /admin/list and /admin/:id must come before /:slug, or "admin" would be
// read as a slug (same pattern as category.route.js / product.route.js)
router.get("/admin/list", authMiddleware, adminMiddleware, getAdminBlogPosts);
router.get("/admin/:id", authMiddleware, adminMiddleware, getAdminBlogPostById);

router.post("/", authMiddleware, adminMiddleware, uploadWithLimits.single("coverImage"), createBlogPost);
router.patch("/:id", authMiddleware, adminMiddleware, uploadWithLimits.single("coverImage"), updateBlogPost);
router.delete("/:id", authMiddleware, adminMiddleware, deleteBlogPost);

// This must always be last.
router.get("/:slug", getBlogPostBySlug);

export default router;
