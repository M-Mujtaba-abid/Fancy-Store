"use client";

import React, { useState, useRef } from 'react';
import { useGetProductReviews } from '@/hooks/useReview'; // Apna sahi path check kar lein
import ReviewStars from './ReviewStars'; // ReviewStars component import karein
import Image from 'next/image';
import { User, MessageSquare, ShieldCheck, ChevronLeft } from 'lucide-react';

interface ProductReviewsProps {
  productId: string | number;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  // 1. Hook se reviews fetch karein
  const { data, isLoading, isError } = useGetProductReviews(productId);

  const [isExpanded, setIsExpanded] = useState(false);
  const reviewsContainerRef = useRef<HTMLDivElement>(null);

  const reviews = data?.data?.reviews || [];
  const avgRating = Number(data?.data?.avgRating) || 0;
  const totalReviews = data?.data?.totalReviews || 0;

  const displayedReviews = isExpanded ? reviews : reviews.slice(0, 4);

  const toggleReviews = () => {
    if (isExpanded) {
      const offset =
        reviewsContainerRef.current!.getBoundingClientRect().top +
        window.scrollY -
        100;

      setIsExpanded(false);

      window.scrollTo({
        top: offset,
        behavior: "smooth",
      });
    } else {
      setIsExpanded(true);
    }
  };

  // 🔄 Loading State
  if (isLoading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center border-t border-border/50 mt-10">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-text-muted animate-pulse">Loading reviews...</p>
      </div>
    );
  }

  // ⚠️ Error State
  if (isError) {
    return (
      <div className="py-12 border-t border-border/50 mt-10 text-center">
        <p className="text-red-500 bg-red-50 p-4 rounded-xl inline-block">Failed to load reviews. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="mt-12 lg:mt-16 pt-10 border-t border-border/50" ref={reviewsContainerRef}>

      {/* ================= HEADER SECTION ================= */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-text-main mb-2">Customer Reviews</h2>
          <div className="flex items-center gap-3">
            {/* <ReviewStars staticRating={avgRating} showCount={false} size={20} /> */}
            <ReviewStars productId={productId} rating={avgRating} totalReviews={totalReviews} />
            <span className="text-sm font-semibold text-text-main">
              {avgRating.toFixed(1)} out of 5
            </span>
            <span className="text-sm text-text-muted">
              ({totalReviews} {totalReviews === 1 ? 'Review' : 'Reviews'})
            </span>
          </div>
        </div>
      </div>

      {/* ================= REVIEWS LIST ================= */}
      {reviews.length === 0 ? (
        // EMPTY STATE
        <div className="bg-card border border-border/50 rounded-2xl p-10 flex flex-col items-center text-center shadow-sm">
          <MessageSquare size={48} className="text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-text-main mb-2">No reviews yet</h3>
          <p className="text-text-muted">Be the first one to review this product!</p>
        </div>
      ) : (
        // REVIEWS MAPPING
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {displayedReviews.map((review) => (
            <div key={review.id} className="bg-card border border-border/50 rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">

              {/* Reviewer Info & Rating */}
              <div className="flex items-start gap-3 sm:gap-4 mb-4">
                {/* Avatar */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0 border border-primary/20">
                  {review.User?.avatar ? (
                    <Image src={review.User.avatar} alt={review.User.name} width={48} height={48} className="rounded-full object-cover" />
                  ) : (
                    <User size={18} className="text-primary sm:w-5 sm:h-5" />
                  )}
                </div>

                {/* Name, Stars & Date */}
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-text-main text-sm sm:text-base truncate leading-tight">{review.User?.name || "Verified Buyer"}</h4>
                  <ReviewStars productId={productId} rating={review.rating} showCount={false} className="mt-1 mb-1 shrink-0" />
                  <p className="text-[10px] sm:text-xs text-text-muted">
                    {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Review Comment */}
              <p className="text-text-main text-xs sm:text-base leading-relaxed mb-4 whitespace-pre-wrap flex-grow">
                {review.comment}
              </p>

              {/* Review Images Gallery */}
              {review.images && review.images.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {review.images.map((imgUrl, idx) => (
                    <div key={idx} className="relative w-12 h-12 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-border/50 cursor-pointer hover:opacity-90 transition-opacity">
                      <Image src={imgUrl} alt={`Review image ${idx + 1}`} fill className="object-cover" sizes="80px" />
                    </div>
                  ))}
                </div>
              )}

              {/* Admin Reply Box (Highlighted) */}
              {review.adminReply && (
                <div className="mt-auto pt-4">
                  <div className="bg-background border border-border/50 border-l-4 border-l-primary rounded-r-xl p-3 sm:p-5 ml-2 sm:ml-8 relative">
                    {/* Little indicator arrow */}
                    <div className="absolute -left-[9px] top-5 w-4 h-4 bg-background border-t border-l border-border/50 transform -rotate-45"></div>

                    <div className="flex items-center gap-1.5 mb-1.5">
                      <ShieldCheck size={14} className="text-primary sm:w-4 sm:h-4" />
                      <h5 className="font-bold text-[10px] sm:text-xs text-text-main uppercase tracking-wider">Response from Store</h5>
                    </div>
                    <p className="text-xs sm:text-sm text-text-muted italic">
                      "{review.adminReply}"
                    </p>
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>
      )}
      {reviews.length > 4 && (
        <div className="flex justify-center mt-8">
          <button
            onClick={toggleReviews}
            className="px-6 py-2.5 bg-primary/10 text-primary font-bold text-sm rounded-full hover:bg-primary/20 flex items-center gap-1.5 group transition-all cursor-pointer"
          >
            {isExpanded ? (
              <>
                Show Less
                <ChevronLeft
                  size={16}
                  className="rotate-90 group-hover:-translate-y-0.5 transition-transform"
                />
              </>
            ) : (
              <>
                Show More
                <ChevronLeft
                  size={16}
                  className="-rotate-90 group-hover:translate-y-0.5 transition-transform"
                />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductReviews;