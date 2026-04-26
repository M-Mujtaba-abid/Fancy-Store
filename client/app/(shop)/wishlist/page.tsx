"use client";

import React from "react";
import { useGetWishlist } from "@/hooks/useWishlist";
import ProductCard from "@/components/shop/share/ProductCard";
import Loading from "@/app/loading";
import Link from "next/link";
import { Heart } from "lucide-react";

export default function WishlistPage() {
  const { data: wishlistItems, isLoading, isError } = useGetWishlist();

  if (isLoading) return <Loading />;

  // Agar user logged in nahi hai ya error aata hai
  if (isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Heart size={48} className="text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-text-main mb-2">Please Login</h2>
        <p className="text-text-muted mb-6">You need to be logged in to view your wishlist.</p>
        <Link href="/login" className="bg-primary text-white px-6 py-2 rounded-full font-medium hover:opacity-90">
          Go to Login
        </Link>
      </div>
    );
  }

  // Agar items nikal aayein toh unme se inner "Product" ko nikalna hoga
  // Kyunke backend { id, userId, productId, Product: {...} } bhej raha hai
  const products = wishlistItems?.map((item) => item.Product) || [];

  return (
    <div className="min-h-screen pt-8 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-10 flex items-center gap-3">
        <Heart className="text-primary fill-primary/20" size={50} />
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-text-main">My Wishlist</h1>
          <div className="h-1 w-16 bg-primary mt-3"></div>
        </div>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} variant="default" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-2xl border border-border/50">
          <Heart size={64} className="text-gray-200 mb-4" />
          <h2 className="text-xl font-bold text-text-main mb-2">Your wishlist is empty</h2>
          <p className="text-text-muted mb-6">Explore our collection and add your favorite products!</p>
          <Link href="/shop" className="bg-primary text-white px-6 py-2 rounded-full font-medium hover:opacity-90 transition-all">
            Start Shopping
          </Link>
        </div>
      )}
    </div>
  );
}