"use client";

import React from "react";
import { ShoppingCart } from "lucide-react";
import { useAddToCart } from "@/hooks/useCart";
import toast from "react-hot-toast";
import { flyToCart } from "@/utils/flyToCart";

interface AddToCartProps {
  productId: string;
  stock: number;
  className?: string; // Custom styling allowance
}

const AddToCart: React.FC<AddToCartProps> = ({ productId, stock, className }) => {
  const { mutate: addToCart } = useAddToCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const isLoggedIn = typeof window !== "undefined" ? localStorage.getItem("isLoggedIn") : null;
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