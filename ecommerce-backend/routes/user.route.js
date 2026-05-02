import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  forgetPassword,
  verifyOtp,
  resetPassword,
  googleAuthCallback,
  getProfile,
  updateProfile,
} from "../controllers/user.controller.js";
import passport from "../config/passport.js"; //  add
import authMiddleware from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import { getDashboardStats } from "../controllers/admin.controller.js";
import adminMiddleware from "../middleware/admin.middleware.js";

const router = express.Router();

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);
// logout
router.post("/logout", logoutUser);

// Forget Password Flow
router.post("/forget-password", forgetPassword); // send OTP
router.post("/verify-otp", verifyOtp); // check OTP
router.post("/reset-password", resetPassword); // reset password
// / Google OAuth
router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google_failed`,
  }),
  googleAuthCallback,
);

// Profile Routes
router.get("/profile", authMiddleware, getProfile);
router.patch(
  "/profile",
  authMiddleware,
  upload.single("avatar"),
  updateProfile,
);
router.get("/dashboard-stats",authMiddleware, adminMiddleware, getDashboardStats);
export default router;
