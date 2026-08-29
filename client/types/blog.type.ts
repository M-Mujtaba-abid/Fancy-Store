export type BlogStatus = "draft" | "published";

// List endpoints exclude `body` (bandwidth — could be 1000+ words).
export interface BlogPostListItem {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  coverImageAlt: string | null;
  status: BlogStatus;
  publishedAt: string | null;
  author: string;
  metaTitle: string | null;
  metaDescription: string | null;
  relatedProductSlugs: string[] | null;
  relatedCategorySlugs: string[] | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface BlogPost extends BlogPostListItem {
  body: string;
}

export interface BlogPostsPage {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  posts: BlogPostListItem[];
}

export interface BlogPostMutationInput {
  slug?: string; // only for create — update rejects a changed slug
  title: string;
  excerpt?: string;
  body: string;
  coverImageAlt?: string;
  author?: string;
  status?: BlogStatus;
  metaTitle?: string;
  metaDescription?: string;
  relatedProductSlugs?: string[];
  relatedCategorySlugs?: string[];
  coverImageFile?: File | null;
}

export interface BlogDeleteResult {
  post: BlogPost;
  message: string;
}
