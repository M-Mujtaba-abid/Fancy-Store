import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import { CATEGORIES } from "../constants/index.js";
import {
  addProductService,
  searchProductsService,
  getFeaturedProductsService,
  getNewArrivalsService,
  getOnSaleProductsService,
  getProductsService,
  getProductByIdService,
  updateProductService,
  deleteProductService,
  getTotalProductsService,
  getCarProductsService,
  getBikeProductsService,
  getProductsByCategoryService,
  getProductsByFilterService,
  getRelatedProductsService,
} from "../services/product.service.js";
import ApiError from "../utils/apiError.js";

export const addProduct = asyncHandler(async (req, res) => {
  const product = await addProductService(req.body, req.files);
  res.status(201).json(new ApiResponse(201, product, "Product added successfully"));
});

export const searchProducts = asyncHandler(async (req, res) => {
  const data = await searchProductsService(req.query.q, req.query.page, req.query.limit);
  res.status(200).json(new ApiResponse(200, data, "Search results fetched"));
});

export const getFeaturedProducts = asyncHandler(async (req, res) => {
  const data = await getFeaturedProductsService(req.query.page, req.query.limit);
  res.status(200).json(new ApiResponse(200, data, "Featured products fetched"));
});

export const getNewArrivals = asyncHandler(async (req, res) => {
  const data = await getNewArrivalsService(req.query.page, req.query.limit);
  res.status(200).json(new ApiResponse(200, data, "New Arrivals fetched"));
});

export const getOnSaleProducts = asyncHandler(async (req, res) => {
  const data = await getOnSaleProductsService(req.query.page, req.query.limit);
  res.status(200).json(new ApiResponse(200, data, "Sale products fetched"));
});

export const getProducts = asyncHandler(async (req, res) => {
  const data = await getProductsService(req.query.page, req.query.limit);
  res.status(200).json(new ApiResponse(200, data, "All products fetched successfully"));
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = await getProductByIdService(req.params.id);
  res.status(200).json(new ApiResponse(200, product, "Product fetched successfully"));
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await updateProductService(req.params.id, req.body, req.files);
  res.status(200).json(new ApiResponse(200, product, "Product updated successfully"));
});

export const deleteProduct = asyncHandler(async (req, res) => {
  await deleteProductService(req.params.id);
  res.status(200).json(new ApiResponse(200, null, "Product and its images deleted from Cloudinary and DB"));
});

export const getTotalProducts = asyncHandler(async (req, res) => {
  const count = await getTotalProductsService();
  res.status(200).json(new ApiResponse(200, { total: count }, "Count fetched"));
});

// Get Cars
export const getCarProducts = asyncHandler(async (req, res) => {
  const data = await getCarProductsService(req.query.page, req.query.limit);
  res.status(200).json(new ApiResponse(200, data, "Car products fetched"));
});

// Get Bikes
export const getBikeProducts = asyncHandler(async (req, res) => {
  const data = await getBikeProductsService(req.query.page, req.query.limit);
  res.status(200).json(new ApiResponse(200, data, "Bike products fetched"));
});



// ✅ 1 Generic Controller — sab categories handle karega
export const getProductsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;

  // Valid category check karo
  if (!Object.values(CATEGORIES).includes(category)) {
    throw new ApiError(400, "Invalid category");
  }

  const data = await getProductsByCategoryService(category, req.query.page, req.query.limit);
  res.status(200).json(new ApiResponse(200, data, `${category} products fetched`));
});

// ✅ Advanced Filter — vehicleType + category + subCategory
export const getProductsByFilter = asyncHandler(async (req, res) => {
  const { vehicleType, category, subCategory } = req.query;
  const data = await getProductsByFilterService(
    { vehicleType, category, subCategory },
    req.query.page,
    req.query.limit
  );
  res.status(200).json(new ApiResponse(200, data, "Filtered products fetched"));
});

export const getRelatedProducts = asyncHandler(async (req, res) => {
  const data = await getRelatedProductsService(req.params.id);
  res.status(200).json(new ApiResponse(200, data, "Related products fetched"));
});