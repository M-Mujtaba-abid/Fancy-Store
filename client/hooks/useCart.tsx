import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CartResponse, AddToCartPayload } from "@/types/cart.type";
import { SHIPPING_FEE } from "@/constants/shipping.constants";
import toast from "react-hot-toast";
import { cartService } from "@/service/cartService/cart.service";

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
    onMutate: async (newItem: AddToCartPayload) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previousCart = queryClient.getQueryData<CartResponse>(["cart"]) ?? {
        success: true,
        items: [],
        subtotal: 0,
      };

      const existingItemIndex = previousCart.items.findIndex(
        (i) => i.productId === newItem.productId && i.variantId === (newItem.variantId || null)
      );
      const newItems = [...previousCart.items];
      const itemPrice = newItem.price ?? 0;

      if (existingItemIndex >= 0) {
        newItems[existingItemIndex].quantity += newItem.quantity;
        newItems[existingItemIndex].itemTotal =
          newItems[existingItemIndex].quantity * newItems[existingItemIndex].price;
      } else {
        newItems.push({
          cartItemId: `optimistic_${Date.now()}`,
          productId: newItem.productId,
          variantId: newItem.variantId || null,
          name: newItem.name || "Product",
          image: newItem.image || "",
          quantity: newItem.quantity,
          price: itemPrice,
          itemTotal: newItem.quantity * itemPrice,
          availableStock: 999,
        });
      }

      const newSubtotal = newItems.reduce((total, item) => total + item.itemTotal, 0);
      const shippingFee = newItems.length ? (previousCart.shippingFee ?? SHIPPING_FEE) : 0;
      const totalAmount = newSubtotal + shippingFee;

      queryClient.setQueryData<CartResponse>(["cart"], {
        ...previousCart,
        items: newItems,
        subtotal: newSubtotal,
        shippingFee,
        totalAmount,
      });

      toast.success("Added to cart!");
      return { previousCart };
    },
    onSuccess: (data) => {
      if (data?.items) {
        queryClient.setQueryData<CartResponse>(["cart"], {
          success: true,
          items: data.items,
          subtotal: data.subtotal ?? 0,
        });
      }
    },
    onError: (err: any, newItem, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(["cart"], context.previousCart);
      }
      toast.error(err.response?.data?.message || "Failed, please try again to add product");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};

// 3. Update Cart Item (OPTIMISTIC UPDATE)
export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cartService.updateCartItem,
    onMutate: async (updatedItem: AddToCartPayload) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previousCart = queryClient.getQueryData<CartResponse>(["cart"]);

      if (previousCart) {
        const newItems = updatedItem.quantity <= 0
          ? previousCart.items.filter(i => !(i.productId === updatedItem.productId && i.variantId === (updatedItem.variantId || null)))
          : previousCart.items.map(item => {
              if (item.productId === updatedItem.productId && item.variantId === (updatedItem.variantId || null)) {
                return {
                  ...item,
                  quantity: updatedItem.quantity,
                  itemTotal: updatedItem.quantity * item.price
                };
              }
              return item;
            });

        const newSubtotal = newItems.reduce((total, item) => total + item.itemTotal, 0);
        const shippingFee = newItems.length ? (previousCart.shippingFee ?? SHIPPING_FEE) : 0;
        const totalAmount = newSubtotal + shippingFee;

        queryClient.setQueryData<CartResponse>(["cart"], {
          ...previousCart,
          items: newItems,
          subtotal: newSubtotal,
          shippingFee,
          totalAmount,
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
      queryClient.setQueryData(["cart"], {
        items: [],
        subtotal: 0,
        shippingFee: 0,
        totalAmount: 0,
        success: true
      });
      toast.success("Cart cleared");
    }
  });
};