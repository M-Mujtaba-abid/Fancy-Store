"use client";

import React from "react";
import { useRelatedProducts } from "@/hooks/useProducts";
import ProductCarousel from "../../share/ProductCarousel"; // Path check kar lein
import { Loader2 } from "lucide-react";

interface RelatedProductsProps {
  productId: string;
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({ productId }) => {
  // ✅ Hook Call
  const { data: products, isLoading, isError } = useRelatedProducts(productId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 text-primary">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  // Agar error aaye ya 0 products hon toh component hide kar do
  if (isError || !products || products.length === 0) return null;

  return (
    <div className="mt-20 pt-12 border-t border-border/50">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-text-main">
          You May Also Like
        </h2>
        <div className="h-1 w-16 bg-primary mt-2"></div>
      </div>

      {/* ✅ Aapka bana banaya Carousel */}
      <ProductCarousel products={products} cardVariant="default" />
    </div>
  );
};

export default RelatedProducts;