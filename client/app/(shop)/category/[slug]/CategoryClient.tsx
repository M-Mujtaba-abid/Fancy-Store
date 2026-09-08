"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/shop/share/ProductCard";
import { useFilteredProducts } from "@/hooks/useProducts";
import type { Product } from "@/types/product.type";

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
  const { data, isFetching, isError } = useFilteredProducts(
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

  const showSkeleton = page !== 1 && isFetching && products.length === 0;

  if (isError && page !== 1) {
    return (
      <div className="text-center text-red-500 py-10">
        Products load nahi ho sake.{" "}
        <button
          onClick={() => setPage(1)}
          className="underline hover:no-underline"
        >
          Page 1 pe wapis jayein
        </button>
      </div>
    );
  }

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
        <div className="flex justify-center items-center min-h-[300px]">
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

      {page < totalPages && (
        <div className="mt-10 flex justify-center">
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={isFetching}
            className="min-h-11 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isFetching ? "Loading..." : "Load More Products"}
          </button>
        </div>
      )}
    </>
  );
};

export default CategoryClient;
