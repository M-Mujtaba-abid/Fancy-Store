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
  stock: 0,
  category: "",
  vehicleType: "car",
  carModel: "",
  color: "",
  material: "",
  isFeatured: false,
  isNewArrival: false,
  isOnSale: false,
  discountPrice: 0,
  images: [],
};

const AddProduct = ({
  mode,
  initialData,
  isSubmitting = false,
  onCancelEdit,
  onSubmit,
}: AddProductProps) => {
  const [form, setForm] = useState<ProductMutationInput>(defaultFormState);

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setForm({
        name: initialData.name,
        description: initialData.description,
        price: Number(initialData.price),
        stock: Number(initialData.stock),
        category: initialData.category,
        vehicleType: initialData.vehicleType === "bike" ? "bike" : "car",
        carModel: initialData.carModel,
        color: initialData.color,
        material: initialData.material,
        isFeatured: Boolean(initialData.isFeatured),
        isNewArrival: Boolean(initialData.isNewArrival),
        isOnSale: Boolean(initialData.isOnSale),
        discountPrice: Number(initialData.discountPrice || 0),
        images: [],
      });
      return;
    }
    setForm(defaultFormState);
  }, [mode, initialData]);

  const onFieldChange =
    (field: keyof ProductMutationInput) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = event.target.value;
      const checked =
        event.target instanceof HTMLInputElement ? event.target.checked : false;
      const isCheckbox =
        event.target instanceof HTMLInputElement && event.target.type === "checkbox";

      setForm((prev) => ({
        ...prev,
        [field]: isCheckbox
          ? checked
          : field === "price" || field === "stock" || field === "discountPrice"
            ? Number(value)
            : value,
      }));
    };

  const onImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    setForm((prev) => ({ ...prev, images: files }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="bg-card rounded-2xl p-6 floating-card">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-text-main">
          {mode === "create" ? "Add Product" : "Edit Product"}
        </h2>
        <p className="text-sm text-text-muted">Manage products from admin dashboard.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input className="bg-background rounded-lg px-4 py-3 text-sm" placeholder="Name" value={form.name} onChange={onFieldChange("name")} required />
        <input className="bg-background rounded-lg px-4 py-3 text-sm" placeholder="Category" value={form.category} onChange={onFieldChange("category")} required />
        <input className="bg-background rounded-lg px-4 py-3 text-sm" type="number" min={0} placeholder="Price" value={form.price} onChange={onFieldChange("price")} required />
        <input className="bg-background rounded-lg px-4 py-3 text-sm" type="number" min={0} placeholder="Stock" value={form.stock} onChange={onFieldChange("stock")} required />
        <select className="bg-background rounded-lg px-4 py-3 text-sm" value={form.vehicleType} onChange={onFieldChange("vehicleType")}>
          <option value="car">Car</option>
          <option value="bike">Bike</option>
        </select>
        <input className="bg-background rounded-lg px-4 py-3 text-sm" placeholder="Car/Bike Model" value={form.carModel} onChange={onFieldChange("carModel")} required />
        <input className="bg-background rounded-lg px-4 py-3 text-sm" placeholder="Color" value={form.color} onChange={onFieldChange("color")} required />
        <input className="bg-background rounded-lg px-4 py-3 text-sm" placeholder="Material" value={form.material} onChange={onFieldChange("material")} required />
        <input className="bg-background rounded-lg px-4 py-3 text-sm" type="number" min={0} placeholder="Discount Price" value={form.discountPrice} onChange={onFieldChange("discountPrice")} />
        <input className="bg-background rounded-lg px-4 py-3 text-sm file:mr-3 file:rounded-md file:border-none file:bg-primary file:px-3 file:py-1.5 file:text-white" type="file" multiple accept="image/*" onChange={onImageChange} />

        <textarea
          className="bg-background rounded-lg px-4 py-3 text-sm md:col-span-2 min-h-24"
          placeholder="Description"
          value={form.description}
          onChange={onFieldChange("description")}
          required
        />

        <div className="md:col-span-2 flex flex-wrap items-center gap-4">
          <label className="text-sm text-text-main flex items-center gap-2">
            <input type="checkbox" checked={form.isFeatured} onChange={onFieldChange("isFeatured")} />
            Featured
          </label>
          <label className="text-sm text-text-main flex items-center gap-2">
            <input type="checkbox" checked={form.isNewArrival} onChange={onFieldChange("isNewArrival")} />
            New Arrival
          </label>
          <label className="text-sm text-text-main flex items-center gap-2">
            <input type="checkbox" checked={form.isOnSale} onChange={onFieldChange("isOnSale")} />
            On Sale
          </label>
        </div>

        <div className="md:col-span-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-70"
          >
            {isSubmitting ? "Saving..." : mode === "create" ? "Create Product" : "Update Product"}
          </button>
          {mode === "edit" && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="bg-background text-text-main px-5 py-2.5 rounded-lg text-sm font-semibold"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
