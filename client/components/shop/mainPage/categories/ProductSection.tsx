"use client";

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Product } from "@/types/product.type";
import ProductCarousel from '../../share/ProductCarousel'; // 👈 Naya component import kiya

interface ProductSectionProps {
  title: string;
  products: Product[]; 
  isLoading: boolean;
  viewMoreLink: string; 
  cardVariant?: "minimal" | "overlay" | "default";
}

const ProductSection: React.FC<ProductSectionProps> = ({ title, products, isLoading, viewMoreLink, cardVariant = "default" }) => {
  
  // ✅ Loading State
  if (isLoading) {
    return (
      <section className="py-16 bg-background flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </section>
    );
  }

  // ✅ Error / Empty State
  if (!products || products.length === 0) return null; 

  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Area */}
        <div className="flex justify-between items-end mb-8 border-b border-border/50 pb-4">
          <div>
            <h2 className="text-2xl  text-primary md:text-3xl font-bold tracking-tight ">{title}</h2>
            <div className="h-1 w-12 bg-primary mt-2"></div>
          </div>
          
          <Link href={viewMoreLink} className="flex items-center text-primary font-medium hover:underline text-sm transition-all pb-1">
            View more <ChevronRight size={16} className="ml-1" />
          </Link>
        </div>

        {/* ✅ Separated Component Called via Props */}
        <ProductCarousel products={products} cardVariant={cardVariant} />

      </div>
    </section>
  );
};

export default ProductSection;