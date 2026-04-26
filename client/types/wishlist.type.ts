import { Product } from "./product.type";

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  Product: Product; // Backend 'include: [{ model: Product }]' se bheje ga
  createdAt: string;
  updatedAt: string;
}