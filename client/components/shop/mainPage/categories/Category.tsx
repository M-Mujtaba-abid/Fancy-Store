"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const categories = [
  {
    id: 1,
    title: "Premium Car Covers",
    subtitle: "Custom fit for Haval & Luxury SUVs",
    image: "/sportage.png",
    link: "/shop/cars",
    direction: -50, // Slide from left
  },
  {
    id: 2,
    title: "Superbike Shields",
    subtitle: "High-performance protection for your ride",
    image: "/bike.png",
    link: "/shop/bikes",
    direction: 50, // Slide from right
  }
];

const Category = () => {
  return (
    <section className="py-12 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 1. Main Heading - Centered */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center mb-16"
        >
          <h2 className="text-3xl font-bold tracking-tighter text-text-main sm:text-4xl text-center">
            SHOP BY <span className="text-primary italic">CATEGORY</span>
          </h2>
          <div className="h-1 w-24 bg-primary mt-3"></div>
        </motion.div>

        {/* 2. Cards Grid with Framer Motion */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
          {categories.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: item.direction }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <Link 
                href={item.link} 
                className="group relative h-[380px] md:h-[420px] block overflow-hidden bg-border-custom rounded-xl shadow-lg cursor-pointer"
              >
                {/* Image Container */}
                <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  {/* Overlay for Depth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-90" />
                </div>

                {/* Hover "More" Button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                  <div className="bg-primary/90 backdrop-blur-sm text-white p-4 rounded-full shadow-2xl transform scale-75 group-hover:scale-100 transition-transform duration-500">
                    <Plus size={28} strokeWidth={2} />
                  </div>
                </div>

                {/* Content - Bottom */}
                <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
                  <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-gray-300 text-xs md:text-sm mt-1 font-light tracking-wide uppercase">
                    {item.subtitle}
                  </p>
                  
                  {/* Hover line animation */}
                  <div className="mt-4 h-[3px] w-0 bg-primary transition-all duration-500 group-hover:w-20" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Category;