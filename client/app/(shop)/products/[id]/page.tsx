

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
import { buildProductTitle, cleanMetaDescription } from "@/utils/seo";

// ==========================================
// 🌟 1. Dynamic Metadata for SEO
// ==========================================
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const response = await productService.getProductById(id);
    const product = (response as any)?.product || response;

    // Sirf naam — app/layout.tsx:81 ka template " | Fancy Store" khud jorta
    // hai. Poora likhne se "Product Not Found | Fancy Store | Fancy Store"
    // ban jata tha.
    if (!product) return { title: "Product Not Found" };

    // Canonical hamesha slug URL hona chahiye — numeric /products/46 wali
    // request bhi yehi canonical dikhati hai (page khud niche permanentRedirect
    // kar deta hai us URL pe).
    const productUrl = `https://www.fancystore.store/products/${product.slug || id}`;
    const cleanDescription = cleanMetaDescription(product.description);
    const ogImage = product.imageUrl || (product.images && product.images[0]) || "https://www.fancystore.store/placeholder.png";

    // Brand suffix yahan NAHI lagta — template lagata hai. Pehle dono lagate
    // the, jis se title 72 characters ka ho jata tha aur Google use kaat deta
    // tha. Dekho utils/seo.ts.
    const seoTitle = buildProductTitle(product.name);

    return {
      title: seoTitle,
      description: cleanDescription,
      alternates: {
        canonical: productUrl,
      },
      openGraph: {
        // openGraph/twitter par template NAHI lagta, is liye brand yahan
        // khud jorna parta hai.
        title: `${seoTitle} | Fancy Store`,
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
        // `type` deliberately omitted here — Next's typed OpenGraphType
        // union doesn't include "product", so og:type is rendered as a raw
        // <meta property> tag in the page body instead (see below). Note:
        // `other` was NOT used for this — it renders <meta name="..."> not
        // <meta property="...">, and Open Graph parsers only read `property`.
      },
      twitter: {
        card: "summary_large_image",
        title: `${seoTitle} | Fancy Store`,
        description: cleanDescription,
        images: [ogImage],
      },
    };
  } catch {
    // Koi title na dene par layout ka `title.default` lag jata hai.
    // Pehle yahan "Fancy Store" tha, jo template ke sath "Fancy Store |
    // Fancy Store" ban jata tha.
    return {};
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

  // Related products SERVER pe fetch karte hain. Pehle ye sirf client pe
  // (useRelatedProducts) aate the, is liye server HTML mein doosre products ka
  // ek bhi <a href> nahi hota tha — har product page Googlebot ke liye dead
  // end thi. Catalog ke andar crawl phailane ka yehi sab se sasta raasta hai.
  //
  // Promise abhi start kar ke await neeche karte hain, taake ye reviews wali
  // fetch ke SATH chale, uske baad nahi (warna page ka TTFB barh jata).
  const relatedProductsPromise = productService
    .getRelatedProducts(String(product.id))
    .catch(() => []);

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

  const relatedProducts = await relatedProductsPromise;

  return (
    <>
      {/* Meta's Product Open Graph tags — read by Facebook/Instagram when
          they crawl or preview this URL, and used as a signal for
          Catalog/Dynamic Ads tooling. Must use `property`, not `name` (the
          Next Metadata API's `other` field only emits `name`, which Open
          Graph parsers ignore), so these are rendered directly as JSX —
          React 19 hoists <meta>/<title>/<link> tags rendered anywhere in
          the tree up into <head> automatically. */}
      <meta property="og:type" content="product" />
      <meta property="product:price:amount" content={String(product.discountPrice || product.price)} />
      <meta property="product:price:currency" content="PKR" />
      <meta property="product:availability" content={product.stock > 0 ? "in stock" : "out of stock"} />
      <meta property="product:retailer_item_id" content={String(product.id)} />

      {/* Structured Data for Google Search Console Enhancements */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailsClient product={product} relatedProducts={relatedProducts} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RelatedGuides productSlug={product.slug} categorySlug={product.category} />
      </div>
    </>
  );
}