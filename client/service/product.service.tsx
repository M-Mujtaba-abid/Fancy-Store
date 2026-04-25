import {
  ApiResponse,
  PagingResponse,
  Product,
  ProductMutationInput,
  ProductUpdateInput,
} from "@/types/product.type";
import api from "./api";

const toProductFormData = (data: ProductMutationInput | ProductUpdateInput) => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null || key === "images") return;

    if (typeof value === "boolean") {
      formData.append(key, value ? "true" : "false");
    } else {
      formData.append(key, String(value));
    }
  });

  if ("images" in data && data.images?.length) {
    data.images.forEach((file) => formData.append("images", file));
  }

  return formData;
};

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

  // 9. Admin: Get All Products
  getAdminProducts: async (page = 1, limit = 10) => {
    const res = await api.get<ApiResponse<PagingResponse>>(
      `/products?page=${page}&limit=${limit}`,
    );
    return res.data.data;
  },

  // 10. Admin: Create Product
  createProduct: async (payload: ProductMutationInput) => {
    const formData = toProductFormData(payload);
    const res = await api.post<ApiResponse<Product>>("/products", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data.data;
  },

  // 11. Admin: Update Product
  updateProduct: async (id: string, payload: ProductUpdateInput) => {
    const formData = toProductFormData(payload);
    const res = await api.patch<ApiResponse<Product>>(`/products/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data.data;
  },

  // 12. Admin: Delete Product
  deleteProduct: async (id: string) => {
    const res = await api.delete<ApiResponse<null>>(`/products/${id}`);
    return res.data;
  },
};
