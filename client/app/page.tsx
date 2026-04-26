
// "use client";

// import Carosel from "@/components/shop/mainPage/Carosel";
// import Category from "@/components/shop/mainPage/categories/Category";
// import ProductGrid from "@/components/shop/mainPage/categories/ProductGrid";
// import ProductSection from "@/components/shop/mainPage/categories/ProductSection";
// import {
//   useFeaturedProducts,
//   useNewArrivals,
//   useOnSaleProducts,
//   // useShopPageProductsViewMore,
// } from "@/hooks/useProducts";
// // import { useSearchParams } from "next/navigation";
// // import ProductSection from "@/components/shop/mainPage/categories/ProductSection"; // Naya component
// // import { useNewArrivals, useSaleProducts, useFeaturedProducts } from "@/hooks/useProducts"; // Aapke hooks

// const HomePage = () => {
//   // Teeno APIs se data fetch karein
//   const { data: newArrivals, isLoading: loadingNew } = useNewArrivals();
//   const { data: saleProducts, isLoading: loadingSale } = useOnSaleProducts();
//   const { data: featuredProducts, isLoading: loadingFeatured } = useFeaturedProducts(); // Agar hook banaya hai
  
//   return (
//     <div className="min-h-screen">
//       <Carosel />
//       <Category />

//       {/* 1. New Arrivals Section */}
//       <ProductSection
//         title="New Arrivals"
//         products={newArrivals?.products || []}
//         isLoading={loadingNew}
//         viewMoreLink="/viewMore?filter=new-arrivals"
//         cardVariant="minimal"
//       />

//       {/* 2. On Sale Section */}
//       <ProductSection
//         title="Hot Deals & Sales"
//         products={saleProducts?.products || []}
//         isLoading={loadingSale}
//         viewMoreLink="/viewMore?filter=on-sale"
//         cardVariant="overlay"
//       />

//       {/* 3. Featured Section */}
//       <ProductSection
//         title="Featured Products"
//         products={featuredProducts?.products || []}
//         isLoading={loadingFeatured}
//         viewMoreLink="/viewMore?filter=featured"
//         cardVariant="default"
//       />

//       <ProductGrid />
//     </div>
//   );
// };

// export default HomePage;



// app/page.tsx

// ❌ "use client" yahan nahi likhna
export const revalidate = 3600;

import Carosel from "@/components/shop/mainPage/Carosel";
import Category from "@/components/shop/mainPage/categories/Category";
import ProductGrid from "@/components/shop/mainPage/categories/ProductGrid";
import ProductSection from "@/components/shop/mainPage/categories/ProductSection";
import { productService } from "@/service/product.service";

// ❌ Hooks ko import NAHI karna
// import { useFeaturedProducts, useNewArrivals, useOnSaleProducts } from "@/hooks/useProducts";

// ✅ Direct apni service file ko import karein jahan Axios/Fetch likha hai
// import productService from "@/services/productService"; // Path apne hisaab se check kar lein

const HomePage = async () => {
  // ✅ Data server par hi fetch karein baghair kisi hook ke
  const [newArrivalsResponse, saleProductsResponse, featuredProductsResponse] = await Promise.all([
    productService.getNewArrivals(1, 10),
    productService.getSaleProducts(1, 10),
    productService.getFeatured(1, 10),
  ]);

  // Agar aapka backend direct array bhejta hai ya object mein products bhejta hai, us hisaab se adjust karein:
  const newArrivals = newArrivalsResponse?.products || [];
  const saleProducts = saleProductsResponse?.products || [];
  const featuredProducts = featuredProductsResponse?.products || [];

  return (
    <div className="min-h-screen">
      <Carosel />
      <Category />

      {/* 1. New Arrivals Section */}
      <ProductSection
        title="New Arrivals"
        products={newArrivals}
        isLoading={false} // Ab hook nahi hai tu loading bhi humesha false rahegi
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