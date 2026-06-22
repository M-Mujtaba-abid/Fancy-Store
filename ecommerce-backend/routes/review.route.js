import express from "express";
import {
  addReview,
  getProductReviews,
  updateReview,
  deleteReview,
  adminReply,
  approveReview,
  getPendingReviews, // Naya controller import kiya
} from "../controllers/review.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import adminMiddleware from "../middleware/admin.middleware.js";

const router = express.Router();

// ================= ADMIN ONLY ROUTES (static paths pehle) =================
router.get("/admin/pending", authMiddleware, adminMiddleware, getPendingReviews);
router.patch("/:id/approve", authMiddleware, adminMiddleware, approveReview);
router.patch("/:id/reply", authMiddleware, adminMiddleware, adminReply);

// ================= PUBLIC ROUTES =================
// Ye dynamic route hamesha sabse aakhir me honi chahiye
router.get("/:productId", getProductReviews);

// ================= PROTECTED ROUTES (USER) =================
router.post("/", authMiddleware, upload.array("images", 5), addReview);
router.patch("/:id", authMiddleware, upload.array("images", 5), updateReview);
router.delete("/:id", authMiddleware, deleteReview);

export default router;