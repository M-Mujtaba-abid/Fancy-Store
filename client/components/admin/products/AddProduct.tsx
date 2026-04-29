"use client";

import React, { useEffect, useState } from "react";
import { Product, ProductMutationInput } from "@/types/product.type";

interface AddProductProps {
  mode: "create" | "edit";
  initialData?: Product | null;
  isSubmitting?: boolean;
  onCancelEdit?: () => void;
  onSubmit: (payload: ProductMutationInput) => void;
}

const defaultFormState: ProductMutationInput = {
  name: "",
  description: "",
  price: 0,
  stock: 10, // ✅ Default stock 10
  category: "",
  vehicleType: "car",
  carModel: "",
  color: "",
  material: "",
  isFeatured: false,
  isNewArrival: false,
  isOnSale: false,
  discountPrice: 0,
  images: [], // ✅ Files array
};

const AddProduct = ({
  mode,
  initialData,
  isSubmitting = false,
  onCancelEdit,
  onSubmit,
}: AddProductProps) => {
  const [form, setForm] = useState<ProductMutationInput>(defaultFormState);

  // Edit Mode ke liye initial data set karna
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setForm({
        name: initialData.name || "",
        description: initialData.description || "",
        price: Number(initialData.price) || 0,
        stock: Number(initialData.stock) || 0,
        category: initialData.category || "",
        vehicleType: initialData.vehicleType === "bike" ? "bike" : "car",
        carModel: initialData.carModel || "",
        color: initialData.color || "",
        material: initialData.material || "",
        isFeatured: Boolean(initialData.isFeatured),
        isNewArrival: Boolean(initialData.isNewArrival),
        isOnSale: Boolean(initialData.isOnSale),
        discountPrice: Number(initialData.discountPrice || 0),
        images: [], // Edit mode mein new images select karne ki option empty rakhi hai
      });
      return;
    }
    setForm(defaultFormState);
  }, [mode, initialData]);

  // Input fields ko handle karna
  const onFieldChange =
    (field: keyof ProductMutationInput) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = event.target.value;
      const checked = event.target instanceof HTMLInputElement ? event.target.checked : false;
      const isCheckbox = event.target instanceof HTMLInputElement && event.target.type === "checkbox";

      setForm((prev) => {
        const updatedForm = {
          ...prev,
          [field]: isCheckbox
            ? checked
            : field === "price" || field === "stock" || field === "discountPrice"
            ? Number(value)
            : value,
        };

        // UX Feature: Agar item sale se hata dein, toh discount automatically 0 ho jaye
        if (field === "isOnSale" && !checked) {
          updatedForm.discountPrice = 0;
        }

        return updatedForm;
      });
    };

  // Images ko File[] mein convert karna
  const onImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    setForm((prev) => ({ ...prev, images: files }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(form); // ✅ Yahan se exact ProductMutationInput type pass hogi
  };

  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
      <div className="mb-6 border-b border-border/50 pb-4">
        <h2 className="text-2xl font-bold text-text-main">
          {mode === "create" ? "Add New Product" : "Edit Product"}
        </h2>
        <p className="text-sm text-text-muted mt-1">
          {mode === "create"
            ? "Fill in the details to add a new product to your inventory."
            : "Update the fields below to modify this product."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* --- SECTION 1: Basic Information --- */}
        <div>
          <h3 className="text-lg font-semibold text-text-main mb-4">1. Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1 md:col-span-1">
              <label className="text-sm font-medium text-text-muted">Product Name *</label>
              <input className="bg-background border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-primary" placeholder="e.g. Premium Car Cover" value={form.name} onChange={onFieldChange("name")} required />
            </div>

            <div className="flex flex-col gap-1 md:col-span-1">
              <label className="text-sm font-medium text-text-muted">Category *</label>
              <select className="bg-background border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-primary" value={form.category} onChange={onFieldChange("category")} required>
                <option value="" disabled>Select Category</option>
                <option value="interior">Interior Accessories</option>
                <option value="exterior">Exterior Accessories</option>
                <option value="electronics">Car Electronics</option>
                <option value="care">Car Care & Cleaning</option>
              </select>
            </div>

            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm font-medium text-text-muted">Description *</label>
              <textarea className="bg-background border border-border rounded-lg px-4 py-3 text-sm min-h-24 outline-none focus:border-primary" placeholder="Enter detailed product description..." value={form.description} onChange={onFieldChange("description")} required />
            </div>
          </div>
        </div>

        {/* --- SECTION 2: Pricing & Inventory --- */}
        <div className="border-t border-border/50 pt-6">
          <h3 className="text-lg font-semibold text-text-main mb-4">2. Pricing & Inventory</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-text-muted">Regular Price (Rs) *</label>
              <input className="bg-background border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-primary" type="number" min={0} placeholder="0" value={form.price || ""} onChange={onFieldChange("price")} required />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-text-muted">Stock Quantity *</label>
              <input className="bg-background border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-primary" type="number" min={0} placeholder="10" value={form.stock || ""} onChange={onFieldChange("stock")} required />
            </div>

            <div className={`flex flex-col gap-1 transition-opacity ${form.isOnSale ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
              <label className="text-sm font-medium text-text-muted">Discount Price (Rs)</label>
              <input className="bg-background border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-primary" type="number" min={0} placeholder="0" value={form.discountPrice || ""} onChange={onFieldChange("discountPrice")} disabled={!form.isOnSale} />
            </div>
          </div>
        </div>

        {/* --- SECTION 3: Vehicle Specifics --- */}
        <div className="border-t border-border/50 pt-6">
          <h3 className="text-lg font-semibold text-text-main mb-4">3. Vehicle Specifics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-text-muted">Vehicle Type</label>
              <select className="bg-background border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-primary" value={form.vehicleType} onChange={onFieldChange("vehicleType")}>
                <option value="car">Car</option>
                <option value="bike">Bike</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-text-muted">Compatible Model(s)</label>
              <input className="bg-background border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-primary" placeholder="e.g. Honda Civic 2022+" value={form.carModel} onChange={onFieldChange("carModel")} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-text-muted">Color</label>
              <input className="bg-background border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-primary" placeholder="e.g. Matte Black" value={form.color} onChange={onFieldChange("color")} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-text-muted">Material</label>
              <input className="bg-background border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-primary" placeholder="e.g. Faux Leather, PVC" value={form.material} onChange={onFieldChange("material")} />
            </div>
          </div>
        </div>

        {/* --- SECTION 4: Status & Media --- */}
        <div className="border-t border-border/50 pt-6">
          <h3 className="text-lg font-semibold text-text-main mb-4">4. Status & Media</h3>
          
          <div className="flex flex-wrap gap-6 mb-6 bg-background p-4 rounded-xl border border-border">
            <label className="text-sm font-medium text-text-main flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 accent-primary" checked={form.isFeatured} onChange={onFieldChange("isFeatured")} />
              ⭐ Featured Product
            </label>
            <label className="text-sm font-medium text-text-main flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 accent-primary" checked={form.isNewArrival} onChange={onFieldChange("isNewArrival")} />
              🚀 New Arrival
            </label>
            <label className="text-sm font-medium text-text-main flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 accent-primary" checked={form.isOnSale} onChange={onFieldChange("isOnSale")} />
              🏷️ On Sale
            </label>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-muted">Upload Product Images *</label>
            <input 
              className="bg-background border border-border rounded-lg px-4 py-3 text-sm outline-none file:mr-4 file:rounded-full file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary hover:file:bg-primary/20" 
              type="file" 
              multiple 
              accept="image/*" 
              onChange={onImageChange} 
              required={mode === "create"} // Create mode mein required hai
            />
            <p className="text-xs text-text-muted mt-1">First image will be used as the main product image.</p>
          </div>
        </div>

        {/* --- FORM ACTIONS --- */}
        <div className="border-t border-border/50 pt-6 flex items-center gap-3 justify-end">
          {mode === "edit" && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="px-6 py-3 rounded-lg text-sm font-bold border border-border text-text-main hover:bg-background transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary text-white px-8 py-3 rounded-lg text-sm font-bold shadow-md hover:opacity-90 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : mode === "create" ? (
              "Create Product"
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;