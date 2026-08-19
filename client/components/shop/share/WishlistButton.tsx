"use client";

import React from "react";
import { Heart } from "lucide-react";
import { useGetWishlist, useToggleWishlist } from "@/hooks/useWishlist";
import { trackAddToWishlist } from "@/utils/tiktokTracking";
import { trackMetaAddToWishlist } from "@/utils/metaTracking";
import { Product } from "@/types/product.type";

interface WishlistButtonProps {
  productId: string;
  className?: string;
  iconClassName?: string;
  product?: Product;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({
  productId,
  className = "",
  iconClassName = "text-gray-400 fill-transparent hover:text-red-500",
  product,
}) => {
  const { data: wishlistItems } = useGetWishlist();
  const { mutate: toggleWishlist, isPending } = useToggleWishlist();

  const isWishlisted =
    wishlistItems?.some(
      (item) => String(item.productId) === String(productId),
    ) || false;

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    toggleWishlist(
      { productId, product },
      {
        onSuccess: (res) => {
          if (product && res.added) {
            trackAddToWishlist({
              id: product.id,
              name: product.name,
              price: product.discountPrice || product.price,
              category: product.category,
            });
            trackMetaAddToWishlist({
              id: product.id,
              name: product.name,
              price: product.discountPrice || product.price,
              category: product.category,
            });
          }
        },
      },
    );
  };

  return (
    <button
      onClick={handleWishlistClick}
      disabled={isPending}
      className={`z-10 disabled:cursor-not-allowed ${className}`}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        size={18}
        className={`transition-all duration-300 ${
          isPending
            ? "text-red-500 loading-heart"
            : isWishlisted
              ? "fill-red-500 text-red-500"
              : iconClassName
        }`}
      />
    </button>
  );
};

export default WishlistButton;
