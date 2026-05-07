// service/review.service.ts

import api from "./api"; // Apne axios instance ka path verify kar lein
import { 
  ProductReviewsResponse, 
  GenericReviewResponse, 
  PendingReviewsResponse, 
  AdminReplyPayload 
} from "@/types/review.type";

export const reviewService = {
  // 1. Get Approved Reviews for a Product (Public)
  getProductReviews: async (productId: string | number): Promise<ProductReviewsResponse> => {
    const res = await api.get(`/reviews/${productId}`);
    // console.log("get review ", res)
    return res.data;
  },

  // 2. Add Review (User - requires FormData for images)
  addReview: async (data: FormData): Promise<GenericReviewResponse> => {
    const res = await api.post("/reviews", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  // 3. Update Review (User - requires FormData for images)
  updateReview: async ({ id, data }: { id: string | number; data: FormData }): Promise<GenericReviewResponse> => {
    const res = await api.patch(`/reviews/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  // 4. Delete Review (User/Admin)
  deleteReview: async (id: string | number): Promise<GenericReviewResponse> => {
    const res = await api.delete(`/reviews/${id}`);
    return res.data;
  },

  // 5. Get Pending Reviews (Admin Only)
  getPendingReviews: async (): Promise<PendingReviewsResponse> => {
    const res = await api.get("/reviews/admin/pending");
    return res.data;
  },

  // 6. Approve Review (Admin Only)
  approveReview: async (id: string | number): Promise<GenericReviewResponse> => {
    const res = await api.patch(`/reviews/${id}/approve`);
    return res.data;
  },

  // 7. Reply to Review (Admin Only)
  adminReply: async ({ id, payload }: { id: string | number; payload: AdminReplyPayload }): Promise<GenericReviewResponse> => {
    const res = await api.patch(`/reviews/${id}/reply`, payload);
    return res.data;
  },
};