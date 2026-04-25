
"use client";
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const slides = [
  {
    id: 1,
    image: "/carosel/elentra.png",
    title: "Premium Vehicle Covers",
    para: "Protect your luxury assets with our high-grade materials.",
    align: "justify-start text-left", // First: Start (Left)
  },
  {
    id: 2,
    image: "/carosel/civic.png",
    title: "The Silver Collection",
    para: "Elegance meets durability in every stitch.",
    align: "justify-start text-left md:pl-40", // Second: Center-Left
  },
  {
    id: 3,
    image: "/carosel/sportage.png",
    title: "All-Weather Shield",
    para: "Rain, sun or snow—we've got you covered.",
    align: "justify-end text-right md:pr-40", // Third: Center-Right
  },
  {
    id: 4,
    image: "/carosel/wagonR.png",
    title: "Limited Edition Series",
    para: "Exclusive designs for the most passionate car owners.",
    align: "justify-end text-right", // Fourth: Proper Right
  }
];

const Carousel = () => {
  const [current, setCurrent] = useState(0);

  const nextSlide = () => setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  // Auto-play
  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [current]);

  return (
    <div className="relative h-[85vh] w-full overflow-hidden bg-background">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="relative h-full w-full"
        >
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-scale duration-10000"
            style={{ backgroundImage: `url(${slides[current].image})` }}
          >
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-black/40" />
          </div>

          {/* Content Container */}
          <div className={`relative h-full max-w-7xl mx-auto px-6 md:px-12 flex items-center ${slides[current].align}`}>
            <motion.div 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="max-w-xl text-white space-y-6"
            >
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
                {slides[current].title}
              </h1>
              <p className="text-lg md:text-xl text-gray-200 font-light max-w-md inline-block">
                {slides[current].para}
              </p>
              <div>
                <button className="bg-primary hover:bg-white hover:text-black text-white px-8 py-4 text-sm font-bold uppercase tracking-widest transition-all duration-300 rounded-none shadow-2xl">
                  Shop Now
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button 
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full border border-white/30 text-white hover:bg-white hover:text-black transition-all z-20"
      >
        <ChevronLeft size={30} />
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full border border-white/30 text-white hover:bg-white hover:text-black transition-all z-20"
      >
        <ChevronRight size={30} />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex space-x-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`h-1 transition-all duration-300 ${current === index ? 'w-12 bg-primary' : 'w-4 bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;