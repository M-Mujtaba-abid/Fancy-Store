import type { ApiResponse } from "@/types/product.type";
import type {
  BlogPost,
  BlogPostListItem,
  BlogPostsPage,
  BlogPostMutationInput,
  BlogDeleteResult,
} from "@/types/blog.type";
import api from "../api";

const toBlogFormData = (data: BlogPostMutationInput) => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (key === "coverImageFile" || value === undefined || value === null) return;

    // Backend's parseSlugArray expects JSON, not a comma-joined String().
    // Appended even when empty ("[]") so clearing all related links persists.
    if (key === "relatedProductSlugs" || key === "relatedCategorySlugs") {
      formData.append(key, JSON.stringify(value));
      return;
    }

    formData.append(key, String(value));
  });

  if (data.coverImageFile) {
    formData.append("coverImage", data.coverImageFile);
  }

  return formData;
};

export const blogService = {
  // Public — published only
  getPublished: async (page = 1, limit = 12) => {
    const res = await api.get<ApiResponse<BlogPostsPage>>(
      `/blog?page=${page}&limit=${limit}`
    );
    // Defensive shape — sitemap.js and the listing page both .map() this
    return res.data.data?.posts ? res.data.data : { totalItems: 0, totalPages: 1, currentPage: page, posts: [] };
  },

  getBySlug: async (slug: string) => {
    const res = await api.get<ApiResponse<BlogPost>>(`/blog/${slug}`);
    return res.data.data;
  },

  // Admin — all statuses, excludes body
  getAdminList: async () => {
    const res = await api.get<ApiResponse<BlogPostListItem[]>>("/blog/admin/list");
    return Array.isArray(res.data.data) ? res.data.data : [];
  },

  // Admin — full row incl. body, for the edit form
  getAdminById: async (id: number) => {
    const res = await api.get<ApiResponse<BlogPost>>(`/blog/admin/${id}`);
    return res.data.data;
  },

  create: async (payload: BlogPostMutationInput) => {
    const res = await api.post<ApiResponse<BlogPost>>("/blog", toBlogFormData(payload));
    return res.data.data;
  },

  update: async (id: number, payload: BlogPostMutationInput) => {
    // slug is immutable on the backend — never send it on update
    const { slug, ...rest } = payload;
    const res = await api.patch<ApiResponse<BlogPost>>(`/blog/${id}`, toBlogFormData(rest));
    return res.data.data;
  },

  remove: async (id: number) => {
    const res = await api.delete<ApiResponse<BlogDeleteResult>>(`/blog/${id}`);
    return res.data.data;
  },
};
