export interface CartItemType {
  cartItemId: string;
  productId: string;
  variantId?: number | null;
  name: string;
  image: string;
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
}