// // ❌ "use client" yahan nahi likhna
// export const revalidate = 3600;

// import Carosel from "@/components/shop/mainPage/Carosel";
// import Category from "@/components/shop/mainPage/categories/Category";
// import ProductGrid from "@/components/shop/mainPage/categories/ProductGrid";
// import ProductSection from "@/components/shop/mainPage/categories/ProductSection";
// import { productService } from "@/service/productservice/product.service";
// // import { productService } from "@/service/product.service";

// // ❌ Hooks ko import NAHI karna
// // import { useFeaturedProducts, useNewArrivals, useOnSaleProducts } from "@/hooks/useProducts";

// // ✅ Direct apni service file ko import karein jahan Axios/Fetch likha hai
// // import productService from "@/services/productService"; // Path apne hisaab se check kar lein

// const HomePage = async () => {
//   // ✅ Data server par hi fetch karein baghair kisi hook ke
//   const [newArrivalsResponse, saleProductsResponse, featuredProductsResponse] = await Promise.all([
//     productService.getNewArrivals(1, 10),
//     productService.getSaleProducts(1, 10),
//     productService.getFeatured(1, 10),
//   ]);

//   // Agar aapka backend direct array bhejta hai ya object mein products bhejta hai, us hisaab se adjust karein:
//   const newArrivals = newArrivalsResponse?.products || [];
//   const saleProducts = saleProductsResponse?.products || [];
//   const featuredProducts = featuredProductsResponse?.products || [];

//   return (
//     <div className="min-h-screen">
//       <Carosel />
//       <Category />

//       {/* 1. New Arrivals Section */}
//       <ProductSection
//         title="New Arrivals"
//         products={newArrivals}
//         isLoading={false} // Ab hook nahi hai tu loading bhi humesha false rahegi
//         viewMoreLink="/viewMore?filter=new-arrivals"
//         cardVariant="minimal"
//       />

//       {/* 2. On Sale Section */}
//       <ProductSection
//         title="Hot Deals & Sales"
//         products={saleProducts}
//         isLoading={false}
//         viewMoreLink="/viewMore?filter=on-sale"
//         cardVariant="overlay"
//       />

//       {/* 3. Featured Section */}
//       <ProductSection
//         title="Featured Products"
//         products={featuredProducts}
//         isLoading={false}
//         viewMoreLink="/viewMore?filter=featured"
//         cardVariant="default"
//       />

//       <ProductGrid />
//     </div>
//   );
// };

// export default HomePage;

// app/page.tsx



export const revalidate = 3600;

import { Metadata } from "next"; // ✅ Next.js Metadata import kiya
import Carosel from "@/components/shop/mainPage/Carosel";
import Category from "@/components/shop/mainPage/categories/Category";
import ProductGrid from "@/components/shop/mainPage/categories/ProductGrid";
import ProductSection from "@/components/shop/mainPage/categories/ProductSection";
import { productService } from "@/service/productservice/product.service";

// ==========================================
// 🌟 1. SEO METADATA SECTION
// ==========================================
export const metadata: Metadata = {
  title: "Fancy Store | Best Online Shopping for Car Accessories in Pakistan",
  description: "Shop the best car accessories, Top Covers, and dashboard mats at Fancy Store. Get hot deals, new arrivals, and fast delivery all over Pakistan.",
  keywords: [
    "Fancy Store",
    "Top covers",
    "Dashboard mats",
    "Steering wheel cover",
    "Seats cover",
    "silver coated cover",
    "black coated cover",
    "PVC + cotton coated cover",
    "micro fibber cover",
    "silver coated cover",
    "Best car accessories",
    "car accessories pakistan", 
    "online shopping pakistan", 
    "buy car parts online", 
    "fancy store", 
    "top covers pk", 
    "dashboard mats pk", 
    "best car gadgets pk"
  ],
  alternates: {
    canonical: "https://fancystore.store", // ✅ Duplicate content issue se bachne ke liye
  },
  openGraph: {
    title: "Fancy Store | Top Covers ",
    description: "Discover amazing deals on car accessories and lifestyle products with Fast Delivery.",
    url: "https://fancystore.store",
    siteName: "Fancy Store",
    images: [
      {
        url: "https://fancystore.store/category/steeringCover.png", // 👈 Apne public folder mein ek achi si banner image rakh kar uska path yahan dein (1200x630 size best hai)
        width: 1200,
        height: 630,
        alt: "Fancy Store Home Banner",
      },
    ],
    locale: "en_PK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fancy Store | Top Covers",
    description: "Discover amazing deals on car accessories and lifestyle products.",
    images: ["https://fancystore.store/category/steeringCover.png"],
  },
};

const HomePage = async () => {
  // Data server par hi fetch karein
  const [newArrivalsResponse, saleProductsResponse, featuredProductsResponse] = await Promise.all([
    productService.getNewArrivals(1, 10),
    productService.getSaleProducts(1, 10),
    productService.getFeatured(1, 10),
  ]);

  const newArrivals = newArrivalsResponse?.products || [];
  const saleProducts = saleProductsResponse?.products || [];
  const featuredProducts = featuredProductsResponse?.products || [];

  // ==========================================
  // 🌟 2. JSON-LD SCHEMA (Google ko batane ke liye ke ye ek Store hai)
  // ==========================================
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Fancy Store",
    "url": "https://fancystore.store",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://fancystore.store/products?search={search_term_string}", // Agar aapka search page alag hai to URL adjust karein
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <div className="min-h-screen">
      {/* ✅ Schema Script Inject Kiya */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Carosel />
      <Category />

      {/* 1. New Arrivals Section */}
      <ProductSection
        title="New Arrivals"
        products={newArrivals}
        isLoading={false}
        viewMoreLink="/viewMore?filter=new-arrivals"
        cardVariant="minimal"
      />

      {/* 2. On Sale Section */}
      <ProductSection
        title="Hot Deals & Sales"
        products={saleProducts}
        isLoading={false}
        viewMoreLink="/viewMore?filter=on-sale"
        cardVariant="overlay"
      />

      {/* 3. Featured Section */}
      <ProductSection
        title="Featured Products"
        products={featuredProducts}
        isLoading={false}
        viewMoreLink="/viewMore?filter=featured"
        cardVariant="default"
      />

      <ProductGrid />
    </div>
  );
};

export default HomePage;