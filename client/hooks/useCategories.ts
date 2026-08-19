import { categoryService } from "@/service/categoryService/category.service";
import type { CategoryMutationInput } from "@/types/category.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

/**
 * Admin category save karne ke baad homepage ka ISR cache clear karta hai.
 * app/page.tsx pe `revalidate = 3600` hai, aur Next stale-while-revalidate
 * karta hai — iske bina naya tile 1-2 ghante tak nahi dikhta.
 * Non-fatal: fail ho jaye to bas ISR window ka intezaar karna padega.
 */
const revalidateHome = async () => {
  try {
    await fetch("/api/revalidate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paths: ["/"] }),
    });
  } catch {
    // ignore — cache agli ISR window mein khud refresh ho jayega
  }
};

// Public — active categories (homepage tabs, admin dropdown)
export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.getAll(),
    // Categories rarely badalti hain; global staleTime 60s se zyada rakha hai
    staleTime: 5 * 60 * 1000,
  });
};

export const useCategory = (slug?: string) => {
  return useQuery({
    queryKey: ["categories", "detail", slug],
    queryFn: () => categoryService.getBySlug(slug!),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
};

// Admin — inactive bhi + product counts + orphans
export const useAdminCategories = () => {
  return useQuery({
    queryKey: ["categories", "admin"],
    queryFn: () => categoryService.getAdminList(),
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CategoryMutationInput) => categoryService.create(payload),
    onSuccess: async () => {
      toast.success("Category created successfully");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      await revalidateHome();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create category");
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CategoryMutationInput }) =>
      categoryService.update(id, payload),
    onSuccess: async () => {
      toast.success("Category updated successfully");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      await revalidateHome();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update category");
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => categoryService.remove(id),
    onSuccess: async (result) => {
      // Products maujood hon to backend soft delete karta hai — message usi ka hai
      toast.success(result?.message || "Category deleted");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      await revalidateHome();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete category");
    },
  });
};
