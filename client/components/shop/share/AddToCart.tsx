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

    // 🎯 DEBUG: Button click ka-check
    console.log("🎯 [AddToCart] 1. Button clicked successfully!");
    console.log("🎯 [AddToCart] Product data:", product);
    console.log(
      "🎯 [AddToCart] 2. Is TTQ available?:",
      typeof window !== "undefined" && window.ttq ? "✅ YES" : "❌ NO",
    );

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
      console.log("🎯 [AddToCart] 3. Calling trackAddToCart with:", product);
      trackAddToCart(
        {
          id: product.id,
          name: product.name,
          price: product.price,
          category: product.category,
        },
        1,
      );
      console.log("🎯 [AddToCart] 4. trackAddToCart call completed!");
    } else {
      console.warn("❌ [AddToCart] Product data missing! Tracking skipped.");
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
