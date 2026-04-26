import { User, UserIdentity } from "../models/index.js"; // ✅ dono import
import bcrypt from "bcryptjs";
import generateToken from "../utils/jwt.js";
import ApiError from "../utils/apiError.js";
import sendEmail from "../utils/sendEmail.js";
// Yeh hona chahiye bilkul top pe
// ================= REGISTER =================
export const registerUserService = async ({ name, email, password, role }) => {
  // Email check karo
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) throw new ApiError(400, "User already exists");

  // Users table mein banao
  const newUser = await User.create({ name, email, role });
  console.log("User bana →", newUser.id); // ✅

  // UserIdentity mein local entry banao
  const hashedPassword = await bcrypt.hash(password, 10);
  const identity = await UserIdentity.create({
    userId: newUser.id,
    provider: "local",
    password: hashedPassword,
  });
  console.log("Identity bani →", identity); // ✅

  return {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
  };
};

// ================= LOGIN =================
export const loginUserService = async ({ email, password }) => {
  // User dhoondo
  const user = await User.findOne({ where: { email } });
  if (!user) throw new ApiError(400, "Invalid credentials");

  // Local identity dhoondo
  const localIdentity = await UserIdentity.findOne({
    where: { userId: user.id, provider: "local" },
  });

  if (!localIdentity) {
    throw new ApiError(400, "Please use 'Continue with Google' to login");
  }

  // Password check karo
  const isMatch = await bcrypt.compare(password, localIdentity.password);
  if (!isMatch) throw new ApiError(400, "Invalid credentials");

  const token = generateToken({ id: user.id, role: user.role });
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    token,
  };
};

// ================= FORGET PASSWORD =================
export const forgetPasswordService = async (email) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new ApiError(404, "Email registered nahi hai");

  // Local identity check karo
  const localIdentity = await UserIdentity.findOne({
    where: { userId: user.id, provider: "local" },
  });

  if (!localIdentity) {
    throw new ApiError(
      400,
      "Aapka account Google se linked hai. Please 'Continue with Google' use karein.",
    );
  }

  // OTP banao aur save karo
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  localIdentity.resetOtp = otp;
  localIdentity.resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  await localIdentity.save();

  await sendEmail(
    user.email,
    "Password Reset OTP — Fancy Store",
    `
    <h2>Password Reset Request 🔐</h2>
    <p>Your OTP code is:</p>
    <h1 style="color: #4F46E5; letter-spacing: 5px;">${otp}</h1>
    <p>This OTP is valid for <strong>10 minutes</strong>.</p>
    <p>If you did not request this, please ignore this email.</p>
    <br/>
    <p><strong>Fancy Store</strong> 🛍️</p>
  `,
  );
};

// ================= VERIFY OTP =================
export const verifyOtpService = async ({ email, otp }) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new ApiError(404, "User not found");

  const localIdentity = await UserIdentity.findOne({
    where: { userId: user.id, provider: "local" },
  });
  if (!localIdentity) throw new ApiError(400, "Invalid request");

  if (localIdentity.resetOtp !== otp) throw new ApiError(400, "Invalid OTP");
  if (new Date() > localIdentity.resetOtpExpiry)
    throw new ApiError(400, "OTP expired");
};

// ================= RESET PASSWORD =================
export const resetPasswordService = async ({ email, newPassword }) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new ApiError(404, "User not found");

  const localIdentity = await UserIdentity.findOne({
    where: { userId: user.id, provider: "local" },
  });
  if (!localIdentity) throw new ApiError(400, "Invalid request");

  localIdentity.password = await bcrypt.hash(newPassword, 10);
  localIdentity.resetOtp = null;
  localIdentity.resetOtpExpiry = null;
  await localIdentity.save();
};

// ================= GOOGLE AUTH =================
export const googleAuthService = (user) => {
  const token = generateToken({ id: user.id, role: user.role });
  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
  };
};
