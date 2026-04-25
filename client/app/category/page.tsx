// src/app/shop/page.tsx
"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useFilteredProducts } from "@/hooks/useProducts";
import ProductCard from "@/components/shop/share/ProductCard";

function ShopContent() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("category") || undefined;

  // Real API Hit 🚀
  const { data, isLoading, isError } = useFilteredProducts({
    category: categoryId,
  });

  // Format title (e.g. "trunk_tray" to "Trunk Tray")
  const displayTitle = categoryId
    ? categoryId.replace(/_/g, " ")
    : "All Products";

  return (
    <div className="min-h-screen pt-12 pb-12 max-w-7xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-8 uppercase">
        Showing results for:{" "}
        <span className="text-primary">{displayTitle}</span>
      </h1>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="text-center text-red-500 py-10">
          Something went wrong while fetching products.
        </div>
      )}

      {/* Data Loaded Successfully */}
      {!isLoading && !isError && data?.products && (
        <>
          {data.products.length === 0 ? (
            <div className="text-center text-gray-500 py-10 text-xl">
              No products found in this category.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 gap-6">
              {data.products.map((product) => (
                // ✅ Yahan humne reusable ProductCard use kiya hai
                // Spread operator {...product} saara data automatically map kar dega
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Next.js Best Practice: useSearchParams ko Suspense boundary mein wrap karna chahiye
export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen pt-24 text-center">Loading Shop...</div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}