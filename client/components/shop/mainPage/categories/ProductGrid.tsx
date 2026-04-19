"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ShoppingCart, Eye, Star } from 'lucide-react';

const allProducts = [
  { id: 1, name: "Haval H6 Premium Cover", price: "5,500", category: "Cars", img: "/sportage.png", rating: 5 },
  { id: 2, name: "Yamaha R6 Sleek Shield", price: "3,200", category: "Bikes", img: "/bike.png", rating: 4 },
  { id: 3, name: "Sportage Alpha Cover", price: "5,200", category: "Cars", img: "/sportage.png", rating: 5 },
  { id: 4, name: "Honda CBR Stealth", price: "2,900", category: "Bikes", img: "/bike.png", rating: 4 },
  { id: 5, name: "Fortuner Legender Fit", price: "6,500", category: "Cars", img: "/sportage.png", rating: 5 },
  { id: 6, name: "Kawasaki Ninja Z", price: "3,500", category: "Bikes", img: "/bike.png", rating: 5 },
  { id: 7, name: "Civic RS Custom Cover", price: "4,800", category: "Cars", img: "/sportage.png", rating: 4 },
  { id: 8, name: "Suzuki Hayabusa Pro", price: "3,800", category: "Bikes", img: "/bike.png", rating: 5 },
];

const categories = ["All", "Cars", "Bikes"];

const ProductGrid = () => {
  const [activeTab, setActiveTab] = useState("All");

  const filteredProducts = activeTab === "All" 
    ? allProducts 
    : allProducts.filter(p => p.category === activeTab);

  return (
    <section className="py-20 bg-background text-text-main transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Filter */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 space-y-6 md:space-y-0">
          <div className="text-center md:text-left">
            <h2 className="text-4xl font-extrabold tracking-tight uppercase">
              Our <span className="text-primary italic">Collection</span>
            </h2>
            <p className="text-text-muted mt-2">High-quality protection for every vehicle</p>
          </div>

          {/* Filter Tabs */}
          <div className="flex bg-border-custom/30 p-1 rounded-full self-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-8 py-2 rounded-full text-sm font-bold transition-all ${
                  activeTab === cat 
                    ? "bg-primary text-white shadow-lg" 
                    : "text-text-muted hover:text-text-main"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          <AnimatePresence mode='popLayout'>
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="group"
              >
                {/* Image Container */}
                <div className="relative aspect-square bg-border-custom rounded-3xl overflow-hidden border border-border-custom/50 shadow-sm group-hover:shadow-xl transition-all duration-500">
                  <Image
                    src={product.img}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  {/* Hover Quick Actions */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
                    <button className="bg-white text-black p-3 rounded-full hover:bg-primary hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0">
                      <ShoppingCart size={20} />
                    </button>
                    <button className="bg-white text-black p-3 rounded-full hover:bg-primary hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 delay-75">
                      <Eye size={20} />
                    </button>
                  </div>
                </div>

                {/* Info Section */}
                <div className="mt-5 space-y-2 px-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                  </div>
                  
                  <div className="flex items-center space-x-1 text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill={i < product.rating ? "currentColor" : "none"} />
                    ))}
                    <span className="text-text-muted text-xs ml-2">({product.rating}.0)</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <p className="text-xl font-black text-primary">Rs. {product.price}</p>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted px-2 py-1 border border-border-custom rounded-md">
                      {product.category}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

export default ProductGrid;