"use client";

import React from "react";
import Link from "next/link";
import { ShoppingCart, PackageX } from "lucide-react";
import { Product } from "@/types/product.type";
import Image from "next/image";
import WishlistButton from "@/components/shop/share/WishlistButton";
import AddToCart from "./AddToCart";
import ReviewStars from "@/components/shop/reviews/ReviewStars";

const formatText = (text?: string) => {
  if (!text) return "";
  return text.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};

const hasActiveSale = (
  price: number,
  discountPrice?: number,
  isOnSale?: boolean,
  variants?: any[]
) => {
  if (isOnSale) return true;
  if (discountPrice && discountPrice > 0 && discountPrice < price) return true;
  if (variants && variants.length > 0) {
    return variants.some(
      (v) =>
        v.salePrice &&
        Number(v.salePrice) > 0 &&
        Number(v.salePrice) < Number(v.price)
    );
  }
  return false;
};

const formatSoldCount = (sold?: number) => {
  if (!sold) return "0";
  if (sold >= 1000) {
    const kValue = sold / 1000;
    return kValue % 1 === 0 ? `${kValue}k` : `${kValue.toFixed(1)}k`;
  }
  return sold.toString();
};

const ProductPrice = ({
  price,
  discountPrice,
  isOnSale,
  variants,
  size = "md",
}: {
  price: number;
  discountPrice?: number;
  isOnSale?: boolean;
  variants?: any[];
  size?: "sm" | "md" | "lg";
}) => {
  const hasVariants = Boolean(variants && variants.length > 0);

  const saleSize =
    size === "lg"
      ? "text-lg font-bold"
      : size === "sm"
        ? "text-sm font-bold"
        : "text-sm md:text-lg font-bold";
  const originalSize =
    size === "lg"
      ? "text-sm line-through"
      : size === "sm"
        ? "text-xs line-through"
        : "text-[10px] sm:text-xs line-through";

  if (hasVariants) {
    const minVariantPrice = Math.min(
      ...variants!.map((v) =>
        v.salePrice && Number(v.salePrice) > 0 && Number(v.salePrice) < Number(v.price)
          ? Number(v.salePrice)
          : Number(v.price)
      )
    );

    const minVariantRegularPrice = Math.min(
      ...variants!.map((v) => Number(v.price))
    );

    const variantHasSale =
      minVariantPrice < minVariantRegularPrice || isOnSale;

    if (variantHasSale && minVariantRegularPrice > minVariantPrice) {
      return (
        <div className="flex flex-col leading-tight">
          <span className="text-[10px] uppercase font-semibold text-text-muted">
            Starting From
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`${saleSize} text-primary whitespace-nowrap`}>
              Rs. {minVariantPrice.toLocaleString()}
            </span>
            <span
              className={`${originalSize} text-gray-400 dark:text-gray-500 whitespace-nowrap`}
            >
              Rs. {minVariantRegularPrice.toLocaleString()}
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col leading-tight">
        <span className="text-[10px] uppercase font-semibold text-text-muted">
          Starting From
        </span>
        <span className={`${saleSize} text-primary whitespace-nowrap`}>
          Rs. {minVariantPrice.toLocaleString()}
        </span>
      </div>
    );
  }

  const onSale = hasActiveSale(price, discountPrice, isOnSale, variants);

  if (onSale && discountPrice && discountPrice > 0 && discountPrice < price) {
    return (
      <div className="flex flex-col leading-tight">
        <span className={`${saleSize} text-primary whitespace-nowrap`}>
          Rs. {discountPrice.toLocaleString()}
        </span>
        <span
          className={`${originalSize} text-gray-400 dark:text-gray-500 whitespace-nowrap`}
        >
          Rs. {price.toLocaleString()}
        </span>
      </div>
    );
  }

  return (
    <span className={`${saleSize} text-primary whitespace-nowrap`}>
      Rs. {price.toLocaleString()}
    </span>
  );
};

interface ProductCardProps extends Product {
  variant?: "default" | "overlay" | "minimal";
  averageRating?: number;
  totalReviews?: number;
}

const ProductCard: React.FC<ProductCardProps> = (props) => {
  const {
    id,
    slug,
    name,
    price,
    discountPrice,
    imageUrl,
    images,
    isOnSale,
    isNewArrival,
    isFeatured,
    category,
    carModel,
    vehicleType,
    stock,
    averageRating = 0,
    totalReviews = 0,
    sold = 0,
    variant = "default",
  } = props;

  // SEO: naye products ke paas slug hota hai (/products/honda-mat), purane
  // ya abhi-abhi backfill se pehle wale products id pe fallback karte hain.
  const productUrl = `/products/${slug || id}`;
  const displayImage =
    imageUrl || (images?.length ? images[0] : "/placeholder.png");
  const isOutOfStock = stock <= 0;
  const { variant: _variant, averageRating: _avg, totalReviews: _reviews, ...productForWishlist } = props;
  const wishlistProduct = {
    ...productForWishlist,
    id: String(props.id),
    imageUrl: displayImage,
  };
  const onSale = hasActiveSale(price, discountPrice, isOnSale, props.variants);
  const metaData = [
    formatText(vehicleType),
    formatText(carModel),
    formatText(category),
  ]
    .filter(Boolean)
    .join(" • ");

  // ------------------------------------------------------------------
  // VARIANT 1: OVERLAY DESIGN
  // ------------------------------------------------------------------
  if (variant === "overlay") {
    return (
      // ✅ Semantic <article> Tag added
      // ✅ 1. Mobile pe 'aspect-square' aur desktop pe 'h-[320px]' kar diya
      <article className="group relative w-full aspect-square md:aspect-auto md:h-[320px] rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 bg-white dark:bg-card">
        {/* ✅ Image Link separate to keep HTML valid */}
        <Link
          href={productUrl}
          className="absolute inset-0 z-0 block"
          aria-label={`View details of ${name}`}
        >
          <Image
            src={displayImage}
            alt={name}
            fill
            // ✅ 2. 'object-contain' aur thori padding (p-2) taake image poori visible ho aur kategi nahi
            className="object-contain p-2 md:object-cover md:p-0 group-hover:scale-110 transition-transform duration-700 ease-in-out"
            sizes="(max-width: 768px) 100vw, 25vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
        </Link>

        {/* Buttons are now separate siblings, positioned with z-index */}
        <WishlistButton
          productId={id as string}
          product={wishlistProduct}
          className="absolute top-3 right-3 md:top-4 md:right-4 z-10 bg-white/20 backdrop-blur-md p-2 rounded-full hover:bg-white/40 transition-colors"
          iconClassName="text-white fill-transparent"
        />

        {/* Content Box */}
        <div className="absolute bottom-0 left-0 w-full p-3 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 pointer-events-none">
          <div className="flex flex-wrap gap-1.5 mb-1">
            {onSale && (
              <span className="bg-red-500 text-white text-[9px] uppercase font-bold px-1.5 py-0.5 rounded shadow-sm">
                Sale
              </span>
            )}
            {isNewArrival && (
              <span className="bg-green-500 text-white text-[9px] uppercase font-bold px-1.5 py-0.5 rounded shadow-sm">
                New
              </span>
            )}
            {isFeatured && (
              <span className="bg-amber-500 text-white text-[9px] uppercase font-bold px-1.5 py-0.5 rounded shadow-sm">
                Featured
              </span>
            )}
          </div>

          {/* ✅ Mobile par Category hide kardi taake safai aye */}
          <p className="text-[10px] text-gray-300 mb-0.5 line-clamp-1 hidden sm:block">
            {metaData}
          </p>

          <Link
            href={productUrl}
            className="inline-block pointer-events-auto w-full"
          >
            <h3 className="text-xs sm:text-sm md:text-lg font-bold line-clamp-1  hover:underline leading-tight">
              {name}
            </h3>
          </Link>

          <div className="flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-1.5">
              <ProductPrice
                price={price}
                discountPrice={discountPrice}
                isOnSale={isOnSale}
                variants={props.variants}
              />
              {sold > 0 && (
                <span className="text-[9px] text-white/90 bg-white/20 px-1.5 py-0.5 rounded backdrop-blur-sm whitespace-nowrap">
                  {formatSoldCount(sold)} sold
                </span>
              )}
            </div>

            <AddToCart
              productId={id as string}
              stock={stock}
              // ✅ YEH LINE ADD KAREIN
              product={{
                id: String(id),
                name,
                price: discountPrice || price,
                image: displayImage,
                category,
              }}
              className={`p-1.5 rounded-full backdrop-blur-md z-10 ${isOutOfStock ? "bg-gray-500/50" : "bg-primary hover:bg-primary/90"}`}
            >
              {isOutOfStock ? (
                <PackageX size={14} className="text-white" />
              ) : (
                <ShoppingCart size={14} className="text-white" />
              )}
            </AddToCart>
          </div>
        </div>
      </article>
    );
  }

  // ------------------------------------------------------------------
  // VARIANT 2: MINIMAL DESIGN
  // ------------------------------------------------------------------
  if (variant === "minimal") {
    return (
      // ✅ Semantic <article> Tag added
      <article className="group relative flex flex-col h-full bg-transparent">
        <div className="relative w-full aspect-[4/5] mb-3">
          <Link
            href={productUrl}
            className="block w-full h-full bg-gray-100 rounded-lg overflow-hidden"
            aria-label={`View ${name}`}
          >
            <Image
              src={displayImage}
              alt={name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 25vw"
            />
          </Link>
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 pointer-events-none">
            {onSale && (
              <span className="bg-black text-white text-[10px] uppercase font-bold px-2 py-0.5 tracking-widest shadow-sm">
                Sale
              </span>
            )}
            {isNewArrival && (
              <span className="bg-green-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 tracking-widest shadow-sm">
                New
              </span>
            )}
            {isFeatured && (
              <span className="bg-amber-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 tracking-widest shadow-sm">
                Featured
              </span>
            )}
          </div>

          <WishlistButton
            productId={id as string}
            product={wishlistProduct}
            className="absolute top-3 right-3 bg-white/70 backdrop-blur-md p-2 rounded-full hover:bg-white transition-colors shadow-sm"
          />

          <AddToCart
            productId={id as string}
            stock={stock}
            // ✅ YEH LINE ADD KAREIN
            product={{
              id: String(id),
              name,
              price: discountPrice || price,
              image: displayImage,
              category,
            }}
            className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-md p-2 rounded-full hover:bg-primary hover:text-white transition-all shadow-sm text-gray-700 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
          >
            {isOutOfStock ? <PackageX size={18} /> : <ShoppingCart size={18} />}
          </AddToCart>
        </div>

        <Link
          href={productUrl}
          className="flex flex-col flex-grow text-center"
        >
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">
            {category?.replace(/_/g, " ")}
          </p>
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1 mb-1 group-hover:text-primary transition-colors">
            {name}
          </h3>

          <div className="flex justify-center items-center gap-1.5 mb-2">
            <ReviewStars
              productId={id}
              rating={averageRating}
              totalReviews={totalReviews}
              size={12}
            />
            {sold > 0 && (
              <>
                <span className="text-gray-300 dark:text-gray-600 text-xs">•</span>
                <span className="text-[10px] text-gray-500 font-medium">
                  {formatSoldCount(sold)} sold
                </span>
              </>
            )}
          </div>

          <div className="flex justify-center">
            <ProductPrice
              price={price}
              discountPrice={discountPrice}
              isOnSale={isOnSale}
              variants={props.variants}
              size="sm"
            />
          </div>
        </Link>
      </article>
    );
  }

  // ------------------------------------------------------------------
  // VARIANT 3: DEFAULT DESIGN
  // ------------------------------------------------------------------
  return (
    // ✅ Semantic <article> Tag added
    <article className="group relative bg-card rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full border border-border/50">
      <div className="relative w-full aspect-square bg-gray-50">
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 pointer-events-none">
          {onSale && (
            <span className="bg-red-500 text-white text-[10px] uppercase font-bold px-2 py-1 rounded shadow-sm">
              Sale
            </span>
          )}
          {isNewArrival && (
            <span className="bg-green-600 text-white text-[10px] uppercase font-bold px-2 py-1 rounded shadow-sm">
              New
            </span>
          )}
          {isFeatured && (
            <span className="bg-amber-500 text-white text-[10px] uppercase font-bold px-2 py-1 rounded shadow-sm">
              Featured
            </span>
          )}
        </div>
        <Link
          href={productUrl}
          className="block w-full h-full overflow-hidden"
          aria-label={`View ${name}`}
        >
          <Image
            src={displayImage}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        </Link>

        <WishlistButton
          productId={id as string}
          product={wishlistProduct}
          className="absolute top-3 right-3 z-10 bg-white/80 backdrop-blur-md p-2 rounded-full hover:bg-white transition-colors shadow-sm"
        />
      </div>

      <div className="p-4 flex flex-col grow">
        <Link href={productUrl}>
          <h3 className="text-sm font-semibold line-clamp-2 mb-1.5 group-hover:text-primary transition-colors">
            {name}
          </h3>
        </Link>

        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <ReviewStars
            productId={id}
            rating={averageRating}
            totalReviews={totalReviews}
          />
          {sold > 0 && (
            <>
              <span className="text-text-muted text-xs">•</span>
              <span className="text-[11px] sm:text-xs text-text-muted font-medium bg-primary/5 text-primary px-2 py-0.5 rounded-full">
                {formatSoldCount(sold)} Sold
              </span>
            </>
          )}
        </div>

        <div className="mb-4">
          <ProductPrice
            price={price}
            discountPrice={discountPrice}
            isOnSale={isOnSale}
            variants={props.variants}
            size="lg"
          />
        </div>

        <AddToCart
          productId={id as string}
          stock={stock}
          // ✅ YEH LINE ADD KAREIN
          product={{
            id: String(id),
            name,
            price: discountPrice || price,
            image: displayImage,
            category,
          }}
          className="w-full bg-primary text-white py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity mt-auto flex justify-center items-center gap-2"
        >
          {isOutOfStock ? (
            <>
              {" "}
              <PackageX size={16} /> Out of Stock{" "}
            </>
          ) : (
            <>
              {" "}
              <ShoppingCart size={16} /> Add to Cart{" "}
            </>
          )}
        </AddToCart>
      </div>
    </article>
  );
};

export default ProductCard;
