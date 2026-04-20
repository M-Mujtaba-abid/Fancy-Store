export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
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