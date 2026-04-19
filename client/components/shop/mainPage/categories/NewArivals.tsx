"use client";
import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

// Sample Data
const products = [
  { id: 1, name: "Luxury Haval Cover", price: "4,500", img: "/sportage.png", tag: "New" },
  { id: 2, name: "Superbike Pro Shield", price: "2,800", img: "/bike.png", tag: "Hot" },
  { id: 3, name: "Fortuner Elite Cover", price: "5,200", img: "/sportage.png", tag: "New" },
  { id: 4, name: "Yamaha R1 Sleek", price: "3,100", img: "/bike.png", tag: "Best" },
  { id: 5, name: "Civic RS Custom", price: "4,200", img: "/sportage.png", tag: "New" },
];

const NewArrivals = () => {
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
        
        {/* Header Area */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-text-main">New Arrivals</h2>
            <div className="h-1 w-12 bg-primary mt-2"></div>
          </div>
          <Link href="/shop" className="text-primary font-medium hover:underline text-sm flex items-center">
            View more
          </Link>
        </div>

        {/* Carousel Container */}
        <div className="relative group">
          
          {/* Navigation Arrows */}
          <button 
            onClick={() => scroll('left')}
            className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 bg-background border border-border-custom p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hidden md:block"
          >
            <ChevronLeft size={24} />
          </button>

          <button 
            onClick={() => scroll('right')}
            className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 bg-background border border-border-custom p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hidden md:block"
          >
            <ChevronRight size={24} />
          </button>

          {/* Draggable/Scrollable Area */}
          <div 
            ref={scrollRef}
            className="flex space-x-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4"
          >
            {products.map((product) => (
              <motion.div 
                key={product.id}
                whileHover={{ y: -5 }}
                className="min-w-[280px] md:min-w-[calc(25%-18px)] snap-start"
              >
                <div className="relative aspect-[4/5] bg-border-custom rounded-2xl overflow-hidden group/card border border-border-custom/50">
                  {/* Product Image */}
                  <Image 
                    src={product.img} 
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover/card:scale-110"
                  />
                  
                  {/* Tag */}
                  <span className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                    {product.tag}
                  </span>

                  {/* Add to Cart Quick Overlay */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center">
                    <button className="bg-white text-black p-3 rounded-full hover:bg-primary hover:text-white transition-colors">
                      <ShoppingCart size={20} />
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="mt-4 px-1">
                  <h3 className="text-sm font-semibold text-text-main truncate">{product.name}</h3>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-primary font-bold">Rs. {product.price}</p>
                    <span className="text-[10px] text-text-muted uppercase font-medium">Free Delivery</span>
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

export default NewArrivals;