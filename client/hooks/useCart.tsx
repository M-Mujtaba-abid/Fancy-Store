import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cartService } from "@/service/cart.service";
import { CartResponse, AddToCartPayload } from "@/types/cart.type";
import toast from "react-hot-toast";

// 1. Get Cart
export const useGetCart = () => {
  return useQuery({
    queryKey: ["cart"],
    queryFn: cartService.getCart,
  });
};

// 2. Add To Cart (OPTIMISTIC UPDATE)
export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cartService.addToCart,
    onMutate: async (newItem) => {
      // 1. API hit hone se pehle purani queries roko
      await queryClient.cancelQueries({ queryKey: ["cart"] });

      // 2. Purana cart save kar lo (agar API fail hui toh wapas yahi laana hai)
      const previousCart = queryClient.getQueryData<CartResponse>(["cart"]);

      // 3. UI ko FORAN update karo (Fake data inject karo jab tak asli na aaye)
      if (previousCart) {
        const existingItemIndex = previousCart.items.findIndex(i => i.productId === newItem.productId);
        const newItems = [...previousCart.items];

        if (existingItemIndex >= 0) {
          newItems[existingItemIndex].quantity += newItem.quantity;
          newItems[existingItemIndex].itemTotal = newItems[existingItemIndex].quantity * newItems[existingItemIndex].price;
        }

        const newSubtotal = newItems.reduce((total, item) => total + item.itemTotal, 0);

        queryClient.setQueryData<CartResponse>(["cart"], {
          ...previousCart,
          items: newItems,
          subtotal: newSubtotal,
        });
      }

      toast.success("Added to cart!");
      return { previousCart };
    },
    onError: (err: any, newItem, context) => {
      // Agar backend se error (e.g. Out of stock) aaya toh purana cart wapas set karo
      if (context?.previousCart) {
        queryClient.setQueryData(["cart"], context.previousCart);
      }
      toast.error(err.response?.data?.message || "Failed, please try again to add product");
    },
    onSettled: () => {
      // End mein ek background refresh taake DB se exact data sync ho jaye
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};

// 3. Update Cart Item (OPTIMISTIC UPDATE)
export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cartService.updateCartItem,
    onMutate: async (updatedItem) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previousCart = queryClient.getQueryData<CartResponse>(["cart"]);

      if (previousCart) {
        // Agar quantity 0 hai toh remove kardo, warna update karo
        const newItems = updatedItem.quantity <= 0 
          ? previousCart.items.filter(i => i.productId !== updatedItem.productId)
          : previousCart.items.map(item => {
              if (item.productId === updatedItem.productId) {
                return { 
                  ...item, 
                  quantity: updatedItem.quantity, 
                  itemTotal: updatedItem.quantity * item.price 
                };
              }
              return item;
            });

        const newSubtotal = newItems.reduce((total, item) => total + item.itemTotal, 0);

        queryClient.setQueryData<CartResponse>(["cart"], {
          ...previousCart,
          items: newItems,
          subtotal: newSubtotal,
        });
      }

      return { previousCart };
    },
    onError: (err: any, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(["cart"], context.previousCart);
      }
      toast.error(err.response?.data?.message || "Failed to update cart");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};

// 4. Clear Cart
export const useClearCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cartService.clearCart,
    onSuccess: () => {
      queryClient.setQueryData(["cart"], { items: [], subtotal: 0, success: true });
      toast.success("Cart cleared");
    }
  });
};