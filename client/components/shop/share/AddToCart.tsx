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
  product?: {
    id: string;
    name: string;
    price: number;
    image?: string;
    category?: string;
    variantId?: number;
  };
  onClick?: (e: React.MouseEvent) => boolean | void;
}

const AddToCart: React.FC<AddToCartProps> = ({
  productId,
  stock,
  className,
  product,
  children,
  onClick,
}) => {
  const { mutate: addToCart } = useAddToCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (onClick) {
      const shouldProceed = onClick(e);
      if (shouldProceed === false) return;
    }

    if (stock <= 0) {
      toast.error("Product is out of stock!");
      return;
    }

    // ✅ Animation chalao
    flyToCart(e);

    // ✅ Ab hum yahan price aur name bhi bhej rahe hain (Guest cart ke liye zaroori hai)
    addToCart({
      productId,
      quantity: 1,
      price: product?.price || 0,
      name: product?.name || "Product",
      image: product?.image,
      variantId: product?.variantId,
    });

    // 🎯 TIKTOK CONTENT CODE
    if (product) {
      trackAddToCart({
          id: product.id,
          name: product.name,
          price: product.price,
          category: product.category,
        }, 1);
    }
  };
  return (
    <button
      onClick={handleAddToCart}
      disabled={stock <= 0}
      className={`bg-primary text-white p-2 rounded-full hover:scale-105 transition-transform disabled:bg-gray-400 disabled:cursor-not-allowed ${className}`}
    >
      {children || <ShoppingCart size={18} />}
    </button>
  );
};

export default AddToCart;
