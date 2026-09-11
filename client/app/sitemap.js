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

// Rows ke updatedAt/publishedAt mein se sab se naya date. Kuch na mile to
// undefined — jhooti date dene se behtar hai lastmod bilkul na dena.
const newestDate = (rows, ...fields) => {
  let newest;
  for (const row of rows) {
    for (const field of fields) {
      const value = row?.[field];
      if (!value) continue;
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) continue;
      if (!newest || date > newest) newest = date;
      break;
    }
  }
  return newest;
};

export default async function sitemap() {
  const [products, categories, blogPosts] = await Promise.all([
    getAllProductPages(),
    getAllCategories(),
    getAllBlogPosts(),
  ]);

  // ⚠️ lastmod par `now` mat lagana.
  //
  // Ye route dynamic hai (fetch cache: "no-store"), is liye `new Date()` har
  // request par badal jata hai. Pehle static routes aur SAARI category URLs
  // isi par thin: Google jab bhi sitemap fetch karta, 17 URLs ka lastmod naya
  // hota — jaise har page har waqt badal raha ho. Google ka apna rule hai ke
  // lastmod bharosay ke qabil na ho to poore sitemap ka lastmod ignore kar do,
  // aur yehi 13 category pages + /blog GSC mein "Discovered - currently not
  // indexed" (Last crawled: N/A) par atke hue hain.
  //
  // Is liye ab har date asli underlying content se aati hai, aur jahan koi
  // asli date nahi (e.g. /contactus) wahan lastmod chhor dete hain.
  const newestProductAt = newestDate(products, "updatedAt", "createdAt");
  const newestPostAt = newestDate(blogPosts, "updatedAt", "publishedAt");

  // Har category ki apni date = us category ke products mein sab se naya
  // update. Category row ka apna updatedAt sirf tab badalta hai jab admin
  // category edit kare, jabke listing to product badalne se badalti hai.
  const categoryLastMod = new Map();
  for (const product of products) {
    const slug = product?.category;
    if (!slug) continue;
    const date = newestDate([product], "updatedAt", "createdAt");
    if (!date) continue;
    const current = categoryLastMod.get(slug);
    if (!current || date > current) categoryLastMod.set(slug, date);
  }

  const STATIC_ROUTE_LASTMOD = {
    "/": newestProductAt,
    "/products": newestProductAt,
    "/blog": newestPostAt,
    // "/contactus" jaan bujh kar nahi — ye page content se nahi chalta, aur
    // iske liye koi bhi date banana matlab dobara wahi jhoot bolna hai.
  };

  // Static Entries
  const staticEntries = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    ...(STATIC_ROUTE_LASTMOD[route]
      ? { lastModified: STATIC_ROUTE_LASTMOD[route] }
      : {}),
    changeFrequency: route === "/" ? "daily" : "weekly",
    priority: route === "/" ? 1 : 0.8,
  }));

  // Dynamic Products (https://www.fancystore.store/products/honda-mat)
  const productEntries = products.map((product) => {
    const lastModified = newestDate([product], "updatedAt", "createdAt");
    return {
      url: `${SITE_URL}/products/${product.slug || product.id}`,
      ...(lastModified ? { lastModified } : {}),
      changeFrequency: "daily",
      priority: 0.9,
    };
  });

  // Dynamic Categories (https://www.fancystore.store/category/dashboard_mat)
  // Backend sirf isActive categories bhejta hai, to soft-deleted slugs yahan
  // apne aap nahi aate.
  //
  // Khali categories yahan se nikal jati hain. Jis category mein ek bhi product
  // nahi, uska page sirf "This Category is Coming soon..." dikhata hai (200
  // status ke sath). Aisi thin pages sitemap mein submit karna crawl budget
  // zaya karta hai aur Google inhe kabhi index karta bhi nahi — bas
  // "Discovered - currently not indexed" ki list lambi karti hain.
  //
  // Ye khud theek ho jata hai: category mein pehla product aate hi uska
  // lastmod ban jata hai aur URL agli sitemap fetch mein wapas aa jati hai.
  const categoryEntries = categories
    .map((cat) => cat?.slug)
    .filter(Boolean)
    .filter((slug) => categoryLastMod.has(slug))
    .map((slug) => ({
      url: `${SITE_URL}/category/${slug}`,
      lastModified: categoryLastMod.get(slug),
      changeFrequency: "weekly",
      priority: 0.85,
    }));

  // Dynamic Blog Posts (https://www.fancystore.store/blog/car-cover-guide)
  const blogEntries = blogPosts
    .map((post) => (post?.slug ? post : null))
    .filter(Boolean)
    .map((post) => {
      const lastModified = newestDate([post], "updatedAt", "publishedAt");
      return {
        url: `${SITE_URL}/blog/${post.slug}`,
        ...(lastModified ? { lastModified } : {}),
        changeFrequency: "monthly",
        priority: 0.7,
      };
    });

  return [...staticEntries, ...productEntries, ...categoryEntries, ...blogEntries];
}
