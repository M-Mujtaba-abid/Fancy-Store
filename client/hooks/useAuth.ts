import { useMutation } from "@tanstack/react-query";
import { authService } from "@/service/auth.service";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast"; // Recommended for feedback

export const useRegister = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: authService.register,
    onSuccess: (res) => {
      toast.success(res.message);
      router.push("/login");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Registration failed");
    },
  });
};

export const useLogin = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: authService.login,
    onSuccess: (res) => {
      toast.success(res.message);
      toast.success("Welcome back!");
      // You might want to save user to a global state (Zustand/Redux) here
      router.push("/");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Login failed");
    },
  });
};