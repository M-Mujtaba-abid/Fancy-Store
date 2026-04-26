export interface CartItemType {
  cartItemId: string;
  productId: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
  itemTotal: number;
  availableStock: number;
}

export interface CartResponse {
  success: boolean;
  cartId?: string;
  items: CartItemType[];
  subtotal: number;
  message?: string;
}

export interface AddToCartPayload {
  productId: string;
  quantity: number;
}