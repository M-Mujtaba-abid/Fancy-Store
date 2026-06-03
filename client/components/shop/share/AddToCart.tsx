"use client";

import React from "react";
import { ShoppingCart } from "lucide-react";
import { useAddToCart } from "@/hooks/useCart";
import toast from "react-hot-toast";
import { flyToCart } from "@/utils/flyToCart";
import { trackAddToCart } from "@/utils/tiktokTracking"; // 🎯 TIKTOK IMPORT

interface AddToCartProps {
  productId: string;
  stock: number;
  className?: string; // Custom styling allowance
  children?: React.ReactNode; // 👈 YEH LINE LAZMI ADD KAREIN
  product?: { id: string; name: string; price: number; category?: string }; // Product data for tracking
}

const AddToCart: React.FC<AddToCartProps> = ({
  productId,
  stock,
  className,
  product,
}) => {
  const { mutate: addToCart } = useAddToCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const isLoggedIn =
      typeof window !== "undefined" ? localStorage.getItem("isLoggedIn") : null;
    if (!isLoggedIn) {
      toast.error("Please login to add items to cart!");
      return;
    }

    if (stock <= 0) {
      toast.error("Product is out of stock!");
      return;
    }

    // ✅ Animation chalao
    flyToCart(e);

    addToCart({ productId, quantity: 1 });

    // 🎯 TIKTOK CONTENT CODE: Product added to cart
    if (product) {
      trackAddToCart(
        {
          id: product.id,
          name: product.name,
          price: product.price,
          category: product.category,
        },
        1,
      );
    }
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={stock <= 0}
      className={`bg-primary text-white p-2 rounded-full hover:scale-105 transition-transform disabled:bg-gray-400 disabled:cursor-not-allowed ${className}`}
    >
      <ShoppingCart size={18} />
    </button>
  );
};

export default AddToCart;
