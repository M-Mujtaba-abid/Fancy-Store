// import ProductDetailsClient from "@/components/shop/share/ProductDetails";
// import { productService } from "@/service/productservice/product.service";

// export default async function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  
//   const { id } = await params;
//   console.log("👉 Resolved Product ID:", id); 

//   if (!id || id === "undefined") {
//     return (
//       <div className="text-center py-20 text-red-500 font-medium text-2xl">
//         Invalid Product ID.
//       </div>
//     );
//   }

//   // ⚡ Nayi Logic: Variables ko bahar define karein
//   let product = null;
//   let hasError = false;

//   try {
//     const response = await productService.getProductById(id);
//     product = (response as any)?.product || response;
//   } catch (error) {
//     // Agar api fail ho jaye to error ko true kar dein
//     hasError = true;
//   }

//   // ⚡ JSX ko try/catch ke bahar return karein
//   if (hasError) {
//     return (
//       <div className="text-center py-20 text-red-500 font-medium text-2xl">
//         Something went wrong while fetching the product.
//       </div>
//     );
//   }

//   if (!product) {
//     return (
//       <div className="text-center py-20 text-red-500 font-medium text-2xl">
//         Product not found.
//       </div>
//     );
//   }

//   // Agar sab theek hai to final component return karein
//   return <ProductDetailsClient product={product} />;
// }


// app/products/[id]/page.tsx (Server Component)

import ProductDetailsClient from "@/components/shop/share/ProductDetails";
import { productService } from "@/service/productservice/product.service";

export default async function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let product = null;
  let hasError = false;

  try {
    const response = await productService.getProductById(id);
    product = (response as any)?.product || response;
  } catch (error) {
    hasError = true;
  }

  if (hasError || !product) {
    return (
      <div className="text-center py-20 text-red-500 font-medium text-2xl">
        {hasError ? "Something went wrong." : "Product not found."}
      </div>
    );
  }

  // --- JSON-LD Schema Object ---
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.imageUrl || (product.images && product.images[0]),
    "description": product.description,
    "sku": product.id.toString(),
    "brand": {
      "@type": "Brand",
      "name": "Fancy Store"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://fancystore.store/products/${product.id}`,
      "priceCurrency": "PKR",
      "price": product.discountPrice || product.price,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "Fancy Store"
      }
    }
  };

  return (
    <>
      {/* Google SEO ke liye Rich Snippet Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailsClient product={product} />
    </>
  );
}