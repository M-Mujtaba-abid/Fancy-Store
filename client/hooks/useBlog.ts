import { blogService } from "@/service/blogService/blog.service";
import type { BlogPostMutationInput } from "@/types/blog.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

// Same fire-and-forget ISR-invalidation pattern as useCategories.ts's
// revalidateHome — non-fatal, worst case the ISR window just expires normally.
const revalidateBlog = async (slug?: string) => {
  try {
    await fetch("/api/revalidate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paths: ["/blog", "/sitemap.xml", ...(slug ? [`/blog/${slug}`] : [])],
      }),
    });
  } catch {
    // ignore — cache will refresh on its own during the next ISR window
  }
};

// Public — published posts, paginated
export const useBlogPosts = (page = 1, limit = 12) => {
  return useQuery({
    queryKey: ["blog", "published", page, limit],
    queryFn: () => blogService.getPublished(page, limit),
    staleTime: 60 * 1000,
  });
};

// Admin — all statuses
export const useAdminBlogPosts = () => {
  return useQuery({
    queryKey: ["blog", "admin"],
    queryFn: () => blogService.getAdminList(),
  });
};

// Admin — single post incl. body, for the edit form
export const useAdminBlogPost = (id?: number) => {
  return useQuery({
    queryKey: ["blog", "admin", "detail", id],
    queryFn: () => blogService.getAdminById(id!),
    enabled: !!id,
  });
};

export const useCreateBlogPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BlogPostMutationInput) => blogService.create(payload),
    onSuccess: async (post) => {
      toast.success("Blog post created");
      queryClient.invalidateQueries({ queryKey: ["blog"] });
      await revalidateBlog(post?.slug);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create blog post");
    },
  });
};

export const useUpdateBlogPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: BlogPostMutationInput }) =>
      blogService.update(id, payload),
    onSuccess: async (post) => {
      toast.success("Blog post updated");
      queryClient.invalidateQueries({ queryKey: ["blog"] });
      await revalidateBlog(post?.slug);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update blog post");
    },
  });
};

export const useDeleteBlogPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => blogService.remove(id),
    onSuccess: async (result) => {
      toast.success(result?.message || "Blog post deleted");
      queryClient.invalidateQueries({ queryKey: ["blog"] });
      await revalidateBlog(result?.post?.slug);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete blog post");
    },
  });
};
