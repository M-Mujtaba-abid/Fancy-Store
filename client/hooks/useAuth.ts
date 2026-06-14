import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/service/authService/auth.service";
import { setAuthSession } from "@/utils/auth";
import { syncGuestDataOnLogin } from "@/utils/guestSync";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { AxiosError } from "axios";
import {
  AuthResponse,
  ForgetPasswordPayload,
  ProfileResponse,
  ResetPasswordPayload,
  VerifyOtpPayload,
} from "@/types/user.type"; // Path check kar lijiyega

export const useRegister = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: authService.register,
    // ✅ 'res' ko type di
    onSuccess: (res: AuthResponse) => {
      // ✅ Fallback string lagaya taake TS ka undefined wala error na aaye
      toast.success(res.message || "Registration successful! Please login.");
      router.push("/login");
    },
    // ✅ 'any' ko hata kar AxiosError lagaya
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Registration failed");
    },
  });
};

export const useLogin = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.login,

    onSuccess: async (res: AuthResponse) => {
      const userRole = res.data?.role || "user";
      setAuthSession(userRole);

      await syncGuestDataOnLogin();
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });

      toast.success(res.message || "Welcome back!");

      if (userRole === "admin") {
        // 🔧 FIX: Add small delay to ensure cookie is set before redirect
        // This helps with production where cookies might take a moment to be accessible
        await new Promise((resolve) => setTimeout(resolve, 100));
        router.push("/dashboard");
        return;
      }

      router.push("/");
    },

    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Login failed");
      console.error("❌ Login error:", error.response?.data?.message);
    },
  });
};

// 1. Send OTP
export const useForgetPassword = () => {
  return useMutation({
    mutationFn: (data: ForgetPasswordPayload) =>
      authService.forgetPassword(data),
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    },
  });
};

// 2. Verify OTP
export const useVerifyOtp = () => {
  return useMutation({
    mutationFn: (data: VerifyOtpPayload) => authService.verifyOtp(data),
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Invalid OTP");
    },
  });
};

// 3. Reset Password
export const useResetPassword = () => {
  return useMutation({
    mutationFn: (data: ResetPasswordPayload) => authService.resetPassword(data),
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to reset password");
    },
  });
};

// 1. Get Profile Hook
export const useGetProfile = () => {
  return useQuery<ProfileResponse>({
    queryKey: ["profile"],
    queryFn: authService.getProfile,
  });
};

// 2. Update Profile Hook
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FormData) => authService.updateProfile(data),
    onSuccess: (res: ProfileResponse) => {
      toast.success(res.message || "Profile updated successfully");
      // Cache invalidate karein taake naya data foran screen par show ho
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Failed to update profile");
    },
  });
};
