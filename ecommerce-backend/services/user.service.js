import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/jwt.js";
import ApiError from "../utils/apiError.js";
import sendEmail from "../utils/sendEmail.js";

// ================= REGISTER =================
export const registerUserService = async ({ name, email, password, role }) => {
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) throw new ApiError(400, "User already exists");

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({ name, email, password: hashedPassword, role });

  return { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role };
};

// ================= LOGIN =================
export const loginUserService = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new ApiError(400, "Invalid credentials");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new ApiError(400, "Invalid credentials");

  const token = generateToken({ id: user.id, role: user.role });

  return { id: user.id, name: user.name, email: user.email, role: user.role, token };
};

// ================= FORGET PASSWORD =================
export const forgetPasswordService = async (email) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new ApiError(404, "User not found");

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  user.resetOtp = otp;
  user.resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min
  await user.save();

  await sendEmail(user.email, "Password Reset OTP", `Your OTP is: ${otp}`);
};

// ================= VERIFY OTP =================
export const verifyOtpService = async ({ email, otp }) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new ApiError(404, "User not found");

  if (user.resetOtp !== otp) throw new ApiError(400, "Invalid OTP");
  if (new Date() > user.resetOtpExpiry) throw new ApiError(400, "OTP expired");
};

// ================= RESET PASSWORD =================
export const resetPasswordService = async ({ email, newPassword }) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new ApiError(404, "User not found");

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedPassword;
  user.resetOtp = null;
  user.resetOtpExpiry = null;
  await user.save();
};



// ================= GOOGLE AUTH =================
export const googleAuthService = (user) => {
  const token = generateToken({ id: user.id, role: user.role });

  return {
    token,
    user: {
      id:     user.id,
      name:   user.name,
      email:  user.email,
      role:   user.role,
      avatar: user.avatar,
    },
  };
};