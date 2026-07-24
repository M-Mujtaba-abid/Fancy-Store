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
  buildProductTextForAI,
  addVariantService,
  updateVariantService,
  deleteVariantService,
} from "../services/product.service.js";
import ApiError from "../utils/apiError.js";
import Product from "../models/product.model.js";
import { generateEmbedding } from "../utils/ai.util.js";

export const addProduct = asyncHandler(async (req, res) => {
  const product = await addProductService(req.body, req.files);
  res
    .status(201)
    .json(new ApiResponse(201, product, "Product added successfully"));
});

export const searchProducts = asyncHandler(async (req, res) => {
  const data = await searchProductsService(
    req.query.q,
    req.query.page,
    req.query.limit,
  );
  res.status(200).json(new ApiResponse(200, data, "Search results fetched"));
});

export const getFeaturedProducts = asyncHandler(async (req, res) => {
  const data = await getFeaturedProductsService(
    req.query.page,
    req.query.limit,
  );
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
  res
    .status(200)
    .json(new ApiResponse(200, data, "All products fetched successfully"));
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = await getProductByIdService(req.params.id);
  res
    .status(200)
    .json(new ApiResponse(200, product, "Product fetched successfully"));
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await updateProductService(
    req.params.id,
    req.body,
    req.files,
  );
  res
    .status(200)
    .json(new ApiResponse(200, product, "Product updated successfully"));
});

export const deleteProduct = asyncHandler(async (req, res) => {
  await deleteProductService(req.params.id);
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        null,
        "Product and its images deleted from Cloudinary and DB",
      ),
    );
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
  const { vehicleType, subCategory, page, limit } = req.query; // Query nikal li

  const normalizedCategory = (category || "").trim().replace(/-/g, "_");

  // Valid category check karo (case-insensitive & hyphen-friendly)
  const validCategories = Object.values(CATEGORIES).map((c) => c.toLowerCase());
  if (
    !validCategories.includes(normalizedCategory.toLowerCase()) &&
    !validCategories.includes(category.toLowerCase())
  ) {
    throw new ApiError(400, "Invalid category");
  }

  const filters = { category: normalizedCategory, vehicleType, subCategory };

  const data = await getProductsByFilterService(filters, page, limit);
  res
    .status(200)
    .json(new ApiResponse(200, data, `${category} products fetched`));
});

// ✅ Advanced Filter — vehicleType + category + subCategory
export const getProductsByFilter = asyncHandler(async (req, res) => {
  const { vehicleType, category, subCategory } = req.query;
  const data = await getProductsByFilterService(
    { vehicleType, category, subCategory },
    req.query.page,
    req.query.limit,
  );
  res.status(200).json(new ApiResponse(200, data, "Filtered products fetched"));
});

export const getRelatedProducts = asyncHandler(async (req, res) => {
  const data = await getRelatedProductsService(req.params.id);
  res.status(200).json(new ApiResponse(200, data, "Related products fetched"));
});

export const syncProductEmbeddings = asyncHandler(async (req, res) => {
  const products = await Product.findAll({ 
    where: { embedding: null } 
  });

  if (!products || products.length === 0) {
    return res.status(200).json({ message: "All products are already vectorized!" });
  }

  let count = 0;
  console.log(`Found ${products.length} products to vectorize. Starting...`);

  for (const product of products) {
    const textToEmbed = buildProductTextForAI(product);
    const vectorArray = await generateEmbedding(textToEmbed, "search_document");
    product.embedding = `[${vectorArray.join(',')}]`;
    await product.save();
    
    count++;
    console.log(`✅ Vectorized (${count}/${products.length}): ${product.name}`);
  }

  res.status(200).json({ 
    success: true, 
    message: `Successfully generated rich embeddings for ${count} products.` 
  });
});

// ================= STANDALONE VARIANT CONTROLLER HANDLERS =================

export const addVariant = asyncHandler(async (req, res) => {
  const variantFile = req.file || (req.files && req.files[0]);
  const variant = await addVariantService(req.params.productId, req.body, variantFile);
  res.status(201).json(new ApiResponse(201, variant, "Product variant added successfully"));
});

export const updateVariant = asyncHandler(async (req, res) => {
  const variantFile = req.file || (req.files && req.files[0]);
  const variant = await updateVariantService(req.params.id, req.body, variantFile);
  res.status(200).json(new ApiResponse(200, variant, "Product variant updated successfully"));
});

export const deleteVariant = asyncHandler(async (req, res) => {
  await deleteVariantService(req.params.id);
  res.status(200).json(new ApiResponse(200, null, "Product variant deleted successfully"));
});