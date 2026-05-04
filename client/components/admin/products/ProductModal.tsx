"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Product } from "@/types/product.type";
import { X, Truck, Tag, Settings } from "lucide-react";
import ExpandableDescription from "@/components/shop/share/ExpandableDescription";

interface ProductModalProps {
  product: Product;
  onClose: () => void;
}

const ProductModal = ({ product, onClose }: ProductModalProps) => {
  const [activeImage, setActiveImage] = useState<string>("");

  // Jab bhi naya product khulega, uski pehli image set ho jayegi
  useEffect(() => {
    setActiveImage(product.imageUrl || (product.images && product.images.length > 0 ? product.images[0] as string : ""));
  }, [product]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative custom-scrollbar border border-border/50">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 bg-background border border-border rounded-full hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors z-10 shadow-sm"
        >
          <X size={20} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-8 mt-4 md:mt-0">
          
          {/* Left: Images */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden border border-border/50 p-4">
              {activeImage && (
                <Image src={activeImage} alt="Main" fill className="object-contain p-4 mix-blend-multiply dark:mix-blend-normal transition-all duration-300" />
              )}
              {/* ✅ CHEEZ (ITEM) TAG ON MODAL IMAGE */}
              <div className="absolute top-3 left-3 z-10">
                <span className="bg-orange-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg uppercase tracking-wider flex items-center gap-1">
                  🔥 Hot Item
                </span>
              </div>
            </div>
            
            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img as string)}
                    className={`relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${activeImage === img ? "border-primary shadow-md scale-105" : "border-transparent opacity-70 hover:opacity-100"}`}
                  >
                    <Image src={img as string} alt={`thumb-${idx}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div className="flex flex-col">
            <div className="flex gap-2 mb-3">
              <span className="bg-primary/10 text-primary px-3 py-1 text-xs font-bold uppercase rounded-full tracking-wider">
                {product.category} {product.subCategory && `> ${product.subCategory}`}
              </span>
            </div>

            <h2 className="text-3xl font-bold text-text-main mb-4">{product.name}</h2>

            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border/50">
              {product.isOnSale && product.discountPrice ? (
                <>
                  <span className="text-3xl font-black text-primary">Rs. {product.discountPrice.toLocaleString()}</span>
                  <span className="text-lg font-medium text-text-muted line-through">Rs. {product.price.toLocaleString()}</span>
                </>
              ) : (
                <span className="text-3xl font-black text-primary">Rs. {product.price.toLocaleString()}</span>
              )}
              <span className={`ml-auto px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${product.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {product.stock} in Stock
              </span>
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-start gap-3 p-3 bg-background rounded-xl border border-border/50 hover:border-primary/30 transition-colors">
                <Truck className="text-primary" size={20} />
                <div>
                  <p className="text-[10px] text-text-muted uppercase font-bold">Vehicle Type</p>
                  <p className="text-sm font-semibold capitalize">{product.vehicleType || "Universal"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-background rounded-xl border border-border/50 hover:border-primary/30 transition-colors">
                <Tag className="text-primary" size={20} />
                <div>
                  <p className="text-[10px] text-text-muted uppercase font-bold">Car Model</p>
                  <p className="text-sm font-semibold capitalize">{product.carModel || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-background rounded-xl border border-border/50 hover:border-primary/30 transition-colors">
                <Settings className="text-primary" size={20} />
                <div>
                  <p className="text-[10px] text-text-muted uppercase font-bold">Material</p>
                  <p className="text-sm font-semibold capitalize">{product.material || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-background rounded-xl border border-border/50 hover:border-primary/30 transition-colors">
                <div className="w-5 h-5 rounded-full border border-border mt-1 shadow-sm" style={{ backgroundColor: product.color || 'transparent' }}></div>
                <div>
                  <p className="text-[10px] text-text-muted uppercase font-bold">Color</p>
                  <p className="text-sm font-semibold capitalize">{product.color || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Description */}
<ExpandableDescription description={product.description} />

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;