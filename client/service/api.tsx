import axios from "axios";

// Axios instance create kar rahe hain
const api = axios.create({
  baseURL: "http://localhost:5000/api", // Aapka Backend URL
  withCredentials: true, // Takay cookies (JWT) automatically backend par jayein
  headers: {
    "Content-Type": "application/json",
  },
});

// Response Interceptor: Backend ke standardized response ko handle karne ke liye
api.interceptors.response.use(
  (response) => {
    // Agar request successful hai, toh sirf data return karo
    // Kyunke aapka backend ApiResponse format bhej raha hai { data, success, message }
    return response;
  },
  (error) => {
    // Global error handling
    const message = error.response?.data?.message || "Something went wrong";
    console.error("API Error:", message);
    
    // Aap yahan toast notifications bhi trigger kar sakte hain
    return Promise.reject(error);
  }
);

export default api;