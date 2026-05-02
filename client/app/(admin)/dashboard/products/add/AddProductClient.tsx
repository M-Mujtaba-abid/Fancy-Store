"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AddProduct from "@/components/admin/products/AddProduct";
import Loading from "@/app/loading";
import { ProductMutationInput } from "@/types/product.type";
import { useCreateProduct, useProductDetails, useUpdateProduct } from "@/hooks/useProducts";

const AddProductClient = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();
  const { data: product, isLoading: isLoadingProduct, isError } = useProductDetails(editId || "");

  const mode = editId ? "edit" : "create";
  const isSubmitting = useMemo(() => isCreating || isUpdating, [isCreating, isUpdating]);

  const handleSubmit = (payload: ProductMutationInput) => {
    if (mode === "edit" && editId) {
      updateProduct(
        { id: editId, payload },
        {
          onSuccess: () => {
            router.push("/dashboard/products");
          },
        },
      );
      return;
    }

    createProduct(payload, {
      onSuccess: () => {
        router.push("/dashboard/products");
      },
    });
  };

  if (mode === "edit" && isLoadingProduct) {
    return <Loading />;
  }

  if (mode === "edit" && isError) {
    return (
      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
        <p className="text-error text-sm font-semibold">
          Product not found for editing. Please return to products list.
        </p>
      </div>
    );
  }

  return (
    <AddProduct
      mode={mode}
      initialData={product || null}
      isSubmitting={isSubmitting}
      onCancelEdit={() => router.push("/dashboard/products")}
      onSubmit={handleSubmit}
    />
  );
};

export default AddProductClient;
