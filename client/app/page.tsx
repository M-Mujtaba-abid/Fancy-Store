// import Carosel from "@/components/shop/mainPage/Carosel"
// import Category from "@/components/shop/mainPage/categories/Category"
// import NewArrivals from "@/components/shop/mainPage/categories/NewArivals"
// import ProductGrid from "@/components/shop/mainPage/categories/ProductGrid"
// import Sale from "@/components/shop/mainPage/categories/Sale"
// // import Sale from "@/components/shop/mainPage/categories/Sale"

// const page = () => {
//   return (
//     <div className="min-h-screen">
//       {/* <Navbar/> */}
//       <Carosel/>
//       <Category/>
//       <NewArrivals/>
//       <Sale/>
//       <ProductGrid/>
//       {/* <Footer/> */}
//       {/* <Sale/> */}
//       {/* <h1 className="text-primary text-4xl font-bold">Fancy Store</h1>
//       <p>Helo, welcome to the store.</p> */}
//     </div>
//   )
// }

// export default page

"use client";

import Carosel from "@/components/shop/mainPage/Carosel";
import Category from "@/components/shop/mainPage/categories/Category";
import ProductGrid from "@/components/shop/mainPage/categories/ProductGrid";
import ProductSection from "@/components/shop/mainPage/categories/ProductSection";
import {
  useFeaturedProducts,
  useNewArrivals,
  useOnSaleProducts,
  useShopPageProductsViewMore,
} from "@/hooks/useProducts";
import { useSearchParams } from "next/navigation";
// import ProductSection from "@/components/shop/mainPage/categories/ProductSection"; // Naya component
// import { useNewArrivals, useSaleProducts, useFeaturedProducts } from "@/hooks/useProducts"; // Aapke hooks

const HomePage = () => {
  // Teeno APIs se data fetch karein
  const { data: newArrivals, isLoading: loadingNew } = useNewArrivals();
  const { data: saleProducts, isLoading: loadingSale } = useOnSaleProducts();
  const { data: featuredProducts, isLoading: loadingFeatured } = useFeaturedProducts(); // Agar hook banaya hai
  
  return (
    <div className="min-h-screen">
      <Carosel />
      <Category />

      {/* 1. New Arrivals Section */}
      <ProductSection
        title="New Arrivals"
        products={newArrivals?.products || []}
        isLoading={loadingNew}
        viewMoreLink="/viewMore?filter=new-arrivals"
        cardVariant="minimal"
      />

      {/* 2. On Sale Section */}
      <ProductSection
        title="Hot Deals & Sales"
        products={saleProducts?.products || []}
        isLoading={loadingSale}
        viewMoreLink="/viewMore?filter=on-sale"
        cardVariant="overlay"
      />

      {/* 3. Featured Section */}
      <ProductSection
        title="Featured Products"
        products={featuredProducts?.products || []}
        isLoading={loadingFeatured}
        viewMoreLink="/viewMore?filter=featured"
        cardVariant="default"
      />

      <ProductGrid />
    </div>
  );
};

export default HomePage;
