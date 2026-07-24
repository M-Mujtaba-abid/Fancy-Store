// --- Product Variant Types ---
export interface ProductVariant {
  id: number;
  productId: number;
  variantType: string; // e.g., "material", "color", "size", "finish"
  variantValue: string; // e.g., "Silver Coated", "Black", "XL"
  materialName?: string; // Backward compatibility fallback
  price: number;
  salePrice?: number | null;
  stock: number;
  imageUrl?: string | null;
  sku?: string | null;
  status?: string;
}

export interface VariantInput {
  id?: number; // present when editing existing variant
  variantType: string;
  variantValue: string;
  materialName?: string; // Backward compatibility fallback
  price: number;
  salePrice?: number | null;
  stock: number;
  imageUrl?: string | null;
  imageFile?: File | null;
  sku?: string | null;
  status?: string;
}

export const COMMON_VARIANT_TYPES = [
  "Material",
  "Color",
  "Size",
  "Finish",
  "Edition",
  "Capacity",
] as const;

export const MATERIAL_OPTIONS = [
  "Silver Coated",
  "Black Coated",
  "PVC + Cotton",
  "Micro Fiber",
] as const;

export type MaterialName = (typeof MATERIAL_OPTIONS)[number];

// --- Product Types ---
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  subCategory?: string | null; 
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
  sold?: number;
  createdAt: string;
  updatedAt: string;
  variants?: ProductVariant[];
}

export interface ProductMutationInput {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  subCategory?: string | null; 
  vehicleType: "car" | "bike";
  carModel: string;
  color: string;
  material: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  isOnSale: boolean;
  discountPrice: number;
  images?: File[];
  variants?: VariantInput[];
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
  products: Product[] | undefined;
}

export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}