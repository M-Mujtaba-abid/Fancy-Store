import { Product } from "./product.type";
import { ReviewUser } from "./review.type";
import { User } from "./user.type"; // Agar user type bani hui hai

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  Product?: Product;
  variantId?: number | null;
  variant?: any;
  isReviewed?: boolean; 
  Review?: ReviewUser;
}

export interface Order {
  id: string;
  userId: string;
  totalAmount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  fullName: string;
  phoneNumber: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  paymentMethod: "cod" | "stripe"; // Add more as needed
  shippingFee: number;
  createdAt: string;
  updatedAt: string;
  OrderItems?: OrderItem[];
  User?: User; // Admin ke liye
}

export interface PlaceOrderPayload {
  fullName: string;
  phoneNumber: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  paymentMethod: string;
  buyNowProductId?: string | number;
  buyNowQuantity?: number;
  buyNowVariantId?: number | null;
  guestCartItems?: { productId: string; quantity: number; variantId?: number | null }[];
}