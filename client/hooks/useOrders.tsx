import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService } from "@/service/orderService/order.service";
import { clearGuestCart } from "@/service/cartService/cart.service";
import { isAuthenticated } from "@/utils/auth";
import { PlaceOrderPayload } from "@/types/order.type";
import toast from "react-hot-toast";

export const usePlaceOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PlaceOrderPayload) => orderService.placeOrder(data),
    onSuccess: async () => {
      if (!isAuthenticated()) {
        clearGuestCart();
      }
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["myOrders"] });
      toast.success("Order placed successfully! 🎉");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to place order.");
    },
  });
};

// 2. Get current user's orders
export const useMyOrders = (params?: { phone?: string; orderId?: string }) => {
  return useQuery({
    // Query key me params shamil kiye hain taake track search fresh fetch trigger kare
    queryKey: ["myOrders", params], 
    queryFn: () => orderService.getMyOrders(params),
    // Agar user logged-in nahi hai aur params bhi khali hain, toh auto-fetch disabled rakhein
    enabled: isAuthenticated() || !!params?.phone || !!params?.orderId,
  });
};

// ================= ADMIN HOOKS =================

// 3. Get all orders (Admin)
export const useAllOrders = () => {
  return useQuery({
    queryKey: ["adminOrders"],
    queryFn: orderService.getAllOrders,
  });
};

// 4. Get order count (Admin Dashboard Stats)
export const useOrdersCount = () => {
  return useQuery({
    queryKey: ["adminOrderCount"],
    queryFn: orderService.getOrdersCount,
  });
};

// 5. Update Order Status (Admin)
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: orderService.updateOrderStatus,
    onSuccess: (res) => {
      // Status update hotay hi admin list fresh ho jaye
      queryClient.invalidateQueries({ queryKey: ["adminOrders"] });
      toast.success(`Order status updated to ${res.order.status}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update status");
    },
  });
};