export interface CartItemType {
  cartItemId: string;
  productId: string;
  variantId?: number | null;
  name: string;
  image: string;
  // Meta/TikTok Pixel ke content_category ke liye. Backend ab bhejta hai
  // (services/cart.service.js), guest cart bhi store karta hai.
  category?: string;
  quantity: number;
  price: number;
  originalPrice?: number | null;
  itemTotal: number;
  availableStock: number;
}

export interface CartResponse {
  success: boolean;
  cartId?: string;
  items: CartItemType[];
  subtotal: number;
  shippingFee?: number;
  totalAmount?: number;
  message?: string;
}

export interface AddToCartPayload {
  productId: string;
  quantity: number;
  variantId?: number | null;
  price?: number;
  name?: string;
  image?: string;
  category?: string;
}