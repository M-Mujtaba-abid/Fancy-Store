// types/review.type.ts

export interface ReviewUser {
  id: string | number;
  name: string;
  avatar?: string | null;
}

export interface ReviewProduct {
  id: string | number; // ✅ YEH LINE ADD KI GAYI HAI
  name: string;
}

export interface Review {
  id: string | number;
  userId: string | number;
  productId: string | number;
  rating: number;
  comment: string;
  images?: string[];
  isApproved: boolean;
  adminReply?: string | null;
  createdAt: string;
  updatedAt: string;
  User?: ReviewUser; // Jab include hoke aaye
  Product?: ReviewProduct; // Jab admin pending list mein aaye
}

export interface ProductReviewsData {
  avgRating: string | number;
  totalReviews: number;
  reviews: Review[];
}

// Responses
export interface ProductReviewsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: ProductReviewsData;
}

export interface PendingReviewsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: Review[];
}

export interface GenericReviewResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: Review | null;
}

// Payload Types
export interface AddReviewPayload {
  productId: string | number;
  rating: number;
  comment: string;
  images?: File[]; // Frontend par file objects honge
}

export interface AdminReplyPayload {
  reply: string;
}

// ✅ ReviewStarsProps ko bhi update kar diya gaya hai
// types/review.type.ts file ke end mein isko replace karein:

export interface ReviewStarsProps {
  productId?: string | number; // Optional
  rating?: number;             // ✅ Yahan humne 'rating' word set kar diya
  totalReviews?: number;       // ✅ Yahan 'totalReviews' set kar diya
  size?: number;
  showCount?: boolean;
  className?: string;
}