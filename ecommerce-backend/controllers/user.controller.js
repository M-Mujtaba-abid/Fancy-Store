import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import {
  registerUserService,
  loginUserService,
  forgetPasswordService,
  verifyOtpService,
  resetPasswordService,
  googleAuthService,
  getProfileService,
  updateProfileService,
} from "../services/user.service.js";

// ================= REGISTER =================
export const registerUser = asyncHandler(async (req, res) => {
  const data = await registerUserService(req.body);
  res
    .status(201)
    .json(new ApiResponse(201, data, "User registered successfully"));
});

// ================= LOGIN =================
export const loginUser = asyncHandler(async (req, res) => {
  const data = await loginUserService(req.body);

  console.log("data login response  ->", data);
  
  // ✅ VERCEL FIX: Ensure cookie works on both localhost and production
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction, // Only secure on production (HTTPS)
    sameSite: isProduction ? 'none' : 'lax', // 'none' requires secure: true
    maxAge: 24 * 60 * 60 * 1000,
    path: '/', // ✅ IMPORTANT: Ensure cookie is sent to entire domain
  };

  // ✅ Add domain for cross-subdomain cookies on production
  if (isProduction && process.env.BACKEND_DOMAIN) {
    cookieOptions.domain = process.env.BACKEND_DOMAIN;
  }

  res.cookie("token", data.token, cookieOptions);
  res.status(200).json(new ApiResponse(200, data, "Login successful"));
});

// ================= LOGOUT =================
export const logoutUser = asyncHandler(async (req, res) => {
  // ✅ VERCEL FIX: Clear cookie with same settings
  const isProduction = process.env.NODE_ENV === 'production';
  const clearCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  };

  if (isProduction && process.env.BACKEND_DOMAIN) {
    clearCookieOptions.domain = process.env.BACKEND_DOMAIN;
  }

  res.clearCookie("token", clearCookieOptions);
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
  const data = await googleAuthService(req.user);

  // ✅ VERCEL FIX: Same cookie settings as login
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000,
    path: '/',
  };

  if (isProduction && process.env.BACKEND_DOMAIN) {
    cookieOptions.domain = process.env.BACKEND_DOMAIN;
  }

  res.cookie("token", data.token, cookieOptions);
  res.redirect(`${process.env.CLIENT_URL}/?login=success`);
});

// ================= VERIFY OTP =================
export const verifyOtp = asyncHandler(async (req, res) => {
  await verifyOtpService(req.body);
  res.status(200).json(new ApiResponse(200, null, "OTP verified successfully"));
});

// ================= GET PROFILE =================
export const getProfile = asyncHandler(async (req, res) => {
  // req.user.id tumhare authMiddleware se aayega
  const profile = await getProfileService(req.user.id);
  res.status(200).json(new ApiResponse(200, profile, "Profile fetched"));
});

// ================= UPDATE PROFILE =================
// controllers/user.controller.js
export const updateProfile = asyncHandler(async (req, res) => {
  // req.user.id token se aayega
  // req.body me text data (name) hoga
  // req.file me image aayegi (multer ki wajah se)

  const updatedData = await updateProfileService(
    req.user.id,
    req.body,
    req.file,
  );

  res
    .status(200)
    .json(new ApiResponse(200, updatedData, "Profile updated successfully"));
});
