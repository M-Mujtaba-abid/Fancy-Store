import express from "express";
import {
  addReview,
  getProductReviews,
  updateReview,
  deleteReview,
  adminReply,
} from "../controllers/review.controller.js";
// import { authMiddleware } from "../middleware/auth.middleware.js";
// import upload from "../middleware/multer.middleware.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import adminMiddleware from "../middleware/admin.middleware.js";

const router = express.Router();

// Public
router.get("/:productId", getProductReviews);

// Protected
router.post("/", authMiddleware, upload.array("images", 5), addReview);
router.put("/:id", authMiddleware, upload.array("images", 5), updateReview);
router.delete("/:id", authMiddleware, deleteReview);
router.patch("/:id/reply", authMiddleware, adminMiddleware, adminReply);


export default router;