"use client";

import React, { useState } from "react";
import BlogCard from "@/components/shop/blog/BlogCard";
import { useBlogPosts } from "@/hooks/useBlog";
import type { BlogPostListItem } from "@/types/blog.type";

interface BlogListClientProps {
  initialPosts: BlogPostListItem[];
  initialTotalPages: number;
  pageSize: number;
}

/**
 * Page 1 comes in as a prop from the server, so the posts are in the
 * prerendered HTML and Google can see them. Page 2+ is fetched on the
 * client. Same pagination pattern as CategoryClient.
 */
const BlogListClient = ({ initialPosts, initialTotalPages, pageSize }: BlogListClientProps) => {
  const [page, setPage] = useState(1);

  const { data, isFetching, isError } = useBlogPosts(page, pageSize);

  const posts: BlogPostListItem[] = page === 1 ? initialPosts : data?.posts || [];
  const totalPages = page === 1 ? initialTotalPages : data?.totalPages ?? 1;

  const showSkeleton = page !== 1 && isFetching && posts.length === 0;

  if (isError && page !== 1) {
    return (
      <div className="text-center text-red-500 py-10">
        Could not load posts.{" "}
        <button onClick={() => setPage(1)} className="underline hover:no-underline">
          Go back to page 1
        </button>
      </div>
    );
  }

  if (!showSkeleton && posts.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-text-muted">New posts are coming soon.</p>
      </div>
    );
  }

  return (
    <>
      {showSkeleton ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
        </div>
      ) : (
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity ${
            isFetching ? "opacity-60" : "opacity-100"
          }`}
        >
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-12">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || isFetching}
            className="px-4 py-2 rounded-lg border border-border text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-text-muted">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || isFetching}
            className="px-4 py-2 rounded-lg border border-border text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </>
  );
};

export default BlogListClient;
