// "use client";
// import React, { useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import Image from 'next/image';
// import { ShoppingCart, Eye, Star } from 'lucide-react';

// const allProducts = [
//   { id: 1, name: "Haval H6 Premium Cover", price: "5,500", category: "Cars", img: "/sportage.png", rating: 5 },
//   { id: 2, name: "Yamaha R6 Sleek Shield", price: "3,200", category: "Bikes", img: "/bike.png", rating: 4 },
//   { id: 3, name: "Sportage Alpha Cover", price: "5,200", category: "Cars", img: "/sportage.png", rating: 5 },
//   { id: 4, name: "Honda CBR Stealth", price: "2,900", category: "Bikes", img: "/bike.png", rating: 4 },
//   { id: 5, name: "Fortuner Legender Fit", price: "6,500", category: "Cars", img: "/sportage.png", rating: 5 },
//   { id: 6, name: "Kawasaki Ninja Z", price: "3,500", category: "Bikes", img: "/bike.png", rating: 5 },
//   { id: 7, name: "Civic RS Custom Cover", price: "4,800", category: "Cars", img: "/sportage.png", rating: 4 },
//   { id: 8, name: "Suzuki Hayabusa Pro", price: "3,800", category: "Bikes", img: "/bike.png", rating: 5 },
// ];

// const categories = ["All", "Cars", "Bikes"];

// const ProductGrid = () => {
//   const [activeTab, setActiveTab] = useState("All");

//   const filteredProducts = activeTab === "All" 
//     ? allProducts 
//     : allProducts.filter(p => p.category === activeTab);

//   return (
//     <section className="py-20 bg-background text-text-main transition-colors duration-300">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
//         {/* Header & Filter */}
//         <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 space-y-6 md:space-y-0">
//           <div className="text-center md:text-left">
//             <h2 className="text-4xl font-extrabold tracking-tight uppercase">
//               Our <span className="text-primary italic">Collection</span>
//             </h2>
//             <p className="text-text-muted mt-2">High-quality protection for every vehicle</p>
//           </div>

//           {/* Filter Tabs */}
//           <div className="flex bg-card p-1 rounded-full self-center floating-card">
//             {categories.map((cat) => (
//               <button
//                 key={cat}
//                 onClick={() => setActiveTab(cat)}
//                 className={`px-8 py-2 rounded-full text-sm font-bold transition-all ${
//                   activeTab === cat 
//                     ? "bg-primary text-white shadow-lg" 
//                     : "text-text-muted hover:text-text-main"
//                 }`}
//               >
//                 {cat}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Products Grid */}
//         <motion.div 
//           layout
//           className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8"
//         >
//           <AnimatePresence mode='popLayout'>
//             {filteredProducts.map((product) => (
//               <motion.div
//                 key={product.id}
//                 layout
//                 initial={{ opacity: 0, scale: 0.9 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 exit={{ opacity: 0, scale: 0.9 }}
//                 transition={{ duration: 0.4 }}
//                 className="group"
//               >
//                 {/* Image Container */}
//                 <div className="relative aspect-square bg-card rounded-3xl overflow-hidden shadow-sm group-hover:shadow-xl transition-all duration-500 floating-card">
//                   <Image
//                     src={product.img}
//                     alt={product.name}
//                     fill
//                     className="object-cover transition-transform duration-700 group-hover:scale-110"
//                   />
                  
//                   {/* Hover Quick Actions */}
//                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
//                     <button className="bg-white text-black p-3 rounded-full hover:bg-primary hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0">
//                       <ShoppingCart size={20} />
//                     </button>
//                     <button className="bg-white text-black p-3 rounded-full hover:bg-primary hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 delay-75">
//                       <Eye size={20} />
//                     </button>
//                   </div>
//                 </div>

//                 {/* Info Section */}
//                 <div className="mt-5 space-y-2 px-2">
//                   <div className="flex justify-between items-start">
//                     <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
//                       {product.name}
//                     </h3>
//                   </div>
                  
//                   <div className="flex items-center space-x-1 text-yellow-500">
//                     {[...Array(5)].map((_, i) => (
//                       <Star key={i} size={14} fill={i < product.rating ? "currentColor" : "none"} />
//                     ))}
//                     <span className="text-text-muted text-xs ml-2">({product.rating}.0)</span>
//                   </div>

//                   <div className="flex items-center justify-between pt-1">
//                     <p className="text-xl font-black text-primary">Rs. {product.price}</p>
//                     <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted px-2 py-1 bg-card rounded-md floating-card">
//                       {product.category}
//                     </span>
//                   </div>
//                 </div>
//               </motion.div>
//             ))}
//           </AnimatePresence>
//         </motion.div>
//       </div>
//     </section>
//   );
// };

// export default ProductGrid;

"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Eye, Star, ChevronLeft, ChevronRight } from 'lucide-react';
// ✅ Real data ke liye apna hook aur loading import karein
import { useAllProducts } from "@/hooks/useProducts";
import Loading from "@/app/loading";
import WishlistButton from '../../share/WishlistButton';

const categories = ["All", "Cars", "Bikes"];

const ProductGrid = () => {
  const [activeTab, setActiveTab] = useState("All");
  
  // ✅ Pagination State
  const [page, setPage] = useState(1);
  const limit = 10; // Ek page par kitne products dikhane hain

  // ✅ Real API Call
  const { data, isLoading, isError } = useAllProducts(page, limit);

  if (isLoading) return <Loading />;
  if (isError) return <div className="text-center py-20 text-red-500 font-medium">Failed to load products.</div>;

  // ✅ Client-side Filtering (Cars / Bikes)
  const allProducts = data?.products || [];
  const filteredProducts = activeTab === "All" 
    ? allProducts 
    : allProducts.filter((p: any) => {
        const type = p.vehicleType?.toLowerCase() || "";
        return activeTab === "Cars" ? type === "car" : type === "bike";
      });

  return (
    <section className="py-20 bg-background text-text-main transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Filter */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 space-y-6 md:space-y-0">
          <div className="text-center md:text-left">
            <h2 className="text-4xl font-extrabold tracking-tight uppercase">
              Our <span className="text-primary italic">Collection</span>
            </h2>
            <p className="text-text-muted mt-2">High-quality protection for every vehicle</p>
          </div>

          {/* Filter Tabs */}
          <div className="flex bg-card p-1 rounded-full self-center floating-card">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveTab(cat);
                  setPage(1); // Tab change karne par page 1 par reset karein
                }}
                className={`px-8 py-2 rounded-full text-sm font-bold transition-all ${
                  activeTab === cat 
                    ? "bg-primary text-white shadow-lg" 
                    : "text-text-muted hover:text-text-main"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid (Aapki Exact Styling) */}
        <motion.div 
          layout
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8"
        >
          <AnimatePresence mode='popLayout'>
            {filteredProducts.map((product: any) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="group"
              >
                {/* Image Container */}
                 {/* Image Container */}
                <div className="relative aspect-square bg-card rounded-3xl overflow-hidden shadow-sm group-hover:shadow-xl transition-all duration-500 floating-card block">
                  <Link href={`/products/${product.id}`} className="block w-full h-full">
                    <Image
                      src={product.imageUrl || (product.images && product.images[0]) || "/placeholder.png"}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </Link>

                  {/* ✅ Yahan Apna Custom Wishlist Button Laga Diya */}
                  <WishlistButton 
                    productId={product.id}
                    className="absolute top-3 right-3 bg-white/80 backdrop-blur-md p-2 rounded-full hover:bg-white transition-colors shadow-sm opacity-0 group-hover:opacity-100 duration-300"
                  />
                  
                  {/* Hover Quick Actions */}
                  <div className="absolute inset-0 pointer-events-none bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
                    <button className="pointer-events-auto bg-white text-black p-3 rounded-full hover:bg-primary hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0">
                      <ShoppingCart size={20} />
                    </button>
                    <Link href={`/products/${product.id}`} className="pointer-events-auto bg-white text-black p-3 rounded-full hover:bg-primary hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 delay-75">
                      <Eye size={20} />
                    </Link>
                  </div>
                </div>

                {/* Info Section */}
                <div className="mt-5 space-y-2 px-2">
                  <div className="flex justify-between items-start">
                    <Link href={`/products/${product.id}`}>
                      <h3 className="font-bold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                        {product.name} {/* ✅ Real Name */}
                      </h3>
                    </Link>
                  </div>
                  
                  <div className="flex items-center space-x-1 text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      // Agar rating backend se nahi aa rahi, toh abhi ke liye 5 stars dikha dein
                      <Star key={i} size={14} fill={i < 5 ? "currentColor" : "none"} />
                    ))}
                    <span className="text-text-muted text-xs ml-2">(5.0)</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    {/* ✅ Real Price */}
                    <p className="text-xl font-black text-primary">Rs. {product.price.toLocaleString()}</p>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted px-2 py-1 bg-card rounded-md floating-card">
                      {product.vehicleType || "Auto"} {/* ✅ Real Category/Type */}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <span className="text-4xl mb-4">🛒</span>
            <p className="text-lg font-medium">No products available in this category.</p>
          </div>
        )}

        {/* ✅ Pagination Controls (Next / Previous) */}
        {data?.totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-16 pt-8 border-t border-border/50">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-card shadow-sm hover:shadow-md border border-border/50"
            >
              <ChevronLeft size={18} /> Previous
            </button>
            
            <span className="font-bold text-text-main">
              Page {data.currentPage} of {data.totalPages}
            </span>
            
            <button
              onClick={() => setPage((prev) => prev + 1)}
              disabled={page >= data.totalPages}
              className="flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-card shadow-sm hover:shadow-md border border-border/50"
            >
              Next <ChevronRight size={18} />
            </button>
          </div>
        )}

      </div>
    </section>
  );
};

export default ProductGrid;