"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  useAdminBlogPosts,
  useAdminBlogPost,
  useDeleteBlogPost,
} from "@/hooks/useBlog";
import type { BlogPostListItem } from "@/types/blog.type";
import BlogPostForm from "./BlogPostForm";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  ImageOff,
  ExternalLink,
  Loader2,
} from "lucide-react";

const BlogClient = () => {
  const { data: posts = [], isLoading, isError } = useAdminBlogPosts();
  const deletePost = useDeleteBlogPost();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const { data: editingPost, isLoading: isLoadingEditingPost } = useAdminBlogPost(
    editingId ?? undefined
  );

  const openCreate = () => {
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (post: BlogPostListItem) => {
    setEditingId(post.id);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
  };

  const handleDelete = async (post: BlogPostListItem) => {
    const confirmed = window.confirm(
      `"${post.title}" will be permanently deleted, and /blog/${post.slug} will start showing a 404. To only hide it from the storefront, set its status to "Draft" instead (Edit). Continue?`
    );
    if (!confirmed) return;
    await deletePost.mutateAsync(post.id).catch(() => {});
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-main">Blog</h1>
          <p className="text-sm text-text-muted mt-1">
            SEO content: buying guides and articles that link to products and categories.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus size={18} />
          New Post
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : isError ? (
        <div className="text-center py-20 text-red-500">Could not load blog posts.</div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-background text-text-muted text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Cover</th>
                  <th className="text-left px-4 py-3 font-semibold">Title</th>
                  <th className="text-left px-4 py-3 font-semibold">Slug</th>
                  <th className="text-center px-4 py-3 font-semibold">Status</th>
                  <th className="text-left px-4 py-3 font-semibold">Published</th>
                  <th className="text-right px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-background shrink-0">
                        {post.coverImage ? (
                          <Image
                            src={post.coverImage}
                            alt={post.coverImageAlt || post.title}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageOff size={16} className="text-text-muted/50" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-text-main">{post.title}</div>
                      {post.excerpt && (
                        <div className="text-xs text-text-muted line-clamp-1">{post.excerpt}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs bg-background px-2 py-1 rounded border border-border">
                        {post.slug}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          post.status === "published"
                            ? "bg-green-500/10 text-green-600"
                            : "bg-text-muted/10 text-text-muted"
                        }`}
                      >
                        {post.status === "published" ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-muted">
                      {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {post.status === "published" && (
                          <Link
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            className="p-2 rounded-lg hover:bg-background text-text-muted hover:text-primary transition-colors"
                            title="View"
                          >
                            <ExternalLink size={15} />
                          </Link>
                        )}
                        <button
                          onClick={() => openEdit(post)}
                          className="p-2 rounded-lg hover:bg-background text-text-muted hover:text-primary transition-colors"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(post)}
                          disabled={deletePost.isPending}
                          className="p-2 rounded-lg hover:bg-background text-text-muted hover:text-red-500 transition-colors disabled:opacity-40"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {posts.length === 0 && (
            <div className="text-center py-16 text-text-muted">No blog posts yet.</div>
          )}
        </div>
      )}

      {modalOpen && (
        // The outer overlay itself scrolls. Putting max-h/overflow only on the
        // inner div was cutting off the blog form (Quill's 480px editor plus
        // nine more fields) on smaller/laptop screens: the content grew taller
        // than 90vh, and the inner overflow-y-auto did not reliably kick in.
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm">
          <div className="min-h-full flex items-start sm:items-center justify-center p-4">
            <div className="bg-card border border-border rounded-xl w-full max-w-4xl my-8 sm:my-12">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card z-10 rounded-t-xl">
                <h2 className="font-bold text-text-main">
                  {editingId ? "Edit Post" : "New Post"}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-1.5 rounded-lg hover:bg-background text-text-muted"
                >
                  <X size={18} />
                </button>
              </div>

              {editingId && isLoadingEditingPost ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="animate-spin text-primary" size={32} />
                </div>
              ) : (
                <BlogPostForm
                  key={editingId ?? "new"}
                  post={editingId ? editingPost ?? null : null}
                  onDone={closeModal}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogClient;
