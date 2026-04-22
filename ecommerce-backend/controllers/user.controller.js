
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import {
  registerUserService,
  loginUserService,
  forgetPasswordService,
  verifyOtpService,
  resetPasswordService,
  googleAuthService,
} from "../services/user.service.js";

// ================= REGISTER =================
export const registerUser = asyncHandler(async (req, res) => {
  const data = await registerUserService(req.body);
  res.status(201).json(new ApiResponse(201, data, "User registered successfully"));
});

// ================= LOGIN =================
export const loginUser = asyncHandler(async (req, res) => {
  const data = await loginUserService(req.body);

  res.cookie("token", data.token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.status(200).json(new ApiResponse(200, data, "Login successful"));
});

// ================= LOGOUT =================
export const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie("token");
  res.status(200).json(new ApiResponse(200, null, "Logout successful"));
});

// ================= FORGET PASSWORD =================
export const forgetPassword = asyncHandler(async (req, res) => {
  await forgetPasswordService(req.body.email);
  res.status(200).json(new ApiResponse(200, null, "OTP sent to email"));
});

// ================= RESET PASSWORD =================
export const resetPassword = asyncHandler(async (req, res) => {
  await resetPasswordService(req.body);
  res.status(200).json(new ApiResponse(200, null, "Password reset successful"));
});
// ================= GOOGLE AUTH CALLBACK =================
export const googleAuthCallback = asyncHandler(async (req, res) => {
  const data = googleAuthService(req.user); // passport ne req.user set kiya

  res.cookie("token", data.token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000,
  })})

  res.redirect(`${process.env.CLIENT_URL}/auth/callback?success=true`);

// ================= VERIFY OTP =================
export const verifyOtp = asyncHandler(async (req, res) => {
  await verifyOtpService(req.body);
  res.status(200).json(new ApiResponse(200, null, "OTP verified successfully"));
});