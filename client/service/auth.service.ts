// import axios from "axios";
// import { AuthResponse } from "@/types/user.type";
// import api from "./api";


// export const authService = {
//   register: async (data: any): Promise<AuthResponse> => {
//     const response = await api.post("/user/register", data);
//     return response.data;
//   },

//   login: async (data: any): Promise<AuthResponse> => {
//     const response = await api.post("/user/login", data);
//     return response.data;
//   },

//   logout: async (): Promise<AuthResponse> => {
//     const response = await api.post("/user/logout");
//     return response.data;
//   },
// };

import { AuthResponse, LoginInput, RegisterInput } from "@/types/user.type";
import api from "./api";



export const authService = {
  // ✅ 2. 'any' ki jagah strictly types assign karein
  register: async (data: RegisterInput): Promise<AuthResponse> => {
    const response = await api.post("/user/register", data);
    return response.data;
  },

  login: async (data: LoginInput): Promise<AuthResponse> => {
    const response = await api.post("/user/login", data);
    return response.data;
  },

  logout: async (): Promise<AuthResponse> => {
    const response = await api.post("/user/logout");
    return response.data;
  },

  handleGoogleLogin : () => {
  // Replace this URL with your actual backend base URL if it's different
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  window.location.href = `${BACKEND_URL}/api/user/auth/google`;
  
  console.log("clicked")
},

};