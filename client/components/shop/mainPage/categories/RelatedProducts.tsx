"use client";

import React from "react";
import { useRelatedProducts } from "@/hooks/useProducts";
import ProductCarousel from "../../share/ProductCarousel"; // Path check kar lein
import { Loader2 } from "lucide-react";

interface RelatedProductsProps {
  productId: string;
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({ productId }) => {
  // ✅ 1. Yahan humne data ko rename nahi kiya, bas data rakha hai
  const { data, isLoading, isError } = useRelatedProducts(productId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 text-primary">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  // ✅ 2. Yahan humne PagingResponse (data) ke andar se asal products ka array nikal liya
  const productsArray = data?.products || [];

  // ✅ 3. Ab hum confidently .length use kar sakte hain kyunke yeh ab array hai
  if (isError || productsArray.length === 0) return null;

  return (
    <div className="mt-20 pt-12 border-t border-border/50">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-text-main">
          You May Also Like
        </h2>
        <div className="h-1 w-16 bg-primary mt-2"></div>
      </div>

      {/* ✅ 4. Carousel ko bhi pure array pass kar diya */}
      <ProductCarousel products={productsArray} cardVariant="default" />
    </div>
  );
};

export default RelatedProducts;