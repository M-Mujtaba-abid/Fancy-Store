const SITE_URL = "https://fancystore.store";
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const STATIC_ROUTES = [
  "/",
  "/profile",
  "/aboutus",
  "/products",
  "/category",
  "/contactus",
  "/wishlist",
  "/cart",
  "/carTopCover",
  "/bikeTopCover",
  "/truncTrayMat",
];

// 1. Products fetch karne ka function
async function getAllProductPages() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products?page=1&limit=500`, { cache: "no-store" });
    if (!response.ok) return [];
    const payload = await response.json();
    return payload?.data?.products || [];
  } catch { return []; }
}

// 2. Categories fetch karne ka function (Naya Add kiya gaya)
async function getAllCategories() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/categories`, { cache: "no-store" });
    if (!response.ok) return [];
    const payload = await response.json();
    return payload?.data || []; // Maan lijiye API data return karti hai
  } catch { return []; }
}

export default async function sitemap() {
  const now = new Date();

  // Static Entries
  const staticEntries = STATIC_ROUTES.map((route, index) => ({
    url: `${SITE_URL}${route}`,
    lastModified: now,
    changeFrequency: route === "/" ? "daily" : "weekly",
    priority: route === "/" ? 1 : 0.8,
  }));

  // Dynamic Products (https://www.fancystore.store/products/46)
  const products = await getAllProductPages();
  const productEntries = products.map((product) => ({
    url: `${SITE_URL}/products/${product.id}`,
    lastModified: product.updatedAt ? new Date(product.updatedAt) : now,
    changeFrequency: "daily",
    priority: 0.9,
  }));

  // Dynamic Categories (https://www.fancystore.store/category?category=dashboard_mat)
  const categories = await getAllCategories();
  const categoryEntries = categories.map((cat) => ({
    url: `${SITE_URL}/category?category=${cat.slug || cat.name.toLowerCase().replace(/ /g, '_')}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  return [...staticEntries, ...productEntries, ...categoryEntries];
}