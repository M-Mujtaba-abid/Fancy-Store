import Product from "../models/product.model.js";
import ProductVariant from "../models/productVariant.model.js";
import ApiError from "../utils/apiError.js";
import { Op } from "sequelize";
import {
  uploadManyBuffers,
  destroyManyByUrls,
} from "../utils/cloudinaryMedia.js";
import {
  CATEGORIES,
  VEHICLE_TYPES,
  DEFAULT_LIMITS,
} from "../constants/index.js"; // ✅ import
import { generateEmbedding } from "../utils/ai.util.js"; // ✅ AI Utility Import Karein

// ============================================================
// PAGINATION HELPERS
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
// CLOUDINARY UPLOAD HELPER
// ============================================================
export const uploadImagesToCloudinary = (files) => {
  return uploadManyBuffers({ files, folder: "products" });
};





// ============================================================
// AI EMBEDDING TEXT FORMATTER (Naya Helper)
// ============================================================
export const buildProductTextForAI = (product) => {
  const parts = [];

  // Basic Info
  parts.push(`Product Name: ${product.name}`);
  if (product.category) parts.push(`Category: ${product.category}`);
  if (product.subCategory) parts.push(`Sub-Category: ${product.subCategory}`);

  // Vehicle Compatibility & Specs
  if (product.vehicleType) parts.push(`Vehicle Type: ${product.vehicleType}`);
  if (product.carModel) parts.push(`Compatible Car Model: ${product.carModel}`);
  if (product.color) parts.push(`Color: ${product.color}`);
  if (product.material) parts.push(`Material: ${product.material}`);

  // Pricing & Stock
  parts.push(`Price: Rs ${product.price}`);
  if (product.isOnSale && product.discountPrice) {
    parts.push(`On Sale! Discount Price: Rs ${product.discountPrice}`);
  }
  parts.push(`Stock: ${product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}`);

  // Badges & Ratings
  if (product.isFeatured) parts.push(`Special: Featured Product`);
  if (product.isNewArrival) parts.push(`Special: New Arrival`);
  if (product.averageRating > 0) {
    parts.push(`Rating: ${product.averageRating} out of 5 (${product.totalReviews} reviews)`);
  }

  // Description (Aakhir mein taa ke search keywords match hon)
  if (product.description) parts.push(`Description: ${product.description}`);

  return parts.join(". "); // Sab ko mila kar ek lamba sentence bana diya
};
// ============================================================
// PRODUCT SERVICES
// ============================================================

// 1. Add Product
export const addProductService = async (body, files) => {
  const productFiles = (files || []).filter((f) => f.fieldname === "images");
  if (productFiles.length === 0)
    throw new ApiError(400, "At least one product image file is required");

  const {
    name, description, price, stock, category, subCategory,
    carModel, color, material, isFeatured, isNewArrival,
    isOnSale, discountPrice, vehicleType,
    variants // ✅ FIX 1: 'variant: [variants]' hata kar simple 'variants' likha
  } = body;

  const uploadedImages = await uploadImagesToCloudinary(productFiles);

  const normalizedPrice = Number(price);
  const normalizedStock = Number(stock);
  const normalizedDiscountPrice = Number(discountPrice || 0);

  // STEP 1: Pehle apna exact structured data object ready karein
  const newProductData = {
    name,
    description,
    price: Number.isNaN(normalizedPrice) ? 0 : normalizedPrice,
    stock: Number.isNaN(normalizedStock) ? 0 : normalizedStock,
    category,
    subCategory: subCategory || null,
    carModel,
    color,
    material,
    isFeatured: isFeatured === "true" || isFeatured === true,
    isNewArrival: isNewArrival === "true" || isNewArrival === true,
    isOnSale: isOnSale === "true" || isOnSale === true,
    vehicleType: vehicleType || null,
    discountPrice: Number.isNaN(normalizedDiscountPrice) ? 0 : normalizedDiscountPrice,
    imageUrl: uploadedImages[0],
    images: uploadedImages,
  };

  // ✅ FIX 2: 'const' ko 'let' mein change kiya taake neechay text add ho sake
  let textToEmbed = buildProductTextForAI(newProductData);
  let parsedVariants = [];

  if (variants) {
    // Frontend se FormData mein Array string ban kar aata hai, isliye parse karna parta hai
    parsedVariants = typeof variants === "string" ? JSON.parse(variants) : variants;

    // Upload variant-specific images
    for (let i = 0; i < parsedVariants.length; i++) {
      const v = parsedVariants[i];
      const variantFile = (files || []).find((f) => f.fieldname === `variantImage_${i}`);
      if (variantFile) {
        const variantImageUrl = await uploadBuffer({ buffer: variantFile.buffer, folder: "products" });
        v.imageUrl = variantImageUrl;
      }
    }

    // AI ko batayein ke isme konsi qualities available hain
    const variantNames = parsedVariants.map(v => v.materialName).join(", ");
    textToEmbed += ` Available Qualities/Materials: ${variantNames}.`;
  }

  const vectorArray = await generateEmbedding(textToEmbed, "search_document");
  newProductData.embedding = `[${vectorArray.join(',')}]`;

  // STEP 3: Main Product DB mein Save karein
  const createdProduct = await Product.create(newProductData);

  // 🌟 STEP 4: Variants DB mein Save karein (Agar Admin ne bheje hain)
  if (parsedVariants.length > 0) {
    const variantData = parsedVariants.map((v) => ({
      productId: createdProduct.id,
      materialName: v.materialName,
      price: Number(v.price),
      stock: Number(v.stock || 50),
      imageUrl: v.imageUrl || null,
    }));
    // bulkCreate ek hi dafa mein saare variants insert kar dega
    await ProductVariant.bulkCreate(variantData);
  }

  // ✅ Product ke sath uske variants bhi frontend ko wapas bhej dein
  return await Product.findByPk(createdProduct.id, {
    include: [{ model: ProductVariant, as: 'variants' }]
  });
};

// 2. Search Products
export const searchProductsService = async (q, queryPage, queryLimit) => {
  if (!q) throw new ApiError(400, "Search query is required");

  const { page, limit, offset } = getPaginationData(
    queryPage,
    queryLimit,
    DEFAULT_LIMITS.SEARCH,
  ); // ✅

  const term = `%${q.toLowerCase()}%`;

  const data = await Product.findAndCountAll({
    where: {
      [Op.or]: [
        { name: { [Op.iLike]: term } },
        { description: { [Op.iLike]: term } },
        { carModel: { [Op.iLike]: term } },
      ],
    },
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  return formatPagingResponse(data, page, limit);
};

// 3. Get Featured Products
export const getFeaturedProductsService = async (queryPage, queryLimit) => {
  const { page, limit, offset } = getPaginationData(
    queryPage,
    queryLimit,
    DEFAULT_LIMITS.FEATURED,
  ); // ✅

  const data = await Product.findAndCountAll({
    where: { isFeatured: true },
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  return formatPagingResponse(data, page, limit);
};

// 4. Get New Arrivals
export const getNewArrivalsService = async (queryPage, queryLimit) => {
  const { page, limit, offset } = getPaginationData(
    queryPage,
    queryLimit,
    DEFAULT_LIMITS.NEW_ARRIVALS,
  ); // ✅

  const data = await Product.findAndCountAll({
    where: { isNewArrival: true },
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  return formatPagingResponse(data, page, limit);
};

// 5. Get On Sale Products
export const getOnSaleProductsService = async (queryPage, queryLimit) => {
  const { page, limit, offset } = getPaginationData(
    queryPage,
    queryLimit,
    DEFAULT_LIMITS.ON_SALE,
  ); // ✅

  const data = await Product.findAndCountAll({
    where: { isOnSale: true },
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  return formatPagingResponse(data, page, limit);
};

// 6. Get All Products
export const getProductsService = async (queryPage, queryLimit) => {
  const { page, limit, offset } = getPaginationData(
    queryPage,
    queryLimit,
    DEFAULT_LIMITS.PRODUCTS,
  ); // ✅

  const data = await Product.findAndCountAll({
    limit,
    offset,
    order: [["createdAt", "DESC"]],
    include: [{ model: ProductVariant, as: 'variants' }]
  });

  return formatPagingResponse(data, page, limit);
};

// 7. Get Single Product
export const getProductByIdService = async (id) => {
  const product = await Product.findByPk(id, {
    include: [{ model: ProductVariant, as: 'variants' }]
  });
  if (!product) throw new ApiError(404, "Product not found");
  return product;
};

// 8. Update Product
export const updateProductService = async (id, body, files) => {
  const product = await Product.findByPk(id);
  if (!product) throw new ApiError(404, "Product not found");

  const updateData = { ...body };

  // ✅ Extract variants and remove from updateData to prevent Sequelize errors
  const { variants } = updateData;
  delete updateData.variants;

  // Apki exact Number conversions
  if (updateData.price !== undefined) updateData.price = Number(updateData.price);
  if (updateData.stock !== undefined) updateData.stock = Number(updateData.stock);
  if (updateData.discountPrice !== undefined) updateData.discountPrice = Number(updateData.discountPrice);

  // Apki exact Boolean conversions
  if (updateData.isFeatured !== undefined) updateData.isFeatured = updateData.isFeatured === "true" || updateData.isFeatured === true;
  if (updateData.isNewArrival !== undefined) updateData.isNewArrival = updateData.isNewArrival === "true" || updateData.isNewArrival === true;
  if (updateData.isOnSale !== undefined) updateData.isOnSale = updateData.isOnSale === "true" || updateData.isOnSale === true;

  if (updateData.subCategory === "") updateData.subCategory = null;

  // 1. Parse existingImages from body
  let parsedExistingImages = [];
  if (body.existingImages !== undefined) {
    if (Array.isArray(body.existingImages)) {
      parsedExistingImages = body.existingImages;
    } else if (typeof body.existingImages === "string") {
      parsedExistingImages = body.existingImages
        .split(",")
        .map((url) => url.trim())
        .filter((url) => url.length > 0);
    }
  } else {
    parsedExistingImages = product.images || [];
  }

  // 2. Find and destroy deleted images on Cloudinary
  const imagesToDelete = (product.images || []).filter(
    (url) => !parsedExistingImages.includes(url)
  );
  if (imagesToDelete.length > 0) {
    try {
      await destroyManyByUrls({ urls: imagesToDelete, folder: "products" });
    } catch (cloudErr) {
      console.error("⚠️ Cloudinary image deletion failed (non-fatal):", cloudErr.message);
    }
  }

  // 3. Upload new product gallery files if any are selected
  const productFiles = (files || []).filter((f) => f.fieldname === "images");
  let uploadedImages = [];
  if (productFiles.length > 0) {
    uploadedImages = await uploadImagesToCloudinary(productFiles);
  }

  // 4. Combine remaining images with the new ones
  updateData.images = [...parsedExistingImages, ...uploadedImages];

  // 5. Update primary imageUrl
  if (updateData.images.length > 0) {
    updateData.imageUrl = updateData.images[0];
  } else {
    updateData.imageUrl = null;
  }

  // 6. Clean up the existingImages field
  delete updateData.existingImages;

  // --- VARIANTS PARSING ---
  let parsedVariants = null;
  if (variants !== undefined) {
    parsedVariants = typeof variants === "string" ? JSON.parse(variants) : variants;
  }

  // STEP 1: Purane product ka data naye update data ke sath merge karein
  const mergedProductState = { ...product.toJSON(), ...updateData };

  // STEP 2: Updated data ka AI Text banayein aur Embedding banayein
  try {
    let textToEmbed = buildProductTextForAI(mergedProductState);

    // ✅ AI ko Variants ka naya text dein
    let finalVariantNames = "";
    if (parsedVariants) {
      finalVariantNames = parsedVariants.map(v => v.materialName).join(", ");
    } else {
      // Agar admin ne variants change nahi kiye, toh database wale use karein
      const existingVars = await ProductVariant.findAll({ where: { productId: product.id } });
      finalVariantNames = existingVars.map(v => v.materialName).join(", ");
    }

    if (finalVariantNames) {
      textToEmbed += ` Available Qualities/Materials: ${finalVariantNames}.`;
    }

    const vectorArray = await generateEmbedding(textToEmbed, "search_document");
    updateData.embedding = `[${vectorArray.join(',')}]`;
  } catch (embeddingErr) {
    console.error("⚠️ Embedding generation failed (non-fatal):", embeddingErr.message);
  }

  // STEP 3: DB update karein (Main Product)
  await product.update(updateData);

  // 🌟 STEP 4: VARIANTS SYNC LOGIC (The Magic)
  if (parsedVariants !== null) {
    const existingVariants = await ProductVariant.findAll({ where: { productId: product.id } });
    const newMaterialNames = parsedVariants.map(v => v.materialName);

    // Logic A: Jo purane variants is nayi list mein NAHI hain, unhe DELETE karein
    for (const ev of existingVariants) {
      if (!newMaterialNames.includes(ev.materialName)) {
        // Destroy its image on Cloudinary
        if (ev.imageUrl) {
          try {
            await destroyByUrl({ url: ev.imageUrl, folder: "products" });
          } catch (err) {
            console.error("⚠️ Failed to delete old variant image:", err.message);
          }
        }
        await ev.destroy();
      }
    }

    // Logic B: Jo NAYE hain unhe Create karein, jo PURANE hain unko Update karein
    for (let i = 0; i < parsedVariants.length; i++) {
      const v = parsedVariants[i];
      const ev = existingVariants.find(e => e.materialName === v.materialName);

      // Check if we uploaded a new image for this variant
      const variantFile = (files || []).find((f) => f.fieldname === `variantImage_${i}`);
      let variantImageUrl = v.imageUrl || null;

      if (variantFile) {
        // If there was an old variant image, destroy it
        if (ev && ev.imageUrl) {
          try {
            await destroyByUrl({ url: ev.imageUrl, folder: "products" });
          } catch (err) {
            console.error("⚠️ Failed to delete old variant image:", err.message);
          }
        }
        // Upload new image
        variantImageUrl = await uploadBuffer({ buffer: variantFile.buffer, folder: "products" });
      } else if (v.imageUrl === "" || v.imageUrl === null) {
        // Explicitly removed by admin
        if (ev && ev.imageUrl) {
          try {
            await destroyByUrl({ url: ev.imageUrl, folder: "products" });
          } catch (err) {
            console.error("⚠️ Failed to delete old variant image:", err.message);
          }
        }
        variantImageUrl = null;
      }

      if (ev) {
        // Update existing variant (Saves ID from changing)
        await ev.update({
          price: Number(v.price),
          stock: Number(v.stock || 50),
          imageUrl: variantImageUrl,
        });
      } else {
        // Create new variant
        await ProductVariant.create({
          productId: product.id,
          materialName: v.materialName,
          price: Number(v.price),
          stock: Number(v.stock || 50),
          imageUrl: variantImageUrl,
        });
      }
    }
  }

  // ✅ Return updated product along with its variants
  return await Product.findByPk(product.id, {
    include: [{ model: ProductVariant, as: 'variants' }]
  });
};

// 9. Delete Product
export const deleteProductService = async (id) => {
  const product = await Product.findByPk(id);
  if (!product) throw new ApiError(404, "Product not found");

  const imageList = [...(product.images || [])];
  if (product.imageUrl && !imageList.includes(product.imageUrl)) {
    imageList.push(product.imageUrl);
  }

  // Include all variant images for deletion on Cloudinary
  const variants = await ProductVariant.findAll({ where: { productId: id } });
  variants.forEach((v) => {
    if (v.imageUrl && !imageList.includes(v.imageUrl)) {
      imageList.push(v.imageUrl);
    }
  });

  await destroyManyByUrls({ urls: imageList, folder: "products" });

  await product.destroy();
};

// 10. Total Count
export const getTotalProductsService = async () => {
  return await Product.count();
};

// 11. Get Cars
export const getCarProductsService = async (queryPage, queryLimit) => {
  const { page, limit, offset } = getPaginationData(
    queryPage,
    queryLimit,
    DEFAULT_LIMITS.PRODUCTS,
  );

  const data = await Product.findAndCountAll({
    where: { vehicleType: VEHICLE_TYPES.CAR },
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  return formatPagingResponse(data, page, limit);
};

// 12. Get Bikes
export const getBikeProductsService = async (queryPage, queryLimit) => {
  const { page, limit, offset } = getPaginationData(
    queryPage,
    queryLimit,
    DEFAULT_LIMITS.PRODUCTS,
  );

  const data = await Product.findAndCountAll({
    where: { vehicleType: VEHICLE_TYPES.BIKE },
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  return formatPagingResponse(data, page, limit);
};

// ✅ 1 Generic Function — sab categories handle karega
export const getProductsByCategoryService = async (
  category,
  queryPage,
  queryLimit,
) => {
  const { page, limit, offset } = getPaginationData(
    queryPage,
    queryLimit,
    DEFAULT_LIMITS.PRODUCTS,
  );

  const data = await Product.findAndCountAll({
    where: { category },
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  return formatPagingResponse(data, page, limit);
};

// ✅ Vehicle Type + Category filter — dono saath
export const getProductsByFilterService = async (
  filters,
  queryPage,
  queryLimit,
) => {
  const { page, limit, offset } = getPaginationData(
    queryPage,
    queryLimit,
    DEFAULT_LIMITS.PRODUCTS,
  );

  // Sirf woh filters rakho jo undefined nahi hain
  const where = {};
  if (filters.vehicleType) where.vehicleType = filters.vehicleType;
  if (filters.category) where.category = filters.category;
  if (filters.subCategory) where.subCategory = filters.subCategory;

  const data = await Product.findAndCountAll({
    where,
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  return formatPagingResponse(data, page, limit);
};

// 13. Get Related Products (Amazon/Daraz Style Waterfall Logic)
// 13. Get Related Products (Amazon/Daraz Style Waterfall Logic)
export const getRelatedProductsService = async (productId) => {
  const product = await Product.findByPk(productId);
  if (!product) throw new ApiError(404, "Product not found");

  const limit = 6; // Daraz aksar 6 items dikhata hai slider mein

  // STEP 1: Pehle exact matches dhundo (Same Category + Same Vehicle Type)
  let related = await Product.findAll({
    where: {
      category: product.category,
      vehicleType: product.vehicleType,
      id: { [Op.ne]: productId }, // Current product nikal do
    },
    limit: limit,
    order: [["createdAt", "DESC"]],
  });

  // STEP 2: Agar list puri nahi hui, toh sirf Same Category ke aur products dalo
  if (related.length < limit) {
    const fetchedIds = related.map((p) => p.id);
    fetchedIds.push(productId);

    const categoryMatches = await Product.findAll({
      where: {
        category: product.category,
        id: { [Op.notIn]: fetchedIds }, // Duplicate se bachne ke liye
      },
      limit: limit - related.length,
      order: [["createdAt", "DESC"]],
    });

    related = [...related, ...categoryMatches];
  }

  // STEP 3: Agar abhi bhi jagah bachi hai, toh shop ke New Arrivals ya Featured dikha do
  if (related.length < limit) {
    const finalIds = related.map((p) => p.id);
    finalIds.push(productId);

    const genericMatches = await Product.findAll({
      where: {
        id: { [Op.notIn]: finalIds },
      },
      limit: limit - related.length,
      order: [
        ["isFeatured", "DESC"], // Pehle featured cheezein ayen
        ["createdAt", "DESC"],
      ],
    });

    related = [...related, ...genericMatches];
  }

  return related;
};
