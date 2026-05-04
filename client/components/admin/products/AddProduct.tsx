"use client";

import React, { useEffect, useState } from "react";
import { Product, ProductMutationInput } from "@/types/product.type";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import styles from "./AddProduct.module.css";

interface AddProductProps {
  mode: "create" | "edit";
  initialData?: Product | null;
  isSubmitting?: boolean;
  onCancelEdit?: () => void;
  onSubmit: (payload: any) => void;
}

const defaultFormState: ProductMutationInput = {
  name: "",
  description: "",
  price: 0,
  stock: 10,
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
  subCategory: "",
};

const MAX_IMAGE_COUNT = 5;
const MAX_IMAGE_DIMENSION = 1600;
const IMAGE_QUALITY = 0.8;

// Image Compression Utility
const compressImageFile = (file: File): Promise<File> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = Math.min(
        1,
        MAX_IMAGE_DIMENSION / image.width,
        MAX_IMAGE_DIMENSION / image.height,
      );
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Could not initialize image compressor"));
        return;
      }

      context.drawImage(image, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(objectUrl);
          if (!blob) {
            reject(new Error("Image compression failed"));
            return;
          }
          const compressedFile = new File(
            [blob],
            file.name.replace(/\.\w+$/, ".webp"),
            {
              type: "image/webp",
              lastModified: Date.now(),
            },
          );
          resolve(compressedFile);
        },
        "image/webp",
        IMAGE_QUALITY,
      );
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Invalid image file"));
    };

    image.src = objectUrl;
  });

const AddProduct = ({
  mode,
  initialData,
  isSubmitting = false,
  onCancelEdit,
  onSubmit,
}: AddProductProps) => {
  const [form, setForm] = useState<ProductMutationInput>(defaultFormState);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [imageError, setImageError] = useState("");
  const [isPreparingImages, setIsPreparingImages] = useState(false);

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setForm({
        name: initialData.name || "",
        description: initialData.description || "",
        price: Number(initialData.price) || 0,
        stock: Number(initialData.stock) || 0,
        category: initialData.category || "",
        subCategory: initialData.subCategory || "",
        vehicleType: initialData.vehicleType === "bike" ? "bike" : "car",
        carModel: initialData.carModel || "",
        color: initialData.color || "",
        material: initialData.material || "",
        isFeatured: Boolean(initialData.isFeatured),
        isNewArrival: Boolean(initialData.isNewArrival),
        isOnSale: Boolean(initialData.isOnSale),
        discountPrice: Number(initialData.discountPrice || 0),
        images: [],
      });
      setExistingImages(initialData.images || []);
    } else {
      setForm(defaultFormState);
      setExistingImages([]);
    }
    setNewImagePreviews([]);
  }, [mode, initialData]);

  const onFieldChange =
    (field: keyof ProductMutationInput) =>
    (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      const value = event.target.value;
      const checked =
        event.target instanceof HTMLInputElement ? event.target.checked : false;
      const isCheckbox =
        event.target instanceof HTMLInputElement &&
        event.target.type === "checkbox";

      setForm((prev) => {
        const updatedForm = {
          ...prev,
          [field]: isCheckbox
            ? checked
            : field === "price" ||
                field === "stock" ||
                field === "discountPrice"
              ? Number(value)
              : value,
        };
        if (field === "isOnSale" && !checked) updatedForm.discountPrice = 0;
        return updatedForm;
      });
    };

  const onImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];

    if (existingImages.length + files.length > MAX_IMAGE_COUNT) {
      setImageError(
        `Total images (saved + new) cannot exceed ${MAX_IMAGE_COUNT}.`,
      );
      return;
    }

    setImageError("");
    setIsPreparingImages(true);

    const previews = files.map((file) => URL.createObjectURL(file));
    setNewImagePreviews(previews);

    Promise.allSettled(files.map((file) => compressImageFile(file)))
      .then((results) => {
        const preparedFiles = results.map((result, index) =>
          result.status === "fulfilled" ? result.value : files[index],
        );
        setForm((prev) => ({ ...prev, images: preparedFiles }));
      })
      .catch(() => setImageError("Image processing failed."))
      .finally(() => setIsPreparingImages(false));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
    setForm((prev) => ({
      ...prev,
      images: (prev.images as File[]).filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (isPreparingImages) return;

    if (existingImages.length + (form.images?.length || 0) === 0) {
      setImageError("At least one product image is required.");
      return;
    }

    if (form.discountPrice > form.price) {
      setImageError("Discount price cannot be greater than regular price.");
      return;
    }

    const payload = {
      ...form,
      existingImages: existingImages,
    };

    onSubmit(payload);
  };

  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
      <div className="mb-6 border-b border-border/50 pb-4">
        <h2 className="text-2xl font-bold text-text-main">
          {mode === "create" ? "Add New Product" : "Edit Product"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* --- SECTION 1: Basic Information --- */}
        <div>
          <h3 className="text-lg font-semibold text-text-main mb-4">
            1. Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1 md:col-span-1">
              <label className="text-sm font-medium text-text-muted">
                Product Name *
              </label>
              <input
                className="bg-background border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-primary"
                value={form.name}
                onChange={onFieldChange("name")}
                required
                placeholder="e.g. Premium Car Cover"
              />
            </div>

            <div className="flex flex-col gap-1 md:col-span-1">
              <label className="text-sm font-medium text-text-muted">
                Category *
              </label>
              <select
                className="bg-background border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-primary"
                value={form.category}
                onChange={onFieldChange("category")}
                required
              >
                <option value="" disabled>
                  Select Category
                </option>
                <option value="car_topCover">Car Top Cover</option>
                <option value="bike_topCover">Bike Top Cover</option>
                <option value="floor_mat">Floor Mat</option>
                <option value="trunk_tray">Trunk Tray</option>
                <option value="dashboard_mat">Dashboard Mat</option>
                <option value="seat_cover">Seat Cover</option>
                <option value="steering_cover">Steering Cover</option>
              </select>
            </div>

            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm font-medium text-text-muted">
                Description *
              </label>
              <ReactQuill
                theme="snow"
                value={form.description}
                onChange={(val) => setForm((p) => ({ ...p, description: val }))}
                className={styles.quillEditor}
              />
            </div>
          </div>
        </div>

        {/* --- SECTION 2: Pricing & Inventory --- */}
        <div className="border-t border-border/50 pt-6">
          <h3 className="text-lg font-semibold text-text-main mb-4">
            2. Pricing & Inventory
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-text-muted">
                Regular Price (Rs) *
              </label>
              <input
                className="bg-background border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-primary"
                type="number"
                value={form.price || ""}
                onChange={onFieldChange("price")}
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-text-muted">
                Stock *
              </label>
              <input
                className="bg-background border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-primary"
                type="number"
                value={form.stock || ""}
                onChange={onFieldChange("stock")}
                required
              />
            </div>
            <div
              className={`flex flex-col gap-1 transition-opacity ${form.isOnSale ? "opacity-100" : "opacity-40 pointer-events-none"}`}
            >
              <label className="text-sm font-medium text-text-muted">
                Discount Price (Rs)
              </label>
              <input
                className="bg-background border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-primary"
                type="number"
                value={form.discountPrice || ""}
                onChange={onFieldChange("discountPrice")}
                disabled={!form.isOnSale}
              />
            </div>
          </div>
        </div>

        {/* --- SECTION 3: Vehicle Specifics --- */}
        <div className="border-t border-border/50 pt-6">
          <h3 className="text-lg font-semibold text-text-main mb-4">
            3. Vehicle Specifics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-text-muted">
                Vehicle Type
              </label>
              <select
                className="bg-background border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-primary"
                value={form.vehicleType}
                onChange={onFieldChange("vehicleType")}
              >
                <option value="car">Car</option>
                <option value="bike">Bike</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-text-muted">
                Sub Category
              </label>
              <input
                className="bg-background border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-primary"
                placeholder="e.g. luxury, universal"
                value={form.subCategory ?? ""}
                onChange={onFieldChange("subCategory")}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-text-muted">
                Compatible Model(s)
              </label>
              <input
                className="bg-background border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-primary"
                placeholder="e.g. Civic 2024"
                value={form.carModel ?? ""}
                onChange={onFieldChange("carModel")}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-text-muted">
                Color
              </label>
              <input
                className="bg-background border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-primary"
                placeholder="e.g. Black"
                value={form.color ?? ""}
                onChange={onFieldChange("color")}
              />
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm font-medium text-text-muted">
                Material
              </label>
              <input
                className="bg-background border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-primary"
                placeholder="e.g. Leatherette"
                value={form.material ?? ""}
                onChange={onFieldChange("material")}
              />
            </div>
          </div>
        </div>

        {/* --- SECTION 4: Status & Media --- */}
        <div className="border-t border-border/50 pt-6">
          <h3 className="text-lg font-semibold text-text-main mb-4">
            4. Status & Media
          </h3>

          <div className="flex flex-wrap gap-6 mb-6 bg-background p-4 rounded-xl border border-border">
            <label className="text-sm font-medium flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 accent-primary"
                checked={form.isFeatured}
                onChange={onFieldChange("isFeatured")}
              />{" "}
              ⭐ Featured
            </label>
            <label className="text-sm font-medium flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 accent-primary"
                checked={form.isNewArrival}
                onChange={onFieldChange("isNewArrival")}
              />{" "}
              🚀 New Arrival
            </label>
            <label className="text-sm font-medium flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 accent-primary"
                checked={form.isOnSale}
                onChange={onFieldChange("isOnSale")}
              />{" "}
              🏷️ On Sale
            </label>
          </div>

          <div className="flex flex-wrap gap-4 mb-6">
            {existingImages.map((url, index) => (
              <div
                key={`old-${index}`}
                className="relative w-24 h-24 border rounded-lg overflow-hidden group border-border"
              >
                <img
                  src={url}
                  alt="saved"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeExistingImage(index)}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow-lg"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
                <div className="absolute bottom-0 w-full bg-black/50 text-[10px] text-white text-center py-0.5">
                  Saved
                </div>
              </div>
            ))}

            {newImagePreviews.map((blob, index) => (
              <div
                key={`new-${index}`}
                className="relative w-24 h-24 border-2 border-primary/40 rounded-lg overflow-hidden group"
              >
                <img
                  src={blob}
                  alt="new"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeNewImage(index)}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow-lg"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
                <div className="absolute bottom-0 w-full bg-primary text-[10px] text-white text-center py-0.5">
                  New
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-muted">
              Select Images (Max {MAX_IMAGE_COUNT})
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={onImageChange}
              disabled={
                isPreparingImages ||
                existingImages.length + newImagePreviews.length >=
                  MAX_IMAGE_COUNT
              }
              className="bg-background border border-border rounded-lg px-4 py-3 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-primary"
            />
            {isPreparingImages && (
              <p className="text-xs text-primary mt-1">Optimizing images...</p>
            )}
            {imageError && (
              <p className="text-xs text-red-500 mt-1">{imageError}</p>
            )}
          </div>
        </div>

        {/* --- FORM ACTIONS --- */}
        <div className="pt-6 flex justify-end gap-3 border-t border-border/50">
          {mode === "edit" && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="px-6 py-3 border border-border rounded-lg text-sm font-bold"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || isPreparingImages}
            className="bg-primary text-white px-8 py-3 rounded-lg font-bold disabled:opacity-50 shadow-md hover:opacity-90 transition-all flex items-center gap-2"
          >
            {isSubmitting
              ? "Processing..."
              : mode === "create"
                ? "Create Product"
                : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
