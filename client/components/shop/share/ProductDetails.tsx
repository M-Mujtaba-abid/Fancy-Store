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
} from "lucide-react";
import Image from "next/image";
import { Product } from "@/types/product.type";
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

  // Stock Check
  const isOutOfStock = product.stock <= 0;

  // All Images Array
  const galleryImages = product.images
    ? [
        product.imageUrl,
        ...product.images.filter((img: string) => img !== product.imageUrl),
      ]
    : [product.imageUrl];

  // ✅ Buy Now Function (AddToCart Hook nikal dein isme se)
  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();

    const isLoggedIn =
      typeof window !== "undefined" ? localStorage.getItem("isLoggedIn") : null;
    if (!isLoggedIn) {
      toast.error("Please login to buy! 🛒");
      router.push("/login");
      return;
    }

    // ✅ 2. Button ko loading state mein daal dein
    setIsBuyNowPending(true);

    // 1. Temporary Product save karo taake Checkout page usay parh sakay
    sessionStorage.setItem(
      "buyNowItem",
      JSON.stringify({
        productId: product.id,
        name: product.name,
        image: product.imageUrl || product.images?.[0],
        price: product.discountPrice || product.price,
        quantity: 1, // Ek hi piece khareed raha hai default
      }),
    );

    // 2. Checkout par bhej do query ke sath
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

          {/* Pricing Logic */}
          <div className="flex items-center space-x-4 mb-8 border-b border-border/50 pb-6">
            {product.isOnSale && product.discountPrice ? (
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

            {/* Stock Badge */}
            <span
              className={`ml-auto text-sm font-medium px-3 py-1 rounded-full ${isOutOfStock ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}
            >
              {isOutOfStock ? "Out of Stock" : `${product.stock} in Stock`}
            </span>
          </div>

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
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10 mt-auto">
            {/* ✅ Outer <button> ko hata kar seedha <AddToCart> use kiya */}
            <AddToCart
              productId={product.id}
              stock={product.stock}
              className={`flex-1 h-14 rounded-full font-bold flex items-center justify-center space-x-2 transition-all duration-200 w-full sm:w-auto
                ${
                  isOutOfStock
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-primary text-white hover:shadow-lg hover:-translate-y-1"
                }
              `}
            >
              {/* ✅ Jo bhi text ya icon yahan likhenge, wo us button ke andar aa jayega */}
              {isOutOfStock ? (
                <>
                  <PackageX size={20} /> <span>Out of Stock</span>
                </>
              ) : (
                <>
                  <ShoppingCart size={20} /> <span>Add to Cart</span>
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
