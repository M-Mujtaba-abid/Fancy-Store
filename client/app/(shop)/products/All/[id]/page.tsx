"use client";

import { useParams } from "next/navigation";
import { useProductDetails } from "@/hooks/useProducts";
import { ShoppingCart, ChevronLeft, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Loading from "@/app/loading";

const ProductDetails = () => {
  const { id } = useParams();
  const { data: product, isLoading, isError } = useProductDetails(id as string);

  if (isLoading) return <Loading />;
  if (isError || !product) return <div className="text-center py-20">Product not found.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back Button */}
      <Link href="/shop" className="flex items-center text-sm text-text-muted hover:text-primary mb-8 transition-colors">
        <ChevronLeft size={18} /> Back to Shop
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square relative overflow-hidden rounded-2xl bg-card floating-card">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-contain p-4"
              priority
            />
          </div>
          {/* Sub Images (if any) */}
          <div className="grid grid-cols-4 gap-4">
            {product.images?.map((img, idx) => (
              <div key={idx} className="aspect-square relative rounded-lg overflow-hidden cursor-pointer hover:opacity-90 floating-card">
                <Image src={img} alt="thumbnail" fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Content */}
        <div className="flex flex-col">
          <h1 className="text-3xl md:text-4xl font-bold text-text-main mb-2">{product.name}</h1>
          <p className="text-text-muted mb-6">{product.carModel} • {product.material}</p>

          <div className="flex items-center space-x-4 mb-8">
            <span className="text-3xl font-bold text-primary">Rs. {product.price}</span>
            {product.isOnSale && (
              <span className="text-xl text-text-muted line-through">Rs. {product.discountPrice}</span>
            )}
          </div>

          <div className="prose dark:prose-invert mb-8">
            <p className="text-text-main leading-relaxed">{product.description}</p>
          </div>

          {/* Specifications */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-border-custom/20 rounded-xl">
              <span className="text-xs text-text-muted uppercase block">Color</span>
              <span className="font-medium">{product.color}</span>
            </div>
            <div className="p-4 bg-border-custom/20 rounded-xl">
              <span className="text-xs text-text-muted uppercase block">Material</span>
              <span className="font-medium">{product.material}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <button className="flex-1 bg-primary text-white h-14 rounded-full font-bold flex items-center justify-center space-x-2 hover:opacity-90 transition-all">
              <ShoppingCart size={20} />
              <span>Add to Cart</span>
            </button>
            <button className="flex-1 bg-card h-14 rounded-full font-bold hover:bg-background transition-all floating-card">
              Buy Now
            </button>
          </div>

          {/* Trust Badges */}
          <div className="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3 text-sm text-text-muted">
              <Truck size={20} className="text-primary" />
              <span>Fast Delivery</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-text-muted">
              <ShieldCheck size={20} className="text-primary" />
              <span>Genuine Quality</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-text-muted">
              <RotateCcw size={20} className="text-primary" />
              <span>7 Days Return</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;