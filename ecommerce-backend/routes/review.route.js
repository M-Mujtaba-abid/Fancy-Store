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

// ================= PUBLIC ROUTES =================
// Product detail page par reviews dikhane ke liye
router.get("/:productId", getProductReviews);


// ================= PROTECTED ROUTES (USER) =================
// Review add karne ke liye (Max 5 images allow hain)
router.post("/", authMiddleware, upload.array("images", 5), addReview);

// Apna review update karne ke liye
router.patch("/:id", authMiddleware, upload.array("images", 5), updateReview);

// Review delete karne ke liye (Admin aur User dono use kar sakte hain controller logic ke mutabiq)
router.delete("/:id", authMiddleware, deleteReview);


// ================= ADMIN ONLY ROUTES =================
// Review ko 'Tick' yani approve karne ke liye route
router.patch("/:id/approve", authMiddleware, adminMiddleware, approveReview);

// User ke review par reply dene ke liye
router.patch("/:id/reply", authMiddleware, adminMiddleware, adminReply);

router.get("/admin/pending", authMiddleware, adminMiddleware, getPendingReviews);


export default router;