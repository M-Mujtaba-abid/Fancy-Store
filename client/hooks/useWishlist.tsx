import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { wishlistService } from "@/service/wishlistService/wishlist.service";
import {
  ToggleWishlistPayload,
  WishlistItem,
} from "@/types/wishlist.type";
import toast from "react-hot-toast";

export const useGetWishlist = () => {
  return useQuery({
    queryKey: ["wishlist"],
    queryFn: wishlistService.getWishlist,
    retry: false,
  });
};

export const useToggleWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ToggleWishlistPayload) =>
      wishlistService.toggleWishlist(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ["wishlist"] });
      const previousWishlist = queryClient.getQueryData<WishlistItem[]>([
        "wishlist",
      ]);

      if (previousWishlist) {
        const exists = previousWishlist.some(
          (item) => String(item.productId) === String(payload.productId),
        );
        const updated = exists
          ? previousWishlist.filter(
              (item) => String(item.productId) !== String(payload.productId),
            )
          : payload.product
            ? [
                {
                  id: `optimistic_${Date.now()}`,
                  userId: "guest",
                  productId: payload.productId,
                  Product: payload.product,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
                ...previousWishlist,
              ]
            : previousWishlist;

        queryClient.setQueryData(["wishlist"], updated);
      }

      return { previousWishlist };
    },
    onSuccess: (res) => {
      if (res.data) {
        queryClient.setQueryData(["wishlist"], res.data);
      }
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success(res.message);
    },
    onError: (error: any, _payload, context) => {
      if (context?.previousWishlist) {
        queryClient.setQueryData(["wishlist"], context.previousWishlist);
      }
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update wishlist",
      );
    },
  });
};
