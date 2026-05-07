"use client";

import React, { useState } from "react";
import {
  useGetPendingReviews,
  useApproveReview,
  useDeleteReview,
  useAdminReply,
} from "@/hooks/useReview";
import ReviewStars from "@/components/shop/reviews/ReviewStars";
import Image from "next/image";
import {
  CheckCircle,
  Trash2,
  MessageSquare,
  Star,
  CornerDownRight,
  Loader2,
} from "lucide-react";

export default function AdminPendingReviewsPage() {
  // 1. Fetch Hooks
  const { data, isLoading, isError } = useGetPendingReviews();
  const reviews = data?.data || [];
  console.log("review admin data", data);

  // 2. Mutation Hooks
  const { mutate: approveReview, isPending: isApproving } = useApproveReview();
  const { mutate: deleteReview, isPending: isDeleting } = useDeleteReview();
  const { mutate: replyToReview, isPending: isReplying } = useAdminReply();

  // 3. Local States for handling Replies & Loading tracking
  const [replyingTo, setReplyingTo] = useState<string | number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [actionId, setActionId] = useState<string | number | null>(null); // Track which review is being acted upon

  // --- Handlers ---
  const handleApprove = (id: string | number) => {
    setActionId(id);
    approveReview(id, { onSettled: () => setActionId(null) });
  };

  const handleDelete = (id: string | number) => {
    if (confirm("Are you sure you want to reject and delete this review?")) {
      setActionId(id);
      deleteReview(id, { onSettled: () => setActionId(null) });
    }
  };

  const handleSendReply = (id: string | number) => {
    if (!replyText.trim()) return alert("Reply cannot be empty!");
    setActionId(id);
    replyToReview(
      { id, payload: { reply: replyText } },
      {
        onSuccess: () => {
          setReplyingTo(null);
          setReplyText("");
        },
        onSettled: () => setActionId(null),
      },
    );
  };

  // --- Render States ---
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 size={40} className="animate-spin text-primary mb-4" />
        <p className="text-text-muted font-medium">
          Fetching pending reviews...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-red-500">
        <p className="font-bold text-lg bg-red-50 px-6 py-3 rounded-xl">
          Failed to load pending reviews.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-main flex items-center gap-3">
          Pending Reviews
          <span className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full">
            {reviews.length}
          </span>
        </h1>
        <p className="text-text-muted mt-1">
          Review, approve, or reply to customer feedback before it goes live.
        </p>
      </div>

      {/* Empty State */}
      {reviews.length === 0 ? (
        <div className="bg-card border border-border/50 rounded-2xl p-12 flex flex-col items-center text-center shadow-sm">
          <Star size={64} className="text-gray-200 mb-4" />
          <h2 className="text-xl font-bold text-text-main mb-2">
            All Caught Up!
          </h2>
          <p className="text-text-muted">
            There are no pending reviews waiting for approval.
          </p>
        </div>
      ) : (
        /* Reviews List */
        <div className="space-y-6">
          {reviews.map((review) => {
            const isActing = actionId === review.id; // Check if current review is loading

            return (
              <div
                key={review.id}
                className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm flex flex-col gap-4"
              >
                {/* Top Info: Product & User */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border/30">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
                      Product: {review.Product?.name || "Unknown Product"}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-text-main">
                        {review.User?.name || "User"}
                      </span>
                      <span className="text-text-muted text-sm">
                        • {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Rating Stars */}
                  <div className="bg-background px-4 py-2 rounded-lg border border-border/50">
                    {/* <ReviewStars rating={review.rating} showCount={false} size={16} /> */}
                    <ReviewStars
                      rating={review.rating}
                      showCount={false}
                      size={16}
                    />{" "}
                  </div>
                </div>

                {/* Comment & Images */}
                <div>
                  <p className="text-text-main text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                    {review.comment}
                  </p>

                  {review.images && review.images.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-4">
                      {review.images.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative w-20 h-20 rounded-lg overflow-hidden border border-border/50 shadow-sm cursor-pointer hover:opacity-90"
                        >
                          <Image
                            src={img}
                            alt="review attachment"
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Admin Reply Box (If admin clicked Reply) */}
                {replyingTo === review.id && (
                  <div className="mt-2 bg-background p-4 rounded-xl border border-primary/20 flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                      <CornerDownRight size={16} /> Write a public reply as
                      Admin
                    </div>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Thank you for your feedback..."
                      className="w-full bg-transparent border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary min-h-[80px] resize-y"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyText("");
                        }}
                        className="px-4 py-2 text-sm font-medium text-text-muted hover:bg-border/50 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSendReply(review.id)}
                        disabled={isReplying && isActing}
                        className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
                      >
                        {isReplying && isActing ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          "Post Reply"
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Actions (Approve, Reply, Reject) */}
                <div className="flex flex-wrap items-center justify-end gap-3 pt-4">
                  {/* Delete / Reject Button */}
                  <button
                    onClick={() => handleDelete(review.id)}
                    disabled={isDeleting && isActing}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold rounded-lg transition-colors"
                  >
                    {isDeleting && isActing ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                    Reject
                  </button>

                  {/* Reply Button */}
                  <button
                    onClick={() => setReplyingTo(review.id)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-background border border-border hover:bg-border/50 text-text-main text-sm font-semibold rounded-lg transition-colors"
                  >
                    <MessageSquare size={16} />
                    Reply
                  </button>

                  {/* Approve / Tick Button */}
                  <button
                    onClick={() => handleApprove(review.id)}
                    disabled={isApproving && isActing}
                    className="flex items-center gap-1.5 px-6 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-lg transition-all shadow-sm active:scale-95"
                  >
                    {isApproving && isActing ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        <CheckCircle size={18} /> Approve
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
