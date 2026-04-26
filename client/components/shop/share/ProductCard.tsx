// "use client";

// import React, { useState } from "react";
// import Link from "next/link";
// import { ShoppingCart, Heart, PackageX } from "lucide-react";
// import { Product } from "@/types/product.type";
// import Image from "next/image";

// // Helper function: "floor_mat" ko "Floor Mat" banane ke liye
// const formatText = (text?: string) => {
//   if (!text) return "";
//   return text
//     .replace(/_/g, " ")
//     .replace(/\b\w/g, (char) => char.toUpperCase());
// };

// const ProductCard: React.FC<Product> = (product) => {
//   const {
//     id,
//     name,
//     price,
//     discountPrice,
//     imageUrl,
//     images,
//     isFeatured,
//     isOnSale,
//     isNewArrival,
//     category,
//     carModel,
//     vehicleType,
//     stock,
//   } = product;

//   const [isWishlisted, setIsWishlisted] = useState(false);

//   // Fallback image logic: Agar imageUrl null ho toh images array ka pehla image use karein
//   const displayImage = imageUrl || (images?.length ? images[0] : "/placeholder.png");

//   // Stock logic
//   const isOutOfStock = stock <= 0;

//   // Meta string generation (e.g., "Car • Civic • Floor Mat")
//   const metaData = [
//     formatText(vehicleType),
//     formatText(carModel),
//     formatText(category),
//   ]
//     .filter(Boolean)
//     .join(" • ");

//   return (
//     <div className="group relative bg-card rounded-xl shadow-sm hover:shadow-xl  transition-all duration-300 overflow-hidden flex flex-col h-full ">
//       {/* 1. Image Section */}
//       <Link href={`/products/All/${id}`} className="relative w-full aspect-square bg-gray-50 overflow-hidden block">
//         <Image
//           src={displayImage}
//           alt={name}
//           fill
//           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
//           sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
//         />

//         {/* Badges (Top Left) */}
//         <div className="absolute top-3 left-3 flex flex-col gap-2 items-start">
//           {isOnSale && (
//             <span className="bg-red-500 text-white text-[10px] uppercase font-bold px-2.5 py-1 rounded-sm shadow-sm tracking-wider">
//               Sale
//             </span>
//           )}
//           {isNewArrival && (
//             <span className="bg-green-500 text-white text-[10px] uppercase font-bold px-2.5 py-1 rounded-sm shadow-sm tracking-wider">
//               New
//             </span>
//           )}
//           {isFeatured && (
//             <span className="bg-blue-600 text-white text-[10px] uppercase font-bold px-2.5 py-1 rounded-sm shadow-sm tracking-wider">
//               Featured
//             </span>
//           )}
//         </div>
//       </Link>

//       {/* Wishlist Button (Top Right) */}
//       <button
//         onClick={(e) => {
//           e.preventDefault(); // Link click hone se rokay ga
//           setIsWishlisted(!isWishlisted);
//         }}
//         className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2.5 rounded-full shadow-sm hover:bg-white hover:scale-110 transition-all duration-200 z-10"
//         aria-label="Add to wishlist"
//       >
//         <Heart
//           size={18}
//           className={`transition-colors duration-300 ${
//             isWishlisted ? "fill-red-500 text-red-500" : "text-gray-500"
//           }`}
//         />
//       </button>

//       {/* 2. Content Section */}
//       <div className="p-4 flex flex-col grow">
//         <Link href={`/products/${id}`} className="grow">
//           {/* Meta Information (Category / Car Model) */}
//           <p className="text-[11px] text-gray-500 font-medium mb-1.5 line-clamp-1">
//             {metaData || "Automotive Accessory"}
//           </p>

//           {/* Product Title */}
//           <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2 group-hover:text-primary transition-colors leading-snug">
//             {name}
//           </h3>

//           {/* Price Section */}
//           <div className="flex items-center gap-2 mb-4">
//             {isOnSale && discountPrice ? (
//               <>
//                 <span className="text-lg font-bold text-primary">
//                   Rs. {discountPrice.toLocaleString()}
//                 </span>
//                 <span className="text-xs line-through text-gray-400">
//                   Rs. {price.toLocaleString()}
//                 </span>
//               </>
//             ) : (
//               <span className="text-lg font-bold text-primary">
//                 Rs. {price.toLocaleString()}
//               </span>
//             )}
//           </div>
//         </Link>

//         {/* 3. Action Button */}
//         <button
//           disabled={isOutOfStock}
//           className={`w-full font-medium py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm
//             ${
//               isOutOfStock
//                 ? "bg-gray-100 text-gray-400 cursor-not-allowed"
//                 : "bg-primary hover:bg-primary/90 text-white shadow-sm hover:shadow-md"
//             }
//           `}
//         >
//           {isOutOfStock ? (
//             <>
//               <PackageX size={16} />
//               Out of Stock
//             </>
//           ) : (
//             <>
//               <ShoppingCart size={16} />
//               Add to Cart
//             </>
//           )}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ProductCard;

"use client";

import React from "react";
import Link from "next/link";
import { ShoppingCart, PackageX } from "lucide-react";
import { Product } from "@/types/product.type";
import Image from "next/image";
// ✅ Apna naya component import karein
import WishlistButton from "@/components/shop/share/WishlistButton";

const formatText = (text?: string) => {
  if (!text) return "";
  return text.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};

interface ProductCardProps extends Product {
  variant?: "default" | "overlay" | "minimal";
}

const ProductCard: React.FC<ProductCardProps> = (props) => {
  const {
    id, name, price, discountPrice, imageUrl, images, isOnSale,
    isNewArrival, category, carModel, vehicleType, stock,
    variant = "default",
  } = props;

  const displayImage = imageUrl || (images?.length ? images[0] : "/placeholder.png");
  const isOutOfStock = stock <= 0;
  const metaData = [formatText(vehicleType), formatText(carModel), formatText(category)].filter(Boolean).join(" • ");

  // ------------------------------------------------------------------
  // VARIANT 2: OVERLAY DESIGN
  // ------------------------------------------------------------------
  if (variant === "overlay") {
    return (
      <Link href={`/products/${id}`} className="group relative block w-full h-[320px] rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
        <Image
          src={displayImage} alt={name} fill
          className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
          sizes="(max-width: 768px) 100vw, 25vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

        {/* ✅ Wishlist Component */}
        <WishlistButton 
          productId={id as string} 
          className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2 rounded-full hover:bg-white/40 transition-colors"
          iconClassName="text-white fill-transparent" // Dark BG ke liye white stroke
        />

        {/* Content Area (Bottom) */}
        <div className="absolute bottom-0 left-0 w-full p-5 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
          <div className="flex gap-2 mb-2">
            {isOnSale && <span className="bg-red-500 text-[10px] uppercase font-bold px-2 py-0.5 rounded">Sale</span>}
            {isNewArrival && <span className="bg-green-500 text-[10px] uppercase font-bold px-2 py-0.5 rounded">New</span>}
          </div>
          <p className="text-xs text-gray-300 mb-1 line-clamp-1">{metaData}</p>
          <h3 className="text-lg font-bold line-clamp-1 mb-1">{name}</h3>
          <div className="flex items-center justify-between mt-2">
            <div>
              {isOnSale && discountPrice ? (
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-primary">Rs. {discountPrice.toLocaleString()}</span>
                  <span className="text-xs line-through text-gray-400">Rs. {price.toLocaleString()}</span>
                </div>
              ) : (
                <span className="text-lg font-bold text-primary">Rs. {price.toLocaleString()}</span>
              )}
            </div>
            <div className={`p-2 rounded-full backdrop-blur-md ${isOutOfStock ? "bg-gray-500/50" : "bg-primary/80 hover:bg-primary"}`}>
              {isOutOfStock ? <PackageX size={18} className="text-white" /> : <ShoppingCart size={18} className="text-white" />}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // ------------------------------------------------------------------
  // VARIANT 3: MINIMAL DESIGN
  // ------------------------------------------------------------------
  if (variant === "minimal") {
    return (
      <div className="group relative flex flex-col h-full bg-transparent">
        <div className="relative w-full aspect-[4/5] mb-3">
          <Link href={`/products/${id}`} className="block w-full h-full bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={displayImage} alt={name} fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 25vw"
            />
          </Link>
          {isOnSale && <span className="absolute top-3 left-3 pointer-events-none bg-black text-white text-[10px] uppercase font-bold px-2 py-1 tracking-widest">Sale</span>}

          {/* ✅ Wishlist Component */}
          <WishlistButton 
            productId={id as string} 
            className="absolute top-3 right-3 bg-white/70 backdrop-blur-md p-2 rounded-full hover:bg-white transition-colors shadow-sm"
          />
        </div>

        <Link href={`/products/${id}`} className="flex flex-col flex-grow text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{category?.replace(/_/g, " ")}</p>
          <h3 className="text-sm font-medium text-gray-900 line-clamp-1 mb-2 group-hover:text-primary transition-colors">{name}</h3>
          <div className="flex justify-center items-center gap-2">
            {isOnSale && discountPrice ? (
              <><span className="text-sm font-bold text-red-600">Rs. {discountPrice.toLocaleString()}</span><span className="text-xs line-through text-gray-400">Rs. {price.toLocaleString()}</span></>
            ) : (
              <span className="text-sm font-semibold text-gray-900">Rs. {price.toLocaleString()}</span>
            )}
          </div>
        </Link>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // VARIANT 1: DEFAULT DESIGN
  // ------------------------------------------------------------------
  return (
    <div className="group relative bg-card rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full border border-border/50">
      <div className="relative w-full aspect-square bg-gray-50">
        <Link href={`/products/${id}`} className="block w-full h-full overflow-hidden">
          <Image
            src={displayImage} alt={name} fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* ✅ Wishlist Component */}
        <WishlistButton 
          productId={id as string} 
          className="absolute top-3 right-3 bg-white/80 backdrop-blur-md p-2 rounded-full hover:bg-white transition-colors shadow-sm"
        />
      </div>

      <div className="p-4 flex flex-col grow">
        <Link href={`/products/${id}`}>
          <h3 className="text-sm font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors">{name}</h3>
        </Link>
        <span className="text-lg font-bold text-primary mb-4">Rs. {price?.toLocaleString()}</span>
        <button className="w-full bg-primary text-white py-2 rounded-lg text-sm hover:opacity-90 transition-opacity mt-auto">
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
