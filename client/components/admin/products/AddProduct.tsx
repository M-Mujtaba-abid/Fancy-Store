"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Product, ProductMutationInput, VariantInput, MATERIAL_OPTIONS } from "@/types/product.type";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import styles from "./AddProduct.module.css";
import { useCategories } from "@/hooks/useCategories";
import { compressImageFile } from "@/utils/imageCompression";

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
  variants: [],
};

const MAX_IMAGE_COUNT = 5;

// --- Dynamic Categories Config & Suggestions ---
// ⚠️ Ye ab OFFLINE FALLBACK hai, source of truth nahi.
// Live list GET /api/categories se aati hai (useCategories hook, neeche).
// Backend down ho to dropdown khali na ho, is liye ye array rakha gaya hai.
export const DYNAMIC_CATEGORIES = [
  { id: "car_topCover", label: "Car Top Cover", suggestedVariantType: "Material" },
  { id: "bike_topCover", label: "Bike Top Cover", suggestedVariantType: "Material" },
  { id: "floor_mat", label: "Floor Mat", suggestedVariantType: "Material" },
  { id: "trunk_tray", label: "Trunk Tray", suggestedVariantType: "Material" },
  { id: "dashboard_mat", label: "Dashboard Mat", suggestedVariantType: "Material" },
  { id: "seat_cover", label: "Seat Cover", suggestedVariantType: "Material" },
  { id: "steering_cover", label: "Steering Cover", suggestedVariantType: "Material" },
  { id: "rain_coat", label: "Rain Coat", suggestedVariantType: "Color" },
  { id: "helmet", label: "Helmet", suggestedVariantType: "Size" },
  { id: "bike_accessories", label: "Bike Accessories", suggestedVariantType: "Edition" },
  { id: "car_accessories", label: "Car Accessories", suggestedVariantType: "Finish" },
];

const VARIANT_TYPE_OPTIONS = [
  "Material",
  "Color",
  "Size",
  "Finish",
  "Capacity",
  "Edition",
  "Other",
];

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

  // --- Variants Toggle & State ---
  const [hasVariants, setHasVariants] = useState<boolean>(false);
  const [selectedVariantType, setSelectedVariantType] = useState<string>("Material");
  const [variants, setVariants] = useState<VariantInput[]>([]);

  // --- Categories (live from API, static array as offline fallback) ---
  const { data: fetchedCategories } = useCategories();

  const categoryOptions = useMemo(() => {
    const base = fetchedCategories?.length
      ? fetchedCategories.map((c) => ({
          id: c.slug,
          label: c.title,
          suggestedVariantType: c.suggestedVariantType || "Material",
        }))
      : DYNAMIC_CATEGORIES;

    // ⚠️ Legacy option — ye zaroori hai, cosmetic nahi.
    // Agar product ki category list mein na ho (deactivate ki gayi ho, ya
    // orphan slug ho), to <select value> ka koi <option> match nahi karega ->
    // DOM value "" ho jayegi -> `required` submit block kar dega ("Please select
    // an item in the list") -> admin us product ki PRICE bhi change nahi kar
    // sakega jab tak category badal na de (jo uska asal category tabah kar dega).
    const current = form.category;
    if (current && !base.some((c) => c.id === current)) {
      return [
        ...base,
        { id: current, label: `${current} (legacy)`, suggestedVariantType: "Material" },
      ];
    }
    return base;
  }, [fetchedCategories, form.category]);

  useEffect(() => {
    if (mode === "edit" && initialData) {
      const initialHasVariants = Boolean(
        initialData.variants && initialData.variants.length > 0
      );
      setHasVariants(initialHasVariants);
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

      if (initialHasVariants) {
        const loadedVariants = initialData.variants!.map((v) => ({
          id: v.id,
          variantType: v.variantType || "Material",
          variantValue: v.variantValue || v.materialName || "",
          materialName: v.variantValue || v.materialName || "",
          price: Number(v.price),
          salePrice: v.salePrice ? Number(v.salePrice) : null,
          stock: Number(v.stock),
          imageUrl: v.imageUrl || null,
          sku: v.sku || "",
        }));
        setVariants(loadedVariants);
        if (loadedVariants[0]?.variantType) {
          setSelectedVariantType(loadedVariants[0].variantType);
        }
      } else {
        setVariants([]);
      }
    } else {
      setForm(defaultFormState);
      setExistingImages([]);
      setVariants([]);
      setHasVariants(false);
    }
    setNewImagePreviews([]);
  }, [mode, initialData]);

  // Smart Category Change Suggestion
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value;
    setForm((prev) => ({ ...prev, category: newCategory }));

    const categoryObj = categoryOptions.find((c) => c.id === newCategory);
    if (categoryObj) {
      setSelectedVariantType(categoryObj.suggestedVariantType);
      // Update existing default variant types if unassigned
      setVariants((prev) =>
        prev.map((v) => ({
          ...v,
          variantType: v.variantType || categoryObj.suggestedVariantType,
        }))
      );
    }
  };

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

  // --- Image Reordering & Cumulative Upload Helpers ---
  const getUnifiedImages = () => {
    const list: { type: "existing" | "new"; url: string; file?: File; origIndex: number }[] = [];
    existingImages.forEach((url, i) => {
      list.push({ type: "existing", url, origIndex: i });
    });
    newImagePreviews.forEach((url, i) => {
      list.push({ type: "new", url, file: form.images?.[i] as File, origIndex: i });
    });
    return list;
  };

  const applyUnifiedImages = (
    unifiedList: { type: "existing" | "new"; url: string; file?: File }[]
  ) => {
    const nextExisting: string[] = [];
    const nextPreviews: string[] = [];
    const nextFiles: File[] = [];

    unifiedList.forEach((item) => {
      if (item.type === "existing") {
        nextExisting.push(item.url);
      } else {
        nextPreviews.push(item.url);
        if (item.file) nextFiles.push(item.file);
      }
    });

    setExistingImages(nextExisting);
    setNewImagePreviews(nextPreviews);
    setForm((prev) => ({ ...prev, images: nextFiles }));
  };

  const makeMainImage = (globalIndex: number) => {
    if (globalIndex === 0) return;
    const list = getUnifiedImages();
    const target = list[globalIndex];
    const remaining = list.filter((_, i) => i !== globalIndex);
    applyUnifiedImages([target, ...remaining]);
  };

  // --- Drag & Drop Mouse Swap State ---
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const swapImages = (fromIndex: number | null, toIndex: number) => {
    if (fromIndex === null || fromIndex === toIndex) return;
    const list = getUnifiedImages();
    if (fromIndex < 0 || fromIndex >= list.length || toIndex < 0 || toIndex >= list.length) return;

    const temp = list[fromIndex];
    list[fromIndex] = list[toIndex];
    list[toIndex] = temp;

    applyUnifiedImages(list);
  };

  const moveImage = (globalIndex: number, direction: "left" | "right") => {
    const list = getUnifiedImages();
    const targetIndex = direction === "left" ? globalIndex - 1 : globalIndex + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[globalIndex];
    list[globalIndex] = list[targetIndex];
    list[targetIndex] = temp;

    applyUnifiedImages(list);
  };

  const onImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    if (files.length === 0) return;

    const currentCount = existingImages.length + newImagePreviews.length;
    if (currentCount + files.length > MAX_IMAGE_COUNT) {
      setImageError(
        `Total images (saved + new) cannot exceed ${MAX_IMAGE_COUNT}. Currently you have ${currentCount} images.`,
      );
      return;
    }

    setImageError("");
    setIsPreparingImages(true);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setNewImagePreviews((prev) => [...prev, ...newPreviews]);

    Promise.allSettled(files.map((file) => compressImageFile(file)))
      .then((results) => {
        const preparedFiles = results.map((result, index) =>
          result.status === "fulfilled" ? result.value : files[index],
        );
        setForm((prev) => ({
          ...prev,
          images: [...(prev.images || []), ...preparedFiles],
        }));
      })
      .catch(() => setImageError("Image processing failed."))
      .finally(() => setIsPreparingImages(false));

    // Reset input so user can pick more images repeatedly
    event.target.value = "";
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

  // --- Variant Handlers ---
  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        variantType: selectedVariantType,
        variantValue: "",
        materialName: "",
        price: Number(form.price) || 0,
        salePrice: Number(form.discountPrice) || null,
        stock: Number(form.stock) || 50,
        sku: "",
      },
    ]);
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const updateVariant = (
    index: number,
    field: keyof VariantInput,
    value: any
  ) => {
    setVariants((prev) =>
      prev.map((v, i) =>
        i === index
          ? {
              ...v,
              [field]:
                field === "price" || field === "stock" || field === "salePrice"
                  ? value === "" ? null : Number(value)
                  : value,
            }
          : v
      )
    );
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (isPreparingImages) return;

    if (existingImages.length + (form.images?.length || 0) === 0) {
      setImageError("At least one product image is required.");
      return;
    }

    if (!hasVariants && form.discountPrice > form.price) {
      setImageError("Discount price cannot be greater than regular price.");
      return;
    }

    if (hasVariants) {
      if (variants.length === 0) {
        setImageError("Please add at least one variant when variants toggle is ON.");
        return;
      }

      // Check for empty values or duplicate variant values
      const seen = new Set<string>();
      for (const v of variants) {
        const val = (v.variantValue || v.materialName || "").trim().toLowerCase();
        if (!val) {
          setImageError("All variant option values must be filled out.");
          return;
        }
        const key = `${(v.variantType || selectedVariantType).trim().toLowerCase()}:${val}`;
        if (seen.has(key)) {
          setImageError(`Duplicate variant "${v.variantValue}" found for type "${v.variantType}".`);
          return;
        }
        seen.add(key);
      }
    }

    // Prepare payload
    let finalForm = { ...form };
    let finalVariants: VariantInput[] = [];

    if (hasVariants && variants.length > 0) {
      const minPrice = Math.min(...variants.map((v) => v.price || 0));
      const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);
      finalForm.price = minPrice;
      finalForm.stock = totalStock;
      finalVariants = variants.map((v) => ({
        ...v,
        variantType: v.variantType || selectedVariantType,
        variantValue: v.variantValue || v.materialName || "Option",
        materialName: v.variantValue || v.materialName || "Option",
      }));
    }

    const payload = {
      ...finalForm,
      existingImages: existingImages,
      variants: hasVariants ? finalVariants : [],
    };

    onSubmit(payload);
  };

  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50 max-w-5xl mx-auto">
      <div className="mb-6 border-b border-border/50 pb-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-text-main">
            {mode === "create" ? "Add New Product" : "Edit Product"}
          </h2>
          <p className="text-xs text-text-muted mt-1">
            Configure product metadata, images, pricing, and dynamic variant options.
          </p>
        </div>
        {onCancelEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="px-4 py-2 text-xs font-bold rounded-xl border-2 border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors flex items-center gap-1 cursor-pointer"
          >
            ✕ Cancel
          </button>
        )}
      </div>

      {imageError && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium">
          ⚠️ {imageError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* --- SECTION 1: Basic Information --- */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border/40 pb-2">
            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
              1
            </span>
            <h3 className="text-lg font-semibold text-text-main">
              Basic Information
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1 md:col-span-1">
              <label className="text-xs font-semibold text-text-muted uppercase">
                Product Name *
              </label>
              <input
                className="bg-background border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-primary transition-colors"
                value={form.name}
                onChange={onFieldChange("name")}
                required
                placeholder="e.g. Premium Car Cover"
              />
            </div>

            <div className="flex flex-col gap-1 md:col-span-1">
              <label className="text-xs font-semibold text-text-muted uppercase">
                Category *
              </label>
              <select
                className="bg-background border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-primary transition-colors"
                value={form.category}
                onChange={handleCategoryChange}
                required
              >
                <option value="" disabled>
                  Select Category
                </option>
                {categoryOptions.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-text-muted uppercase">
                Sub Category (Optional)
              </label>
              <input
                className="bg-background border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-primary transition-colors"
                placeholder="e.g. luxury, universal, waterproof"
                value={form.subCategory ?? ""}
                onChange={onFieldChange("subCategory")}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-text-muted uppercase">
                Vehicle Type (If Applicable)
              </label>
              <select
                className="bg-background border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-primary transition-colors"
                value={form.vehicleType}
                onChange={onFieldChange("vehicleType")}
              >
                <option value="car">Car</option>
                <option value="bike">Bike</option>
              </select>
            </div>

            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-xs font-semibold text-text-muted uppercase">
                Compatible Vehicle Model(s)
              </label>
              <input
                className="bg-background border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-primary transition-colors"
                placeholder="e.g. Honda Civic 2022-2025, Toyota Corolla"
                value={form.carModel ?? ""}
                onChange={onFieldChange("carModel")}
              />
            </div>

            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-xs font-semibold text-text-muted uppercase mb-1">
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

        {/* --- SECTION 2: Media & Images --- */}
        <div className="border-t border-border/50 pt-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-border/40 pb-2">
            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
              2
            </span>
            <h3 className="text-lg font-semibold text-text-main">
              Product Images
            </h3>
          </div>

          <div className="flex flex-wrap gap-4 mb-4">
            {getUnifiedImages().map((item, index) => {
              const isMain = index === 0;
              const isFirst = index === 0;
              const isLast = index === getUnifiedImages().length - 1;
              const isDragging = draggedIndex === index;
              const isDragOver = dragOverIndex === index;

              return (
                <div
                  key={`${item.type}-${item.origIndex}-${item.url}`}
                  draggable={true}
                  onDragStart={(e) => {
                    setDraggedIndex(index);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                    if (dragOverIndex !== index) {
                      setDragOverIndex(index);
                    }
                  }}
                  onDragLeave={() => {
                    if (dragOverIndex === index) setDragOverIndex(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    swapImages(draggedIndex, index);
                    setDraggedIndex(null);
                    setDragOverIndex(null);
                  }}
                  onDragEnd={() => {
                    setDraggedIndex(null);
                    setDragOverIndex(null);
                  }}
                  className={`relative w-32 h-36 border-2 rounded-2xl overflow-hidden group shadow-sm transition-all bg-card flex flex-col cursor-grab active:cursor-grabbing select-none ${
                    isDragging
                      ? "opacity-40 scale-95 border-dashed border-primary"
                      : isDragOver
                        ? "scale-105 border-primary ring-4 ring-primary/40 bg-primary/10 shadow-lg z-20"
                        : isMain
                          ? "border-primary ring-2 ring-primary/30"
                          : "border-border/80 hover:border-primary/50"
                  }`}
                >
                  {/* Badge: Main or Sequence Number */}
                  <div className="absolute top-1 left-1 z-10 flex gap-1 items-center">
                    {isMain ? (
                      <span className="bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow flex items-center gap-0.5">
                        ⭐ Main
                      </span>
                    ) : (
                      <span className="bg-black/60 text-white text-[9px] font-mono px-1.5 py-0.5 rounded-md font-semibold">
                        #{index + 1}
                      </span>
                    )}
                  </div>

                  {/* Drag Handle Overlay Indicator */}
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded-md font-bold flex items-center gap-0.5 pointer-events-none">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="9" cy="5" r="1" />
                      <circle cx="9" cy="12" r="1" />
                      <circle cx="9" cy="19" r="1" />
                      <circle cx="15" cy="5" r="1" />
                      <circle cx="15" cy="12" r="1" />
                      <circle cx="15" cy="19" r="1" />
                    </svg>
                    Drag
                  </div>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (item.type === "existing") removeExistingImage(item.origIndex);
                      else removeNewImage(item.origIndex);
                    }}
                    className="absolute top-1 right-1 z-10 bg-red-600 text-white rounded-full p-1 shadow-md hover:scale-110 transition-transform"
                    title="Remove image"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>

                  {/* Thumbnail Image */}
                  <div className="relative flex-1 w-full bg-background pointer-events-none">
                    <img
                      src={item.url}
                      alt={`product-img-${index}`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Action Controls Footer */}
                  <div className="p-1 bg-background border-t border-border/50 flex items-center justify-between gap-1 text-[10px]">
                    {/* Move Left */}
                    <button
                      type="button"
                      disabled={isFirst}
                      onClick={(e) => {
                        e.stopPropagation();
                        moveImage(index, "left");
                      }}
                      className="px-1.5 py-0.5 rounded hover:bg-primary/10 text-text-muted hover:text-primary disabled:opacity-20 disabled:pointer-events-none transition-colors font-bold"
                      title="Move Left"
                    >
                      ◀
                    </button>

                    {/* Set Main Button */}
                    {!isMain && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          makeMainImage(index);
                        }}
                        className="text-[9px] font-bold text-primary hover:underline px-1.5 py-0.5 rounded bg-primary/10 hover:bg-primary/20 transition-colors"
                        title="Set as Main/Primary image"
                      >
                        ⭐ Main
                      </button>
                    )}

                    {/* Move Right */}
                    <button
                      type="button"
                      disabled={isLast}
                      onClick={(e) => {
                        e.stopPropagation();
                        moveImage(index, "right");
                      }}
                      className="px-1.5 py-0.5 rounded hover:bg-primary/10 text-text-muted hover:text-primary disabled:opacity-20 disabled:pointer-events-none transition-colors font-bold"
                      title="Move Right"
                    >
                      ▶
                    </button>
                  </div>
                </div>
              );
            })}

            {existingImages.length + newImagePreviews.length < MAX_IMAGE_COUNT && (
              <label className="w-32 h-36 border-2 border-dashed border-border hover:border-primary rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors bg-background/50 hover:bg-primary/5">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-text-muted mb-1"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span className="text-[11px] font-bold text-text-muted">
                  Add Image
                </span>
                <span className="text-[9px] text-text-muted mt-0.5 font-mono">
                  ({existingImages.length + newImagePreviews.length}/{MAX_IMAGE_COUNT})
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={onImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* --- SECTION 3: Pricing & Variants --- */}
        <div className="border-t border-border/50 pt-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                3
              </span>
              <h3 className="text-lg font-semibold text-text-main">
                Pricing & Variants
              </h3>
            </div>

            {/* HAS VARIANTS TOGGLE */}
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hasVariants}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setHasVariants(checked);
                  if (checked && variants.length === 0) {
                    addVariant();
                  }
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
              <span className="ml-3 text-sm font-semibold text-text-main">
                This product has variants
              </span>
            </label>
          </div>

          {/* CASE 1: SIMPLE PRODUCT (Toggle OFF) */}
          {!hasVariants && (
            <div className="p-5 rounded-2xl bg-background border border-border/60 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted">
                <span>📦 Base Pricing & Specifications (Simple Product)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-text-muted uppercase">
                    Regular Price (Rs) *
                  </label>
                  <input
                    className="bg-card border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-primary"
                    type="number"
                    value={form.price || ""}
                    onChange={onFieldChange("price")}
                    required={!hasVariants}
                    min={0}
                    placeholder="e.g. 4500"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-text-muted uppercase">
                    Stock Quantity *
                  </label>
                  <input
                    className="bg-card border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-primary"
                    type="number"
                    value={form.stock || ""}
                    onChange={onFieldChange("stock")}
                    required={!hasVariants}
                    min={0}
                    placeholder="e.g. 50"
                  />
                </div>
                <div
                  className={`flex flex-col gap-1 transition-opacity ${form.isOnSale ? "opacity-100" : "opacity-40 pointer-events-none"}`}
                >
                  <label className="text-xs font-semibold text-text-muted uppercase">
                    Discount / Sale Price (Rs)
                  </label>
                  <input
                    className="bg-card border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-primary"
                    type="number"
                    value={form.discountPrice || ""}
                    onChange={onFieldChange("discountPrice")}
                    disabled={!form.isOnSale}
                    placeholder="e.g. 3999"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-text-muted uppercase">
                    Material Specification
                  </label>
                  <input
                    className="bg-card border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-primary"
                    placeholder="e.g. Leatherette"
                    value={form.material ?? ""}
                    onChange={onFieldChange("material")}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-text-muted uppercase">
                    Color Specification
                  </label>
                  <input
                    className="bg-card border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-primary"
                    placeholder="e.g. Black"
                    value={form.color ?? ""}
                    onChange={onFieldChange("color")}
                  />
                </div>
              </div>
            </div>
          )}

          {/* CASE 2: DYNAMIC VARIANT BUILDER (Toggle ON) */}
          {hasVariants && (
            <div className={styles.variantsSection}>
              {/* Builder Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-primary/5 border border-primary/20 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold">
                    🧵
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-text-main">
                      Dynamic Variant Builder
                    </h4>
                    <p className="text-xs text-text-muted">
                      Define multi-attribute variant options (Material, Color, Size, Finish) with individual price & stock.
                    </p>
                  </div>
                </div>

                {/* Variant Type Selector */}
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-text-main uppercase whitespace-nowrap">
                    Variant Type:
                  </label>
                  <select
                    value={selectedVariantType}
                    onChange={(e) => {
                      const newType = e.target.value;
                      setSelectedVariantType(newType);
                      setVariants((prev) =>
                        prev.map((v) => ({ ...v, variantType: newType }))
                      );
                    }}
                    className="bg-background border border-primary/40 text-primary font-bold rounded-lg px-3 py-2 text-xs outline-none focus:border-primary"
                  >
                    {VARIANT_TYPE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Variant Grid Cards */}
              <div className="space-y-4">
                {variants.map((variant, index) => (
                  <div
                    key={index}
                    className="p-5 rounded-2xl border border-border/80 bg-background shadow-sm space-y-4 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center justify-between border-b border-border/40 pb-2">
                      <span className="text-xs font-bold text-primary uppercase tracking-wider">
                        ✦ Option #{index + 1} — {variant.variantType || selectedVariantType}
                        {variant.id ? " (Saved)" : " (New)"}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="text-red-500 hover:text-red-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                        Remove Option
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3 items-end">
                      {/* Image Upload field */}
                      <div className="flex flex-col gap-1 items-center justify-center">
                        <label className="text-[11px] font-bold uppercase text-text-muted">Image</label>
                        <label className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-dashed border-border hover:border-primary cursor-pointer flex items-center justify-center bg-card transition-colors group">
                          {variant.imageFile || variant.imageUrl ? (
                            <>
                              <img
                                src={
                                  variant.imageFile
                                    ? URL.createObjectURL(variant.imageFile)
                                    : variant.imageUrl || ""
                                }
                                alt="variant preview"
                                className="w-full h-full object-cover"
                              />
                              <div
                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  updateVariant(index, "imageFile", null);
                                  updateVariant(index, "imageUrl", null);
                                }}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <line x1="18" y1="6" x2="6" y2="18" />
                                  <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="text-text-muted hover:text-primary">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                  <circle cx="8.5" cy="8.5" r="1.5" />
                                  <polyline points="21 15 16 10 5 21" />
                                </svg>
                              </div>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    compressImageFile(file)
                                      .then((compressed) => {
                                        updateVariant(index, "imageFile", compressed);
                                      })
                                      .catch(() => {
                                        updateVariant(index, "imageFile", file);
                                      });
                                  }
                                }}
                              />
                            </>
                          )}
                        </label>
                      </div>

                      {/* Option Value */}
                      <div className="flex flex-col gap-1 lg:col-span-2">
                        <label className="text-[11px] font-bold uppercase text-text-muted">
                          Option Value * (e.g. Silver Coated, Black, XL)
                        </label>
                        <input
                          type="text"
                          className="bg-card border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                          placeholder="e.g. Silver Coated"
                          value={variant.variantValue || variant.materialName || ""}
                          onChange={(e) => {
                            updateVariant(index, "variantValue", e.target.value);
                            updateVariant(index, "materialName", e.target.value);
                          }}
                          required
                        />
                      </div>

                      {/* Price */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-bold uppercase text-text-muted">
                          Price (Rs) *
                        </label>
                        <input
                          type="number"
                          className="bg-card border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                          placeholder="4500"
                          value={variant.price || ""}
                          onChange={(e) =>
                            updateVariant(index, "price", e.target.value)
                          }
                          min={0}
                          required
                        />
                      </div>

                      {/* Sale Price */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-bold uppercase text-text-muted">
                          Sale Price (Rs)
                        </label>
                        <input
                          type="number"
                          className="bg-card border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                          placeholder="3999"
                          value={variant.salePrice ?? ""}
                          onChange={(e) =>
                            updateVariant(index, "salePrice", e.target.value)
                          }
                          min={0}
                        />
                      </div>

                      {/* Stock */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-bold uppercase text-text-muted">
                          Stock *
                        </label>
                        <input
                          type="number"
                          className="bg-card border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                          placeholder="50"
                          value={variant.stock || ""}
                          onChange={(e) =>
                            updateVariant(index, "stock", e.target.value)
                          }
                          min={0}
                          required
                        />
                      </div>

                      {/* SKU */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-bold uppercase text-text-muted">
                          SKU (Optional)
                        </label>
                        <input
                          type="text"
                          className="bg-card border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                          placeholder="MAT-SLV-01"
                          value={variant.sku || ""}
                          onChange={(e) =>
                            updateVariant(index, "sku", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Variant Button */}
              <button
                type="button"
                onClick={addVariant}
                className="w-full mt-4 py-3 rounded-xl border-2 border-dashed border-primary/40 text-primary font-bold text-sm hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Another Variant Option
              </button>
            </div>
          )}
        </div>

        {/* --- SECTION 4: Marketing Flags --- */}
        <div className="border-t border-border/50 pt-6">
          <div className="flex flex-wrap gap-6 bg-background p-4 rounded-xl border border-border">
            <label className="text-sm font-semibold flex items-center gap-2 cursor-pointer text-text-main">
              <input
                type="checkbox"
                className="w-4 h-4 accent-primary"
                checked={form.isFeatured}
                onChange={onFieldChange("isFeatured")}
              />{" "}
              ⭐ Featured Product
            </label>
            <label className="text-sm font-semibold flex items-center gap-2 cursor-pointer text-text-main">
              <input
                type="checkbox"
                className="w-4 h-4 accent-primary"
                checked={form.isNewArrival}
                onChange={onFieldChange("isNewArrival")}
              />{" "}
              🚀 New Arrival
            </label>
            <label className="text-sm font-semibold flex items-center gap-2 cursor-pointer text-text-main">
              <input
                type="checkbox"
                className="w-4 h-4 accent-primary"
                checked={form.isOnSale}
                onChange={onFieldChange("isOnSale")}
              />{" "}
              🏷️ On Sale
            </label>
          </div>
        </div>

        {/* --- SUBMIT BUTTONS --- */}
        <div className="flex justify-end gap-4 border-t border-border/50 pt-6">
          {onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="px-6 py-3 rounded-xl border-2 border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 font-bold text-sm transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              ✕ Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || isPreparingImages}
            className="px-8 py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-md hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            {isSubmitting
              ? "Saving..."
              : mode === "create"
                ? "Publish Product"
                : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
