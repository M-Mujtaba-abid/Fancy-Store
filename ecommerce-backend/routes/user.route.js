import express from "express";
import { registerUser, loginUser, logoutUser,forgetPassword,verifyOtp,resetPassword } from "../controllers/user.controller.js";

const router = express.Router();

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);
// logout
router.post("/logout", logoutUser);

// Forget Password Flow
router.post("/forget-password", forgetPassword);  // send OTP
router.post("/verify-otp", verifyOtp);            // check OTP
router.post("/reset-password", resetPassword);    // reset password
export default router;
