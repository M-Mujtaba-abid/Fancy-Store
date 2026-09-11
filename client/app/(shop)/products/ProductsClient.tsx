// app/(shop)/products/ProductsClient.tsx
"use client";

import React, { Suspense } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { productService } from "@/service/productservice/product.service";
import ProductCard from "@/components/shop/share/ProductCard";
import Loading from "@/app/loading";
import SmallLoader from "@/components/shop/share/SmallLoader";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import type { Product } from "@/types/product.type";

interface ProductsClientProps {
  /**
   * Page 1 ke products, server component (page.tsx) se. Inke bagair pehla
   * paint sirf ek spinner hota tha aur server HTML mein product ka ek bhi
   * link nahi jata tha.
   */
  initialProducts: Product[];
  initialTotalPages: number;
  pageSize: number;
}

function ProductsContent({
  initialProducts,
  initialTotalPages,
  pageSize,
}: ProductsClientProps) {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
  } = useInfiniteQuery({
    queryKey: ["products", "all", pageSize],
    queryFn: ({ pageParam = 1 }: any) => productService.getAllProducts(pageParam, pageSize),
    getNextPageParam: (lastPage: any) => {
      if (!lastPage) return undefined;
      return lastPage.currentPage < (lastPage.totalPages || 0)
        ? lastPage.currentPage + 1
        : undefined;
    },
    initialPageParam: 1,
    // Server wali page 1 ko seed kar do — koi redundant refetch nahi aur
    // hydration ke waqt grid khali nahi hoti. Khali array seed karne ka koi
    // faida nahi (server fetch fail hui hogi), us soorat mein normal client
    // fetch chalne do.
    initialData:
      initialProducts.length > 0
        ? {
            pages: [
              {
                products: initialProducts,
                currentPage: 1,
                totalPages: initialTotalPages,
                totalItems: initialProducts.length,
              },
            ],
            pageParams: [1],
          }
        : undefined,
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
    <>
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
    </>
  );
}

export default function ProductsClient(props: ProductsClientProps) {
  return (
    <Suspense fallback={<Loading />}>
      <ProductsContent {...props} />
    </Suspense>
  );
}
