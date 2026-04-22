import axios from "axios";
import { AuthResponse } from "@/types/user.type";
import api from "./api";


export const authService = {
  register: async (data: any): Promise<AuthResponse> => {
    const response = await api.post("/user/register", data);
    return response.data;
  },

  login: async (data: any): Promise<AuthResponse> => {
    const response = await api.post("/user/login", data);
    return response.data;
  },

  logout: async (): Promise<AuthResponse> => {
    const response = await api.post("/user/logout");
    return response.data;
  },
};