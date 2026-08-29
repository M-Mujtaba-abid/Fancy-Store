import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import {
  listPublishedPostsService,
  getPublishedPostBySlugService,
  getAdminPostsService,
  getAdminPostByIdService,
  createBlogPostService,
  updateBlogPostService,
  deleteBlogPostService,
  runBlogWrite,
} from "../services/blog.service.js";

// GET /api/blog — public, published only
export const getBlogPosts = asyncHandler(async (req, res) => {
  const data = await listPublishedPostsService(req.query.page, req.query.limit);
  res.status(200).json(new ApiResponse(200, data, "Blog posts fetched"));
});

// GET /api/blog/:slug — public
export const getBlogPostBySlug = asyncHandler(async (req, res) => {
  const data = await getPublishedPostBySlugService(req.params.slug);
  res.status(200).json(new ApiResponse(200, data, "Blog post fetched"));
});

// GET /api/blog/admin/list — admin, all statuses
export const getAdminBlogPosts = asyncHandler(async (req, res) => {
  const data = await getAdminPostsService();
  res.status(200).json(new ApiResponse(200, data, "Admin blog posts fetched"));
});

// GET /api/blog/admin/:id — admin, full row incl. body
export const getAdminBlogPostById = asyncHandler(async (req, res) => {
  const data = await getAdminPostByIdService(req.params.id);
  res.status(200).json(new ApiResponse(200, data, "Blog post fetched"));
});

// POST /api/blog — admin
export const createBlogPost = asyncHandler(async (req, res) => {
  const data = await runBlogWrite(() => createBlogPostService(req.body, req.file));
  res.status(201).json(new ApiResponse(201, data, "Blog post created"));
});

// PATCH /api/blog/:id — admin
export const updateBlogPost = asyncHandler(async (req, res) => {
  const data = await runBlogWrite(() => updateBlogPostService(req.params.id, req.body, req.file));
  res.status(200).json(new ApiResponse(200, data, "Blog post updated"));
});

// DELETE /api/blog/:id — admin
export const deleteBlogPost = asyncHandler(async (req, res) => {
  const result = await runBlogWrite(() => deleteBlogPostService(req.params.id));
  res.status(200).json(new ApiResponse(200, result, result.message));
});
