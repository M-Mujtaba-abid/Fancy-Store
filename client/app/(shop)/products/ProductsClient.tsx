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
   * Server se aayi page ke products (productsView.tsx se). Inke bagair pehla
   * paint sirf ek spinner hota tha aur server HTML mein product ka ek bhi
   * link nahi jata tha.
   */
  initialProducts: Product[];
  /**
   * Server se kaun si page aayi hai. /products par 1, aur /products/page/<n>
   * par n. Infinite scroll isi ke AAGE se chalta hai — hardcoded 1 rakhne se
   * page 3 khol kar scroll karne par dobara page 2 fetch hoti.
   * (Wahi bug CategoryClient mein pehle theek ho chuka hai.)
   */
  initialPage: number;
  initialTotalPages: number;
  pageSize: number;
}

function ProductsContent({
  initialProducts,
  initialPage,
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
    // initialPage queryKey ka hissa hai: /products aur /products/page/3 ki
    // cached lists alag honi chahiye, warna page 3 kholne par react-query
    // page 1 ka cached data dikha deta.
    queryKey: ["products", "all", pageSize, initialPage],
    queryFn: ({ pageParam = initialPage }: any) =>
      productService.getAllProducts(pageParam, pageSize),
    getNextPageParam: (lastPage: any) => {
      if (!lastPage) return undefined;
      return lastPage.currentPage < (lastPage.totalPages || 0)
        ? lastPage.currentPage + 1
        : undefined;
    },
    initialPageParam: initialPage,
    // Server wali page ko seed kar do — koi redundant refetch nahi aur
    // hydration ke waqt grid khali nahi hoti. Khali array seed karne ka koi
    // faida nahi (server fetch fail hui hogi), us soorat mein normal client
    // fetch chalne do.
    initialData:
      initialProducts.length > 0
        ? {
            pages: [
              {
                products: initialProducts,
                currentPage: initialPage,
                totalPages: initialTotalPages,
                totalItems: initialProducts.length,
              },
            ],
            pageParams: [initialPage],
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
