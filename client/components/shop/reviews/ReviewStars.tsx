// "use client";

// import React from "react";
// import { Star, StarHalf } from "lucide-react";

// import { ReviewStarsProps } from "@/types/review.type";

// const ReviewStars: React.FC<ReviewStarsProps> = ({
//   // productId,
//   rating,
//   totalReviews,
//   size = 14,
//   showCount = true,
//   className = "",
// }) => {
//   // 3. Logic for full, half, and empty stars
//   const fullStars = Math.floor(rating);
//   const hasHalfStar = rating % 1 !== 0;
//   const emptyStars = Math.max(0, 5 - fullStars - (hasHalfStar ? 1 : 0)); // Ensure negative na ho

//   // ⭐ Final Real Data Stars
//   return (
//     <div className={`flex items-center gap-1.5 ${className}`}>
//       <div className="flex items-center">
//         {/* Render Full Stars */}
//         {[...Array(fullStars)].map((_, i) => (
//           <Star
//             key={`full-${i}`}
//             size={size}
//             className="fill-amber-400 text-amber-400"
//           />
//         ))}

//         {/* Render Half Star (if any) */}
//         {hasHalfStar && (
//           <StarHalf
//             key="half"
//             size={size}
//             className="fill-amber-400 text-amber-400"
//           />
//         )}

//         {/* Render Empty Stars */}
//         {[...Array(emptyStars)].map((_, i) => (
//           <Star
//             key={`empty-${i}`}
//             size={size}
//             className="text-gray-300 dark:text-gray-600"
//           />
//         ))}
//       </div>

//       {/* Render Total Reviews Count */}
//       {showCount && (
//         <span className="text-[11px] sm:text-xs text-text-muted font-medium mt-0.5">
//           ({totalReviews})
//         </span>
//       )}
//     </div>
//   );
// };

// export default ReviewStars;


"use client";

import React from "react";
import { Star, StarHalf } from "lucide-react";
import { ReviewStarsProps } from "@/types/review.type";

const ReviewStars: React.FC<ReviewStarsProps> = ({
  rating = 0,
  totalReviews = 0,
  size = 14,
  showCount = true,
  className = "",
}) => {
  // ✅ 1. Rating ko hamesha 0 se 5 ke darmiyan safe rakhein
  const safeRating = Math.max(0, Math.min(5, Number(rating) || 0));

  const fullStars = Math.floor(safeRating);
  const hasHalfStar = safeRating % 1 !== 0;
  const emptyStars = Math.max(0, 5 - fullStars - (hasHalfStar ? 1 : 0));

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center">
        {/* ✅ 2. Array.from use kiya hai taake RangeError kabhi na aaye */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star key={`full-${i}`} size={size} className="fill-amber-400 text-amber-400" />
        ))}

        {hasHalfStar && (
          <StarHalf key="half" size={size} className="fill-amber-400 text-amber-400" />
        )}

        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star key={`empty-${i}`} size={size} className="text-gray-300 dark:text-gray-600" />
        ))}
      </div>

      {showCount && (
        <span className="text-[11px] sm:text-xs text-text-muted font-medium mt-0.5">
          ({totalReviews})
        </span>
      )}
    </div>
  );
};

export default ReviewStars;