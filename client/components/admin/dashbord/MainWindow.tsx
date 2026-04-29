"use client";

import React, { useMemo, useState } from "react";
import { AdminDashboardSection, Product, ProductMutationInput } from "@/types/product.type";
import AddProduct from "@/components/admin/products/AddProduct";
import ShowProduct from "@/components/admin/products/ShowProduct";
import { useCreateProduct, useUpdateProduct } from "@/hooks/useProducts";
import Loading from "@/app/loading";
import { ThemeToggle } from "@/components/ThemeToggle";
import { authService } from "@/service/auth.service";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

interface MainWindowProps {
  activeSection: AdminDashboardSection;
}

const MainWindow = ({ activeSection }: MainWindowProps) => {
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();
  const router = useRouter();

  const isSubmitting = useMemo(() => isCreating || isUpdating, [isCreating, isUpdating]);

  const handleSubmitProduct = (payload: ProductMutationInput) => {
    if (editProduct) {
      updateProduct(
        { id: editProduct.id, payload },
        {
          onSuccess: () => setEditProduct(null),
        },
      );
      return;
    }
    createProduct(payload);
  };

  if (isSubmitting && activeSection !== "products-add" && activeSection !== "products-show") {
    return <Loading />;
  }

  const renderPlaceholder = (title: string, subtitle: string) => (
    <div className="bg-card rounded-2xl p-8 floating-card">
      <h2 className="text-2xl font-bold text-text-main mb-2">{title}</h2>
      <p className="text-sm text-text-muted">{subtitle}</p>
    </div>
  );

  const handleLogout = async () => {
    try {
      await authService.logout();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Logout failed");
    }
  };

  return (
    <main className="flex-1 p-6 bg-background">
      {activeSection === "products-add" && (
        <div className="space-y-6">
          <AddProduct
            mode={editProduct ? "edit" : "create"}
            initialData={editProduct}
            isSubmitting={isSubmitting}
            onCancelEdit={() => setEditProduct(null)}
            onSubmit={handleSubmitProduct}
          />
        </div>
      )}

      {activeSection === "products-show" && (
        <ShowProduct onEdit={(product) => setEditProduct(product)} />
      )}
      {activeSection === "orders-add" &&
        renderPlaceholder("Add Order", "Manual order creation screen will be shown here.")}
      {activeSection === "orders-show" &&
        renderPlaceholder("Show Orders", "Orders list and status management will be shown here.")}
      {activeSection === "users" &&
        renderPlaceholder("User Management", "User list, roles, and account actions will be shown here.")}
      {activeSection === "settings-login-logout" && (
        <div className="bg-card rounded-2xl p-8 floating-card">
          <h2 className="text-2xl font-bold text-text-main mb-2">Login / Logout</h2>
          <p className="text-sm text-text-muted mb-5">Manage your admin session.</p>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/login")}
              className="px-5 py-2.5 rounded-lg bg-background text-text-main font-semibold"
            >
              Go to Login
            </button>
            <button
              onClick={handleLogout}
              className="px-5 py-2.5 rounded-lg bg-error text-white font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      )}
      {activeSection === "settings-theme" && (
        <div className="bg-card rounded-2xl p-8 floating-card">
          <h2 className="text-2xl font-bold text-text-main mb-2">Theme Settings</h2>
          <p className="text-sm text-text-muted mb-5">Switch dark/light mode from here.</p>
          <div className="inline-flex items-center bg-background px-4 py-3 rounded-lg">
            <ThemeToggle />
          </div>
        </div>
      )}
    </main>
  );
};

export default MainWindow;
