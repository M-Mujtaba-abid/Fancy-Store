// app/(shop)/products/ProductsClient.tsx
"use client";

import React, { useRef, useEffect, Suspense } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { productService } from "@/service/productservice/product.service";
import ProductCard from "@/components/shop/share/ProductCard"; 
import Loading from "@/app/loading"; 
import { ChevronLeft, ChevronRight } from "lucide-react";
import SmallLoader from "@/components/shop/share/SmallLoader";

function ProductsContent() {
  const limit = 12;

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["products", "all"],
    queryFn: ({ pageParam = 1 }: any) => productService.getAllProducts(pageParam, limit),
    getNextPageParam: (lastPage: any) => {
      if (!lastPage) return undefined;
      return lastPage.currentPage < (lastPage.totalPages || 0)
        ? lastPage.currentPage + 1
        : undefined;
    },
    initialPageParam: 1,
  });

  const products = data?.pages?.flatMap((p: any) => p.products) || [];
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const node = sentinelRef.current;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        });
      },
      { rootMargin: "200px" },
    );

    obs.observe(node);
    return () => obs.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) return <Loading />;
  if (isError)
    return (
      <div className="text-center py-20 text-red-500 font-medium">
        Failed to load products.
      </div>
    );

  return (
    <div className="min-h-screen pt-8 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-text-main">
          All Products
        </h1>
        <div className="h-1 w-16 bg-primary mt-3"></div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
        {products.map((product: any) => (
          <ProductCard key={product.id} {...product} variant="default" />
        ))}

        {products.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-500">
            <span className="text-4xl mb-4">🛒</span>
            <p className="text-lg font-medium">No products available at the moment.</p>
          </div>
        )}
      </div>

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} />

      {/* Fetching next page spinner */}
       {isFetchingNextPage && <SmallLoader />}
    </div>
  );
}

export default function ProductsClient() {
  return (
    <Suspense fallback={<Loading />}>
      <ProductsContent />
    </Suspense>
  );
}