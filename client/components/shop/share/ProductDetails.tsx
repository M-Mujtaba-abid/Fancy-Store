"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  ChevronLeft,
  ShieldCheck,
  Truck,
  RotateCcw,
  PackageX,
  Layers,
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

interface Props {
  product: Product;
}

export default function ProductDetailsClient({ product }: Props) {
  const router = useRouter();
  // ✅ 1. Yeh line add karein button ki loading state ke liye
  const [isBuyNowPending, setIsBuyNowPending] = useState(false);

  // 🌟 VARIANT STATE: Track the selected variant
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  const hasVariants = product.variants && product.variants.length > 0;

  // 🎯 TIKTOK: Track product view on mount
  useEffect(() => {
    // 🎯 TIKTOK CONTENT CODE: Product details page viewed
    trackViewContent({
      id: product.id,
      name: product.name,
      price: product.discountPrice || product.price,
      category: product.category,
    });
  }, [
    product.id,
    product.name,
    product.price,
    product.discountPrice,
    product.category,
  ]);

  // Main image state: Jab user thumbnail par click kare toh main image badle
  const [activeImage, setActiveImage] = useState<string>(
    product?.imageUrl ||
      (product?.images && product.images.length > 0
        ? product.images[0]
        : "/placeholder.png"),
  );

  // 🌟 COMPUTED: Active price based on selected variant
  const activePrice = selectedVariant
    ? selectedVariant.price
    : product.isOnSale && product.discountPrice
      ? product.discountPrice
      : product.price;

  // 🌟 COMPUTED: Active stock based on selected variant
  const activeStock = selectedVariant ? selectedVariant.stock : product.stock;

  // Stock Check
  const isOutOfStock = activeStock <= 0;

  // All Images Array
  const galleryImages = product.images
    ? [
        product.imageUrl,
        ...product.images.filter((img: string) => img !== product.imageUrl),
      ]
    : [product.imageUrl];

  // 🌟 VARIANT SELECTION HANDLER
  const handleVariantSelect = (variant: ProductVariant) => {
    if (selectedVariant?.id === variant.id) {
      // Deselect if clicking the same variant
      setSelectedVariant(null);
      // Reset to first image
      setActiveImage(
        product?.imageUrl ||
          (product?.images && product.images.length > 0
            ? product.images[0]
            : "/placeholder.png"),
      );
    } else {
      setSelectedVariant(variant);
      if (variant.imageUrl) {
        setActiveImage(variant.imageUrl);
      } else {
        // Map variant to a gallery image by index (if available)
        const variantIndex = product.variants!.findIndex((v) => v.id === variant.id);
        if (variantIndex !== -1 && variantIndex < galleryImages.length) {
          setActiveImage(galleryImages[variantIndex] as string);
        } else {
          setActiveImage(galleryImages[0] || "/placeholder.png");
        }
      }
    }
  };

  // ✅ Buy Now Function (AddToCart Hook nikal dein isme se)
  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();

    if (isOutOfStock) {
      toast.error("Product is out of stock!");
      return;
    }

    // If variants exist but none selected, prompt user
    if (hasVariants && !selectedVariant) {
      toast.error("Please select a material quality first!");
      return;
    }

    setIsBuyNowPending(true);

    sessionStorage.setItem(
      "buyNowItem",
      JSON.stringify({
        productId: product.id,
        name: selectedVariant
          ? `${product.name} (${selectedVariant.materialName})`
          : product.name,
        image: activeImage || product.imageUrl || product.images?.[0],
        price: activePrice,
        quantity: 1,
        ...(selectedVariant && { variantId: selectedVariant.id, materialName: selectedVariant.materialName }),
      }),
    );

    router.push("/checkout?type=buynow");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-10">
      {/* Auto Back Button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center text-sm text-text-muted hover:text-primary mb-4 transition-colors bg-transparent border-none cursor-pointer p-0"
      >
        <ChevronLeft size={18} className="mr-1" /> Back
      </button>

      {/* --- UPPER SECTION: 2 COLUMNS (Image & Details) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Image Gallery */}
        <div className="space-y-4">
          {/* Main Active Image */}
          <div className="aspect-square relative overflow-hidden rounded-2xl bg-card border border-border/50 shadow-sm floating-card">
            <Image
              src={activeImage}
              alt={product.name}
              fill
              className="object-contain p-4 transition-all duration-300 ease-in-out"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          {/* Thumbnails (Sub Images) */}
          {galleryImages.length > 1 && (
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img as string)}
                  className={`relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden transition-all duration-200 border-2 
                    ${activeImage === img ? "border-primary shadow-md scale-105" : "border-transparent hover:opacity-80"}
                  `}
                >
                  <Image
                    src={img as string}
                    alt={`thumbnail-${idx}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Content */}
        <div className="flex flex-col">
          {/* Categories / Badges */}
          <div className="flex gap-2 mb-3">
            {product.isNewArrival && (
              <span className="bg-green-100 text-green-700 text-[10px] uppercase font-bold px-2 py-1 rounded">
                New Arrival
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

          {/* Meta Info */}
          {(product.carModel || product.material) && (
            <p className="text-sm text-text-muted mb-6 capitalize">
              {product.vehicleType} • {product.carModel}
            </p>
          )}

          {/* Pricing Logic — now variant-aware */}
          <div className="flex items-center space-x-4 mb-6 border-b border-border/50 pb-6">
            {selectedVariant ? (
              /* When a variant is selected, show variant price */
              <>
                <span className="text-3xl font-bold text-primary">
                  Rs. {selectedVariant.price.toLocaleString()}
                </span>
                <span className="text-sm text-text-muted font-medium bg-primary/10 px-2 py-1 rounded">
                  {selectedVariant.materialName}
                </span>
              </>
            ) : product.isOnSale && product.discountPrice ? (
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
          {/* 🌟 PRODUCT VARIANTS SELECTOR (Material Quality Cards) */}
          {/* ===================================================== */}
          {hasVariants && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Layers size={18} className="text-primary" />
                <span className="text-sm font-semibold text-text-main uppercase tracking-wider">
                  Available Qualities
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.variants!.map((variant, idx) => {
                  const isSelected = selectedVariant?.id === variant.id;
                  const variantOutOfStock = variant.stock <= 0;
                  const variantImage = variant.imageUrl || galleryImages[idx] || galleryImages[0] || "/placeholder.png";

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
                          alt={variant.materialName}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      </div>

                      {/* Variant Info */}
                      <div className="flex-1 min-w-0">
                        <p className={`
                          text-sm font-semibold truncate transition-colors duration-200
                          ${isSelected ? "text-primary" : "text-text-main"}
                        `}>
                          {variant.materialName}
                        </p>
                        <p className={`
                          text-lg font-bold mt-0.5 transition-colors duration-200
                          ${isSelected ? "text-primary" : "text-text-main"}
                        `}>
                          Rs. {variant.price.toLocaleString()}
                        </p>
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
                  Select a quality to see its price
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

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10 mt-auto">
            {/* ✅ AddToCart — now variant-aware */}
            <AddToCart
              productId={product.id}
              stock={activeStock}
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
                image: activeImage,
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
        {/* 2. REVIEWS SECTION (Bilkul neechay) */}
        <ProductReviews productId={product.id} />
      </div>
      {/* 🛑 GRID YAHAN KHATAM HOTA HAI */}

      {/* --- LOWER SECTION: FULL WIDTH --- */}
      {/* ✅ Related Products ab grid ke baahar aur poori screen par aaye ga */}
      <div className="mt-16">
        {/* <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-text-main">
          You May Also Like
        </h1> */}
        {/* <div className="">{product.id}</div> */}
        <RelatedProducts productId={product.id} />
      </div>
    </div>
  );
}

