"use client"; // 1. Client component zaroori hai hook use karne ke liye

import Loading from "@/app/loading";
import { useAllProducts } from "@/hooks/useProducts";
import Link from "next/link";
import React from "react";

// 2. Isay 'default' export banayein
const ProductList = () => {
  const { data, isLoading, isError, error } = useAllProducts(1, 10);

  if (isLoading) return <Loading />;
  
  if (isError) return <div className="p-4 text-red-500">Error loading products.</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
      {data?.products.map((product) => (
        <div key={product.id} className="border rounded-lg p-4 shadow-sm bg-background">
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-48 object-contain mb-4" 
          />
          <h3 className="font-bold text-lg text-text-main">{product.name}</h3>
          <p className="text-text-muted text-sm line-clamp-2">{product.description}</p>
          <div className="mt-4 flex justify-between items-center">
            <span className="text-primary font-bold">Rs. {product.price}</span>
            <button className="bg-primary text-white px-4 py-2 rounded-md hover:opacity-90">
              Add to Cart
            </button>
            <Link href={`/products/All/${product.id}`} className="bg-primary text-white px-4 py-2 rounded-md hover:opacity-90">
              see details
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductList; // 3. Ye line sab se important hai



// import React from 'react'

// const page = () => {
//   return (
//     <div>
//       i am all products 
//     </div>
//   )
// }

// export default page
