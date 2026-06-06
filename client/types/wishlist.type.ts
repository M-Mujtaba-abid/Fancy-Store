import { Product } from "./product.type";

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  Product: Product;
  createdAt: string;
  updatedAt: string;
}

export interface ToggleWishlistPayload {
  productId: string;
  product?: Product;
}

export interface ToggleWishlistResponse {
  added: boolean;
  message: string;
  data?: WishlistItem[];
}