"use client";
import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, ShoppingCart, Percent } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

const saleProducts = [
  { id: 1, name: "Premium Haval Cover", originalPrice: "6,500", salePrice: "4,500", img: "/sportage.png", discount: "30% OFF" },
  { id: 2, name: "Superbike Pro Shield", originalPrice: "4,000", salePrice: "2,800", img: "/bike.png", discount: "25% OFF" },
  { id: 3, name: "Fortuner Elite Cover", originalPrice: "7,500", salePrice: "5,200", img: "/sportage.png", discount: "30% OFF" },
  { id: 4, name: "Yamaha R1 Sleek", originalPrice: "4,500", salePrice: "3,100", img: "/bike.png", discount: "20% OFF" },
  { id: 5, name: "Civic RS Custom", originalPrice: "6,000", salePrice: "4,200", img: "/sportage.png", discount: "30% OFF" },
];

const Sale = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Area - With Sale Badge */}
        <div className="flex justify-between items-end mb-8">
          <div className="flex items-center space-x-3">
            <div className="bg-error p-2 rounded-lg text-black">
              <Percent size={32} strokeWidth={3} />
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-text-main uppercase">Flash <span className="text-error">Sale</span></h2>
              <p className="text-xs text-text-muted font-medium">Limited time offers on premium covers</p>
            </div>
          </div>
          <Link href="/sale" className="text-error font-bold hover:underline text-sm uppercase tracking-wider">
            View All Deals
          </Link>
        </div>

        {/* Carousel Container */}
        <div className="relative group">
          
          {/* Navigation Arrows */}
          <button 
            onClick={() => scroll('left')}
            className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 bg-background border border-border-custom p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hidden md:block hover:bg-error hover:text-white"
          >
            <ChevronLeft size={24} />
          </button>

          <button 
            onClick={() => scroll('right')}
            className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 bg-background border border-border-custom p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hidden md:block hover:bg-error hover:text-white"
          >
            <ChevronRight size={24} />
          </button>

          {/* Scrollable Area */}
          <div 
            ref={scrollRef}
            className="flex space-x-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4"
          >
            {saleProducts.map((product) => (
              <motion.div 
                key={product.id}
                whileHover={{ y: -8 }}
                className="min-w-[280px] md:min-w-[calc(25%-18px)] snap-start"
              >
                <div className="relative aspect-[4/5] bg-border-custom rounded-2xl overflow-hidden group/card border border-border-custom/50">
                  <Image 
                    src={product.img} 
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover/card:scale-110"
                  />
                  
                  {/* Sale Badge */}
                  <div className="absolute top-3 left-3 bg-error text-white text-[11px] font-black px-3 py-1 rounded-full shadow-lg animate-pulse">
                    {product.discount}
                  </div>

                  {/* Add to Cart Quick Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center">
                    <button className="bg-error text-white px-6 py-2 rounded-full font-bold text-xs uppercase tracking-tighter flex items-center transform translate-y-4 group-hover/card:translate-y-0 transition-transform">
                      <ShoppingCart size={16} className="mr-2" /> Quick Add
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="mt-4 px-1 text-center">
                  <h3 className="text-sm font-semibold text-text-main truncate">{product.name}</h3>
                  <div className="flex justify-center items-center space-x-2 mt-1">
                    <p className="text-error font-black text-lg">Rs. {product.salePrice}</p>
                    <p className="text-text-muted line-through text-xs">Rs. {product.originalPrice}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
};

export default Sale;