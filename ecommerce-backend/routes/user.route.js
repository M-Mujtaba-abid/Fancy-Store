import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  forgetPassword,
  verifyOtp,
  resetPassword,
   googleAuthCallback,     
} from "../controllers/user.controller.js";
import passport from "../config/passport.js";        // ✅ add


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
router.get("/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

router.get("/auth/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google_failed`
  }),
  googleAuthCallback
);

export default router;
