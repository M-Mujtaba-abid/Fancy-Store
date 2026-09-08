"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/shop/share/ProductCard";
import { useFilteredProducts } from "@/hooks/useProducts";
import type { Product } from "@/types/product.type";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

interface CategoryClientProps {
  slug: string;
  initialProducts: Product[];
  initialTotalPages: number;
  pageSize: number;
}

/**
 * Page 1 server se aati hai (props mein), taake HTML mein products maujood hon
 * aur Google unko dekh sake. Page 2+ client pe fetch hoti hai.
 *
 * Purana /category page 12 products pe hard cap tha (useFilteredProducts ka
 * default limit, aur koi pagination UI nahi). Ab pagination hai.
 */
const CategoryClient = ({
  slug,
  initialProducts,
  initialTotalPages,
  pageSize,
}: CategoryClientProps) => {
  const [page, setPage] = useState(1);
  const [loadedProducts, setLoadedProducts] = useState<Product[]>(initialProducts);

  // page === 1 pe server data hi use karo — koi redundant fetch nahi
  const { data, isFetching, isError, refetch } = useFilteredProducts(
    { category: slug },
    page,
    pageSize
  );

  useEffect(() => {
    if (page > 1 && data?.products) {
      setLoadedProducts((current) => {
        const existingIds = new Set(current.map((product) => product.id));
        return [...current, ...(data.products as Product[]).filter((product) => !existingIds.has(product.id))];
      });
    }
  }, [data, page]);

  const products = loadedProducts;
  const totalPages = page === 1 ? initialTotalPages : data?.totalPages ?? 1;
  const loadNextPage = useCallback(() => setPage((currentPage) => currentPage + 1), []);
  const sentinelRef = useInfiniteScroll({
    hasMore: page < totalPages && !isError,
    isLoading: isFetching,
    onLoadMore: loadNextPage,
  });

  const showSkeleton = page !== 1 && isFetching && products.length === 0;

  if (!showSkeleton && products.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-text-muted">
          This Category is Coming soon...
        </p>
        <Link
          href="/products"
          className="inline-block mt-6 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Browse all products
        </Link>
      </div>
    );
  }

  return (
    <>
      {showSkeleton ? (
        <div className="flex min-h-75 items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
        </div>
      ) : (
        <div
          className={`grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 transition-opacity ${isFetching ? "opacity-60" : "opacity-100"
            }`}
        >
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      )}

      {isFetching && page > 1 && <div className="mt-6 flex justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-label="Loading more products" /></div>}
      {isError && page > 1 && (
        <div className="mt-4 flex flex-col items-center gap-2 text-sm text-red-500">
          <span>More products could not be loaded.</span>
          <button type="button" onClick={() => void refetch()} className="min-h-11 rounded-lg border border-red-200 px-4 py-2 font-semibold hover:bg-red-50">
            Retry
          </button>
        </div>
      )}
      <div ref={sentinelRef} aria-hidden="true" className="h-2" />
    </>
  );
};

export default CategoryClient;
