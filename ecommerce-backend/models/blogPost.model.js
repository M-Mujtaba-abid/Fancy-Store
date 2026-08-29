import { Model, DataTypes } from "sequelize";
import sequelize from "../config/db.js";

// SEO content-marketing posts (buying guides, articles). These capture
// searches product pages can't rank for, and link to products/categories to
// pass authority to the commercial pages.
//
// Same rule as Category: no Sequelize association here. Related
// products/categories are stored as plain slug strings in
// `relatedProductSlugs`/`relatedCategorySlugs`, not a foreign key. This way,
// if a product is deleted, it just disappears from the "shop this" list
// instead of breaking the whole article.
class BlogPost extends Model {}

BlogPost.init(
  {
    // Hyphenated, immutable once set (services/blog.service.js enforces).
    // Case-insensitive uniqueness comes from a DB-level LOWER(slug) index
    // (migrations/20260830090000-create-blog-posts.cjs).
    slug: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    // Listing card copy + metaDescription fallback. Auto-derived from body
    // if left blank at creation time.
    excerpt: {
      type: DataTypes.STRING(300),
      allowNull: true,
    },
    // Quill HTML.
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    coverImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    coverImageAlt: {
      type: DataTypes.STRING(160),
      allowNull: true,
    },
    // 'draft' | 'published'
    status: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: "draft",
    },
    // Set once on first publish, never reset on republish — see
    // updateBlogPostService for the exact rule (keeps sitemap freshness
    // signal honest).
    publishedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    author: {
      type: DataTypes.STRING(80),
      allowNull: false,
      defaultValue: "Fancy Store",
    },
    metaTitle: {
      type: DataTypes.STRING(70),
      allowNull: true,
    },
    metaDescription: {
      type: DataTypes.STRING(180),
      allowNull: true,
    },
    // string[], max 6 — see parseSlugArray in blog.service.js
    relatedProductSlugs: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    relatedCategorySlugs: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "BlogPost",
    tableName: "BlogPosts",
  }
);

export default BlogPost;
