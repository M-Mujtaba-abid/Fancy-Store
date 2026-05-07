"use client";

import React, { useState } from "react";
import { Star, X, UploadCloud } from "lucide-react";
import Image from "next/image";
import { useAddReview } from "@/hooks/useReview"; // Apna hook import karein

interface AddReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string | number;
    name: string;
    image: string;
  } | null;
}

export default function AddReviewModal({ isOpen, onClose, product }: AddReviewModalProps) {
  const { mutate: addReview, isPending } = useAddReview();
  
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  if (!isOpen || !product) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    // Max 5 images allowed
    if (files.length + selectedFiles.length > 5) {
      alert("You can only upload a maximum of 5 images.");
      return;
    }

    setFiles((prev) => [...prev, ...selectedFiles]);

    // Create preview URLs for the selected images
    const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return alert("Please give a rating!");

    const formData = new FormData();
    formData.append("productId", product.id.toString());
    formData.append("rating", rating.toString());
    formData.append("comment", comment);
    files.forEach((file) => {
      formData.append("images", file); // Backend expects "images" array
    });

    addReview(formData, {
      onSuccess: () => {
        handleClose();
      },
    });
  };

  const handleClose = () => {
    setRating(0);
    setComment("");
    setFiles([]);
    setPreviewUrls([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-lg rounded-3xl shadow-2xl relative overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-border/50">
          <h2 className="text-xl font-bold text-text-main">Write a Review</h2>
          <button onClick={handleClose} className="p-2 bg-background rounded-full hover:bg-red-50 hover:text-red-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-3 space-y-6">
          {/* Product Reminder Section */}
          <div className="flex items-center gap-2 p-3 bg-background rounded-2xl border border-border/50">
            <div className="relative w-15 h-13 rounded-xl overflow-hidden shrink-0">
              <Image src={product.image} alt={product.name} fill className="object-cover" />
            </div>
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider font-bold mb-1">Reviewing Product</p>
              <h3 className="font-semibold text-text-main line-clamp-1">{product.name}</h3>
            </div>
          </div>

          {/* Star Rating */}
          <div className="flex flex-col items-center justify-center space-y-2">
            <p className="font-semibold text-text-main">Tap to Rate</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    size={36}
                    className={(hoverRating || rating) >= star ? "fill-orange-400 text-orange-400" : "text-gray-300"}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment Section */}
          <div>
            <textarea
              placeholder="Tell us what you think about this product..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full h-20 px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              required
            ></textarea>
          </div>

          {/* Image Upload */}
          <div>
            <p className="text-sm font-semibold text-text-main mb-0">Upload Photos (Max 5)</p>
            <div className="flex flex-wrap gap-3">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative w-16 h-16 rounded-lg overflow-hidden border border-border group">
                  <Image src={url} alt="preview" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="text-white" size={16} />
                  </button>
                </div>
              ))}
              
              {files.length < 5 && (
                <label className="w-16 h-16 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 bg-background transition-colors">
                  <UploadCloud size={20} className="text-text-muted mb-1" />
                  <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending || rating === 0}
            className="w-full py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Submitting..." : "Submit Review"}
          </button>
        </form>

      </div>
    </div>
  );
}