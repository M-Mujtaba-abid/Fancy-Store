"use client";

import React from "react";
import { useRelatedProducts } from "@/hooks/useProducts";
import ProductCarousel from "../../share/ProductCarousel"; // Path check kar lein
import { Loader2 } from "lucide-react";
import type { Product } from "@/types/product.type";

interface RelatedProductsProps {
  productId: string;
  /**
   * Server component (app/(shop)/products/[id]/page.tsx) se aane wale related
   * products. Ye SEO ke liye zaroori hain: inke bagair pehla paint sirf ek
   * spinner hota tha aur server HTML mein doosre products ka ek bhi link nahi
   * jata tha.
   */
  initialProducts?: Product[];
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({
  productId,
  initialProducts,
}) => {
  // ✅ 1. Yahan humne data ko rename nahi kiya, bas data rakha hai
  const { data, isLoading, isError } = useRelatedProducts(productId, initialProducts);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 text-primary">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }
  // ✅ 3. Ab hum confidently .length use kar sakte hain kyunke yeh ab array hai
  if (isError || !data || data.length === 0) return null;

  return (
    <div className="mt-20 pt-12 border-t border-border/50">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-text-main">
          You May Also Like
        </h2>
        <div className="h-1 w-16 bg-primary mt-2"></div>
      </div>

      {/* ✅ 4. Carousel ko bhi pure array pass kar diya */}
      <ProductCarousel products={data} cardVariant="default" />
    </div>
  );
};

export default RelatedProducts;
