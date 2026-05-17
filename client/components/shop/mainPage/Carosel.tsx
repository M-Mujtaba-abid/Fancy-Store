"use client";
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

const slides = [
  {
    id: 1,
    image: "/carosel/elentra.png",
    title: "Premium Vehicle Covers",
    para: "Protect your luxury assets with our high-grade materials.",
    align: "justify-start text-left",
  },
  {
    id: 2,
    image: "/carosel/civic.png",
    title: "The Silver Collection",
    para: "Elegance meets durability in every stitch.",
    align: "justify-start text-left md:pl-24 lg:pl-40", // Adjusted for better scaling
  },
  {
    id: 3,
    image: "/carosel/sportage.png",
    title: "All-Weather Shield",
    para: "Rain, sun or snow—we've got you covered.",
    align: "justify-end text-right md:pr-24 lg:pr-40", // Adjusted for better scaling
  },
  {
    id: 4,
    image: "/carosel/wagonR.png",
    title: "Limited Edition Series",
    para: "Exclusive designs for the most passionate car owners.",
    align: "justify-end text-right",
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
          <div className="absolute inset-0 w-full h-full">
            <Image
              src={slides[current].image}
              alt={slides[current].title}
              fill
              priority={current === 0}
              className="object-cover object-center"
              sizes="100vw"
            />
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-black/50" />
          </div>

          {/* Content Container - PADDING INCREASED HERE (px-16 md:px-24) TO AVOID ARROWS */}
          <div className={`relative h-full max-w-7xl mx-auto px-16 sm:px-20 md:px-24 flex items-center ${slides[current].align}`}>
            <motion.div 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="w-full max-w-[280px] sm:max-w-md md:max-w-xl text-white space-y-4 md:space-y-6"
            >
              {/* Heading - SCALED DOWN FOR MOBILE */}
              <h1 className="text-3xl sm:text-xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight drop-shadow-lg">
                {slides[current].title}
              </h1>
              
              {/* Paragraph - SCALED DOWN FOR MOBILE */}
              <p className="text-sm sm:text-xs md:text-xl text-gray-200 font-medium inline-block drop-shadow-md">
                {slides[current].para}
              </p>
              
              {/* Button */}
              <div className="pt-2">
                <Link href={'/products'} className="inline-block bg-primary hover:bg-white hover:text-black text-white px-6 py-3 md:px-8 md:py-4 text-xs md:text-sm font-bold uppercase tracking-widest transition-all duration-300 rounded-sm shadow-xl">
                  Shop Now
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows - RESPONSIVE SIZES ADDED */}
      <button 
        onClick={prevSlide}
        className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 p-2 md:p-3 rounded-full border border-white/30 bg-black/20 hover:bg-white text-white hover:text-black backdrop-blur-sm transition-all z-20"
      >
        <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 p-2 md:p-3 rounded-full border border-white/30 bg-black/20 hover:bg-white text-white hover:text-black backdrop-blur-sm transition-all z-20"
      >
        <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 flex space-x-2 md:space-x-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`h-1.5 md:h-1 transition-all duration-300 rounded-full md:rounded-none ${current === index ? 'w-8 md:w-12 bg-primary' : 'w-2 md:w-4 bg-white/50'}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;