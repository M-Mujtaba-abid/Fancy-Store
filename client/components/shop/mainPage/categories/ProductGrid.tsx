"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCart,
  Eye,
  Star,
  PackageX,
} from "lucide-react";

// ✅ Real data ke liye apna hook aur loading import karein
import { useAllProducts } from "@/hooks/useProducts";
import Loading from "@/app/loading";
import WishlistButton from "../../share/WishlistButton";
import AddToCart from "../../share/AddToCart";
import { Pagination } from "../../share/Pagination";

// ✅ Apni categories import karein (Path apne hisaab se adjust kar lein)
import { HOME_CATEGORIES } from "@/constants/categoriesData";

// 📌 Sab tabs ko ek array mein combine kar liya (vehicleType aur categories dono ke liye)
const FILTER_TABS = [
  { id: "All", label: "All" },
  { id: "car", label: "Cars" },
  { id: "bike", label: "Bikes" },
  ...HOME_CATEGORIES.map((cat) => ({ id: cat.id, label: cat.title })),
];

const ProductGrid = () => {
  // 📌 Ab activeTab mein 'id' save hogi (e.g., 'All', 'car', 'seat_cover')
  const [activeTab, setActiveTab] = useState("All");

  const [page, setPage] = useState(1);
  const limit = 10; 

  const { data, isLoading, isError } = useAllProducts(page, limit);

  if (isLoading) return <Loading />;
  if (isError)
    return (
      <div className="text-center py-20 text-red-500 font-medium">
        Failed to load products.
      </div>
    );

  const allProducts = data?.products || [];
  
  // 📌 Smart Filtering Logic
  const filteredProducts =
    activeTab === "All"
      ? allProducts
      : allProducts.filter((p: any) => {
          // Agar user ne 'Cars' ya 'Bikes' select kiya hai toh vehicleType check karo
          if (activeTab === "car" || activeTab === "bike") {
            return p.vehicleType?.toLowerCase() === activeTab;
          }
          // Warna backend wali category check karo (e.g., 'seat_cover', 'dashboard_mat')
          return p.category === activeTab;
        });

  return (
    <section className="py-20 bg-background text-text-main transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header & Filter */}
        <div className="flex flex-col mb-12 space-y-6">
          <div className="text-center md:text-left">
            <h2 className="text-4xl font-extrabold tracking-tight uppercase">
              Our <span className="text-primary italic">Collection</span>
            </h2>
            <p className="text-text-muted mt-2">
              High-quality protection for every vehicle
            </p>
          </div>

          {/* 📌 Filter Tabs (Scrollable on mobile, Wrap on desktop) */}
          <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-4">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setPage(1); 
                }}
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

        {/* Products Grid */}
        <motion.div
          layout
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product: any) => {
              const isOutOfStock = product.stock <= 0;

              return (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  className="group"
                >
                  {/* Image Container */}
                  <div className="relative aspect-square bg-card rounded-3xl overflow-hidden shadow-sm group-hover:shadow-xl transition-all duration-500 floating-card block border border-border/50">
                    <Link
                      href={`/products/${product.id}`}
                      className="block w-full h-full"
                    >
                      <Image
                        src={
                          product.imageUrl ||
                          (product.images && product.images[0]) ||
                          "/placeholder.png"
                        }
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </Link>

                    <WishlistButton
                      productId={product.id}
                      className="absolute top-3 right-3 bg-white/80 backdrop-blur-md p-2 rounded-full hover:bg-white transition-colors shadow-sm opacity-0 group-hover:opacity-100 duration-300"
                    />

                    <div className="absolute inset-0 pointer-events-none bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
                      <AddToCart
  productId={product.id}
  stock={product.stock}
  className={`pointer-events-auto p-3 rounded-full transition-all transform translate-y-4 group-hover:translate-y-0 flex items-center justify-center ${
    isOutOfStock
      ? "bg-gray-300 text-gray-500"
      : "bg-white text-black! hover:bg-primary hover:text-white"
  }`}
>
  {isOutOfStock ? (
    <PackageX size={20} />
  ) : (
    <ShoppingCart size={20} />
  )}
</AddToCart>

                      <Link
                        href={`/products/${product.id}`}
                        className="pointer-events-auto bg-white text-black p-3 rounded-full hover:bg-primary hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 delay-75"
                      >
                        <Eye size={20} />
                      </Link>
                    </div>
                  </div>

                  {/* Info Section */}
                  <div className="mt-5 space-y-2 px-2">
                    <div className="flex justify-between items-start">
                      <Link href={`/products/${product.id}`}>
                        <h3 className="font-bold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                    </div>

                    <div className="flex items-center space-x-1 text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          fill={i < 5 ? "currentColor" : "none"}
                        />
                      ))}
                      <span className="text-text-muted text-xs ml-2">(5.0)</span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <p className="text-xl font-black text-primary">
                        Rs. {product.price.toLocaleString()}
                      </p>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted px-2 py-1 bg-card rounded-md floating-card border border-border/50">
                        {/* Yahan category show ho rahi hai */}
                        {product.category?.replace(/_/g, " ") || product.vehicleType || "Auto"}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <span className="text-4xl mb-4">🛒</span>
            <p className="text-lg font-medium">
              No products available in this category.
            </p>
          </div>
        )}

        {/* Pagination Component */}
       {(data?.totalPages || 0) > 1 && (
          <div className="mt-16 pt-8 border-t border-border/50">
            <Pagination
              currentPage={data?.currentPage || page}
              totalPages={data?.totalPages || 1}
              onPageChange={(newPage) => setPage(newPage)}
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductGrid;