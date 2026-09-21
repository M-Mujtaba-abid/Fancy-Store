import express from "express";
import rateLimit from "express-rate-limit";
import {
  createCoupon,
  deleteCoupon,
  getCouponReport,
  getCoupons,
  releaseRedemption,
  updateCoupon,
  validateCoupon,
} from "../controllers/coupon.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";
import adminMiddleware from "../middleware/admin.middleware.js";

const router = express.Router();

/**
 * Validate endpoint par rate limit zaroori hai.
 *
 * Ye ek public endpoint hai jo bata deta hai ke code sahi hai ya nahi, yani
 * koi script chala kar codes guess kar sakta hai. Codes random hain
 * (0078ABQD00 jaise) is liye guess karna waise bhi mushkil hai, magar limit
 * lagana muft ka bachao hai.
 */
const validateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 12,
  message: {
    success: false,
    message: "Too many coupon attempts. Please wait a minute and try again.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// --- Public ---
router.post("/validate", validateLimiter, validateCoupon);

// --- Admin ---
// ⚠️ /redemptions/... ko /:id se PEHLE rakhna zaroori hai, warna
// "redemptions" ko coupon id samjha jayega (wahi pattern jo
// category.route.js aur product.route.js follow karte hain).
router.patch(
  "/redemptions/:id/release",
  authMiddleware,
  adminMiddleware,
  releaseRedemption
);

router.get("/", authMiddleware, adminMiddleware, getCoupons);
router.post("/", authMiddleware, adminMiddleware, createCoupon);
router.get("/:id/report", authMiddleware, adminMiddleware, getCouponReport);
router.patch("/:id", authMiddleware, adminMiddleware, updateCoupon);
router.delete("/:id", authMiddleware, adminMiddleware, deleteCoupon);

export default router;
