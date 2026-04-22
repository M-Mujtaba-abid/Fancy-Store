import { ApiResponse, PagingResponse, Product } from "@/types/product.type";
import api from "./api";

export const productService = {
  // 1. Get All Products
  getAllProducts: async (page = 1, limit = 10) => {
    const res = await api.get<ApiResponse<PagingResponse>>(
      `/products?page=${page}&limit=${limit}`,
    );
    return res.data.data; // ApiResponse ke andar ka 'data' field return hoga
  },

  // 2. Get Single Product
  getProductById: async (id: string) => {
    const res = await api.get<ApiResponse<Product>>(`/products/${id}`);
    return res.data.data;
  },

  // 3. New Arrivals
  getNewArrivals: async (page = 1, limit = 5) => {
    const res = await api.get<ApiResponse<PagingResponse>>(
      `/products/new-arrivals?page=${page}&limit=${limit}`,
    );
    return res.data.data;
  },

  // 4. Featured Products
  getFeatured: async (page = 1, limit = 5) => {
    const res = await api.get<ApiResponse<PagingResponse>>(
      `/products/featured?page=${page}&limit=${limit}`,
    );
    return res.data.data;
  },

  // 5. Search Products
  search: async (query: string, page = 1) => {
    const res = await api.get<ApiResponse<PagingResponse>>(
      `/products/search?q=${query}&page=${page}`,
    );
    return res.data.data;
  },

  // 6. On Sale Products
  getSaleProducts: async () => {
    const res = await api.get<ApiResponse<PagingResponse>>("/products/sale");
    return res.data.data;
  },

  // 7. Car Products (Top Covers)
  getCarProducts: async (page = 1, limit = 10) => {
    const res = await api.get<ApiResponse<PagingResponse>>(
      `/products/cars?page=${page}&limit=${limit}`,
    );
    return res.data.data;
  },

  // 8. Bike Products (Top Covers)
  getBikeProducts: async (page = 1, limit = 10) => {
    const res = await api.get<ApiResponse<PagingResponse>>(
      `/products/bikes?page=${page}&limit=${limit}`,
    );
    return res.data.data;
  },
};
