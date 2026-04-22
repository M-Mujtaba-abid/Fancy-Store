import { ApiResponse } from "./product.type"; // Reusing your existing ApiResponse structure

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export interface AuthData extends User {
  token: string;
}

export type AuthResponse = ApiResponse<AuthData>;