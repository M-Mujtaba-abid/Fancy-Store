// API shape — GET /api/categories
export interface Category {
  id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  image: string | null;
  suggestedVariantType: string;
  matchMode: "exact" | "fuzzy";
  showOnHome: boolean;
  isActive: boolean;
  sortOrder: number;
  /**
   * Is category mein kitne products hain. Optional is liye hai ke backend count
   * query fail hone par categories phir bhi bhejta hai, bas ye field chhor deta
   * hai (services/category.service.js:listCategoriesService).
   *
   * Storefront ise khali categories link na karne ke liye use karta hai — khali
   * category ka page sirf "This Category is Coming soon..." dikhata hai, wo bhi
   * HTTP 200 ke sath, yani Google ke liye soft 404.
   */
  productCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Admin list — GET /api/categories/admin/list
export interface AdminCategory extends Category {
  productCount: number;
}

export interface AdminCategoryList {
  categories: AdminCategory[];
  // Products.category mein maujood hain lekin Categories table mein nahi
  orphans: { category: string; productCount: number }[];
}

/**
 * ⚠️ HOME_CATEGORIES (client/constants/categoriesData.ts) mein `id` ek SLUG hai
 * ("seat_cover"), lekin API ka `Category.id` ek numeric PK hai. Dono shapes ko
 * ek hi .map() mein flow karne dena bug hai — link `/category/7` ban jayega.
 *
 * Is liye rendering ke liye alag view type, aur boundary pe normalize.
 */
export interface HomeCategoryTile {
  slug: string;
  title: string;
  subtitle: string | null;
  image: string | null;
  /** Dekho Category.productCount. Static fallback par hamesha undefined. */
  productCount?: number;
}

/**
 * API row (jiska `id` numeric PK hai) -> view shape.
 * Slug hamesha `slug` field se aata hai, `id` se KABHI nahi.
 */
export const apiCategoryToTile = (c: Category): HomeCategoryTile => ({
  slug: c.slug,
  title: c.title,
  subtitle: c.subtitle,
  image: c.image,
  productCount: c.productCount,
});

/** Shape of the static HOME_CATEGORIES fallback entries. */
export interface StaticCategoryEntry {
  id: string; // yahan `id` ek SLUG hai, numeric PK nahi
  title: string;
  subtitle?: string | null;
  image?: string | null;
}

/**
 * Static fallback (jiska `id` slug hai) -> view shape.
 * Do alag functions jaan-boojh kar rakhe hain, taake numeric `id` galti se
 * slug ki jagah use na ho jaye (warna link `/category/7` ban jata).
 */
export const staticCategoryToTile = (c: StaticCategoryEntry): HomeCategoryTile => ({
  slug: c.id,
  title: c.title,
  subtitle: c.subtitle ?? null,
  image: c.image ?? null,
});

export interface CategoryMutationInput {
  slug?: string;
  title: string;
  subtitle?: string | null;
  suggestedVariantType?: string;
  showOnHome?: boolean;
  isActive?: boolean;
  sortOrder?: number;
  imageFile?: File | null;
}

export interface CategoryDeleteResult {
  category: Category;
  deleted: boolean;
  productCount: number;
  message: string;
}
