import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { wishlistService } from "@/service/wishlist.service";
import toast from "react-hot-toast";

// 1. Get Wishlist Hook
export const useGetWishlist = () => {
  return useQuery({
    queryKey: ["wishlist"],
    queryFn: wishlistService.getWishlist,
    // Agar user logged in nahi hai (API 401 degi) toh background retries band kar dein
    retry: false, 
  });
};

// 2. Toggle Wishlist Hook
export const useToggleWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => wishlistService.toggleWishlist(productId),
    onSuccess: (res) => {
      // ✅ Jaise hi toggle successful ho, wishlist ka purana cache delete kar do 
      // taake automatically naya data fetch ho jaye aur heart icon fill/unfill ho jaye
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success(res.message); // Backend se aaya hua message ("Added" ya "Removed")
    },
    onError: (error: any) => {
      // Agar token nahi hai toh error aayega
      toast.error(error.response?.data?.message || "Please login to manage wishlist");
    },
  });
};