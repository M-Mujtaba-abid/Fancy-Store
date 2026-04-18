import sequelize from "../config/db.js";
import Product from "../models/product.model.js";
import cloudinary from "../utils/cloudinary.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import { Op } from "sequelize";

// ============================================================
// ✅ PAGINATION HELPERS
// ============================================================
const getPaginationData = (queryPage, queryLimit, defaultLimit = 10) => {
  const page = parseInt(queryPage) || 1;
  const limit = parseInt(queryLimit) || defaultLimit;
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

const formatPagingResponse = (data, page, limit) => {
  const { count: totalItems, rows: products } = data;
  const totalPages = Math.ceil(totalItems / limit);
  return { totalItems, totalPages, currentPage: page, products };
};

// ============================================================
// ✅ PRODUCT CONTROLLERS
// ============================================================

// 1. Add Product
export const addProduct = asyncHandler(async (req, res) => {
  const { 
    name, description, price, stock, category, 
    carModel, color, material, isFeatured, isNewArrival, isOnSale, discountPrice 
  } = req.body;

  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, "At least one image file is required");
  }

  const uploadedImages = await Promise.all(
    req.files.map((file) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "products" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );
        stream.end(file.buffer);
      });
    })
  );

  const product = await Product.create({
    name,
    description,
    price,
    stock,
    category,
    carModel,
    color,
    material,
    isFeatured: isFeatured === 'true' || isFeatured === true,
    isNewArrival: isNewArrival === 'true' || isNewArrival === true,
    isOnSale: isOnSale === 'true' || isOnSale === true,
    discountPrice: discountPrice || 0,
    imageUrl: uploadedImages[0],
    images: uploadedImages,
  });

  res.status(201).json(new ApiResponse(201, product, "Product added successfully"));
});

// 2. Search Products (Custom Limit: 10)
export const searchProducts = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q) throw new ApiError(400, "Search query is required");

  const { page, limit, offset } = getPaginationData(req.query.page, req.query.limit, 10);
  const term = `%${q.toLowerCase()}%`;

  const data = await Product.findAndCountAll({
    where: {
      [Op.or]: [
        { name: { [Op.iLike]: term } },
        { description: { [Op.iLike]: term } },
        { carModel: { [Op.iLike]: term } }
      ],
    },
    limit,
    offset,
    order: [['createdAt', 'DESC']]
  });

  const response = formatPagingResponse(data, page, limit);
  res.status(200).json(new ApiResponse(200, response, "Search results fetched"));
});

// 3. Get Featured Products (Custom Limit: 4 - Perfect for Home Sliders)
export const getFeaturedProducts = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPaginationData(req.query.page, req.query.limit, 4);

  const data = await Product.findAndCountAll({ 
    where: { isFeatured: true },
    limit,
    offset,
    order: [['createdAt', 'DESC']]
  });

  const response = formatPagingResponse(data, page, limit);
  res.status(200).json(new ApiResponse(200, response, "Featured products fetched"));
});

// 4. Get New Arrivals (Custom Limit: 8)
export const getNewArrivals = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPaginationData(req.query.page, req.query.limit, 8);

  const data = await Product.findAndCountAll({ 
    where: { isNewArrival: true },
    limit,
    offset,
    order: [['createdAt', 'DESC']]
  });

  const response = formatPagingResponse(data, page, limit);
  res.status(200).json(new ApiResponse(200, response, "New Arrivals fetched"));
});

// 5. Get On Sale Products (Custom Limit: 10)
export const getOnSaleProducts = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPaginationData(req.query.page, req.query.limit, 10);

  const data = await Product.findAndCountAll({ 
    where: { isOnSale: true },
    limit,
    offset,
    order: [['createdAt', 'DESC']]
  });

  const response = formatPagingResponse(data, page, limit);
  res.status(200).json(new ApiResponse(200, response, "Sale products fetched"));
});

// 6. Get All Products (Custom Limit: 12)
export const getProducts = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPaginationData(req.query.page, req.query.limit, 12);

  const data = await Product.findAndCountAll({
    limit,
    offset,
    order: [['createdAt', 'DESC']]
  });

  const response = formatPagingResponse(data, page, limit);
  res.status(200).json(new ApiResponse(200, response, "All products fetched successfully"));
});

// 7. Get Single Product by ID
export const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findByPk(id);
  if (!product) throw new ApiError(404, "Product not found");
  res.status(200).json(new ApiResponse(200, product, "Product fetched successfully"));
});

// 8. Update Product
export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const product = await Product.findByPk(id);
  if (!product) throw new ApiError(404, "Product not found");

  if (req.files && req.files.length > 0) {
    const uploadedImages = await Promise.all(
      req.files.map((file) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "products" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result.secure_url);
            }
          );
          stream.end(file.buffer);
        });
      })
    );
    updateData.images = uploadedImages;
    updateData.imageUrl = uploadedImages[0];
  }
console.log("Update Data:", updateData); // Ye check karein ke isme 'name' key mojood hai?
  await product.update(updateData);
  res.status(200).json(new ApiResponse(200, product, "Product updated successfully"));
});

// 9. Delete Product with Full Cloudinary Cleanup
export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findByPk(id);
  if (!product) throw new ApiError(404, "Product not found");

  // Gallery ki sari images delete karo
  const imageList = product.images || [];
  if (product.imageUrl && !imageList.includes(product.imageUrl)) {
    imageList.push(product.imageUrl);
  }

  for (const url of imageList) {
    const publicId = url.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(`products/${publicId}`);
  }

  await product.destroy();
  res.status(200).json(new ApiResponse(200, null, "Product and its images deleted from Cloudinary and DB"));
});

// 10. Total Count
export const getTotalProducts = asyncHandler(async (req, res) => {
  const count = await Product.count();
  res.status(200).json(new ApiResponse(200, { total: count }, "Count fetched"));
});