// ✅ www ke saath — baaki har jagah canonical www hai (layout.tsx:78,
// app/page.tsx:39, products/[id]/page.tsx, robots.ts:10). Pehle yahan non-www
// tha, to Search Console har submitted URL ko "Alternate page with proper
// canonical" report karta tha aur index nahi karta tha.
const SITE_URL = "https://www.fancystore.store";
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const STATIC_ROUTES = [
  "/",
  "/products",
  "/contactus",
  "/blog",
  // Hataye gaye:
  //   "/aboutus"      -> is route ka koi page file nahi hai (404 submit ho raha tha)
  //   "/category"     -> ab /products pe redirect hai; asli pages /category/<slug> hain
  //   "/carTopCover", "/bikeTopCover", "/truncTrayMat"
  //                   -> placeholder stubs the, ab delete + 301 redirect
  //   "/profile", "/wishlist", "/cart"
  //                   -> auth-gated, per-user pages hain, koi public unique
  //                      content nahi — GSC "Crawled/Discovered - currently
  //                      not indexed" laga raha tha. robots.ts mein disallow
  //                      bhi kar diya.
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

// 2. Categories fetch karne ka function
// NOTE: ye endpoint pehle exist hi nahi karta tha — fetch 404 hota tha, catch
// [] return karta tha, aur category URLs sitemap mein KABHI nahi jati thin.
// Ab /api/categories mount ho chuka hai (backend app.js).
async function getAllCategories() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/categories`, { cache: "no-store" });
    if (!response.ok) return [];
    const payload = await response.json();
    // Backend bare array bhejta hai. Array.isArray guard zaroori hai — shape
    // badal jaye to .map() throw karega aur /sitemap.xml 500 de dega.
    return Array.isArray(payload?.data) ? payload.data : [];
  } catch { return []; }
}

// 3. Fetch blog posts. The endpoint only returns published posts
// (services/blog.service.js listPublishedPostsService), so drafts never
// leak into the sitemap.
async function getAllBlogPosts() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/blog?page=1&limit=500`, { cache: "no-store" });
    if (!response.ok) return [];
    const payload = await response.json();
    return Array.isArray(payload?.data?.posts) ? payload.data.posts : [];
  } catch { return []; }
}

export default async function sitemap() {
  const now = new Date();

  // Static Entries
  const staticEntries = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: now,
    changeFrequency: route === "/" ? "daily" : "weekly",
    priority: route === "/" ? 1 : 0.8,
  }));

  const [products, categories, blogPosts] = await Promise.all([
    getAllProductPages(),
    getAllCategories(),
    getAllBlogPosts(),
  ]);

  // Dynamic Products (https://www.fancystore.store/products/honda-mat)
  const productEntries = products.map((product) => ({
    url: `${SITE_URL}/products/${product.slug || product.id}`,
    lastModified: product.updatedAt ? new Date(product.updatedAt) : now,
    changeFrequency: "daily",
    priority: 0.9,
  }));

  // Dynamic Categories (https://www.fancystore.store/category/dashboard_mat)
  // Backend sirf isActive categories bhejta hai, to soft-deleted slugs yahan
  // apne aap nahi aate.
  const categoryEntries = categories
    .map((cat) => cat?.slug)
    .filter(Boolean)
    .map((slug) => ({
      url: `${SITE_URL}/category/${slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    }));

  // Dynamic Blog Posts (https://www.fancystore.store/blog/car-cover-guide)
  const blogEntries = blogPosts
    .map((post) => (post?.slug ? post : null))
    .filter(Boolean)
    .map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: post.updatedAt
        ? new Date(post.updatedAt)
        : post.publishedAt
          ? new Date(post.publishedAt)
          : now,
      changeFrequency: "monthly",
      priority: 0.7,
    }));

  return [...staticEntries, ...productEntries, ...categoryEntries, ...blogEntries];
}
