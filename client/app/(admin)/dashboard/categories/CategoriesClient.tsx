"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  useAdminCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/useCategories";
import { compressImageFile } from "@/utils/imageCompression";
import type { AdminCategory, CategoryMutationInput } from "@/types/category.type";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  ImageOff,
  AlertTriangle,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

const VARIANT_TYPE_OPTIONS = [
  "Material",
  "Color",
  "Size",
  "Finish",
  "Capacity",
  "Edition",
  "Other",
];

// Backend ka SLUG_PATTERN (services/category.service.js) mirror karta hai
const SLUG_PATTERN = /^[a-z][a-z0-9_]*$/;

const slugify = (title: string) =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

interface FormState {
  slug: string;
  title: string;
  subtitle: string;
  suggestedVariantType: string;
  showOnHome: boolean;
  isActive: boolean;
  sortOrder: number;
}

const emptyForm: FormState = {
  slug: "",
  title: "",
  subtitle: "",
  suggestedVariantType: "Material",
  showOnHome: true,
  isActive: true,
  sortOrder: 0,
};

const CategoriesClient = () => {
  const { data, isLoading, isError } = useAdminCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [formError, setFormError] = useState("");
  // User ne slug manually chhua? Phir title se auto-fill band
  const [slugTouched, setSlugTouched] = useState(false);

  const categories = data?.categories ?? [];
  const orphans = data?.orphans ?? [];

  const isSubmitting =
    createCategory.isPending || updateCategory.isPending || isCompressing;

  // Title se slug auto-suggest (sirf create mode mein, jab tak user ne slug
  // khud edit na kiya ho)
  useEffect(() => {
    if (editing || slugTouched) return;
    setForm((prev) => ({ ...prev, slug: slugify(prev.title) }));
  }, [form.title, editing, slugTouched]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview(null);
    setFormError("");
    setSlugTouched(false);
    setModalOpen(true);
  };

  const openEdit = (category: AdminCategory) => {
    setEditing(category);
    setForm({
      slug: category.slug,
      title: category.title,
      subtitle: category.subtitle ?? "",
      suggestedVariantType: category.suggestedVariantType || "Material",
      showOnHome: category.showOnHome,
      isActive: category.isActive,
      sortOrder: category.sortOrder,
    });
    setImageFile(null);
    setImagePreview(category.image);
    setFormError("");
    setSlugTouched(true);
    setModalOpen(true);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormError("");
    setIsCompressing(true);
    try {
      // ⚠️ Compression mandatory hai — backend multer 8 MB pe reject karta hai
      // aur Vercel ~4.5 MB body edge pe hi block kar deta hai. Reference ke
      // liye: maujooda category PNGs 7-8.6 MB ke hain.
      const compressed = await compressImageFile(file);
      setImageFile(compressed);
      setImagePreview(URL.createObjectURL(compressed));
    } catch {
      setFormError("Image process nahi ho saki. Koi doosri image try karein.");
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const title = form.title.trim();
    if (!title) {
      setFormError("Title zaroori hai.");
      return;
    }

    if (!editing) {
      if (!SLUG_PATTERN.test(form.slug)) {
        setFormError(
          "Slug sirf lowercase letters, digits aur underscore use kar sakta hai, aur letter se shuru hona chahiye (e.g. alloy_rims)."
        );
        return;
      }
    }

    const payload: CategoryMutationInput = {
      title,
      subtitle: form.subtitle.trim() || null,
      suggestedVariantType: form.suggestedVariantType,
      showOnHome: form.showOnHome,
      isActive: form.isActive,
      imageFile,
    };

    try {
      if (editing) {
        // slug jaan-boojh kar nahi bheja — backend bhi reject karta hai
        await updateCategory.mutateAsync({
          id: editing.id,
          payload: { ...payload, sortOrder: form.sortOrder },
        });
      } else {
        await createCategory.mutateAsync({ ...payload, slug: form.slug });
      }
      setModalOpen(false);
    } catch {
      // toast hook mein handle ho raha hai
    }
  };

  const handleDelete = async (category: AdminCategory) => {
    const warning =
      category.productCount > 0
        ? `"${category.title}" mein ${category.productCount} products hain. Ye permanently delete nahi hogi — sirf deactivate ho jayegi (storefront se hat jayegi, products safe rahenge). Continue?`
        : `"${category.title}" permanently delete kar dein? Isme koi product nahi hai.`;

    if (!window.confirm(warning)) return;
    await deleteCategory.mutateAsync(category.id).catch(() => { });
  };

  const homeCount = useMemo(
    () => categories.filter((c) => c.showOnHome && c.isActive).length,
    [categories]
  );

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-main">Categories</h1>
          <p className="text-sm text-text-muted mt-1">
            Add a new category  .
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus size={18} />
          New Category
        </button>
      </div>

      {/* Homepage tile count hint — grid md:grid-cols-4 hai */}
      {homeCount % 4 !== 0 && homeCount > 0 && (
        <div className="mb-4 flex items-start gap-2 text-xs bg-card border border-border rounded-lg p-3 text-text-muted">
          <AlertTriangle size={15} className="mt-0.5 shrink-0 text-amber-500" />
          <span>
            Homepage pe abhi <b>{homeCount}</b> tiles hain. Grid 4 columns ka hai,
            to aakhri row adhoori dikhegi. 4 ke multiple (4, 8, 12) pe rakhein to
            zyada saaf lagega — ye sirf cosmetic hai, kuch toota nahi.
          </span>
        </div>
      )}

      {/* Orphan slugs */}
      {orphans.length > 0 && (
        <div className="mb-6 border border-amber-500/40 bg-amber-500/5 rounded-lg p-4">
          <div className="flex items-center gap-2 text-amber-600 font-semibold text-sm mb-2">
            <AlertTriangle size={16} />
            Orphan categories
          </div>
          <p className="text-xs text-text-muted mb-3">
            In slugs ke products maujood hain lekin registry mein entry nahi hai.
            Inka koi tile ya proper title nahi banega jab tak yahan add na karein.
          </p>
          <div className="flex flex-wrap gap-2">
            {orphans.map((o) => (
              <span
                key={o.category}
                className="text-xs bg-background border border-border rounded-full px-3 py-1"
              >
                {o.category}{" "}
                <span className="text-text-muted">({o.productCount})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : isError ? (
        <div className="text-center py-20 text-red-500">
          Categories load nahi ho sakin.
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-background text-text-muted text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Image</th>
                  <th className="text-left px-4 py-3 font-semibold">Title</th>
                  <th className="text-left px-4 py-3 font-semibold">Slug</th>
                  <th className="text-right px-4 py-3 font-semibold">Products</th>
                  <th className="text-center px-4 py-3 font-semibold">Homepage</th>
                  <th className="text-center px-4 py-3 font-semibold">Status</th>
                  <th className="text-right px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr
                    key={category.id}
                    className={`border-t border-border ${category.isActive ? "" : "opacity-55"
                      }`}
                  >
                    <td className="px-4 py-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-background shrink-0">
                        {category.image ? (
                          <Image
                            src={category.image}
                            alt={category.title}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageOff size={16} className="text-text-muted/50" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-text-main">
                        {category.title}
                      </div>
                      {category.subtitle && (
                        <div className="text-xs text-text-muted line-clamp-1">
                          {category.subtitle}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs bg-background px-2 py-1 rounded border border-border">
                        {category.slug}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-text-muted">
                      {category.productCount}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {category.showOnHome ? (
                        <Eye size={16} className="inline text-green-500" />
                      ) : (
                        <EyeOff size={16} className="inline text-text-muted/50" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${category.isActive
                            ? "bg-green-500/10 text-green-600"
                            : "bg-text-muted/10 text-text-muted"
                          }`}
                      >
                        {category.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(category)}
                          className="p-2 rounded-lg hover:bg-background text-text-muted hover:text-primary transition-colors"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(category)}
                          disabled={deleteCategory.isPending}
                          className="p-2 rounded-lg hover:bg-background text-text-muted hover:text-red-500 transition-colors disabled:opacity-40"
                          title={
                            category.productCount > 0
                              ? "Deactivate (products maujood hain)"
                              : "Delete"
                          }
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {categories.length === 0 && (
            <div className="text-center py-16 text-text-muted">
              Abhi koi category nahi hai.
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card">
              <h2 className="font-bold text-text-main">
                {editing ? `Edit: ${editing.title}` : "New Category"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-background text-text-muted"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Title */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-text-muted uppercase">
                  Title *
                </label>
                <input
                  value={form.title}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, title: e.target.value }))
                  }
                  placeholder="e.g. Alloy Rims"
                  required
                  className="bg-background border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* Slug */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-text-muted uppercase">
                  Slug {editing ? "(locked)" : "*"}
                </label>
                <input
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setForm((p) => ({ ...p, slug: e.target.value }));
                  }}
                  // Slug immutable hai: rename karne se saare products is category
                  // se disconnect ho jate (koi FK nahi jo cascade kare) aur unke
                  // AI embeddings stale ho jate.
                  disabled={!!editing}
                  placeholder="alloy_rims"
                  required
                  className="bg-background border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-mono"
                />
                <p className="text-[11px] text-text-muted">
                  {editing
                    ? "Slug change nahi ho sakta — is se is category ke saare products disconnect ho jayenge."
                    : "URL mein ye use hoga: /category/" + (form.slug || "your_slug")}
                </p>
              </div>

              {/* Subtitle */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-text-muted uppercase">
                  Subtitle
                </label>
                <input
                  value={form.subtitle}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, subtitle: e.target.value }))
                  }
                  placeholder="e.g. Premium finish, custom fit"
                  className="bg-background border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                />
                <p className="text-[11px] text-text-muted">
                  Homepage tile pe aur category page ki SEO description mein aata hai.
                </p>
              </div>

              {/* Image */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-text-muted uppercase">
                  Tile Image
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-background border border-border shrink-0">
                    {imagePreview ? (
                      <Image
                        src={imagePreview}
                        alt="preview"
                        fill
                        className="object-cover"
                        sizes="80px"
                        unoptimized={imagePreview.startsWith("blob:")}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageOff size={18} className="text-text-muted/50" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="block w-full text-xs text-text-muted file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:opacity-90 file:cursor-pointer"
                    />
                    <p className="text-[11px] text-text-muted mt-1">
                      {isCompressing
                        ? "Compressing…"
                        : "Auto-compress hoti hai (WebP, max 1600px). Square image best lagti hai."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Variant type */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-text-muted uppercase">
                  Default Variant Type
                </label>
                <select
                  value={form.suggestedVariantType}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, suggestedVariantType: e.target.value }))
                  }
                  className="bg-background border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                >
                  {VARIANT_TYPE_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-text-muted">
                  Add Product form mein ye variant type apne aap select ho jayega.
                </p>
              </div>

              {/* Toggles */}
              <div className="flex flex-col gap-3 pt-1">
                <label className="flex items-center gap-3 text-sm text-text-main cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.showOnHome}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, showOnHome: e.target.checked }))
                    }
                    className="w-4 h-4 accent-primary"
                  />
                  Homepage pe tile aur filter tab dikhayein
                </label>

                <label className="flex items-center gap-3 text-sm text-text-main cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, isActive: e.target.checked }))
                    }
                    className="w-4 h-4 accent-primary"
                  />
                  Active (uncheck karne se storefront se hat jayegi, products safe rahenge)
                </label>
              </div>

              {editing && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-text-muted uppercase">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, sortOrder: Number(e.target.value) }))
                    }
                    className="bg-background border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors w-32"
                  />
                  <p className="text-[11px] text-text-muted">
                    Chhota number pehle aata hai.
                  </p>
                </div>
              )}

              {formError && (
                <div className="text-xs text-red-500 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                  {formError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium text-text-muted hover:bg-background transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 size={15} className="animate-spin" />}
                  {editing ? "Save Changes" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesClient;
