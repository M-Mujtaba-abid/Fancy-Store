"use client";

import React, { useState, Suspense } from "react";
// ✅ Apna hook import karein
import { useAllProducts } from "@/hooks/useProducts"; 
// ✅ Apna ProductCard import karein
import ProductCard from "@/components/shop/share/ProductCard"; 
import Loading from "@/app/loading"; // Agar aapka loading component hai
import { ChevronLeft, ChevronRight } from "lucide-react";

function ProductsContent() {
  // Pagination ke liye state (Default page 1, aur 12 items per page)
  const [page, setPage] = useState(1);
  const limit = 12; 

  // ✅ API Hit ho rahi hai
  const { data, isLoading, isError } = useAllProducts(page, limit);

  if (isLoading) return <Loading />;
  if (isError) return <div className="text-center py-20 text-red-500 font-medium">Failed to load products.</div>;

  return (
    <div className="min-h-screen pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Page Header */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-text-main">
          All Products
        </h1>
        <div className="h-1 w-16 bg-primary mt-3"></div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* ✅ Data Map Kar Rahe Hain */}
        {data?.products?.map((product: any) => (
          <ProductCard key={product.id} {...product} variant="default" />
        ))}

        {/* Empty State */}
        {data?.products?.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-500">
            <span className="text-4xl mb-4">🛒</span>
            <p className="text-lg font-medium">No products available at the moment.</p>
          </div>
        )}
      </div>

      {/* ✅ Pagination Controls (Next / Previous Buttons) */}
    {/* ✅ Pagination Controls (Next / Previous Buttons) */}
      {/* Yahan brackets lagana zaroori hain */}
      {(data?.totalPages || 0) > 1 && (
        <div className="flex justify-center items-center gap-4 mt-12 pt-8 border-t border-border/50">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-card border hover:bg-background"
          >
            <ChevronLeft size={18} /> Previous
          </button>
          
          <span className="font-medium text-text-muted">
            Page {data?.currentPage || 1} of {data?.totalPages || 1}
          </span>
          
          <button
            onClick={() => setPage((prev) => prev + 1)}
            // ✅ Yahan bhi brackets lazmi hain
            disabled={page >= (data?.totalPages || 1)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-card border hover:bg-background"
          >
            Next <ChevronRight size={18} />
          </button>
        </div>
      )}

    </div>
  );
}

// Next.js Best Practice (Hook use karte waqt Suspense zaroori hota hai agar parent layout mein issue aaye)
export default function ProductsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ProductsContent />
    </Suspense>
  );
}