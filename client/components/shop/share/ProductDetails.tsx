"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  PackageX,
  Layers,
  Play,
  Video,
  Star,
  Plus,
  Minus,
} from "lucide-react";
import Image from "next/image";
import { Product, ProductVariant } from "@/types/product.type";
import RelatedProducts from "../mainPage/categories/RelatedProducts";
import AddToCart from "./AddToCart";
import { useAddToCart } from "@/hooks/useCart"; // ✅ Hook import kiya
import toast from "react-hot-toast";
import ExpandableDescription from "./ExpandableDescription";
import ProductReviews from "../reviews/ProductReviews";
import { trackViewContent } from "@/utils/tiktokTracking"; // 🎯 TIKTOK IMPORT
import { trackMetaViewContent } from "@/utils/metaTracking"; // 🎯 META PIXEL IMPORT

// Social Media Embed Parser Helper (Instagram Reels/Posts & TikTok Videos)
export type SocialPlatform = "instagram" | "tiktok";

export interface SocialVideoEmbed {
  platform: SocialPlatform;
  embedUrl: string;
  originalUrl: string;
}

export function parseSocialVideoUrl(url?: string | null): SocialVideoEmbed | null {
  if (!url || typeof url !== "string") return null;
  const cleanUrl = url.trim();
  if (!cleanUrl) return null;

  // Instagram Reel or Post (/reel/ or /p/)
  const instaMatch = cleanUrl.match(/instagram\.com\/(reel|p)\/([^/?#&]+)/i);
  if (instaMatch) {
    const type = instaMatch[1];
    const id = instaMatch[2];
    return {
      platform: "instagram",
      embedUrl: `https://www.instagram.com/${type}/${id}/embed`,
      originalUrl: cleanUrl,
    };
  }

  // TikTok Video (/video/{id})
  const tiktokMatch = cleanUrl.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/i) || cleanUrl.match(/tiktok\.com\/embed\/v2\/(\d+)/i);
  if (tiktokMatch) {
    const videoId = tiktokMatch[1];
    return {
      platform: "tiktok",
      embedUrl: `https://www.tiktok.com/embed/v2/${videoId}`,
      originalUrl: cleanUrl,
    };
  }

  // Generic fallback if user pasted another Instagram or TikTok URL format
  if (/instagram\.com/i.test(cleanUrl)) {
    const embed = cleanUrl.endsWith("/embed") ? cleanUrl : `${cleanUrl.replace(/\/$/, "")}/embed`;
    return { platform: "instagram", embedUrl: embed, originalUrl: cleanUrl };
  }

  if (/tiktok\.com/i.test(cleanUrl)) {
    return { platform: "tiktok", embedUrl: cleanUrl, originalUrl: cleanUrl };
  }

  return null;
}

// Official Instagram & TikTok Embed Viewer Component
function SocialEmbedViewer({ embed, name }: { embed: SocialVideoEmbed; name: string }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);

    if (embed.platform === "instagram") {
      const scriptId = "instagram-embed-script";
      let script = document.getElementById(scriptId) as HTMLScriptElement | null;

      const processInsta = () => {
        if ((window as any).instgrm?.Embeds?.process) {
          (window as any).instgrm.Embeds.process();
        }
      };

      if (!script) {
        script = document.createElement("script");
        script.id = scriptId;
        script.src = "https://www.instagram.com/embed.js";
        script.async = true;
        script.onload = processInsta;
        script.onerror = () => setHasError(true);
        document.body.appendChild(script);
      } else {
        processInsta();
        const timer = setTimeout(processInsta, 300);
        return () => clearTimeout(timer);
      }
    } else if (embed.platform === "tiktok") {
      const scriptId = "tiktok-embed-script";
      let script = document.getElementById(scriptId) as HTMLScriptElement | null;

      const processTikTok = () => {
        if ((window as any).tiktokEmbed?.process) {
          (window as any).tiktokEmbed.process();
        }
      };

      if (!script) {
        script = document.createElement("script");
        script.id = scriptId;
        script.src = "https://www.tiktok.com/embed.js";
        script.async = true;
        script.onload = processTikTok;
        script.onerror = () => setHasError(true);
        document.body.appendChild(script);
      } else {
        processTikTok();
        const timer = setTimeout(processTikTok, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [embed]);

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center text-white/80 space-y-3">
        <Video size={36} className="text-red-400 opacity-80" />
        <p className="text-xs sm:text-sm font-semibold">Video Unavailable</p>
        <a
          href={embed.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary underline hover:opacity-80 font-bold"
        >
          Watch on {embed.platform === "instagram" ? "Instagram" : "TikTok"}
        </a>
      </div>
    );
  }

  if (embed.platform === "instagram") {
    return (
      <div className="w-full h-full overflow-y-auto flex items-center justify-center p-2 bg-black/90 no-scrollbar">
        <blockquote
          className="instagram-media"
          data-instgrm-permalink={embed.originalUrl}
          data-instgrm-version="14"
          style={{
            background: "#FFF",
            border: 0,
            borderRadius: "12px",
            boxShadow: "0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)",
            margin: "1px",
            maxWidth: "540px",
            minWidth: "280px",
            padding: 0,
            width: "99%",
          }}
        >
          <div style={{ padding: "16px" }}>
            <a
              href={embed.originalUrl}
              style={{
                background: "#FFFFFF",
                lineHeight: 0,
                padding: "0 0",
                textAlign: "center",
                textDecoration: "none",
                width: "100%",
              }}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="text-xs font-semibold text-gray-500 py-4 text-center">
                Loading Instagram Reel...
              </div>
            </a>
          </div>
        </blockquote>
      </div>
    );
  }

  // TikTok embed
  const videoIdMatch = embed.originalUrl.match(/video\/(\d+)/i) || embed.embedUrl.match(/v2\/(\d+)/i);
  const videoId = videoIdMatch ? videoIdMatch[1] : "";

  return (
    <div className="w-full h-full overflow-y-auto flex items-center justify-center p-2 bg-black/90 no-scrollbar">
      <blockquote
        className="tiktok-embed"
        cite={embed.originalUrl}
        data-video-id={videoId}
        style={{ maxWidth: "605px", minWidth: "280px", width: "100%" }}
      >
        <section>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={embed.originalUrl}
            className="text-xs font-semibold text-gray-400 text-center block py-4"
          >
            Loading TikTok Video...
          </a>
        </section>
      </blockquote>
    </div>
  );
}

interface Props {
  product: Product;
  relatedProducts?: Product[];
}

export default function ProductDetailsClient({ product, relatedProducts }: Props) {
  const router = useRouter();
  const [isBuyNowPending, setIsBuyNowPending] = useState(false);

  // 🌟 QUANTITY STATE
  const [quantity, setQuantity] = useState(1);

  // 🌟 VARIANT STATE: Track the selected variant
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const hasVariants = Boolean(product.variants && product.variants.length > 0);

  // 🌟 SOCIAL MEDIA VIDEO EMBED
  const socialEmbed = parseSocialVideoUrl(product.socialVideoUrl);
  const [socialEmbedError, setSocialEmbedError] = useState(false);

  // All Images Array
  //
  // ⚠️ Variant ki apni image bhi is list mein AANI zaroori hai.
  //
  // handleVariantSelect variant ki image ko `mediaItems` mein findIndex se
  // dhoondta hai aur na milne par kuch nahi karta. Variant ki image (jaise
  // "Black Coated" wala cover) product.images mein hoti hi nahi - wo sirf
  // ProductVariants row par hoti hai. Is liye match kabhi nahi hota tha aur
  // variant select karne par price to badalti thi magar main image wahi purani
  // rehti thi.
  //
  // Set order barqarar rakhta hai aur duplicate hata deta hai: "Silver Coated"
  // variant ki image aksar product.imageUrl hi hoti hai, wo dobara nahi aati.
  const galleryImages = (() => {
    const unique = Array.from(
      new Set(
        [
          product.imageUrl,
          ...(product.images || []),
          ...(product.variants || []).map((v) => v.imageUrl),
        ].filter(Boolean) as string[]
      )
    );
    // Product par ek bhi image na ho to khali array se neeche mediaItems khali
    // ho jata aur gallery render hi na hoti.
    return unique.length > 0 ? unique : ["/placeholder.png"];
  })();

  // Combined Media Items (Uploaded Video + Social Media Video + Images)
  type MediaItem =
    | { type: "video"; url: string; poster: string }
    | { type: "socialVideo"; embed: SocialVideoEmbed }
    | { type: "image"; url: string };

  const mediaItems: MediaItem[] = [
    ...(product.videoUrl
      ? [
          {
            type: "video" as const,
            url: product.videoUrl,
            poster: product.imageUrl || galleryImages[0] || "/placeholder.png",
          },
        ]
      : []),
    ...(socialEmbed
      ? [
          {
            type: "socialVideo" as const,
            embed: socialEmbed,
          },
        ]
      : []),
    ...galleryImages.map((img) => ({
      type: "image" as const,
      url: img as string,
    })),
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Active display image (for AddToCart & BuyNow payloads)
  const currentMedia = mediaItems[activeIndex];
  const activeDisplayImage =
    currentMedia?.type === "image"
      ? currentMedia.url
      : product?.imageUrl || galleryImages[0] || "/placeholder.png";

  // Touch swipe handling for mobile horizontal swiping
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 40;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      setIsVideoPlaying(false);
      setActiveIndex((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1));
    } else if (isRightSwipe) {
      setIsVideoPlaying(false);
      setActiveIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1));
    }
  };

  // 🌟 COMPUTED: Active price based on selected variant
  const getVariantPrice = (v: ProductVariant) => {
    if (v.salePrice && Number(v.salePrice) > 0) return Number(v.salePrice);
    return Number(v.price);
  };

  const activePrice = selectedVariant
    ? getVariantPrice(selectedVariant)
    : product.isOnSale && product.discountPrice
      ? product.discountPrice
      : product.price;

  // 🌟 COMPUTED: Active stock based on selected variant
  const activeStock = selectedVariant ? selectedVariant.stock : product.stock;

  // Stock Check
  const isOutOfStock = activeStock <= 0;

  // 🌟 VARIANT SELECTION HANDLER
  const handleVariantSelect = (variant: ProductVariant) => {
    setIsVideoPlaying(false);
    if (selectedVariant?.id === variant.id) {
      // Deselect if clicking the same variant
      setSelectedVariant(null);
      setActiveIndex(0);
    } else {
      setSelectedVariant(variant);
      if (variant.imageUrl) {
        const imgIdx = mediaItems.findIndex(
          (item) => item.type === "image" && item.url === variant.imageUrl
        );
        if (imgIdx !== -1) {
          setActiveIndex(imgIdx);
        }
      } else {
        // Map variant to a gallery image by index (if available)
        const variantIndex = product.variants!.findIndex((v) => v.id === variant.id);
        const targetImg = galleryImages[variantIndex] || galleryImages[0];
        const imgIdx = mediaItems.findIndex(
          (item) => item.type === "image" && item.url === targetImg
        );
        if (imgIdx !== -1) {
          setActiveIndex(imgIdx);
        } else {
          setActiveIndex(0);
        }
      }
    }
  };

  // ✅ Buy Now Function
  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();

    if (isOutOfStock) {
      toast.error("Product is out of stock!");
      return;
    }

    // If variants exist but none selected, prompt user
    if (hasVariants && !selectedVariant) {
      toast.error("Please select an option first!");
      return;
    }

    setIsBuyNowPending(true);

    const variantLabel = selectedVariant ? (selectedVariant.variantValue || selectedVariant.materialName) : "";

    const origPrice = selectedVariant
      ? (selectedVariant.salePrice && Number(selectedVariant.salePrice) > 0 && Number(selectedVariant.salePrice) < Number(selectedVariant.price)
          ? Number(selectedVariant.price)
          : null)
      : (product.isOnSale || (product.discountPrice > 0 && product.discountPrice < product.price)) && product.discountPrice
        ? product.price
        : null;

    sessionStorage.setItem(
      "buyNowItem",
      JSON.stringify({
        productId: product.id,
        name: selectedVariant
          ? `${product.name} (${variantLabel})`
          : product.name,
        image: activeDisplayImage || product.imageUrl || product.images?.[0],
        // Buy Now flow bhi category drop kar raha tha — is ke bina checkout ke
        // Meta/TikTok events mein content_category undefined jata hai
        category: product.category,
        price: activePrice,
        originalPrice: origPrice,
        quantity: quantity,
        ...(selectedVariant && { 
          variantId: selectedVariant.id, 
          materialName: variantLabel,
          variantType: selectedVariant.variantType,
          variantValue: variantLabel
        }),
      }),
    );

    router.push("/checkout?type=buynow");
  };

  const isProductOnSale = Boolean(
    product.isOnSale ||
      (product.discountPrice && product.discountPrice > 0 && product.discountPrice < product.price) ||
      (product.variants && product.variants.some((v) => v.salePrice && Number(v.salePrice) > 0 && Number(v.salePrice) < Number(v.price)))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-28 md:pb-12">
      {/* Auto Back Button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center text-sm text-text-muted hover:text-primary mb-4 transition-colors bg-transparent border-none cursor-pointer p-0"
      >
        <ChevronLeft size={18} className="mr-1" /> Back
      </button>

      {/* --- UPPER SECTION: 2 COLUMNS (Image & Details) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
        {/* Left: Combined Image & Video Gallery (Daraz Style) */}
        <div className="space-y-4">
          {/* Main Display Area (Aspect Square, Touch Swipeable) */}
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="aspect-square relative overflow-hidden rounded-2xl bg-card border border-border/50 shadow-sm floating-card group select-none max-h-[70vh] md:max-h-none"
          >
            {mediaItems[activeIndex]?.type === "socialVideo" ? (
              <div className="relative w-full h-full bg-black flex flex-col items-center justify-center overflow-hidden">
                <SocialEmbedViewer
                  embed={mediaItems[activeIndex].embed}
                  name={product.name}
                />
              </div>
            ) : mediaItems[activeIndex]?.type === "video" ? (
              <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
                {!isVideoPlaying ? (
                  /* Video Thumbnail / Poster with Semi-Transparent Circular Play Button Overlay (Daraz Style) */
                  <div
                    onClick={() => setIsVideoPlaying(true)}
                    className="relative w-full h-full cursor-pointer flex items-center justify-center group/play"
                  >
                    <Image
                      src={mediaItems[activeIndex].poster}
                      alt={`${product.name} video thumbnail`}
                      fill
                      className="object-contain p-4 transition-transform duration-300 group-hover/play:scale-105"
                      priority
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-black/20 group-hover/play:bg-black/35 transition-colors" />

                    {/* Semi-transparent circular play button */}
                    <div className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black/60 text-white backdrop-blur-md flex items-center justify-center shadow-2xl border border-white/20 transform transition-all duration-300 group-hover/play:scale-110 active:scale-95">
                      <Play size={32} className="ml-1 fill-white text-white sm:w-10 sm:h-10" />
                    </div>
                  </div>
                ) : (
                  /* Inline Video Player with standard HTML5 controls (includes fullscreen toggle) */
                  <video
                    key={mediaItems[activeIndex].url}
                    src={mediaItems[activeIndex].url}
                    controls
                    autoPlay
                    controlsList="nodownload"
                    playsInline
                    className="w-full h-full object-contain"
                    onEnded={() => setIsVideoPlaying(false)}
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            ) : (
              /* Image Slide */
              <Image
                src={mediaItems[activeIndex]?.url || "/placeholder.png"}
                alt={product.name}
                fill
                className="object-contain p-4 transition-all duration-300 ease-in-out"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            )}

            {/* Top-Left Badges Flex Container (Prevents overlapping of Sale badge and Video badge) */}
            <div className="absolute left-3 top-3 z-20 flex items-center gap-2 max-w-[65%] flex-wrap pointer-events-none">
              {isProductOnSale && (
                <span className="rounded-lg bg-red-500 px-2.5 py-1 text-xs sm:text-sm font-extrabold uppercase tracking-wide text-white shadow-md">
                  FLAT 40% OFF
                </span>
              )}
              {mediaItems[activeIndex]?.type === "video" && !isVideoPlaying && (
                <span className="rounded-lg bg-black/75 backdrop-blur-md px-2.5 py-1 text-xs font-bold text-white flex items-center gap-1.5 border border-white/10 shadow-md">
                  <Video size={13} className="text-red-500 animate-pulse" />
                  <span>Video</span>
                </span>
              )}
              {mediaItems[activeIndex]?.type === "socialVideo" && (
                <span className="rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 px-2.5 py-1 text-xs font-bold text-white flex items-center gap-1.5 shadow-md">
                  <Video size={13} className="text-white animate-pulse" />
                  <span className="capitalize">{mediaItems[activeIndex].embed.platform} Video</span>
                </span>
              )}
            </div>

            {/* Top-Right: Media Counter Badge (e.g. 1/3) - Keeps bottom 100% clear for video controls */}
            {mediaItems.length > 1 && !isVideoPlaying && (
              <div className="absolute right-3 top-3 z-20 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white border border-white/10 shadow-sm pointer-events-none">
                {activeIndex + 1} / {mediaItems.length}
              </div>
            )}

            {/* Prev / Next Navigation Arrows */}
            {mediaItems.length > 1 && !isVideoPlaying && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsVideoPlaying(false);
                    setActiveIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1));
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-background/80 hover:bg-background text-text-main shadow-md flex items-center justify-center border border-border/50 transition-all opacity-80 hover:opacity-100"
                  aria-label="Previous item"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsVideoPlaying(false);
                    setActiveIndex((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1));
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-background/80 hover:bg-background text-text-main shadow-md flex items-center justify-center border border-border/50 transition-all opacity-80 hover:opacity-100"
                  aria-label="Next item"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails Strip (Including Video & Social Video thumbnails) */}
          {mediaItems.length > 1 && (
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 pt-1">
              {mediaItems.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setIsVideoPlaying(false);
                    setActiveIndex(idx);
                  }}
                  className={`relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-xl overflow-hidden transition-all duration-200 border-2 
                    ${activeIndex === idx ? "border-primary shadow-md scale-105" : "border-border/50 hover:opacity-80"}
                  `}
                >
                  {item.type === "video" ? (
                    <>
                      <Image
                        src={item.poster}
                        alt="Video thumbnail"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shadow-md">
                          <Play size={14} className="ml-0.5 fill-white text-white" />
                        </div>
                      </div>
                      <span className="absolute bottom-1 left-1 right-1 bg-black/85 text-white text-[9px] font-extrabold uppercase rounded text-center py-0.5 tracking-wider">
                        Video
                      </span>
                    </>
                  ) : item.type === "socialVideo" ? (
                    <>
                      <Image
                        src={product.imageUrl || galleryImages[0] || "/placeholder.png"}
                        alt="Social video thumbnail"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-md">
                          <Play size={12} className="ml-0.5 fill-white text-white" />
                        </div>
                      </div>
                      <span className="absolute bottom-1 left-1 right-1 bg-black/85 text-white text-[8px] font-extrabold uppercase rounded text-center py-0.5 tracking-wider truncate px-0.5">
                        {item.embed.platform === "instagram" ? "Reel" : "TikTok"}
                      </span>
                    </>
                  ) : (
                    <Image
                      src={item.url}
                      alt={`thumbnail-${idx}`}
                      fill
                      className="object-cover"
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Content */}
        <div className="flex flex-col">
          {/* Categories / Badges */}
          <div className="flex flex-wrap gap-2 mb-3">
            {isProductOnSale && (
              <span className="bg-red-100 text-red-600 text-[10px] uppercase font-extrabold px-2 py-1 rounded">
                FLAT 40% OFF
              </span>
            )}
            {product.isNewArrival && (
              <span className="bg-green-100 text-green-700 text-[10px] uppercase font-bold px-2 py-1 rounded">
                New Arrival
              </span>
            )}
            {product.isFeatured && (
              <span className="bg-amber-100 text-amber-700 text-[10px] uppercase font-bold px-2 py-1 rounded">
                Featured
              </span>
            )}
            {product.category && (
              <span className="bg-primary/10 text-primary text-[10px] uppercase font-bold px-2 py-1 rounded">
                {product.category.replace(/_/g, " ")}
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-text-main mb-2">
            {product.name}
          </h1>

          {/* Rating & Reviews summary */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center text-amber-400 gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} size={16} className="fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-xs font-bold text-text-main">
              {product.averageRating ? Number(product.averageRating).toFixed(1) : "4.9"}
            </span>
            <a href="#reviews-section" className="text-xs text-primary hover:underline font-medium ml-1">
              ({product.totalReviews || 12} reviews)
            </a>
          </div>

          {/* Meta Info */}
          {(product.carModel || product.material) && (
            <p className="text-sm text-text-muted mb-6 capitalize">
              {product.vehicleType} • {product.carModel}
            </p>
          )}

          {/* Pricing Logic — now variant-aware */}
          <div className="flex items-center space-x-4 mb-6 border-b border-border/50 pb-6">
            {selectedVariant ? (
              (() => {
                const effectivePrice = getVariantPrice(selectedVariant);
                const hasVariantSale = selectedVariant.salePrice && Number(selectedVariant.salePrice) > 0 && Number(selectedVariant.salePrice) < Number(selectedVariant.price);
                return (
                  <>
                    <span className="text-3xl font-bold text-primary">
                      Rs. {effectivePrice.toLocaleString()}
                    </span>
                    {hasVariantSale && (
                      <span className="text-xl text-text-muted line-through font-medium">
                        Rs. {Number(selectedVariant.price).toLocaleString()}
                      </span>
                    )}
                    <span className="text-sm text-text-muted font-medium bg-primary/10 px-2 py-1 rounded">
                      {selectedVariant.variantValue || selectedVariant.materialName}
                    </span>
                  </>
                );
              })()
            ) : hasVariants ? (
              (() => {
                const minVariantPrice = Math.min(
                  ...product.variants!.map((v) =>
                    v.salePrice && Number(v.salePrice) > 0 && Number(v.salePrice) < Number(v.price)
                      ? Number(v.salePrice)
                      : Number(v.price)
                  )
                );
                const minVariantRegularPrice = Math.min(
                  ...product.variants!.map((v) => Number(v.price))
                );
                const variantHasSale = minVariantPrice < minVariantRegularPrice || product.isOnSale;

                return (
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col leading-tight">
                      <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Starting From</span>
                      <div className="flex items-center gap-3">
                        <span className="text-3xl font-bold text-primary">
                          Rs. {minVariantPrice.toLocaleString()}
                        </span>
                        {variantHasSale && minVariantRegularPrice > minVariantPrice && (
                          <span className="text-xl text-text-muted line-through font-medium">
                            Rs. {minVariantRegularPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : product.discountPrice && product.discountPrice > 0 && product.discountPrice < product.price ? (
              <>
                <span className="text-3xl font-bold text-primary">
                  Rs. {product.discountPrice.toLocaleString()}
                </span>
                <span className="text-xl text-text-muted line-through font-medium">
                  Rs. {product.price.toLocaleString()}
                </span>
              </>
            ) : (
              <span className="text-3xl font-bold text-primary">
                Rs. {product.price.toLocaleString()}
              </span>
            )}

            {/* Stock & Sold Badges */}
            <div className="ml-auto flex items-center gap-2">
              {product.sold !== undefined && product.sold > 0 && (
                <span className="text-sm font-semibold text-primary bg-primary/5 px-3 py-1 rounded-full border border-primary/20">
                  {product.sold >= 1000 ? `${(product.sold / 1000).toFixed(1).replace(/\.0$/, '')}k+` : product.sold} Sold
                </span>
              )}
              <span
                className={`text-sm font-medium px-3 py-1 rounded-full ${isOutOfStock ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}
              >
                {isOutOfStock ? "Out of Stock" : `${activeStock} in Stock`}
              </span>
            </div>
          </div>

          {/* ===================================================== */}
          {/* 🌟 PRODUCT VARIANTS SELECTOR (Generic Variant Cards) */}
          {/* ===================================================== */}
          {hasVariants && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Layers size={18} className="text-primary" />
                <span className="text-sm font-semibold text-text-main uppercase tracking-wider">
                  Available Options {product.variants![0]?.variantType ? `(${product.variants![0].variantType})` : ""}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.variants!.map((variant, idx) => {
                  const isSelected = selectedVariant?.id === variant.id;
                  const variantOutOfStock = variant.stock <= 0;
                  const variantImage = variant.imageUrl || galleryImages[idx] || galleryImages[0] || "/placeholder.png";
                  const variantTitle = variant.variantValue || variant.materialName || "Standard";
                  const hasSalePrice = variant.salePrice && Number(variant.salePrice) > 0 && Number(variant.salePrice) < Number(variant.price);
                  const effectivePrice = getVariantPrice(variant);

                  return (
                    <button
                      key={variant.id}
                      onClick={() => !variantOutOfStock && handleVariantSelect(variant)}
                      disabled={variantOutOfStock}
                      className={`
                        group relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 text-left
                        ${variantOutOfStock
                          ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed dark:border-gray-700 dark:bg-gray-800/30"
                          : isSelected
                            ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/30 scale-[1.02] dark:bg-primary/10"
                            : "border-border/50 bg-card hover:border-primary/50 hover:shadow-sm hover:scale-[1.01] dark:hover:border-primary/40"
                        }
                      `}
                    >
                      {/* Variant Thumbnail */}
                      <div className={`
                        relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border transition-all duration-200
                        ${isSelected ? "border-primary" : "border-border/30"}
                      `}>
                        <Image
                          src={variantImage}
                          alt={variantTitle}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      </div>

                      {/* Variant Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className={`
                            text-sm font-semibold truncate transition-colors duration-200
                            ${isSelected ? "text-primary" : "text-text-main"}
                          `}>
                            {variantTitle}
                          </p>
                          {variant.sku && (
                            <span className="text-[9px] font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-text-muted">
                              {variant.sku}
                            </span>
                          )}
                        </div>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <p className={`
                            text-lg font-bold transition-colors duration-200
                            ${isSelected ? "text-primary" : "text-text-main"}
                          `}>
                            Rs. {effectivePrice.toLocaleString()}
                          </p>
                          {hasSalePrice && (
                            <p className="text-xs text-text-muted line-through">
                              Rs. {Number(variant.price).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Stock / Selected indicator */}
                      <div className="flex-shrink-0">
                        {variantOutOfStock ? (
                          <span className="text-[10px] font-bold uppercase bg-red-100 text-red-600 px-2 py-1 rounded-full">
                            Sold Out
                          </span>
                        ) : isSelected ? (
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-text-muted bg-green-50 text-green-600 px-2 py-1 rounded-full dark:bg-green-900/20">
                            {variant.stock} left
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Hint text when no variant selected */}
              {!selectedVariant && (
                <p className="text-xs text-text-muted mt-2 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Select an option to see its price
                </p>
              )}
            </div>
          )}

          {/* Description */}
          {/* ✅ Naya Clean Component Call */}
          <div className="flex flex-col min-w-0">
            {" "}
            {/* min-w-0 zaroori hai flex items ke liye */}
            <ExpandableDescription description={product.description} />
          </div>

          {/* Specifications Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {product.color && (
              <div className="p-4 bg-card border border-border/50 rounded-xl shadow-sm">
                <span className="text-[11px] text-text-muted uppercase tracking-wider block mb-1">
                  Color
                </span>
                <span className="font-semibold text-text-main capitalize">
                  {product.color}
                </span>
              </div>
            )}
            {product.material && (
              <div className="p-4 bg-card border border-border/50 rounded-xl shadow-sm">
                <span className="text-[11px] text-text-muted uppercase tracking-wider block mb-1">
                  Material
                </span>
                <span className="font-semibold text-text-main capitalize">
                  {product.material}
                </span>
              </div>
            )}
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm font-semibold text-text-main">Quantity:</span>
            <div className="inline-flex items-center border border-border/80 rounded-xl overflow-hidden bg-card shadow-sm">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1 || isOutOfStock}
                className="w-10 h-10 flex items-center justify-center text-text-main hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Decrease quantity"
              >
                <Minus size={16} />
              </button>
              <span className="w-12 text-center text-sm font-bold text-text-main">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(activeStock, q + 1))}
                disabled={quantity >= activeStock || isOutOfStock}
                className="w-10 h-10 flex items-center justify-center text-text-main hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Increase quantity"
              >
                <Plus size={16} />
              </button>
            </div>
            {activeStock > 0 && activeStock <= 5 && (
              <span className="text-xs font-semibold text-amber-600 animate-pulse">
                Only {activeStock} left in stock!
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10 mt-auto">
            {/* ✅ AddToCart — now variant-aware */}
            <AddToCart
              productId={product.id}
              stock={activeStock}
              quantity={quantity}
              onClick={(e) => {
                if (hasVariants && !selectedVariant) {
                  toast.error("Please select a material quality first!");
                  return false;
                }
              }}
              // ✅ Price and name reflect selected variant
              product={{
                id: String(product.id),
                name: selectedVariant
                  ? `${product.name} (${selectedVariant.materialName})`
                  : product.name,
                price: activePrice,
                image: activeDisplayImage,
                category: product.category,
                variantId: selectedVariant ? selectedVariant.id : undefined,
              }}
              className={`flex-1 h-14 rounded-full font-bold flex items-center justify-center space-x-2 transition-all duration-200 w-full sm:w-auto
    ${
      isOutOfStock
        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
        : "bg-primary text-white hover:shadow-lg hover:-translate-y-1"
    }
  `}
            >
              {isOutOfStock ? (
                <>
                  {" "}
                  <PackageX size={20} /> <span>Out of Stock</span>{" "}
                </>
              ) : (
                <>
                  {" "}
                  <ShoppingCart size={20} /> <span>Add to Cart</span>{" "}
                </>
              )}
            </AddToCart>

            {/* ✅ Buy Now Button */}
            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock || isBuyNowPending}
              className={`flex-1 h-14 rounded-full font-bold transition-all duration-200 border-2 flex items-center justify-center
                ${
                  isOutOfStock || isBuyNowPending
                    ? "border-gray-200 text-gray-400 cursor-not-allowed"
                    : "border-primary text-primary hover:bg-primary hover:text-white"
                }
              `}
            >
              {isBuyNowPending ? "Redirecting..." : "Buy Now"}
            </button>
          </div>

          {/* Trust Badges */}
          <div className="pt-6 border-t border-border/50 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 text-sm text-text-muted">
              <Truck size={20} className="text-primary flex-shrink-0" />
              <span className="font-medium">Fast Delivery</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-text-muted">
              <ShieldCheck size={20} className="text-primary flex-shrink-0" />
              <span className="font-medium">Genuine Quality</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-text-muted">
              <RotateCcw size={20} className="text-primary flex-shrink-0" />
              <span className="font-medium">7 Days Return</span>
            </div>
          </div>
        </div>
      </div>
      {/* 🛑 GRID YAHAN KHATAM HOTA HAI */}

      {/* 2. REVIEWS SECTION (Ab grid ke baahar aur poori screen par aaye ga) */}
      <ProductReviews productId={product.id} />

      {/* --- LOWER SECTION: FULL WIDTH --- */}
      {/* ✅ Related Products ab grid ke baahar aur poori screen par aaye ga */}
      <div className="mt-16">
        {/* <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-text-main">
          You May Also Like
        </h1> */}
        {/* <div className="">{product.id}</div> */}
        <RelatedProducts productId={product.id} initialProducts={relatedProducts} />
      </div>
    </div>
  );
}

