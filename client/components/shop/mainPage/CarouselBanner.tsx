"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const slides = [
  {
    id: "car-covers",
    image: "/carosel/elentra.webp",
    eyebrow: "Limited-time offer",
    title: "Flat 40% Off on All Car Covers",
    description: "Keep your car protected from dust, sun, rain, and everyday wear.",
    href: "/category/car_topCover",
    cta: "Shop Car Covers",
    accent: "from-orange-950/95 via-slate-950/75 to-slate-950/20",
  },
  {
    id: "new-arrivals",
    image: "/carosel/civic.webp",
    eyebrow: "Fresh for your ride",
    title: "Meet the New Arrivals",
    description: "Discover newly added accessories selected for a smarter drive.",
    href: "/viewMore?filter=new-arrivals",
    cta: "Explore New Arrivals",
    accent: "from-slate-950/95 via-slate-950/70 to-slate-950/20",
  },
  {
    id: "best-sellers",
    image: "/carosel/sportage.webp",
    eyebrow: "Loved by drivers",
    title: "Shop Our Best Sellers",
    description: "Proven essentials and customer favourites, ready for every journey.",
    href: "/products",
    cta: "Shop Best Sellers",
    accent: "from-slate-950/95 via-blue-950/70 to-slate-950/20",
  },
] as const;

const AUTOPLAY_DELAY = 4500;

export default function CarouselBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isAutoplayPaused, setIsAutoplayPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const currentSlide = slides[currentIndex];

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex((index + slides.length) % slides.length);
  }, []);

  const goNext = useCallback(() => goToSlide(currentIndex + 1), [currentIndex, goToSlide]);
  const goPrevious = useCallback(() => goToSlide(currentIndex - 1), [currentIndex, goToSlide]);

  useEffect(() => {
    if (isPaused || isAutoplayPaused) return undefined;
    const timer = window.setInterval(goNext, AUTOPLAY_DELAY);
    return () => window.clearInterval(timer);
  }, [goNext, isAutoplayPaused, isPaused]);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    touchStartX.current = event.clientX;
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;
    const distance = event.clientX - touchStartX.current;
    if (Math.abs(distance) > 45) {
      if (distance > 0) goPrevious();
      else goNext();
    }
    touchStartX.current = null;
  };

  return (
    <section
      className="relative h-[min(620px,72vh)] min-h-107.5 w-full overflow-hidden bg-slate-950 text-white sm:min-h-125 lg:h-[min(680px,78vh)]"
      aria-roledescription="carousel"
      aria-label="Featured promotions"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => { touchStartX.current = null; }}
  style={{ touchAction: "pan-y" }}
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={currentSlide.id}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <Image
            src={currentSlide.image}
            alt=""
            fill
            priority={currentIndex === 0}
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className={`absolute inset-0 bg-linear-to-r ${currentSlide.accent}`} />
          <div className="absolute inset-0 bg-black/15" />
        </motion.div>
      </AnimatePresence>

      <div className="relative mx-auto flex h-full w-full max-w-7xl items-center px-14 py-12 sm:px-20 md:px-24 lg:px-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            className="max-w-xl"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-amber-300 sm:text-sm">{currentSlide.eyebrow}</p>
            <h1 className="max-w-lg text-3xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">{currentSlide.title}</h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-slate-200 sm:text-base">{currentSlide.description}</p>
            <Link href={currentSlide.href} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg bg-amber-400 px-5 py-3 text-sm font-extrabold text-slate-950 shadow-lg shadow-black/20 transition-colors hover:bg-amber-300 sm:mt-8">
              {currentSlide.cta}
              <ArrowRight size={17} aria-hidden />
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      <button type="button" onClick={goPrevious} aria-label="Previous slide" className="absolute left-3 top-1/2 z-20 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/25 text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-slate-950 sm:left-6">
        <ChevronLeft size={24} />
      </button>
      <button type="button" onClick={goNext} aria-label="Next slide" className="absolute right-3 top-1/2 z-20 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/25 text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-slate-950 sm:right-6">
        <ChevronRight size={24} />
      </button>

      <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/25 px-3 py-2 backdrop-blur-sm">
        {slides.map((slide, index) => (
          <button type="button" key={slide.id} onClick={() => goToSlide(index)} aria-label={`Go to slide ${index + 1}`} aria-current={index === currentIndex} className={`min-h-3 min-w-3 rounded-full transition-all ${index === currentIndex ? "w-7 bg-amber-300" : "w-3 bg-white/55 hover:bg-white"}`} />
        ))}
        <button type="button" onClick={() => setIsAutoplayPaused((paused) => !paused)} aria-label={isAutoplayPaused ? "Resume autoplay" : "Pause autoplay"} className="ml-1 flex min-h-11 min-w-11 items-center justify-center rounded-full text-white/85 hover:text-white">
          {isAutoplayPaused ? <Play size={14} fill="currentColor" /> : <Pause size={14} />}
        </button>
      </div>
    </section>
  );
}
