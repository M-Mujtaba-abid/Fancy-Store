"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Product } from "@/types/product.type";
import Loading from "@/app/loading";
import { useAdminProducts, useDeleteProduct } from "@/hooks/useProducts";
import { Edit, Trash2, Package, Eye } from "lucide-react";
import ProductModal from "./ProductModal"; 
import { Pagination } from "@/components/shop/share/Pagination";
// ✅ Apna Pagination component import karein (Path apne hisaab se theek kar lein)
// import { Pagination } from "@/components/Pagination"; 

interface ShowProductProps {
  onEdit: (product: Product) => void;
}

const ShowProduct = ({ onEdit }: ShowProductProps) => {
  const [page, setPage] = useState(1);
  const limit = 8;
  const { data, isLoading, isError } = useAdminProducts(page, limit);
  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();

  // View Details Modal State
  const [viewProduct, setViewProduct] = useState<Product | null>(null);

  if (isLoading) return <Loading />;

  if (isError) {
    return (
      <div className="bg-card rounded-2xl p-6 shadow-sm">
        <p className="text-error text-sm font-semibold">Failed to fetch products. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
       {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card rounded-2xl p-6 shadow-sm border border-border/50">
        <div>
          <h2 className="text-2xl font-bold text-text-main">All Products</h2>
          {/* <p className="text-sm text-text-muted mt-1">Manage your inventory. Total: {data?.totalItems || 0} products</p> */}
        </div>
      </div> 

      {/* --- GRID CARDS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {data?.products?.map((product) => (
          <div 
            key={product.id} 
            className="bg-card rounded-2xl shadow-sm border border-border/50 overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-300"
          >
            {/* Image Wrapper */}
            <div 
              onClick={() => setViewProduct(product)}
              className="relative aspect-square bg-gray-100 dark:bg-gray-800 p-4 flex items-center justify-center cursor-pointer group"
            >
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-contain p-4 mix-blend-multiply dark:mix-blend-normal group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <Package size={40} className="text-text-muted opacity-50" />
              )}

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                <span className="bg-orange-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm uppercase tracking-wider">
                  🔥 Hot Item
                </span>
                
                {product.isFeatured && (
                  <span className="bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">Featured</span>
                )}
                {product.isOnSale && (
                  <span className="bg-primary text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">Sale</span>
                )}
              </div>

              {/* Stock Badge */}
              <div className="absolute top-3 right-3 z-10">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm ${product.stock <= 5 ? "bg-red-100 text-red-700" : "bg-background text-text-main"}`}>
                  Stock: {product.stock}
                </span>
              </div>
            </div>

            {/* Product Details */}
            <div className="p-4 flex flex-col flex-1">
              <h3 className="font-bold text-text-main line-clamp-1 mb-1" title={product.name}>
                {product.name}
              </h3>
              
              <div className="flex items-center gap-2 mb-4">
                {product.isOnSale && product.discountPrice ? (
                  <>
                    <span className="text-lg font-black text-primary">Rs. {product.discountPrice.toLocaleString()}</span>
                    <span className="text-xs font-medium text-text-muted line-through">Rs. {product.price.toLocaleString()}</span>
                  </>
                ) : (
                  <span className="text-lg font-black text-text-main">Rs. {product.price.toLocaleString()}</span>
                )}
              </div>

              {/* Actions: View, Edit, Delete */}
              <div className="grid grid-cols-3 gap-2 mt-auto pt-4 border-t border-border/50">
                <button
                  onClick={() => setViewProduct(product)}
                  className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-100 transition-colors"
                  title="View Details"
                >
                  <Eye size={16} />
                  <span className="text-[10px] font-bold">View</span>
                </button>
                <button
                  onClick={() => onEdit(product)}
                  className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-background border border-border text-text-main hover:border-primary hover:text-primary transition-colors"
                  title="Edit Product"
                >
                  <Edit size={16} />
                  <span className="text-[10px] font-bold">Edit</span>
                </button>
                <button
                  disabled={isDeleting}
                  onClick={() => deleteProduct(product.id)}
                  className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
                  title="Delete Product"
                >
                  <Trash2 size={16} />
                  <span className="text-[10px] font-bold">Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ========================================= */}
      {/* ✅ AAPKA EXISTING PAGINATION COMPONENT */}
      {/* ========================================= */}
      <Pagination 
        currentPage={data?.currentPage || page} 
        totalPages={data?.totalPages || 1} 
        onPageChange={setPage} 
      />

      {/* ========================================= */}
      {/* VIEW DETAILS MODAL */}
      {/* ========================================= */}
      {viewProduct && (
        <ProductModal 
          product={viewProduct} 
          onClose={() => setViewProduct(null)} 
        />
      )}

    </div>
  );
};

export default ShowProduct;