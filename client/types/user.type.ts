

export interface User {
  id: string | number;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

// ✅ 1. Input data ki types define karein taake 'any' na likhna pade
export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  // Agar aur koi field (e.g., phone) hai toh yahan add kar lein
}

export interface AuthData extends User {
  token: string;
}

export interface AuthResponse extends User {
  token: string;
  message?: string; // Optional rakha hai incase API message na bheje
  statusCode: number;
  success: boolean;
  data: AuthData; // User ka data iske andar hai
}

// export type AuthResponse = ApiResponse<AuthData>;


export interface ForgetPasswordPayload {
  email: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface ResetPasswordPayload {
  email: string;
  newPassword: string;
}