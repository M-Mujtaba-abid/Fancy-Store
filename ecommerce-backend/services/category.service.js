import { Op, fn, col, where as sqWhere } from "sequelize";
import Category from "../models/category.model.js";
import Product from "../models/product.model.js";
import ApiError from "../utils/apiError.js";
import { CATEGORIES } from "../constants/index.js";
import { uploadBuffer, destroyByUrl } from "../utils/cloudinaryMedia.js";

const CLOUDINARY_FOLDER = "categories";

// Naye slug ka shape. Sirf lowercase + digits + underscore, letter se shuru.
// Ye teen cheezein rokta hai:
//   1. LIKE metacharacters (%, \) jo query tod dete
//   2. Spaces/uppercase, jo client/service/productservice/product.service.tsx:133
//      mein bina encodeURIComponent URL mein interpolate hote hain
//   3. Case-duplicate rows ("Alloy_Rims" vs "alloy_rims")
const SLUG_PATTERN = /^[a-z][a-z0-9_]*$/;

// "All" / "car" / "bike" homepage filter tabs ke liye reserved hain
// (client/components/shop/mainPage/categories/ProductGrid.tsx:9-14) — inko
// category slug bana diya to woh tab kaam hi nahi karega.
// Baaki generic single tokens hygiene ke liye rok rahe hain.
const RESERVED_SLUGS = new Set([
  "all", "car", "bike",
  "mat", "cover", "tray", "coat", "accessories", "top", "seat",
  "product", "products", "category", "categories", "admin", "new", "list",
]);

// ---------------------------------------------------------------------------
// LIKE/ILIKE escaping
// ---------------------------------------------------------------------------

// Postgres ILIKE mein `_` single-char wildcard aur `%` multi-char wildcard hai.
// Hamare slugs mein underscore hota hai (car_topCover), to bina escape ke
// ILIKE 'car_topCover' galti se "carXtopCover" ko bhi match kar leta.
// Default ESCAPE character backslash hai.
const escapeLikePattern = (value) =>
  String(value).replace(/[\\%_]/g, (ch) => `\\${ch}`);

// ---------------------------------------------------------------------------
// Valid-slug cache  (Safety Net #1)
// ---------------------------------------------------------------------------
// Validation = static CATEGORIES constant + saare DB slugs ka UNION.
//
// Do wajah se union, replacement nahi:
//   - Agar Categories table khali ho / migration na chali ho / DB query fail ho
//     jaye, purani 11 categories phir bhi chalti rahengi
//   - Inactive slugs bhi shamil hain: soft-delete karne se koi indexed URL
//     400 nahi degi (woh URLs sitemap ke through Google ko already ja chuki hain)

const STATIC_SLUGS_LOWER = Object.values(CATEGORIES).map((c) => c.toLowerCase());

const CACHE_TTL_MS = 60 * 1000;
let slugCache = null;
let slugCacheAt = 0;

export const invalidateCategoryCache = () => {
  slugCache = null;
  slugCacheAt = 0;
};

const loadSlugMap = async () => {
  const fresh = slugCache && Date.now() - slugCacheAt < CACHE_TTL_MS;
  if (fresh) return slugCache;

  try {
    // isActive filter jaan-boojh kar NAHI — dekho upar ka comment
    const rows = await Category.findAll({
      attributes: ["slug", "matchMode"],
      raw: true,
    });

    const map = new Map();
    // Static constant pehle, taake DB row uske upar override kar sake
    STATIC_SLUGS_LOWER.forEach((s) => map.set(s, "exact"));
    rows.forEach((r) => map.set(r.slug.toLowerCase(), r.matchMode || "exact"));

    slugCache = map;
    slugCacheAt = Date.now();
    return slugCache;
  } catch (err) {
    // DB down ya table missing — static constant pe fallback, kabhi throw nahi
    console.error("Category slug cache load failed, static fallback:", err.message);
    const fallback = new Map();
    STATIC_SLUGS_LOWER.forEach((s) => fallback.set(s, "exact"));
    return fallback;
  }
};

/**
 * Ek hi call mein controller ko sab kuch de deta hai: slug valid hai ya nahi,
 * aur uska matchMode kya hai.
 *
 * Cache-miss pe seedha 400 nahi karta — pehle ek findOne karta hai. Wajah:
 * Vercel pe har lambda instance ka apna module-level cache hai, to category
 * banane ke turant baad naya page warm instances pe 60s tak intermittently
 * 400 deta.
 *
 * @returns {Promise<{ valid: boolean, slug: string, matchMode: string }>}
 */
export const resolveCategoryForQuery = async (rawSlug) => {
  const cleaned = String(rawSlug || "").trim();
  // Frontend hyphen-friendly URLs bhejta hai (car-topCover)
  const normalized = cleaned.replace(/-/g, "_");
  const lower = normalized.toLowerCase();

  const map = await loadSlugMap();

  if (map.has(lower)) {
    return { valid: true, slug: normalized, matchMode: map.get(lower) };
  }
  // Hyphen ke bina original form bhi try karo (legacy behaviour)
  if (map.has(cleaned.toLowerCase())) {
    return { valid: true, slug: cleaned, matchMode: map.get(cleaned.toLowerCase()) };
  }

  // Cache stale ho sakta hai — ek direct lookup se confirm karo
  try {
    const row = await Category.findOne({
      where: sqWhere(fn("LOWER", col("slug")), lower),
      attributes: ["slug", "matchMode"],
      raw: true,
    });
    if (row) {
      invalidateCategoryCache();
      return { valid: true, slug: row.slug, matchMode: row.matchMode || "exact" };
    }
  } catch (err) {
    console.error("Category slug confirm lookup failed:", err.message);
  }

  return { valid: false, slug: normalized, matchMode: "exact" };
};

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

// Backend migration se PEHLE deploy ho jaye to `Categories` table maujood nahi
// hoti. Postgres tab `relation "Categories" does not exist` throw karta hai.
export const isMissingTableError = (err) =>
  /relation .* does not exist/i.test(err?.message || "");

const MIGRATION_HINT =
  "Categories table nahi mili — pehle `npx --yes sequelize-cli db:migrate` chalayein.";

/**
 * Write operations ko wrap karta hai taake missing-table ka raw Postgres error
 * admin ko toast mein na dikhe, balke saaf actionable message mile.
 *
 * READ path (listCategoriesService) is se alag behave karta hai: wahan khali
 * array return hota hai, throw nahi — taake storefront kabhi na toote.
 */
export const runCategoryWrite = async (fn) => {
  try {
    return await fn();
  } catch (err) {
    if (isMissingTableError(err)) throw new ApiError(503, MIGRATION_HINT);
    throw err;
  }
};

export const listCategoriesService = async ({ includeInactive = false } = {}) => {
  try {
    return await Category.findAll({
      where: includeInactive ? {} : { isActive: true },
      order: [
        ["sortOrder", "ASC"],
        ["id", "ASC"],
      ],
    });
  } catch (err) {
    // 500 dene ke bajaye khali array bhejte hain — frontend apne static fallback
    // pe chala jayega (categoriesData.ts) aur site bilkul aaj jaisi chalti rahegi.
    // Is se deploy order forgiving ho jata hai.
    if (isMissingTableError(err)) {
      console.error(`Categories table missing — empty list bheja ja raha hai. ${MIGRATION_HINT}`);
      return [];
    }
    throw err;
  }
};

export const getCategoryBySlugService = async (slug) => {
  const normalized = String(slug || "").trim().replace(/-/g, "_");

  const category = await Category.findOne({
    where: sqWhere(fn("LOWER", col("slug")), normalized.toLowerCase()),
  });

  if (!category) throw new ApiError(404, "Category not found");
  return category;
};

/**
 * Admin list + har category ka product count, aur orphan slugs
 * (Products mein maujood hain lekin Categories mein nahi).
 */
export const getCategoryCountsService = async () => {
  const [categories, grouped] = await Promise.all([
    listCategoriesService({ includeInactive: true }),
    Product.findAll({
      attributes: ["category", [fn("COUNT", col("id")), "count"]],
      group: ["category"],
      raw: true,
    }),
  ]);

  const counts = new Map(
    grouped.map((row) => [String(row.category).toLowerCase(), Number(row.count)])
  );

  const withCounts = categories.map((c) => ({
    ...c.toJSON(),
    productCount: counts.get(c.slug.toLowerCase()) || 0,
  }));

  const knownSlugs = new Set(categories.map((c) => c.slug.toLowerCase()));
  const orphans = grouped
    .filter((row) => row.category && !knownSlugs.has(String(row.category).toLowerCase()))
    .map((row) => ({ category: row.category, productCount: Number(row.count) }));

  return { categories: withCounts, orphans };
};

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

const countProductsForSlug = async (slug) =>
  Product.count({ where: sqWhere(fn("LOWER", col("category")), slug.toLowerCase()) });

const validateNewSlug = async (rawSlug) => {
  const slug = String(rawSlug || "").trim();

  if (!slug) throw new ApiError(400, "Slug is required");

  if (!SLUG_PATTERN.test(slug)) {
    throw new ApiError(
      400,
      "Slug sirf lowercase letters, digits aur underscore use kar sakta hai, aur letter se shuru hona chahiye (e.g. alloy_rims)"
    );
  }

  if (slug.length > 60) throw new ApiError(400, "Slug 60 characters se lamba nahi ho sakta");

  if (RESERVED_SLUGS.has(slug)) {
    throw new ApiError(400, `"${slug}" reserved hai, koi zyada specific slug use karein`);
  }

  // Case-insensitive duplicate check (DB pe bhi LOWER(slug) unique index hai)
  const existing = await Category.findOne({
    where: sqWhere(fn("LOWER", col("slug")), slug.toLowerCase()),
    attributes: ["id", "slug"],
    raw: true,
  });
  if (existing) {
    throw new ApiError(409, `Category "${existing.slug}" already exists`);
  }

  // Collision guard — defense in depth.
  //
  // Naye categories hamesha matchMode 'exact' hote hain, to unka `_`->`%`
  // pattern kabhi use nahi hota. Lekin agar koi legacy category 'fuzzy' pe
  // hai, uska pattern naye slug ko kha sakta hai. Sirf un ke against check karo.
  const fuzzyRows = await Category.findAll({
    where: { matchMode: "fuzzy" },
    attributes: ["slug"],
    raw: true,
  });

  const slugLower = slug.toLowerCase();
  for (const row of fuzzyRows) {
    const pattern = new RegExp(
      `^.*${row.slug.toLowerCase().split("_").map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join(".*")}.*$`
    );
    if (pattern.test(slugLower)) {
      throw new ApiError(
        400,
        `Slug "${slug}" existing fuzzy category "${row.slug}" ke saath collide karta hai — uska page aapke products bhi dikhane lagega. Koi doosra slug chunein.`
      );
    }
  }

  return slug;
};

export const createCategoryService = async (body, file) => {
  const slug = await validateNewSlug(body.slug);

  const title = String(body.title || "").trim();
  if (!title) throw new ApiError(400, "Title is required");

  let image = body.image ? String(body.image).trim() : null;
  if (file?.buffer) {
    image = await uploadBuffer({ buffer: file.buffer, folder: CLOUDINARY_FOLDER });
  }

  const maxOrder = (await Category.max("sortOrder")) || 0;

  const category = await Category.create({
    slug,
    title,
    subtitle: body.subtitle ? String(body.subtitle).trim() : null,
    image,
    suggestedVariantType: body.suggestedVariantType || "Material",
    // Admin ko choice nahi — naya category hamesha exact match karega
    matchMode: "exact",
    showOnHome: body.showOnHome === undefined ? true : parseBool(body.showOnHome),
    isActive: body.isActive === undefined ? true : parseBool(body.isActive),
    sortOrder: Number(maxOrder) + 1,
  });

  invalidateCategoryCache();
  return category;
};

export const updateCategoryService = async (id, body, file) => {
  const category = await Category.findByPk(id);
  if (!category) throw new ApiError(404, "Category not found");

  // Slug immutable hai. Rename karne se:
  //   - saare Products.category rows orphan ho jate (koi FK nahi jo cascade kare)
  //   - pgvector embeddings stale ho jate — buildProductTextForAI slug ko embed
  //     karta hai (services/product.service.js:50)
  if (body.slug !== undefined && String(body.slug).trim() !== category.slug) {
    throw new ApiError(
      400,
      "Slug change nahi ho sakta — is se maujooda products is category se disconnect ho jayenge. Naya category banayein."
    );
  }

  const updates = {};
  if (body.title !== undefined) {
    const title = String(body.title).trim();
    if (!title) throw new ApiError(400, "Title khali nahi ho sakta");
    updates.title = title;
  }
  if (body.subtitle !== undefined) {
    updates.subtitle = String(body.subtitle).trim() || null;
  }
  if (body.suggestedVariantType !== undefined) {
    updates.suggestedVariantType = body.suggestedVariantType || "Material";
  }
  if (body.showOnHome !== undefined) updates.showOnHome = parseBool(body.showOnHome);
  if (body.isActive !== undefined) updates.isActive = parseBool(body.isActive);
  if (body.sortOrder !== undefined) updates.sortOrder = Number(body.sortOrder) || 0;

  if (file?.buffer) {
    const previousImage = category.image;
    updates.image = await uploadBuffer({
      buffer: file.buffer,
      folder: CLOUDINARY_FOLDER,
    });

    // Purani image sirf tab delete karo jab woh Cloudinary pe ho. Seeded rows
    // local paths hain (/category/seatCover.png) — unko chhedna nahi.
    if (previousImage?.includes("res.cloudinary.com")) {
      try {
        await destroyByUrl({ url: previousImage, folder: CLOUDINARY_FOLDER });
      } catch (err) {
        // Non-fatal: image leak ho jayegi lekin update fail nahi hona chahiye
        console.error("Old category image cleanup failed:", err.message);
      }
    }
  }

  await category.update(updates);
  invalidateCategoryCache();
  return category;
};

export const deleteCategoryService = async (id) => {
  const category = await Category.findByPk(id);
  if (!category) throw new ApiError(404, "Category not found");

  const productCount = await countProductsForSlug(category.slug);

  // Products maujood hain to sirf soft delete. Hard delete se woh products
  // storefront pe orphan ho jate (category page 400 dene lagta).
  if (productCount > 0) {
    await category.update({ isActive: false, showOnHome: false });
    invalidateCategoryCache();
    return {
      category,
      deleted: false,
      productCount,
      message: `Category deactivate kar di gayi (${productCount} products isme maujood hain, is liye permanently delete nahi kiya).`,
    };
  }

  if (category.image?.includes("res.cloudinary.com")) {
    try {
      await destroyByUrl({ url: category.image, folder: CLOUDINARY_FOLDER });
    } catch (err) {
      console.error("Category image cleanup failed:", err.message);
    }
  }

  await category.destroy();
  invalidateCategoryCache();
  return { category, deleted: true, productCount: 0, message: "Category delete kar di gayi." };
};

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

// multipart/form-data mein sab kuch string aata hai
function parseBool(value) {
  if (typeof value === "boolean") return value;
  return String(value).toLowerCase() === "true" || String(value) === "1";
}

export { escapeLikePattern };
