"use client";

import React from "react";
import { Product } from "@/types/product.type";
import Loading from "@/app/loading";
import { useAdminProducts, useDeleteProduct } from "@/hooks/useProducts";

interface ShowProductProps {
  onEdit: (product: Product) => void;
}

const ShowProduct = ({ onEdit }: ShowProductProps) => {
  const [page, setPage] = React.useState(1);
  const limit = 8;
  const { data, isLoading, isError } = useAdminProducts(page, limit);
  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();

  if (isLoading) return <Loading />;

  if (isError) {
    return (
      <div className="bg-card rounded-2xl p-6 floating-card">
        <p className="text-error text-sm">Failed to fetch products.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg-card rounded-2xl p-6 floating-card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-text-main">All Products</h2>
          <p className="text-sm text-text-muted">Total: {data?.totalItems || 0}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-text-muted border-b border-border-custom/40">
                <th className="pb-3">Name</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Price</th>
                <th className="pb-3">Stock</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.products?.map((product) => (
                <tr key={product.id} className="border-b border-border-custom/20">
                  <td className="py-3 text-text-main">{product.name}</td>
                  <td className="py-3 text-text-muted">{product.category}</td>
                  <td className="py-3 text-text-muted uppercase">{product.vehicleType || "-"}</td>
                  <td className="py-3 text-text-main">Rs. {product.price}</td>
                  <td className="py-3 text-text-main">{product.stock}</td>
                  <td className="py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onEdit(product)}
                        className="px-3 py-1.5 rounded-md bg-primary/90 text-white"
                      >
                        Edit
                      </button>
                      <button
                        disabled={isDeleting}
                        onClick={() => deleteProduct(product.id)}
                        className="px-3 py-1.5 rounded-md bg-error text-white disabled:opacity-70"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-end gap-2 mt-5">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-2 text-sm rounded-md bg-background disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-sm text-text-muted">
            Page {data?.currentPage || page} / {data?.totalPages || 1}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= (data?.totalPages || 1)}
            className="px-3 py-2 text-sm rounded-md bg-background disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShowProduct;
