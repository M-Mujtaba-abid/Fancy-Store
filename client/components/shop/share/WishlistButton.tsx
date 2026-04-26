"use client";

import React from "react";
import { Heart } from "lucide-react";
import { useGetWishlist, useToggleWishlist } from "@/hooks/useWishlist";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface WishlistButtonProps {
  productId: string;
  className?: string;     // Button ki custom styling ke liye
  iconClassName?: string; // Heart icon ki custom styling ke liye (jaise default white ya gray)
}

const WishlistButton: React.FC<WishlistButtonProps> = ({ 
  productId, 
  className = "", 
  iconClassName = "text-gray-400 fill-transparent hover:text-red-500" 
}) => {
  const router = useRouter();
  const { data: wishlistItems } = useGetWishlist();
  const { mutate: toggleWishlist, isPending } = useToggleWishlist();

  const isWishlisted = wishlistItems?.some((item) => item.productId === productId) || false;

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Parent link par click hone se rokay

    const isLoggedIn = typeof window !== "undefined" ? localStorage.getItem("isLoggedIn") : null;

    if (!isLoggedIn) {
      toast.error("Please login to add items to your wishlist! 🔒");
      router.push("/login");
      return;
    }

    toggleWishlist(productId);
  };

  return (
    <button
      onClick={handleWishlistClick}
      disabled={isPending}
      className={`z-10 disabled:cursor-not-allowed ${className}`}
    >
      <Heart
        size={18}
        className={`transition-all duration-300 ${
          isPending
            ? "text-red-500 loading-heart" // ✅ Yahan apki custom class use ho rahi hai
            : isWishlisted
            ? "fill-red-500 text-red-500" // Liked state
            : iconClassName // Unliked state (Parent se aayegi)
        }`}
      />
    </button>
  );
};

export default WishlistButton;