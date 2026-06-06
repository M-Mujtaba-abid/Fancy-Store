import axios from "axios";
import { clearAuthSession } from "@/utils/auth";

const api = axios.create({
  // baseURL: "http://localhost:5000/api", // Aapka Backend URL
  baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`, // Aapka Backend URL
  withCredentials: true, // Takay cookies (JWT) automatically backend par jayein
});

// Response Interceptor: Backend ke standardized response ko handle karne ke liye
api.interceptors.response.use(
  (response) => {
    // Agar request successful hai, toh sirf data return karo
    // Kyunke aapka backend ApiResponse format bhej raha hai { data, success, message }
    return response;
  },
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const url = error.config?.url || "";
      if (!url.includes("/user/login") && !url.includes("/user/register")) {
        clearAuthSession();
      }
    }

    const message = error.response?.data?.message || "Something went wrong";
    console.error("API Error:", message);
    return Promise.reject(error);
  }
);

export default api;