"use client";
import dynamic from "next/dynamic";

const ProductGrid = dynamic(
  () => import("@/components/shop/mainPage/categories/ProductGrid"),
  { ssr: false }
);

export default ProductGrid;
