// hooks/useReview.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewService } from "@/service/review.service"; // Path verify kar lein
import { toast } from "react-hot-toast";
import { AxiosError } from "axios";
import { AdminReplyPayload } from "@/types/review.type";

// ======================= QUERIES (GET DATA) =======================

// 1. Get specific product reviews
export const useGetProductReviews = (productId: string | number) => {
  return useQuery({
    queryKey: ["productReviews", productId],
    queryFn: () => reviewService.getProductReviews(productId),
    // enabled: !!productId, // Jab tak productId nahi milta, request na bheje
  });
};

// 2. Get pending reviews for Admin
export const useGetPendingReviews = () => {
  return useQuery({
    queryKey: ["pendingReviews"],
    queryFn: reviewService.getPendingReviews,
  });
};


// ======================= MUTATIONS (MODIFY DATA) =======================

// 3. Add Review (User)
export const useAddReview = () => {
  return useMutation({
    mutationFn: (data: FormData) => reviewService.addReview(data),
    onSuccess: (res) => {
      toast.success(res.message || "Review submitted for approval!");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Failed to submit review");
    },
  });
};

// 4. Update Review (User)
export const useUpdateReview = (productId?: string | number) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: FormData }) => reviewService.updateReview({ id, data }),
    onSuccess: (res) => {
      toast.success(res.message || "Review updated!");
      if (productId) {
        queryClient.invalidateQueries({ queryKey: ["productReviews", productId] });
      }
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Failed to update review");
    },
  });
};

// 5. Delete Review (User/Admin)
export const useDeleteReview = (productId?: string | number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => reviewService.deleteReview(id),
    onSuccess: (res) => {
      toast.success(res.message || "Review deleted successfully!");
      if (productId) {
        queryClient.invalidateQueries({ queryKey: ["productReviews", productId] });
      }
      queryClient.invalidateQueries({ queryKey: ["pendingReviews"] }); // in case admin deletes a pending one
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Failed to delete review");
    },
  });
};

// 6. Approve Review (Admin)
export const useApproveReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => reviewService.approveReview(id),
    onSuccess: (res) => {
      toast.success(res.message || "Review approved and published!");
      // Pending list me se hatane ke liye
      queryClient.invalidateQueries({ queryKey: ["pendingReviews"] });
      // Product page par show karne ke liye (we might not have productId here easily, but we can invalidate all productReviews or just let the user see it when they visit the product)
      queryClient.invalidateQueries({ queryKey: ["productReviews"] }); 
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Failed to approve review");
    },
  });
};

// 7. Admin Reply (Admin)
export const useAdminReply = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: AdminReplyPayload }) => reviewService.adminReply({ id, payload }),
    onSuccess: (res) => {
      toast.success(res.message || "Reply posted successfully!");
      // Agar pending wali list mein tha tab bhi refresh karo, ya product list mein
      queryClient.invalidateQueries({ queryKey: ["pendingReviews"] });
      queryClient.invalidateQueries({ queryKey: ["productReviews"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Failed to post reply");
    },
  });
};