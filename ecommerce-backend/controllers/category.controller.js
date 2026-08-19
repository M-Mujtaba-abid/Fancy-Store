import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import {
  listCategoriesService,
  getCategoryBySlugService,
  getCategoryCountsService,
  createCategoryService,
  updateCategoryService,
  deleteCategoryService,
  runCategoryWrite,
} from "../services/category.service.js";

// GET /api/categories  — public, sirf active
//
// ⚠️ `data` ek BARE ARRAY hona chahiye, `{ categories: [...] }` nahi.
// client/app/sitemap.js:34 already `payload?.data` ko array maan kar :60 pe
// .map() karta hai, bina try/catch — galat shape = /sitemap.xml 500.
export const getCategories = asyncHandler(async (req, res) => {
  const data = await listCategoriesService({ includeInactive: false });
  res.status(200).json(new ApiResponse(200, data, "Categories fetched"));
});

// GET /api/categories/admin/list — admin, inactive bhi + product counts + orphans
export const getAdminCategories = asyncHandler(async (req, res) => {
  const data = await getCategoryCountsService();
  res.status(200).json(new ApiResponse(200, data, "Admin categories fetched"));
});

// GET /api/categories/:slug — public
export const getCategoryBySlug = asyncHandler(async (req, res) => {
  const data = await getCategoryBySlugService(req.params.slug);
  res.status(200).json(new ApiResponse(200, data, "Category fetched"));
});

// POST /api/categories — admin
// runCategoryWrite: agar migration na chali ho to raw Postgres error ke bajaye
// saaf "migration chalayein" message milta hai
export const createCategory = asyncHandler(async (req, res) => {
  const data = await runCategoryWrite(() =>
    createCategoryService(req.body, req.file)
  );
  res.status(201).json(new ApiResponse(201, data, "Category created"));
});

// PATCH /api/categories/:id — admin
export const updateCategory = asyncHandler(async (req, res) => {
  const data = await runCategoryWrite(() =>
    updateCategoryService(req.params.id, req.body, req.file)
  );
  res.status(200).json(new ApiResponse(200, data, "Category updated"));
});

// DELETE /api/categories/:id — admin (products maujood hon to soft delete)
export const deleteCategory = asyncHandler(async (req, res) => {
  const result = await runCategoryWrite(() =>
    deleteCategoryService(req.params.id)
  );
  res.status(200).json(new ApiResponse(200, result, result.message));
});
