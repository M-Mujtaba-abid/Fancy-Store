"use client";

import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import ProductCard from './ProductCard'; // Path apne hisaab se theek kar lein
import { Product } from "@/types/product.type";

interface ProductCarouselProps {
  products: Product[];
  cardVariant?: "default" | "overlay" | "minimal"; // 👈 Naya prop
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({ products, cardVariant = "default" }) => {
  // ... (scroll logic same rahegi)
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group">
      {/* Navigation Arrows */}
      <button 
        onClick={() => scroll('left')} 
        className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 bg-card p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hidden md:block"
      >
        <ChevronLeft size={24} />
      </button>
      
      <button 
        onClick={() => scroll('right')} 
        className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 bg-card p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hidden md:block"
      >
        <ChevronRight size={24} />
      </button>

      {/* Draggable/Scrollable Area */}
      <div ref={scrollRef} className="flex space-x-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4">
        {products.map((product) => (
          <motion.div 
            key={product.id}
            whileHover={{ y: -5 }}
            className="min-w-[280px] md:min-w-[calc(25%-18px)] snap-start"
          >
            <ProductCard {...product} variant={cardVariant} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProductCarousel;