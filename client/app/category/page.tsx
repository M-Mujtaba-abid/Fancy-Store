// src/app/shop/page.tsx
"use client";

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useFilteredProducts } from '@/hooks/useProducts'; // Apna path theek kar lein
// import ProductCard from '@/components/ProductCard'; // Apna ProductCard import karein

function ShopContent() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("category") || undefined; 
  
  // Real API Hit 🚀
  const { data, isLoading, isError } = useFilteredProducts({ category: categoryId });

  // Format title (e.g. "trunk_tray" to "Trunk Tray")
  const displayTitle = categoryId 
    ? categoryId.replace(/_/g, ' ') 
    : "All Products";

  return (
    <div className="min-h-screen pt-24 pb-12 max-w-7xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-8 uppercase">
        Showing results for: <span className="text-primary">{displayTitle}</span>
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
                <div key={product.id} className="border p-4 rounded-lg shadow-sm">
                  {/* Yahan par apna real ProductCard component call karein */}
                  {/* <ProductCard product={product} /> */}
                  
                  {/* Temporary Placeholder UI */}
                  <img src={product.imageUrl || product.images?.[0]} alt={product.name} className="w-full h-48 object-cover rounded-md mb-4"/>
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-primary font-bold">Rs. {product.price}</p>
                </div>
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
    <Suspense fallback={<div className="min-h-screen pt-24 text-center">Loading Shop...</div>}>
      <ShopContent />
    </Suspense>
  );
}