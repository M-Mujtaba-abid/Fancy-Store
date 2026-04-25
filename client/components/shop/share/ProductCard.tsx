"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Heart } from "lucide-react";
import { Product } from "@/types/product.type";
import Image from "next/image";

const ProductCard: React.FC<Product> = (product) => {
  const { id, name, price, discountPrice, imageUrl, isFeatured, isOnSale } = product;
  const [isWishlisted, setIsWishlisted] = useState(false);

  return (
    <Link href={`/products/${id}`}>
      <div className="group relative bg-card rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden floating-card">
        <div className="relative w-full h-48 bg-card/80 overflow-hidden">
          <Image
            src={imageUrl}  
            alt={name}
            width={300}
            height={300}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />

          <div className="absolute top-3 left-3 flex gap-2">
            {isOnSale && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">Sale</span>
            )}
            {isFeatured && (
              <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">Featured</span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              setIsWishlisted(!isWishlisted);
            }}
            className="absolute top-3 right-3 bg-card p-2 rounded-full shadow-md hover:bg-background transition-colors"
          >
            <Heart
              size={18}
              className={`transition-colors ${isWishlisted ? "fill-red-500 text-red-500" : "text-text-muted"}`}
            />
          </button>
        </div>

        <div className="p-4">
          <h3 className="text-sm font-semibold text-text-main line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {name}
          </h3>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-bold text-primary">₹{price}</span>
            {discountPrice && (
              <span className="text-sm line-through text-text-muted">₹{discountPrice}</span>
            )}
          </div>
          <button className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2 rounded-md transition-colors flex items-center justify-center gap-2">
            <ShoppingCart size={16} />
            Add to Cart
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;