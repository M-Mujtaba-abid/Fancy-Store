export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  vehicleType: "car" | "bike" | string;
  carModel: string;
  color: string;
  material: string;
  imageUrl: string;
  images: string[];
  isFeatured: boolean;
  isNewArrival: boolean;
  isOnSale: boolean;
  discountPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductMutationInput {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  vehicleType: "car" | "bike";
  carModel: string;
  color: string;
  material: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  isOnSale: boolean;
  discountPrice: number;
  images?: File[];
}

export type ProductUpdateInput = Partial<ProductMutationInput>;

export type AdminDashboardSection =
  | "products-add"
  | "products-show"
  | "orders-add"
  | "orders-show"
  | "users"
  | "settings-login-logout"
  | "settings-theme";

export interface PagingResponse {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  products: Product[];
}

export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}