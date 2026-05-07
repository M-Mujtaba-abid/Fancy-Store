"use client";

import React from 'react';
import { useGetProductReviews } from '@/hooks/useReview'; // Apna sahi path check kar lein
import ReviewStars from './ReviewStars'; // ReviewStars component import karein
import Image from 'next/image';
import { User, MessageSquare, ShieldCheck } from 'lucide-react';

interface ProductReviewsProps {
  productId: string | number;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  // 1. Hook se reviews fetch karein
  const { data, isLoading, isError } = useGetProductReviews(productId);

  const reviews = data?.data?.reviews || [];
  const avgRating = Number(data?.data?.avgRating) || 0;
  const totalReviews = data?.data?.totalReviews || 0;

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
    <div className="mt-12 lg:mt-16 pt-10 border-t border-border/50">
      
      {/* ================= HEADER SECTION ================= */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-text-main mb-2">Customer Reviews</h2>
          <div className="flex items-center gap-3">
            {/* <ReviewStars staticRating={avgRating} showCount={false} size={20} /> */}
            <ReviewStars productId={productId} rating={avgRating}  totalReviews={totalReviews} />
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
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-card border border-border/50 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
              
              {/* Reviewer Info & Rating */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  {/* Avatar */}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0 border border-primary/20">
                    {review.User?.avatar ? (
                      <Image src={review.User.avatar} alt={review.User.name} width={48} height={48} className="rounded-full object-cover" />
                    ) : (
                      <User size={20} className="text-primary" />
                    )}
                  </div>
                  
                  {/* Name & Date */}
                  <div>
                    <h4 className="font-bold text-text-main text-sm sm:text-base">{review.User?.name || "Verified Buyer"}</h4>
                    <p className="text-[11px] sm:text-xs text-text-muted">
                      {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Stars */}
                <ReviewStars productId={productId} rating={review.rating}  totalReviews={totalReviews} className="mt-1" />
              </div>

              {/* Review Comment */}
              <p className="text-text-main text-sm sm:text-base leading-relaxed mb-4 whitespace-pre-wrap">
                {review.comment}
              </p>

              {/* Review Images Gallery */}
              {review.images && review.images.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {review.images.map((imgUrl, idx) => (
                    <div key={idx} className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-border/50 cursor-pointer hover:opacity-90 transition-opacity">
                      <Image src={imgUrl} alt={`Review image ${idx + 1}`} fill className="object-cover" sizes="80px" />
                    </div>
                  ))}
                </div>
              )}

              {/* Admin Reply Box (Highlighted) */}
              {review.adminReply && (
                <div className="mt-5 bg-background border border-border/50 border-l-4 border-l-primary rounded-r-xl p-4 sm:p-5 ml-4 sm:ml-8 relative">
                  {/* Little indicator arrow */}
                  <div className="absolute -left-[9px] top-5 w-4 h-4 bg-background border-t border-l border-border/50 transform -rotate-45"></div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck size={16} className="text-primary" />
                    <h5 className="font-bold text-sm text-text-main uppercase tracking-wider">Response from Store</h5>
                  </div>
                  <p className="text-sm text-text-muted italic">
                    "{review.adminReply}"
                  </p>
                </div>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductReviews;