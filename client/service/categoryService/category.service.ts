import type { ApiResponse } from "@/types/product.type";
import type {
  AdminCategoryList,
  Category,
  CategoryDeleteResult,
  CategoryMutationInput,
} from "@/types/category.type";
import api from "../api";

const toCategoryFormData = (data: CategoryMutationInput) => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (key === "imageFile" || value === undefined || value === null) return;
    if (typeof value === "boolean") {
      formData.append(key, value ? "true" : "false");
    } else {
      formData.append(key, String(value));
    }
  });

  if (data.imageFile) {
    formData.append("image", data.imageFile);
  }

  return formData;
};

export const categoryService = {
  // Public — active categories, sortOrder ke hisaab se
  getAll: async () => {
    const res = await api.get<ApiResponse<Category[]>>("/categories");
    // Backend bare array bhejta hai; defensive rehna, sitemap/homepage
    // dono isi pe .map() karte hain
    return Array.isArray(res.data.data) ? res.data.data : [];
  },

  getBySlug: async (slug: string) => {
    const res = await api.get<ApiResponse<Category>>(`/categories/${slug}`);
    return res.data.data;
  },

  // Admin — inactive bhi + product counts + orphan slugs
  getAdminList: async () => {
    const res = await api.get<ApiResponse<AdminCategoryList>>(
      "/categories/admin/list"
    );
    return res.data.data;
  },

  create: async (payload: CategoryMutationInput) => {
    const res = await api.post<ApiResponse<Category>>(
      "/categories",
      toCategoryFormData(payload)
    );
    return res.data.data;
  },

  update: async (id: number, payload: CategoryMutationInput) => {
    const res = await api.patch<ApiResponse<Category>>(
      `/categories/${id}`,
      toCategoryFormData(payload)
    );
    return res.data.data;
  },

  remove: async (id: number) => {
    const res = await api.delete<ApiResponse<CategoryDeleteResult>>(
      `/categories/${id}`
    );
    return res.data.data;
  },
};
