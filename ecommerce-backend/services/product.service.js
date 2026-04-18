import Product from "../models/product.model.js";
import cloudinary from "../utils/cloudinary.js";
import ApiError from "../utils/apiError.js";
import { Op } from "sequelize";

// ============================================================
// ✅ PAGINATION HELPERS
// ============================================================
export const getPaginationData = (queryPage, queryLimit, defaultLimit = 10) => {
  const page = parseInt(queryPage) || 1;
  const limit = parseInt(queryLimit) || defaultLimit;
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

export const formatPagingResponse = (data, page, limit) => {
  const { count: totalItems, rows: products } = data;
  const totalPages = Math.ceil(totalItems / limit);
  return { totalItems, totalPages, currentPage: page, products };
};

// ============================================================
// ✅ CLOUDINARY UPLOAD HELPER
// ============================================================
export const uploadImagesToCloudinary = (files) => {
  return Promise.all(
    files.map((file) =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "products" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );
        stream.end(file.buffer);
      })
    )
  );
};

// ============================================================
// ✅ PRODUCT SERVICES
// ============================================================

// 1. Add Product
export const addProductService = async (body, files) => {
  if (!files || files.length === 0) throw new ApiError(400, "At least one image file is required");

  const {
    name, description, price, stock, category,
    carModel, color, material, isFeatured,
    isNewArrival, isOnSale, discountPrice,
  } = body;

  const uploadedImages = await uploadImagesToCloudinary(files);

  return await Product.create({
    name, description, price, stock, category,
    carModel, color, material,
    isFeatured: isFeatured === "true" || isFeatured === true,
    isNewArrival: isNewArrival === "true" || isNewArrival === true,
    isOnSale: isOnSale === "true" || isOnSale === true,
    discountPrice: discountPrice || 0,
    imageUrl: uploadedImages[0],
    images: uploadedImages,
  });
};

// 2. Search Products
export const searchProductsService = async (q, queryPage, queryLimit) => {
  if (!q) throw new ApiError(400, "Search query is required");

  const { page, limit, offset } = getPaginationData(queryPage, queryLimit, 10);
  const term = `%${q.toLowerCase()}%`;

  const data = await Product.findAndCountAll({
    where: {
      [Op.or]: [
        { name: { [Op.iLike]: term } },
        { description: { [Op.iLike]: term } },
        { carModel: { [Op.iLike]: term } },
      ],
    },
    limit, offset,
    order: [["createdAt", "DESC"]],
  });

  return formatPagingResponse(data, page, limit);
};

// 3. Get Featured Products
export const getFeaturedProductsService = async (queryPage, queryLimit) => {
  const { page, limit, offset } = getPaginationData(queryPage, queryLimit, 4);

  const data = await Product.findAndCountAll({
    where: { isFeatured: true },
    limit, offset,
    order: [["createdAt", "DESC"]],
  });

  return formatPagingResponse(data, page, limit);
};

// 4. Get New Arrivals
export const getNewArrivalsService = async (queryPage, queryLimit) => {
  const { page, limit, offset } = getPaginationData(queryPage, queryLimit, 8);

  const data = await Product.findAndCountAll({
    where: { isNewArrival: true },
    limit, offset,
    order: [["createdAt", "DESC"]],
  });

  return formatPagingResponse(data, page, limit);
};

// 5. Get On Sale Products
export const getOnSaleProductsService = async (queryPage, queryLimit) => {
  const { page, limit, offset } = getPaginationData(queryPage, queryLimit, 10);

  const data = await Product.findAndCountAll({
    where: { isOnSale: true },
    limit, offset,
    order: [["createdAt", "DESC"]],
  });

  return formatPagingResponse(data, page, limit);
};

// 6. Get All Products
export const getProductsService = async (queryPage, queryLimit) => {
  const { page, limit, offset } = getPaginationData(queryPage, queryLimit, 12);

  const data = await Product.findAndCountAll({
    limit, offset,
    order: [["createdAt", "DESC"]],
  });

  return formatPagingResponse(data, page, limit);
};

// 7. Get Single Product
export const getProductByIdService = async (id) => {
  const product = await Product.findByPk(id);
  if (!product) throw new ApiError(404, "Product not found");
  return product;
};

// 8. Update Product
export const updateProductService = async (id, body, files) => {
  const product = await Product.findByPk(id);
  if (!product) throw new ApiError(404, "Product not found");

  const updateData = { ...body };

  if (files && files.length > 0) {
    const uploadedImages = await uploadImagesToCloudinary(files);
    updateData.images = uploadedImages;
    updateData.imageUrl = uploadedImages[0];
  }

  console.log("Update Data:", updateData);
  await product.update(updateData);
  return product;
};

// 9. Delete Product
export const deleteProductService = async (id) => {
  const product = await Product.findByPk(id);
  if (!product) throw new ApiError(404, "Product not found");

  const imageList = [...(product.images || [])];
  if (product.imageUrl && !imageList.includes(product.imageUrl)) {
    imageList.push(product.imageUrl);
  }

  for (const url of imageList) {
    const publicId = url.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(`products/${publicId}`);
  }

  await product.destroy();
};

// 10. Total Count
export const getTotalProductsService = async () => {
  return await Product.count();
};