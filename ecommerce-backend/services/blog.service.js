import { Op, fn, col, where as sqWhere } from "sequelize";
import BlogPost from "../models/blogPost.model.js";
import ApiError from "../utils/apiError.js";
import { uploadBuffer, destroyByUrl } from "../utils/cloudinaryMedia.js";
import { slugify } from "../utils/slugify.js";

const CLOUDINARY_FOLDER = "blog";
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_RELATED = 6;

// "admin"/"list" would shadow GET /api/blog/admin/list if used as a post slug.
const RESERVED_SLUGS = new Set([
  "admin", "list", "page", "feed", "rss", "sitemap", "new",
]);

// ---------------------------------------------------------------------------
// missing-table / write-error wrapping (same shape as category.service.js)
// ---------------------------------------------------------------------------

export const isMissingTableError = (err) =>
  /relation .* does not exist/i.test(err?.message || "");

const MIGRATION_HINT =
  "BlogPosts table not found. Run `npx --yes sequelize-cli db:migrate` first.";

export const runBlogWrite = async (fn) => {
  try {
    return await fn();
  } catch (err) {
    if (isMissingTableError(err)) throw new ApiError(503, MIGRATION_HINT);
    if (
      err?.name === "SequelizeUniqueConstraintError" ||
      /blog_posts_slug_lower_uniq/i.test(err?.message || "")
    ) {
      throw new ApiError(409, "A post with this slug already exists.");
    }
    throw err;
  }
};

// ---------------------------------------------------------------------------
// Slug generation
// ---------------------------------------------------------------------------

const generateUniqueBlogSlug = async (title) => {
  const base = slugify(title) || "post";
  let candidate = base;
  let counter = 2;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await BlogPost.findOne({
      where: sqWhere(fn("LOWER", col("slug")), candidate.toLowerCase()),
      attributes: ["id"],
      raw: true,
    });
    if (!existing) return candidate;
    candidate = `${base}-${counter}`;
    counter++;
  }
};

const validateNewSlug = async (rawSlug) => {
  const slug = String(rawSlug || "").trim();

  if (!slug) throw new ApiError(400, "Slug is required");

  if (!SLUG_PATTERN.test(slug)) {
    throw new ApiError(
      400,
      "Slug can only use lowercase letters, digits, and hyphens (e.g. car-cover-buying-guide)"
    );
  }

  if (slug.length > 120) throw new ApiError(400, "Slug cannot be longer than 120 characters");

  if (RESERVED_SLUGS.has(slug)) {
    throw new ApiError(400, `"${slug}" is reserved, please use a different slug`);
  }

  const existing = await BlogPost.findOne({
    where: sqWhere(fn("LOWER", col("slug")), slug.toLowerCase()),
    attributes: ["id", "slug"],
    raw: true,
  });
  if (existing) {
    throw new ApiError(409, `Post "${existing.slug}" already exists`);
  }

  return slug;
};

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

// Storefront-facing — never throws, mirrors listCategoriesService's
// forgiving-on-missing-table behaviour so /blog and /sitemap.xml stay up
// even if the frontend deploys before the migration runs.
export const listPublishedPostsService = async (queryPage, queryLimit) => {
  const page = Math.max(1, parseInt(queryPage, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(queryLimit, 10) || 12));
  const offset = (page - 1) * limit;

  try {
    const data = await BlogPost.findAndCountAll({
      where: { status: "published", publishedAt: { [Op.ne]: null } },
      attributes: { exclude: ["body"] },
      order: [["publishedAt", "DESC"], ["id", "DESC"]],
      limit,
      offset,
    });

    return {
      totalItems: data.count,
      totalPages: Math.max(1, Math.ceil(data.count / limit)),
      currentPage: page,
      posts: data.rows,
    };
  } catch (err) {
    if (isMissingTableError(err)) {
      console.error(`BlogPosts table missing, returning an empty list. ${MIGRATION_HINT}`);
      return { totalItems: 0, totalPages: 1, currentPage: page, posts: [] };
    }
    throw err;
  }
};

export const getPublishedPostBySlugService = async (slug) => {
  const post = await BlogPost.findOne({
    where: {
      [Op.and]: [
        { status: "published" },
        sqWhere(fn("LOWER", col("slug")), String(slug || "").toLowerCase()),
      ],
    },
  });
  if (!post) throw new ApiError(404, "Post not found");
  return post;
};

export const getAdminPostsService = async () => {
  return BlogPost.findAll({
    attributes: { exclude: ["body"] },
    order: [["updatedAt", "DESC"]],
  });
};

export const getAdminPostByIdService = async (id) => {
  const post = await BlogPost.findByPk(id);
  if (!post) throw new ApiError(404, "Post not found");
  return post;
};

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

export const createBlogPostService = async (body, file) => {
  const title = String(body.title || "").trim();
  if (!title) throw new ApiError(400, "Title is required");

  if (!hasVisibleText(body.body)) {
    throw new ApiError(400, "Body is required");
  }

  const slug = body.slug
    ? await validateNewSlug(body.slug)
    : await generateUniqueBlogSlug(title);

  let coverImage = null;
  if (file?.buffer) {
    coverImage = await uploadBuffer({ buffer: file.buffer, folder: CLOUDINARY_FOLDER });
  }

  const status = body.status === "published" ? "published" : "draft";

  const post = await BlogPost.create({
    slug,
    title,
    excerpt: body.excerpt ? String(body.excerpt).trim() : buildExcerpt(body.body),
    body: body.body,
    coverImage,
    coverImageAlt: body.coverImageAlt ? String(body.coverImageAlt).trim() : null,
    status,
    publishedAt: status === "published" ? new Date() : null,
    author: body.author ? String(body.author).trim() : "Fancy Store",
    metaTitle: body.metaTitle ? String(body.metaTitle).trim() : null,
    metaDescription: body.metaDescription ? String(body.metaDescription).trim() : null,
    relatedProductSlugs: parseSlugArray(body.relatedProductSlugs),
    relatedCategorySlugs: parseSlugArray(body.relatedCategorySlugs),
  });

  return post;
};

export const updateBlogPostService = async (id, body, file) => {
  const post = await BlogPost.findByPk(id);
  if (!post) throw new ApiError(404, "Post not found");

  // Slug immutable — same reasoning as category/product slugs: renaming
  // breaks an already-indexed URL, and sitemap.xml/generateStaticParams
  // won't know to redirect it.
  if (body.slug !== undefined && String(body.slug).trim() !== post.slug) {
    throw new ApiError(
      400,
      "Slug cannot be changed. This would break the indexed URL. Create a new post instead."
    );
  }

  const updates = {};

  if (body.title !== undefined) {
    const title = String(body.title).trim();
    if (!title) throw new ApiError(400, "Title cannot be empty");
    updates.title = title;
  }

  if (body.body !== undefined) {
    if (!hasVisibleText(body.body)) throw new ApiError(400, "Body cannot be empty");
    updates.body = body.body;
  }

  if (body.excerpt !== undefined) {
    const excerpt = String(body.excerpt).trim();
    updates.excerpt = excerpt || buildExcerpt(updates.body ?? post.body);
  }

  if (body.coverImageAlt !== undefined) {
    updates.coverImageAlt = String(body.coverImageAlt).trim() || null;
  }
  if (body.author !== undefined) {
    updates.author = String(body.author).trim() || "Fancy Store";
  }
  if (body.metaTitle !== undefined) {
    updates.metaTitle = String(body.metaTitle).trim() || null;
  }
  if (body.metaDescription !== undefined) {
    updates.metaDescription = String(body.metaDescription).trim() || null;
  }
  if (body.relatedProductSlugs !== undefined) {
    updates.relatedProductSlugs = parseSlugArray(body.relatedProductSlugs);
  }
  if (body.relatedCategorySlugs !== undefined) {
    updates.relatedCategorySlugs = parseSlugArray(body.relatedCategorySlugs);
  }

  if (body.status !== undefined) {
    const nextStatus = body.status === "published" ? "published" : "draft";
    updates.status = nextStatus;
    // Publish-date rule: set once on first publish, never reset on
    // republish — a typo-fix draft->publish round-trip shouldn't churn the
    // sitemap's freshness signal.
    if (nextStatus === "published" && !post.publishedAt) {
      updates.publishedAt = new Date();
    }
  }

  if (file?.buffer) {
    const previousImage = post.coverImage;
    updates.coverImage = await uploadBuffer({ buffer: file.buffer, folder: CLOUDINARY_FOLDER });

    if (previousImage?.includes("res.cloudinary.com")) {
      try {
        await destroyByUrl({ url: previousImage, folder: CLOUDINARY_FOLDER });
      } catch (err) {
        console.error("Old blog cover image cleanup failed:", err.message);
      }
    }
  }

  await post.update(updates);
  return post;
};

export const deleteBlogPostService = async (id) => {
  const post = await BlogPost.findByPk(id);
  if (!post) throw new ApiError(404, "Post not found");

  if (post.coverImage?.includes("res.cloudinary.com")) {
    try {
      await destroyByUrl({ url: post.coverImage, folder: CLOUDINARY_FOLDER });
    } catch (err) {
      console.error("Blog cover image cleanup failed:", err.message);
    }
  }

  await post.destroy();
  return { post, message: "Post deleted." };
};

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

// Quill emits "<p><br></p>" for an empty editor — truthiness alone would
// accept that as valid content.
function hasVisibleText(html) {
  return String(html || "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim().length > 0;
}

function stripHtml(html) {
  return String(html || "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildExcerpt(html) {
  const text = stripHtml(html);
  if (!text) return null;
  return text.length > 157 ? `${text.slice(0, 157)}…` : text;
}

// multipart sends this as either a real array (rare) or a JSON string.
// Never throws on malformed input — falls back to null.
function parseSlugArray(value) {
  if (value === undefined) return undefined;

  let arr = value;
  if (typeof value === "string") {
    try {
      arr = JSON.parse(value);
    } catch {
      return null;
    }
  }
  if (!Array.isArray(arr)) return null;

  const seen = new Set();
  const cleaned = [];
  for (const item of arr) {
    const s = String(item || "").trim();
    if (!s || seen.has(s.toLowerCase())) continue;
    seen.add(s.toLowerCase());
    cleaned.push(s);
    if (cleaned.length >= MAX_RELATED) break;
  }

  return cleaned.length > 0 ? cleaned : null;
}
