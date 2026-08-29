"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import styles from "./BlogPostForm.module.css";
import { useCategories } from "@/hooks/useCategories";
import { useSearchProducts } from "@/hooks/useProducts";
import { useCreateBlogPost, useUpdateBlogPost } from "@/hooks/useBlog";
import { compressImageFile } from "@/utils/imageCompression";
import type { BlogPost, BlogPostMutationInput, BlogStatus } from "@/types/blog.type";
import { ImageOff, Loader2, X, Search } from "lucide-react";

const MAX_RELATED = 6;

// Mirrors the backend's SLUG_PATTERN (services/blog.service.js). This uses
// hyphens, unlike category slugs, which use underscores for legacy reasons
// (they come from the Products.category column, blog slugs don't).
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const slugify = (title: string) =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// h1 is deliberately excluded: the page renders its own h1 (the post
// title), and a second one would dilute the heading signal. The image
// button is excluded too: Quill's default handler inlines the file as
// base64, bypassing Cloudinary and bloating the `body` column.
const QUILL_MODULES = {
  toolbar: [
    [{ header: [2, 3, false] }],
    ["bold", "italic"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["blockquote", "link"],
    ["clean"],
  ],
};

interface FormState {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverImageAlt: string;
  author: string;
  metaTitle: string;
  metaDescription: string;
  status: BlogStatus;
  relatedProductSlugs: string[];
  relatedCategorySlugs: string[];
}

const emptyForm: FormState = {
  title: "",
  slug: "",
  excerpt: "",
  body: "",
  coverImageAlt: "",
  author: "Fancy Store",
  metaTitle: "",
  metaDescription: "",
  status: "draft",
  relatedProductSlugs: [],
  relatedCategorySlugs: [],
};

interface BlogPostFormProps {
  post?: BlogPost | null;
  onDone: () => void;
}

const BlogPostForm: React.FC<BlogPostFormProps> = ({ post, onDone }) => {
  const editing = !!post;
  const createPost = useCreateBlogPost();
  const updatePost = useUpdateBlogPost();
  const { data: categories = [] } = useCategories();

  const [form, setForm] = useState<FormState>(emptyForm);
  const [slugTouched, setSlugTouched] = useState(false);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [formError, setFormError] = useState("");
  const [productQuery, setProductQuery] = useState("");
  const { data: productResults } = useSearchProducts(productQuery, 1, 6);

  useEffect(() => {
    if (!post) return;
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt ?? "",
      body: post.body,
      coverImageAlt: post.coverImageAlt ?? "",
      author: post.author,
      metaTitle: post.metaTitle ?? "",
      metaDescription: post.metaDescription ?? "",
      status: post.status,
      relatedProductSlugs: post.relatedProductSlugs ?? [],
      relatedCategorySlugs: post.relatedCategorySlugs ?? [],
    });
    setCoverPreview(post.coverImage);
    setSlugTouched(true);
  }, [post]);

  useEffect(() => {
    if (editing || slugTouched) return;
    setForm((p) => ({ ...p, slug: slugify(p.title) }));
  }, [form.title, editing, slugTouched]);

  const isSubmitting = createPost.isPending || updatePost.isPending || isCompressing;

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormError("");
    setIsCompressing(true);
    try {
      const compressed = await compressImageFile(file);
      setCoverImageFile(compressed);
      setCoverPreview(URL.createObjectURL(compressed));
    } catch {
      setFormError("Could not process the image. Please try a different image.");
    } finally {
      setIsCompressing(false);
    }
  };

  const addRelatedProduct = (slug: string | null | undefined) => {
    if (!slug) return;
    setForm((p) =>
      p.relatedProductSlugs.includes(slug) || p.relatedProductSlugs.length >= MAX_RELATED
        ? p
        : { ...p, relatedProductSlugs: [...p.relatedProductSlugs, slug] }
    );
    setProductQuery("");
  };

  const removeRelatedProduct = (slug: string) => {
    setForm((p) => ({
      ...p,
      relatedProductSlugs: p.relatedProductSlugs.filter((s) => s !== slug),
    }));
  };

  const toggleRelatedCategory = (slug: string) => {
    setForm((p) => {
      if (p.relatedCategorySlugs.includes(slug)) {
        return { ...p, relatedCategorySlugs: p.relatedCategorySlugs.filter((s) => s !== slug) };
      }
      if (p.relatedCategorySlugs.length >= MAX_RELATED) return p;
      return { ...p, relatedCategorySlugs: [...p.relatedCategorySlugs, slug] };
    });
  };

  const handleSubmit = async (e: React.FormEvent, submitStatus: BlogStatus) => {
    e.preventDefault();
    setFormError("");

    const title = form.title.trim();
    if (!title) {
      setFormError("Title is required.");
      return;
    }
    const bodyText = form.body.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
    if (!bodyText) {
      setFormError("Body cannot be empty.");
      return;
    }
    if (!editing && !SLUG_PATTERN.test(form.slug)) {
      setFormError(
        "Slug can only use lowercase letters, digits, and hyphens (e.g. car-cover-buying-guide)."
      );
      return;
    }

    const payload: BlogPostMutationInput = {
      title,
      excerpt: form.excerpt.trim() || undefined,
      body: form.body,
      coverImageAlt: form.coverImageAlt.trim() || undefined,
      author: form.author.trim() || undefined,
      metaTitle: form.metaTitle.trim() || undefined,
      metaDescription: form.metaDescription.trim() || undefined,
      status: submitStatus,
      relatedProductSlugs: form.relatedProductSlugs,
      relatedCategorySlugs: form.relatedCategorySlugs,
      coverImageFile,
    };

    try {
      if (editing && post) {
        await updatePost.mutateAsync({ id: post.id, payload });
      } else {
        await createPost.mutateAsync({ ...payload, slug: form.slug });
      }
      onDone();
    } catch {
      // handled by the toast in the hook
    }
  };

  const availableProductResults = (productResults?.products || []).filter(
    (p) => p.slug && !form.relatedProductSlugs.includes(p.slug)
  );

  return (
    <form className="p-5 space-y-4">
      {/* Title */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-text-muted uppercase">Title *</label>
        <input
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          placeholder="e.g. How to Choose the Right Car Cover"
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
          disabled={editing}
          placeholder="car-cover-buying-guide"
          required
          className="bg-background border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-mono"
        />
        <p className="text-[11px] text-text-muted">
          {editing
            ? "Slug cannot be changed. This would break the indexed URL."
            : "URL: /blog/" + (form.slug || "your-slug")}
        </p>
      </div>

      {/* Excerpt */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-text-muted uppercase">Excerpt</label>
        <textarea
          value={form.excerpt}
          onChange={(e) => setForm((p) => ({ ...p, excerpt: e.target.value.slice(0, 300) }))}
          maxLength={300}
          rows={2}
          placeholder="Shown on the listing card"
          className="bg-background border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors resize-none"
        />
        <p className="text-[11px] text-text-muted">
          {form.excerpt.length}/300. Leave blank to auto-generate from the body.
        </p>
      </div>

      {/* Cover image */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-text-muted uppercase">Cover Image</label>
        <div className="flex items-center gap-3">
          <div className="relative w-24 h-16 rounded-lg overflow-hidden bg-background border border-border shrink-0">
            {coverPreview ? (
              <Image
                src={coverPreview}
                alt="preview"
                fill
                className="object-cover"
                sizes="96px"
                unoptimized={coverPreview.startsWith("blob:")}
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
              onChange={handleCoverChange}
              className="block w-full text-xs text-text-muted file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:opacity-90 file:cursor-pointer"
            />
            <p className="text-[11px] text-text-muted mt-1">
              {isCompressing ? "Compressing…" : "Suggested: 1200×630 for social sharing."}
            </p>
          </div>
        </div>
      </div>

      {/* Cover alt text */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-text-muted uppercase">
          Cover Image Alt Text
        </label>
        <input
          value={form.coverImageAlt}
          onChange={(e) => setForm((p) => ({ ...p, coverImageAlt: e.target.value.slice(0, 160) }))}
          maxLength={160}
          placeholder="Describes the image for accessibility & image search"
          className="bg-background border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
        />
      </div>

      {/* Body */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-text-muted uppercase">Body *</label>
        <ReactQuill
          theme="snow"
          value={form.body}
          onChange={(val) => setForm((p) => ({ ...p, body: val }))}
          modules={QUILL_MODULES}
          className={styles.quillEditor}
        />
      </div>

      {/* Author */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-text-muted uppercase">Author</label>
        <input
          value={form.author}
          onChange={(e) => setForm((p) => ({ ...p, author: e.target.value }))}
          className="bg-background border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
        />
      </div>

      {/* SEO section */}
      <details className="border border-border rounded-lg">
        <summary className="cursor-pointer select-none px-4 py-2.5 text-xs font-semibold text-text-muted uppercase">
          SEO (optional)
        </summary>
        <div className="p-4 pt-0 space-y-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-text-muted uppercase">Meta Title</label>
            <input
              value={form.metaTitle}
              onChange={(e) => setForm((p) => ({ ...p, metaTitle: e.target.value.slice(0, 70) }))}
              maxLength={70}
              placeholder="Blank = use the post title"
              className="bg-background border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
            />
            <p className="text-[11px] text-text-muted">
              {form.metaTitle.length}/70. " | Fancy Store" is added automatically.
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-text-muted uppercase">
              Meta Description
            </label>
            <textarea
              value={form.metaDescription}
              onChange={(e) =>
                setForm((p) => ({ ...p, metaDescription: e.target.value.slice(0, 180) }))
              }
              maxLength={180}
              rows={2}
              placeholder="Blank = use the excerpt"
              className="bg-background border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors resize-none"
            />
            <p className="text-[11px] text-text-muted">{form.metaDescription.length}/180</p>
          </div>
        </div>
      </details>

      {/* Related products */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-text-muted uppercase">
          Related Products ({form.relatedProductSlugs.length}/{MAX_RELATED})
        </label>
        <div className="flex flex-wrap gap-2">
          {form.relatedProductSlugs.map((slug) => (
            <span
              key={slug}
              className="flex items-center gap-1.5 text-xs bg-background border border-border rounded-full px-3 py-1"
            >
              {slug}
              <button
                type="button"
                onClick={() => removeRelatedProduct(slug)}
                className="text-text-muted hover:text-red-500"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
        {form.relatedProductSlugs.length < MAX_RELATED && (
          <div className="relative">
            <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2">
              <Search size={14} className="text-text-muted shrink-0" />
              <input
                value={productQuery}
                onChange={(e) => setProductQuery(e.target.value)}
                placeholder="Search products to add"
                className="flex-1 bg-transparent text-sm outline-none"
              />
            </div>
            {productQuery && availableProductResults.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {availableProductResults.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => addRelatedProduct(p.slug)}
                    className="block w-full text-left px-3 py-2 text-sm hover:bg-background transition-colors"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Related categories */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-text-muted uppercase">
          Related Categories ({form.relatedCategorySlugs.length}/{MAX_RELATED})
        </label>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => {
            const selected = form.relatedCategorySlugs.includes(c.slug);
            return (
              <button
                key={c.slug}
                type="button"
                onClick={() => toggleRelatedCategory(c.slug)}
                className={`text-xs rounded-full px-3 py-1 border transition-colors ${
                  selected
                    ? "bg-primary text-white border-primary"
                    : "bg-background text-text-muted border-border hover:border-primary"
                }`}
              >
                {c.title}
              </button>
            );
          })}
        </div>
      </div>

      {formError && (
        <div className="text-xs text-red-500 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
          {formError}
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onDone}
          className="px-4 py-2.5 rounded-lg text-sm font-medium text-text-muted hover:bg-background transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={isSubmitting}
          onClick={(e) => handleSubmit(e, "draft")}
          className="flex items-center gap-2 border border-border px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-background transition-colors disabled:opacity-50"
        >
          {isSubmitting && <Loader2 size={15} className="animate-spin" />}
          Save Draft
        </button>
        <button
          type="button"
          disabled={isSubmitting}
          onClick={(e) => handleSubmit(e, "published")}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isSubmitting && <Loader2 size={15} className="animate-spin" />}
          {editing && post?.status === "published" ? "Save Changes" : "Publish"}
        </button>
      </div>
    </form>
  );
};

export default BlogPostForm;
