import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService } from "@/service/order.service";
import { PlaceOrderPayload } from "@/types/order.type";
import toast from "react-hot-toast";

// ================= USER HOOKS =================

// 1. Place a new order
export const usePlaceOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PlaceOrderPayload) => orderService.placeOrder(data),
    onSuccess: () => {
      // ✅ Order place hone par Cart ko clear/refresh karna lazmi hai
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      // ✅ My Orders list ko bhi update kar dein
      queryClient.invalidateQueries({ queryKey: ["myOrders"] });
      toast.success("Order placed successfully! 🎉");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to place order.");
    },
  });
};

// 2. Get current user's orders
export const useMyOrders = () => {
  return useQuery({
    queryKey: ["myOrders"],
    queryFn: orderService.getMyOrders,
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