"use client";

import { useRouter } from "next/navigation";
import ShowProduct from "@/components/admin/products/ShowProduct";
import { Product } from "@/types/product.type";

const ProductsClient = () => {
  const router = useRouter();

  const handleEdit = (product: Product) => {
    router.push(`/dashboard/products/add?edit=${product.id}`);
  };

  return <ShowProduct onEdit={handleEdit} />;
};

export default ProductsClient;
