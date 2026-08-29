

// // app/products/[id]/page.tsx (Server Component)
// import ProductDetailsClient from "@/components/shop/share/ProductDetails";
// import { productService } from "@/service/productservice/product.service";
// import { Metadata } from "next";

// // 1. Dynamic Metadata for SEO (Title, Description, OpenGraph)
// export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
//   const { id } = await params;
//   try {
//     const response = await productService.getProductById(id);
//     const product = (response as any)?.product || response;

//     if (!product) return { title: "Product Not Found | Fancy Store" };

//     return {
//       title: `${product.name} | Fancy Store`,
//       description: product.description?.substring(0, 160),
//       openGraph: {
//         title: product.name,
//         description: product.description?.substring(0, 160),
//         images: [product.imageUrl || "/placeholder.png"],
//         url: `https://fancystore.store/products/${id}`,
//       },
//     };
//   } catch {
//     return { title: "Fancy Store" };
//   }
// }

// export default async function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
//   const { id } = await params;

//   if (!id || id === "undefined") {
//     return (
//       <div className="text-center py-20 text-red-500 font-medium text-2xl">
//         Invalid Product ID.
//       </div>
//     );
//   }

//   let product = null;
//   let hasError = false;

//   try {
//     const response = await productService.getProductById(id);
//     product = (response as any)?.product || response;
//   } catch (error) {
//     hasError = true;
//   }

//   if (hasError || !product) {
//     return (
//       <div className="text-center py-20 text-red-500 font-medium text-2xl">
//         {hasError ? "Something went wrong while fetching the product." : "Product not found."}
//       </div>
//     );
//   }

//   // --- JSON-LD Schema Object (Optimized) ---
//   const jsonLd = {
//     "@context": "https://schema.org",
//     "@type": "Product",
//     "name": product.name,
//     // Cloudinary URL handle ho raha hai
//     "image": product.imageUrl || (product.images && product.images[0]) || "https://fancystore.store/placeholder.png",
//     "description": product.description,
//     "sku": product.id.toString(),
//     "brand": {
//       "@type": "Brand",
//       "name": "Fancy Store"
//     },
//     "offers": {
//       "@type": "Offer",
//       "url": `https://fancystore.store/products/${product.id}`,
//       "priceCurrency": "PKR",
//       "price": product.discountPrice || product.price,
//       "itemCondition": "https://schema.org/NewCondition",
//       "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
//       "priceValidUntil": "2026-12-31", // Search Console requirement ke liye
//       "seller": {
//         "@type": "Organization",
//         "name": "Fancy Store"
//       }
//     }
//   };

//   return (
//     <>
//       {/* Structured Data for Google Search Console Enhancements */}
//       <script
//         type="application/ld+json"
//         dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
//       />
//       <ProductDetailsClient product={product} />
//     </>
//   );
// }










// app/products/[id]/page.tsx (Server Component)
import ProductDetailsClient from "@/components/shop/share/ProductDetails";
import RelatedGuides from "@/components/shop/share/RelatedGuides";
import { productService } from "@/service/productservice/product.service";
import { reviewService } from "@/service/review.service";
import { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

// ==========================================
// 🌟 1. Dynamic Metadata for SEO
// ==========================================
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const response = await productService.getProductById(id);
    const product = (response as any)?.product || response;

    if (!product) return { title: "Product Not Found | Fancy Store" };

    // Canonical hamesha slug URL hona chahiye — numeric /products/46 wali
    // request bhi yehi canonical dikhati hai (page khud niche permanentRedirect
    // kar deta hai us URL pe).
    const productUrl = `https://www.fancystore.store/products/${product.slug || id}`;
    // Description se HTML tags hata kar 160 characters nikalna
    const cleanDescription = product.description?.replace(/<[^>]+>/g, '').substring(0, 160) || "Buy premium car accessories at Fancy Store.";
    const ogImage = product.imageUrl || (product.images && product.images[0]) || "https://www.fancystore.store/placeholder.png";

    return {
      title: `${product.name} | Fancy Store`,
      description: cleanDescription,
      alternates: {
        canonical: productUrl,
      },
      openGraph: {
        title: `${product.name} | Fancy Store`,
        description: cleanDescription,
        images: [
          {
            url: ogImage,
            width: 1080,
            height: 1080,
            alt: product.name,
          }
        ],
        url: productUrl,
        siteName: "Fancy Store",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: `${product.name} | Fancy Store`,
        description: cleanDescription,
        images: [ogImage],
      },
    };
  } catch {
    return { title: "Fancy Store" };
  }
}

// ==========================================
// 🌟 2. MAIN PAGE COMPONENT
// ==========================================
export default async function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!id || id === "undefined") {
    notFound();
  }

  let product = null;
  let hasError = false;

  try {
    const response = await productService.getProductById(id);
    product = (response as any)?.product || response;
  } catch (error: any) {
    // Backend ne explicitly "product exists nahi" bola — real 404.
    if (error?.response?.status === 404) {
      notFound();
    }
    // Network/server glitch — asal product hoga, sirf temporarily fetch
    // nahi hua. Isko notFound() mat karo warna transient error se Google
    // ek valid product ko deindex kar sakta hai.
    hasError = true;
  }

  if (!product) {
    if (hasError) {
      return (
        <div className="text-center py-20 text-red-500 font-medium text-2xl">
          Something went wrong while fetching the product.
        </div>
      );
    }
    notFound();
  }

  // Purani numeric URL (/products/46) hit hui aur product ka slug ban chuka
  // hai -> permanently naye SEO URL (/products/<slug>) pe bhej do. Google ke
  // pehle se indexed links aur purane bookmarks/cart/order links dono ke
  // liye zaroori — warna wo hamesha numeric URL pe hi phanse rehte.
  const idIsNumeric = /^\d+$/.test(id);
  if (idIsNumeric && product.slug && product.slug !== id) {
    permanentRedirect(`/products/${product.slug}`);
  }

  // --- JSON-LD Schema Object (Optimized with Review Stars) ---
  const jsonLd: any = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.imageUrl || (product.images && product.images[0]) || "https://www.fancystore.store/placeholder.png",
    "description": product.description?.replace(/<[^>]+>/g, ''), // Clean description for schema
    "sku": product.id.toString(),
    "brand": {
      "@type": "Brand",
      "name": "Fancy Store"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://www.fancystore.store/products/${product.slug || product.id}`,
      "priceCurrency": "PKR",
      "price": product.discountPrice || product.price,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "priceValidUntil": "2026-12-31", // Search Console requirement ke liye
      "seller": {
        "@type": "Organization",
        "name": "Fancy Store"
      }
    }
  };

  // 🔥 HUGE SEO BOOST: Agar product ki ratings hain, toh Google me Stars show karega
  if (product.totalReviews && product.totalReviews > 0) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": product.averageRating || "5.0",
      "reviewCount": product.totalReviews
    };

    // Individual reviews bhi JSON-LD mein daalte hain (sirf average nahi) —
    // AI shopping results aur rich snippets mein attribute-rich Product
    // schema zyada dikhta hai. Failure yahan poore page ko na toray,
    // isliye best-effort — comment wale reviews ko priority (zyada useful
    // rich-result content), phir rating-only se fill karte hain.
    try {
      const reviewsRes = await reviewService.getProductReviews(product.id);
      const allReviews = reviewsRes?.data?.reviews || [];
      const withComment = allReviews.filter((r) => r.comment);
      const withoutComment = allReviews.filter((r) => !r.comment);
      const topReviews = [...withComment, ...withoutComment].slice(0, 5);

      if (topReviews.length > 0) {
        jsonLd.review = topReviews.map((r) => ({
          "@type": "Review",
          reviewRating: {
            "@type": "Rating",
            ratingValue: r.rating,
            bestRating: "5",
            worstRating: "1",
          },
          author: {
            "@type": "Person",
            name: r.User?.name || "Verified Buyer",
          },
          reviewBody: r.comment || undefined,
          datePublished: r.createdAt,
        }));
      }
    } catch {
      // Reviews fetch fail hui to bas aggregateRating pe hi rehne do.
    }
  }

  return (
    <>
      {/* Structured Data for Google Search Console Enhancements */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailsClient product={product} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RelatedGuides productSlug={product.slug} categorySlug={product.category} />
      </div>
    </>
  );
}