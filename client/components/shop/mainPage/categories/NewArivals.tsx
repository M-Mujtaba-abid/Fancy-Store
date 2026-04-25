"use client";

import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
// ✅ Apna hook import karein
import { useNewArrivals } from "@/hooks/useProducts";
import ProductCard from '../../share/ProductCard';

const NewArrivals = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // ✅ 1. API se real data fetch kar rahe hain
  const { data, isLoading, isError } = useNewArrivals();

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  // ✅ 2. Loading State (Jab tak data aa raha hai)
  if (isLoading) {
    return (
      <section className="py-16 bg-background flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </section>
    );
  }

  // ✅ 3. Error ya Empty State (Agar API fail ho jaye ya koi product na ho toh yeh section hide ho jayega)
  if (isError || !data || data.products.length === 0) {
    return null; // Homepage pe khali jagah dikhane se behtar hai section hide kar dein
  }

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Area */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-text-main">New Arrivals</h2>
            <div className="h-1 w-12 bg-primary mt-2"></div>
          </div>
          <Link href="/shop" className="text-primary font-medium hover:underline text-sm">
            View more
          </Link>
        </div>

        {/* Carousel Container */}
        <div className="relative group">
          {/* Navigation Arrows */}
          <button onClick={() => scroll('left')} className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 bg-card p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
            <ChevronLeft size={24} />
          </button>
          <button onClick={() => scroll('right')} className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 bg-card p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
            <ChevronRight size={24} />
          </button>

          {/* Draggable/Scrollable Area */}
          <div ref={scrollRef} className="flex space-x-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4">
            
            {/* ✅ 4. Real data ko map kar diya */}
            {data.products.map((product) => (
              <motion.div 
                key={product.id}
                whileHover={{ y: -5 }}
                className="min-w-[280px] md:min-w-[calc(25%-18px)] snap-start"
              >
                {/* Ab 'as Product' likhne ki zaroorat nahi kyunke API type automatically theek aayegi */}
                <ProductCard {...product} />
              </motion.div>
            ))}

          </div>
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;