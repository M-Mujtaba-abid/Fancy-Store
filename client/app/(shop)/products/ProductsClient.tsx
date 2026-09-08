// app/(shop)/products/ProductsClient.tsx
"use client";

import React, { Suspense } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { productService } from "@/service/productservice/product.service";
import ProductCard from "@/components/shop/share/ProductCard"; 
import Loading from "@/app/loading"; 
import SmallLoader from "@/components/shop/share/SmallLoader";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

function ProductsContent() {
  const limit = 12;

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
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
  const retryNextPage = () => void fetchNextPage();
  const sentinelRef = useInfiniteScroll({
    hasMore: Boolean(hasNextPage) && !isFetchNextPageError,
    isLoading: isFetchingNextPage,
    onLoadMore: () => void fetchNextPage(),
  });

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
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
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

      <div ref={sentinelRef} aria-hidden="true" className="h-2" />
      {isFetchingNextPage && <SmallLoader />}
      {isFetchNextPageError && (
        <div className="mt-4 flex flex-col items-center gap-2 text-sm text-red-500">
          <span>More products could not be loaded.</span>
          <button type="button" onClick={retryNextPage} className="min-h-11 rounded-lg border border-red-200 px-4 py-2 font-semibold hover:bg-red-50">
            Retry
          </button>
        </div>
      )}
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