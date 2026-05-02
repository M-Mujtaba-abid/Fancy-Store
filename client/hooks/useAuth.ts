import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/service/authService/auth.service";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast"; 
import { AxiosError } from "axios";
import { AuthResponse, ForgetPasswordPayload, ProfileResponse, ResetPasswordPayload, UpdateProfileInput, VerifyOtpPayload } from "@/types/user.type"; // Path check kar lijiyega

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
  
  return useMutation({
    mutationFn: authService.login, 
    
    // ✅ Yahan se type hata di. Ab TS khud infer karega!
    onSuccess: (res: AuthResponse) => { 
      // console.log("res.msg => ",res, "res.data.msg => ",res.data )

      if (typeof window !== "undefined") {
        localStorage.setItem("isLoggedIn", "true");
      }
      
      toast.success(res.message || "Welcome back!");

      const userRole = res.data.role; 

      console.log("Extracted role => " , userRole); // Ab yahan 'admin' aayega!


      if (userRole === "admin") {
        router.push("/dashboard"); 
      } else {
        router.push("/"); 
      }
    },
    
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Login failed");
    },
  });
};


// 1. Send OTP
export const useForgetPassword = () => {
  return useMutation({
    mutationFn: (data: ForgetPasswordPayload) => authService.forgetPassword(data),
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
    mutationFn: (data: UpdateProfileInput) => authService.updateProfile(data),
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