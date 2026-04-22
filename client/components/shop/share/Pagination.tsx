"use client";

import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  // Don't render if there's only one page
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-4 mt-12 py-8">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-card rounded-md shadow-md hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed transition-colors floating-card"
      >
        Previous
      </button>

      <div className="flex gap-2">
        {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
          // Logic to show a sliding window of pages
          const pageNum = currentPage > 3 ? currentPage - 2 + i : i + 1;
          if (pageNum > totalPages) return null;

          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`px-3 py-2 rounded-md transition-colors ${
                currentPage === pageNum
                  ? "bg-primary text-white"
                  : "bg-card shadow-md hover:bg-background floating-card"
              }`}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="px-4 py-2 bg-card rounded-md shadow-md hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed transition-colors floating-card"
      >
        Next
      </button>
    </div>
  );
};