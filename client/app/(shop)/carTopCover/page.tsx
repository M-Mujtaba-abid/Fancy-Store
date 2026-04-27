// "use client";

// import React, { Suspense, useState } from "react";
// import { useCarProducts } from "@/hooks/useProducts";
// import { useRouter } from "next/navigation";
// import toast from "react-hot-toast";
// import Loading from "@/app/loading";

// // Shared imports
// import ProductCard from "@/components/shop/share/ProductCard";
// import { Pagination } from "@/components/shop/share/Pagination";

// function CarProductsContent() {
//   const [page, setPage] = useState(1);
//   const LIMIT = 12;

//   const { data, isLoading, isError } = useCarProducts(page, LIMIT);
//   const router = useRouter();

//   // Handle errors - navigate to not-found page
//   if (isError) {
//     toast.error("Failed to load products");
//     router.push("/not-found");
//     return null;
//   }

//   if (isLoading) {
//     return null; // Will show global loading.tsx via Suspense
//   }

//   return (
//     <>
//       {data?.products && data.products.length > 0 ? (
//         <>
//           <div className="mb-4 text-sm text-text-muted dark:text-slate-400">
//             Showing {(page - 1) * LIMIT + 1} to{" "}
//             {Math.min(page * LIMIT, data.totalItems)} of {data.totalItems}{" "}
//             products
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//             {data.products.map((product) => (
//               <ProductCard key={product.id} {...product} />
//             ))}
//           </div>

//           <Pagination
//             currentPage={page}
//             totalPages={data.totalPages}
//             onPageChange={(p) => setPage(p)}
//           />
//         </>
//       ) : (
//         <div className="text-center py-12">
//           <p className="text-text-muted dark:text-slate-400 text-lg">
//             No car covers available.
//           </p>
//         </div>
//       )}
//     </>
//   );
// }

// export default function CarTopCoverPage() {
//   return (
//     <div className="min-h-screen bg-background transition-colors duration-300">
//       {/* Header Section */}
//       <header className="bg-linear-to-r from-card to-background py-8 px-4">
//         <div className="max-w-7xl mx-auto">
//           <h1 className="text-4xl font-bold text-text-main mb-2">
//             Car Top Covers
//           </h1>
//           <p className="text-text-muted">
//             Premium protection for your vehicle
//           </p>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="max-w-7xl mx-auto px-4 py-12">
//         <Suspense fallback={<Loading />}>
//           <CarProductsContent />
//         </Suspense>
//       </main>
//     </div>
//   );
// }


import React from 'react'

const CarTopCoverPage = () => {
  return (
    <div>
      <h1>Car Top Covers</h1>
      <p>Here you will find amazing car top covers.</p>
    </div>
  )
}

export default CarTopCoverPage
