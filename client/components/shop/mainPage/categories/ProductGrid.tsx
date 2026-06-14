"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAllProductsInfinite } from "@/hooks/useProducts";
import { HOME_CATEGORIES } from "@/constants/categoriesData";
import ProductCard from "../../share/ProductCard";
import SmallLoader from "../../share/SmallLoader";

const FILTER_TABS = [
  { id: "All", label: "All" },
  { id: "car", label: "Cars" },
  { id: "bike", label: "Bikes" },
  ...HOME_CATEGORIES.map((cat) => ({ id: cat.id, label: cat.title })),
];

const ProductGrid = () => {
  const [activeTab, setActiveTab] = useState("All");
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useAllProductsInfinite(10);

  const allProducts = data?.pages?.flatMap((p: any) => p.products) || [];

  const filteredProducts =
    activeTab === "All"
      ? allProducts
      : allProducts.filter((p: any) => {
          if (activeTab === "car" || activeTab === "bike") {
            return p.vehicleType?.toLowerCase() === activeTab;
          }
          return p.category === activeTab;
        });

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
      { rootMargin: "200px" }
    );

    obs.observe(node);
    return () => obs.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <section className="py-20 bg-background text-text-main transition-colors duration-300 min-h-[800px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col mb-12 space-y-6">
          <div className="text-center md:text-left">
            <h2 className="text-4xl font-extrabold tracking-tight uppercase">
              Our <span className="text-primary italic">Collection</span>
            </h2>
            <p className="text-text-muted mt-2">
              High-quality protection for every vehicle
            </p>
          </div>

          <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-4">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all border border-border/50 floating-card ${
                  activeTab === tab.id
                    ? "bg-primary text-white shadow-lg"
                    : "bg-card text-text-muted hover:text-text-main hover:bg-background"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20 min-h-[400px]">
            <SmallLoader />
          </div>
        ) : isError ? (
          <div className="text-center py-20 text-red-500 font-medium">
            Failed to load products.
          </div>
        ) : (
          <>
            <motion.div
              layout
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8"
            >
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product: any) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4 }}
                    className="h-full"
                  >
                    <ProductCard
                      {...product}
                      variant="overlay"
                      averageRating={product.rating || product.averageRating || 0}
                      totalReviews={product.totalReviews || product.reviews?.length || 0}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {filteredProducts.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <span className="text-4xl mb-4">🛒</span>
                <p className="text-lg font-medium">No products available in this category.</p>
              </div>
            )}

            <div ref={sentinelRef} />
            {isFetchingNextPage && <SmallLoader />}
          </>
        )}
      </div>
    </section>
  );
};

export default ProductGrid;