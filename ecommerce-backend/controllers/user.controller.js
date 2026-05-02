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

const getAuthCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000,
    path: "/",
  };

  if (isProduction && process.env.BACKEND_DOMAIN) {
    cookieOptions.domain = process.env.BACKEND_DOMAIN;
  }

  return cookieOptions;
};

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
  res.cookie("token", data.token, getAuthCookieOptions());
  res.status(200).json(new ApiResponse(200, data, "Login successful"));
});

// ================= LOGOUT =================
export const logoutUser = asyncHandler(async (req, res) => {
  const clearCookieOptions = { ...getAuthCookieOptions() };
  delete clearCookieOptions.maxAge;

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
  res.cookie("token", data.token, getAuthCookieOptions());
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
