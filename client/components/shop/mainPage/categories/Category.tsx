"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';

// ✅ 1. Apna data import karein
import { HOME_CATEGORIES } from '@/constants/categoriesData'; 

const Category = () => {
  return (
    <section className="py-12 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Heading */}
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

        {/* Cards Grid */}
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-8">
  {HOME_CATEGORIES.map((item) => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, x: item.direction }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* ✅ 1. 'md:h-105' hata diya. Ab aspect-square khud height/width manage karega */}
      <Link 
        href={`/category?category=${item.id}`} 
        className="group relative aspect-square block overflow-hidden bg-card rounded-xl shadow-lg cursor-pointer floating-card"
      >
        {/* Image Container */}
        <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
          {/* ✅ 2. bg-linear-to-t ko bg-gradient-to-t se theek kiya */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-90" />
        </div>

        {/* Hover "More" Button */}
        {/* ✅ z-10 lagaya taake hover button text/image ke oopar aaye */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 z-10">
          <div className="bg-primary/90 backdrop-blur-sm text-white p-3 md:p-4 rounded-full shadow-2xl transform scale-75 group-hover:scale-100 transition-transform duration-500">
            <Plus size={24} className="md:w-7 md:h-7" strokeWidth={2} />
          </div>
        </div>

        {/* Content - Bottom */}
        {/* ✅ 3. Padding (p-4 md:p-6) ko set kiya taake text box se bahar na nikle */}
        <div className="absolute bottom-0 left-0 p-4 md:p-6 w-full z-10">
          
          {/* ✅ Text size ko smooth kiya: mobile pe text-sm, tab pe text-lg, PC pe text-xl */}
          <h3 className="text-sm sm:text-lg md:text-xl lg:text-2xl truncate font-bold text-white tracking-tight drop-shadow-md">
            {item.title}
          </h3>
          
          <p className="text-gray-300 text-[10px] md:text-xs mt-1 font-light tracking-wide uppercase truncate">
            {item.subtitle}
          </p>
          
          <div className="mt-3 md:mt-4 h-1 w-0 bg-primary transition-all duration-500 group-hover:w-16 rounded-full" />
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