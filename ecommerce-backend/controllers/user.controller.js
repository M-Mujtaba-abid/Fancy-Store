// import User from "../models/user.model.js";
// import bcrypt from "bcryptjs";
// import generateToken from "../utils/jwt.js";
// import asyncHandler from "../utils/asyncHandler.js";
// import ApiResponse from "../utils/apiResponse.js";
// import ApiError from "../utils/apiError.js";
// import sendEmail from "../utils/sendEmail.js";

// // ✅ Register User
// export const registerUser = asyncHandler(async (req, res) => {
//   const { name, email, password, role } = req.body;

//   // check if user exists
//   const existingUser = await User.findOne({ where: { email } });
//   if (existingUser) throw new ApiError(400, "User already exists");

//   // hash password
//   const hashedPassword = await bcrypt.hash(password, 10);

//   // create user
//   const newUser = await User.create({
//     name,
//     email,
//     password: hashedPassword,
//     role,
//   });

//   res.status(201).json(
//     new ApiResponse(
//       201,
//       { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
//       "User registered successfully"
//     )
//   );
// });

// // ✅ Login User
// export const loginUser = asyncHandler(async (req, res) => {
//   const { email, password } = req.body;

//   // find user
//   const user = await User.findOne({ where: { email } });
//   if (!user) throw new ApiError(400, "Invalid credentials");

//   // check password
//   const isMatch = await bcrypt.compare(password, user.password);
//   if (!isMatch) throw new ApiError(400, "Invalid credentials");

//   // generate token
//   const token = generateToken({ id: user.id, role: user.role });

//   // set cookie
//   // res.cookie("token", token, {
//   //   httpOnly: true, // prevents XSS attacks
//   //   secure: false, // set true if using https
//   //   maxAge: 24 * 60 * 60 * 1000, // 1 day
//   // });
//   res.cookie("token", token, {
//   httpOnly: true,
//   secure: true, // localhost
//   sameSite: "none", // ✅ important
//   maxAge: 24 * 60 * 60 * 1000
// });


//   res.status(200).json(
//     new ApiResponse(
//       200,
//       { id: user.id, name: user.name, email: user.email, token,role:user.role },
//       "Login successful"
//     )
//   );
// });

// // ✅ Logout User
// export const logoutUser = asyncHandler(async (req, res) => {
//   res.clearCookie("token"); // clear token cookie
//   res.status(200).json(new ApiResponse(200, null, "Logout successful"));
// });

// // ✅ Forget Password
// export const forgetPassword = asyncHandler(async (req, res) => {
//   const { email } = req.body;

//   const user = await User.findOne({ where: { email } });
//   if (!user) throw new ApiError(404, "User not found");

//   // Generate OTP
//   const otp = Math.floor(100000 + Math.random() * 900000).toString();

//   // Save OTP in DB
//   user.resetOtp = otp;
//   user.resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min
//   await user.save();

//   // Send OTP via email
//   await sendEmail(user.email, "Password Reset OTP", `Your OTP is: ${otp}`);

//   res.status(200).json(new ApiResponse(200, null, "OTP sent to email"));
// });

// // ✅ Verify OTP
// export const verifyOtp = asyncHandler(async (req, res) => {
//   const { email, otp } = req.body;

//   const user = await User.findOne({ where: { email } });
//   if (!user) throw new ApiError(404, "User not found");

//   if (user.resetOtp !== otp) throw new ApiError(400, "Invalid OTP");
//   if (new Date() > user.resetOtpExpiry) throw new ApiError(400, "OTP expired");

//   res.status(200).json(new ApiResponse(200, null, "OTP verified successfully"));
// });

// // ✅ Reset Password
// export const resetPassword = asyncHandler(async (req, res) => {
//   const { email, newPassword } = req.body;

//   const user = await User.findOne({ where: { email } });
//   if (!user) throw new ApiError(404, "User not found");

//   // hash new password
//   const hashedPassword = await bcrypt.hash(newPassword, 10);

//   user.password = hashedPassword;
//   user.resetOtp = null;
//   user.resetOtpExpiry = null;
//   await user.save();

//   res.status(200).json(new ApiResponse(200, null, "Password reset successful"));
// });


// n
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

// ================= VERIFY OTP =================
export const verifyOtp = asyncHandler(async (req, res) => {
  await verifyOtpService(req.body);
  res.status(200).json(new ApiResponse(200, null, "OTP verified successfully"));
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
  });

  res.redirect(`${process.env.CLIENT_URL}/auth/callback?success=true`);
});