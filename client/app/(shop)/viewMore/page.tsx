"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useShopPageProductsViewMore } from "@/hooks/useProducts";
import ProductCard from "@/components/shop/share/ProductCard"; 
import Loading from "@/app/loading";

function ShopContent() {
  const searchParams = useSearchParams();
  // ✅ URL se "?filter=" nikal rahe hain
  const currentFilter = searchParams.get("filter"); 
  const searchQuery = searchParams.get("search"); // e.g., "Honda"

  // ✅ Smart Hook Call: Yeh automatically filter ke hisaab se API hit karega
  const { data, isLoading, isError } = useShopPageProductsViewMore(currentFilter, searchQuery);

  // Dynamic Title
  const getPageTitle = () => {
    if (searchQuery) return `Search Results for "${searchQuery}"`; // Output: Search Results for "Honda"
    if (currentFilter === "new-arrivals") return "New Arrivals";
    if (currentFilter === "on-sale") return "Hot Deals & Sales";
    if (currentFilter === "featured") return "Featured Products";
    return "All Products"; // Agar filter na ho
  };

  if (isLoading) return <Loading />;
  if (isError) return <div className="text-center py-20 text-red-500">Failed to load products.</div>;

  return (
    <div className="min-h-screen pt-12 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Page Header */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-text-main">
          {getPageTitle()}
        </h1>
        <div className="h-1 w-16 bg-primary mt-3"></div>
      </div>

      {/* Products Grid (Yahan hum saare products grid mein show karenge) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
        {data?.products?.map((product: any) => (
          // View More wale page par aam tor par default variant acha lagta hai
          <ProductCard key={product.id} {...product} variant="default" />
        ))}

        {data?.products?.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-500">
            <span className="text-4xl mb-4">🔍</span>
            <p className="text-lg font-medium">
              {searchQuery ? `No products found matching "${searchQuery}"` : "No products found in this category."}
            </p>
          </div>
        )}

        {data?.products?.length === 0 && (
          <div className="col-span-full text-center py-20 text-gray-500 text-lg">
            No products found in this category.
          </div>
        )}
      </div>

    </div>
  );
}

// ✅ Next.js Best Practice: useSearchParams ko Suspense mein wrap karna zaroori hai
export default function ShopPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ShopContent />
    </Suspense>
  );
}