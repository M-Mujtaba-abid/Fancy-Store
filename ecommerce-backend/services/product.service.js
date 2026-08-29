import Product from "../models/product.model.js";
import ProductVariant from "../models/productVariant.model.js";
import ApiError from "../utils/apiError.js";
import { Op } from "sequelize";
import {
  uploadManyBuffers,
  destroyManyByUrls,
  uploadBuffer,
  destroyByUrl,
} from "../utils/cloudinaryMedia.js";
import {
  VEHICLE_TYPES,
  DEFAULT_LIMITS,
} from "../constants/index.js"; // ✅ import
import { generateEmbedding } from "../utils/ai.util.js"; // ✅ AI Utility Import Karein
import { validateVariantsPayload } from "../validations/variant.validation.js";
import { slugify } from "../utils/slugify.js";

// ============================================================
// SLUG GENERATION (SEO-friendly /products/<slug> URLs)
// ============================================================
// Naam se slug banata hai aur collision hone par "-2", "-3" append karta hai.
// Sirf creation time pe call hota hai — update par slug kabhi nahi badalta,
// warna already-indexed URLs 404 ho jayen.
const generateUniqueSlug = async (name) => {
  const base = slugify(name) || "product";
  let candidate = base;
  let counter = 2;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await Product.findOne({ where: { slug: candidate } });
    if (!existing) return candidate;
    candidate = `${base}-${counter}`;
    counter++;
  }
};

// ============================================================
// LIKE / ILIKE ESCAPING
// ============================================================
// Postgres LIKE/ILIKE mein `_` single-char wildcard aur `%` multi-char wildcard
// hai (default ESCAPE character backslash). Hamare category slugs mein
// underscore hota hai (car_topCover), aur user search queries mein kuch bhi ho
// sakta hai — is liye pattern banane se pehle escape karna zaroori hai.
const escapeLikePattern = (value) =>
  String(value).replace(/[\\%_]/g, (ch) => `\\${ch}`);

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
  if (product.sold && product.sold > 0) {
    parts.push(`Popularity: ${product.sold} items sold`);
  }
  if (product.averageRating > 0) {
    parts.push(`Rating: ${product.averageRating} out of 5 (${product.totalReviews} reviews)`);
  }

  // Description
  if (product.description) parts.push(`Description: ${product.description}`);

  return parts.join(". ");
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
    variants
  } = body;

  const uploadedImages = await uploadImagesToCloudinary(productFiles);

  const normalizedPrice = Number(price);
  const normalizedStock = Number(stock);
  const normalizedDiscountPrice = Number(discountPrice || 0);

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
    slug: await generateUniqueSlug(name),
  };

  let textToEmbed = buildProductTextForAI(newProductData);
  let parsedVariants = [];

  if (variants) {
    parsedVariants = typeof variants === "string" ? JSON.parse(variants) : variants;
    
    // Validate variants payload
    validateVariantsPayload(parsedVariants);

    // Upload variant-specific images
    for (let i = 0; i < parsedVariants.length; i++) {
      const v = parsedVariants[i];
      const variantFile = (files || []).find((f) => f.fieldname === `variantImage_${i}`);
      if (variantFile) {
        const variantImageUrl = await uploadBuffer({ buffer: variantFile.buffer, folder: "products" });
        v.imageUrl = variantImageUrl;
      }
    }

    const variantDesc = parsedVariants
      .map(v => `${v.variantType || 'Material'}: ${v.variantValue || v.materialName}`)
      .join(", ");
    textToEmbed += ` Available Variants: ${variantDesc}.`;
  }

  const vectorArray = await generateEmbedding(textToEmbed, "search_document");
  newProductData.embedding = `[${vectorArray.join(',')}]`;

  const createdProduct = await Product.create(newProductData);

  if (parsedVariants.length > 0) {
    const variantData = parsedVariants.map((v) => {
      const vType = v.variantType || "material";
      const vValue = v.variantValue || v.materialName;
      return {
        productId: createdProduct.id,
        variantType: vType,
        variantValue: vValue,
        materialName: vValue,
        price: Number(v.price),
        salePrice: v.salePrice !== undefined && v.salePrice !== null && v.salePrice !== "" ? Number(v.salePrice) : null,
        stock: Number(v.stock ?? 50),
        imageUrl: v.imageUrl || null,
        sku: v.sku || null,
        status: v.status || "active",
      };
    });
    await ProductVariant.bulkCreate(variantData);
  }

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
  );

  // escapeLikePattern: warna "50%" ya "a_b" jaisi query wildcard ban jati hai
  const term = `%${escapeLikePattern(q.toLowerCase())}%`;

  // Category slug underscore-separated hai (e.g. "car_topCover"), lekin user
  // "car top cover" type karta hai. Is liye query ke spaces ko `%` bana kar ek
  // alag pattern banate hain, taake naye categories ke naam se search chale.
  const categoryTerm = `%${escapeLikePattern(q.toLowerCase()).replace(/\s+/g, "%")}%`;

  const data = await Product.findAndCountAll({
    // distinct: variants ek hasMany include hai, is ke bina COUNT joined
    // ROWS ginta hai products nahi — yani jis product ke variants hon woh
    // totalItems ko badha deta tha (e.g. car_topCover: 21 products -> 28).
    distinct: true,
    where: {
      [Op.or]: [
        { name: { [Op.iLike]: term } },
        { description: { [Op.iLike]: term } },
        { carModel: { [Op.iLike]: term } },
        { category: { [Op.iLike]: categoryTerm } },
        { subCategory: { [Op.iLike]: term } },
      ],
    },
    limit,
    offset,
    order: [["createdAt", "DESC"]],
    include: [{ model: ProductVariant, as: 'variants' }]
  });

  return formatPagingResponse(data, page, limit);
};

// 3. Get Featured Products
export const getFeaturedProductsService = async (queryPage, queryLimit) => {
  const { page, limit, offset } = getPaginationData(
    queryPage,
    queryLimit,
    DEFAULT_LIMITS.FEATURED,
  );

  const data = await Product.findAndCountAll({
    // distinct: variants ek hasMany include hai, is ke bina COUNT joined
    // ROWS ginta hai products nahi — yani jis product ke variants hon woh
    // totalItems ko badha deta tha (e.g. car_topCover: 21 products -> 28).
    distinct: true,
    where: { isFeatured: true },
    limit,
    offset,
    order: [["createdAt", "DESC"]],
    include: [{ model: ProductVariant, as: 'variants' }]
  });

  return formatPagingResponse(data, page, limit);
};

// 4. Get New Arrivals
export const getNewArrivalsService = async (queryPage, queryLimit) => {
  const { page, limit, offset } = getPaginationData(
    queryPage,
    queryLimit,
    DEFAULT_LIMITS.NEW_ARRIVALS,
  );

  const data = await Product.findAndCountAll({
    // distinct: variants ek hasMany include hai, is ke bina COUNT joined
    // ROWS ginta hai products nahi — yani jis product ke variants hon woh
    // totalItems ko badha deta tha (e.g. car_topCover: 21 products -> 28).
    distinct: true,
    where: { isNewArrival: true },
    limit,
    offset,
    order: [["createdAt", "DESC"]],
    include: [{ model: ProductVariant, as: 'variants' }]
  });

  return formatPagingResponse(data, page, limit);
};

// 5. Get On Sale Products
export const getOnSaleProductsService = async (queryPage, queryLimit) => {
  const { page, limit, offset } = getPaginationData(
    queryPage,
    queryLimit,
    DEFAULT_LIMITS.ON_SALE,
  );

  const data = await Product.findAndCountAll({
    // distinct: variants ek hasMany include hai, is ke bina COUNT joined
    // ROWS ginta hai products nahi — yani jis product ke variants hon woh
    // totalItems ko badha deta tha (e.g. car_topCover: 21 products -> 28).
    distinct: true,
    where: { isOnSale: true },
    limit,
    offset,
    order: [["createdAt", "DESC"]],
    include: [{ model: ProductVariant, as: 'variants' }]
  });

  return formatPagingResponse(data, page, limit);
};

// 6. Get All Products
export const getProductsService = async (queryPage, queryLimit) => {
  const { page, limit, offset } = getPaginationData(
    queryPage,
    queryLimit,
    DEFAULT_LIMITS.PRODUCTS,
  );

  const data = await Product.findAndCountAll({
    // distinct: variants ek hasMany include hai, is ke bina COUNT joined
    // ROWS ginta hai products nahi — yani jis product ke variants hon woh
    // totalItems ko badha deta tha (e.g. car_topCover: 21 products -> 28).
    distinct: true,
    limit,
    offset,
    order: [["createdAt", "DESC"]],
    include: [{ model: ProductVariant, as: 'variants' }]
  });

  return formatPagingResponse(data, page, limit);
};

// 7. Get Single Product — numeric id (legacy links, admin) ya slug (public
// SEO URLs) dono accept karta hai. Non-numeric string ko findByPk mein dena
// Postgres INTEGER column pe type-cast error deta, isliye pehle detect karo.
export const getProductByIdService = async (idOrSlug) => {
  const isNumeric = /^\d+$/.test(String(idOrSlug));

  const product = isNumeric
    ? await Product.findByPk(idOrSlug, {
        include: [{ model: ProductVariant, as: 'variants' }],
      })
    : await Product.findOne({
        where: { slug: String(idOrSlug).toLowerCase() },
        include: [{ model: ProductVariant, as: 'variants' }],
      });

  if (!product) throw new ApiError(404, "Product not found");
  return product;
};

// 8. Update Product
export const updateProductService = async (id, body, files) => {
  const product = await Product.findByPk(id);
  if (!product) throw new ApiError(404, "Product not found");

  const updateData = { ...body };
  const { variants } = updateData;
  delete updateData.variants;

  if (updateData.price !== undefined) updateData.price = Number(updateData.price);
  if (updateData.stock !== undefined) updateData.stock = Number(updateData.stock);
  if (updateData.discountPrice !== undefined) updateData.discountPrice = Number(updateData.discountPrice);

  if (updateData.isFeatured !== undefined) updateData.isFeatured = updateData.isFeatured === "true" || updateData.isFeatured === true;
  if (updateData.isNewArrival !== undefined) updateData.isNewArrival = updateData.isNewArrival === "true" || updateData.isNewArrival === true;
  if (updateData.isOnSale !== undefined) updateData.isOnSale = updateData.isOnSale === "true" || updateData.isOnSale === true;

  if (updateData.subCategory === "") updateData.subCategory = null;

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

  const productFiles = (files || []).filter((f) => f.fieldname === "images");
  let uploadedImages = [];
  if (productFiles.length > 0) {
    uploadedImages = await uploadImagesToCloudinary(productFiles);
  }

  updateData.images = [...parsedExistingImages, ...uploadedImages];
  updateData.imageUrl = updateData.images.length > 0 ? updateData.images[0] : null;
  delete updateData.existingImages;

  let parsedVariants = null;
  if (variants !== undefined) {
    parsedVariants = typeof variants === "string" ? JSON.parse(variants) : variants;
    validateVariantsPayload(parsedVariants);
  }

  const mergedProductState = { ...product.toJSON(), ...updateData };

  try {
    let textToEmbed = buildProductTextForAI(mergedProductState);
    let finalVariantNames = "";
    if (parsedVariants) {
      finalVariantNames = parsedVariants.map(v => `${v.variantType || 'Material'}: ${v.variantValue || v.materialName}`).join(", ");
    } else {
      const existingVars = await ProductVariant.findAll({ where: { productId: product.id } });
      finalVariantNames = existingVars.map(v => `${v.variantType}: ${v.variantValue}`).join(", ");
    }

    if (finalVariantNames) {
      textToEmbed += ` Available Variants: ${finalVariantNames}.`;
    }

    const vectorArray = await generateEmbedding(textToEmbed, "search_document");
    updateData.embedding = `[${vectorArray.join(',')}]`;
  } catch (embeddingErr) {
    console.error("⚠️ Embedding generation failed (non-fatal):", embeddingErr.message);
  }

  await product.update(updateData);

  // VARIANTS SYNC LOGIC
  if (parsedVariants !== null) {
    const existingVariants = await ProductVariant.findAll({ where: { productId: product.id } });
    
    // Identifier array based on variantType + variantValue
    const newVariantKeys = parsedVariants.map(v => 
      `${(v.variantType || "material").trim().toLowerCase()}:${(v.variantValue || v.materialName || "").trim().toLowerCase()}`
    );

    // Delete variants not in incoming list
    for (const ev of existingVariants) {
      const evKey = `${(ev.variantType || "material").trim().toLowerCase()}:${(ev.variantValue || ev.materialName || "").trim().toLowerCase()}`;
      if (!newVariantKeys.includes(evKey)) {
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

    // Upsert variants
    for (let i = 0; i < parsedVariants.length; i++) {
      const v = parsedVariants[i];
      const vType = v.variantType || "material";
      const vValue = v.variantValue || v.materialName;
      const vKey = `${vType.trim().toLowerCase()}:${vValue.trim().toLowerCase()}`;

      const ev = existingVariants.find(e => 
        (e.id && v.id && Number(e.id) === Number(v.id)) ||
        `${(e.variantType || "material").trim().toLowerCase()}:${(e.variantValue || e.materialName || "").trim().toLowerCase()}` === vKey
      );

      const variantFile = (files || []).find((f) => f.fieldname === `variantImage_${i}`);
      let variantImageUrl = v.imageUrl || null;

      if (variantFile) {
        if (ev && ev.imageUrl) {
          try {
            await destroyByUrl({ url: ev.imageUrl, folder: "products" });
          } catch (err) {
            console.error("⚠️ Failed to delete old variant image:", err.message);
          }
        }
        variantImageUrl = await uploadBuffer({ buffer: variantFile.buffer, folder: "products" });
      } else if (v.imageUrl === "" || v.imageUrl === null) {
        if (ev && ev.imageUrl) {
          try {
            await destroyByUrl({ url: ev.imageUrl, folder: "products" });
          } catch (err) {
            console.error("⚠️ Failed to delete old variant image:", err.message);
          }
        }
        variantImageUrl = null;
      }

      const variantPayload = {
        variantType: vType,
        variantValue: vValue,
        materialName: vValue,
        price: Number(v.price),
        salePrice: v.salePrice !== undefined && v.salePrice !== null && v.salePrice !== "" ? Number(v.salePrice) : null,
        stock: Number(v.stock ?? 50),
        imageUrl: variantImageUrl,
        sku: v.sku || null,
        status: v.status || "active",
      };

      if (ev) {
        await ev.update(variantPayload);
      } else {
        await ProductVariant.create({
          productId: product.id,
          ...variantPayload,
        });
      }
    }
  }

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
    // distinct: variants ek hasMany include hai, is ke bina COUNT joined
    // ROWS ginta hai products nahi — yani jis product ke variants hon woh
    // totalItems ko badha deta tha (e.g. car_topCover: 21 products -> 28).
    distinct: true,
    where: { vehicleType: VEHICLE_TYPES.CAR },
    limit,
    offset,
    order: [["createdAt", "DESC"]],
    include: [{ model: ProductVariant, as: 'variants' }]
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
    // distinct: variants ek hasMany include hai, is ke bina COUNT joined
    // ROWS ginta hai products nahi — yani jis product ke variants hon woh
    // totalItems ko badha deta tha (e.g. car_topCover: 21 products -> 28).
    distinct: true,
    where: { vehicleType: VEHICLE_TYPES.BIKE },
    limit,
    offset,
    order: [["createdAt", "DESC"]],
    include: [{ model: ProductVariant, as: 'variants' }]
  });

  return formatPagingResponse(data, page, limit);
};

// 13. (hata diya gaya) getProductsByCategoryService
// Ye dead code tha — export hota tha, controller mein import bhi tha, lekin
// kabhi call nahi hota (getProductsByCategory hamesha getProductsByFilterService
// use karta hai). Isme fuzzy matcher ki DOOSRI copy thi, jo future fixes ke
// liye landmine ban jati.

// 14. Get Filter
export const getProductsByFilterService = async (filters, queryPage, queryLimit) => {
  const { page, limit, offset } = getPaginationData(
    queryPage,
    queryLimit,
    DEFAULT_LIMITS.PRODUCTS,
  );

  const where = {};
  if (filters.vehicleType) where.vehicleType = filters.vehicleType;
  if (filters.category) {
    const cleanCategory = filters.category.trim();
    const normalizedCategory = cleanCategory.replace(/-/g, "_");

    if (filters.matchMode === "exact") {
      // Naye (aur ab saare) categories: case-insensitive EXACT match.
      //
      // escapeLikePattern zaroori hai — ILIKE mein `_` single-char wildcard hai,
      // aur hamare slugs mein underscore hota hai. Bina escape ke
      // ILIKE 'car_topCover' galti se "carXtopCover" ko bhi match kar leta.
      //
      // Pre-flight audit (49 products) mein verify hua ke ye 11 legacy slugs
      // ke liye neeche wale fuzzy branch se bilkul same results deta hai.
      where.category = { [Op.iLike]: escapeLikePattern(normalizedCategory) };
    } else {
      // LEGACY FUZZY — aaj ka original code, byte-for-byte. Sirf un rows ke liye
      // jinka matchMode 'fuzzy' hai (seed ke baad koi nahi). Chhedna mat.
      //
      // Yahan `_` ko `%` bana diya jata hai, to `floor_mat` -> `%floor%mat%`.
      // Isi wajah se naye categories ko exact mode milta hai: warna naya slug
      // `bike_seat_cover` purane `seat_cover` ke page pe aa jata.
      where[Op.or] = [
        { category: cleanCategory },
        { category: normalizedCategory },
        { category: { [Op.iLike]: `%${normalizedCategory.replace(/_/g, "%")}%` } },
        { subCategory: { [Op.iLike]: `%${normalizedCategory.replace(/_/g, "%")}%` } }
      ];
    }
  }
  if (filters.subCategory) where.subCategory = filters.subCategory;

  const data = await Product.findAndCountAll({
    // distinct: variants ek hasMany include hai, is ke bina COUNT joined
    // ROWS ginta hai products nahi — yani jis product ke variants hon woh
    // totalItems ko badha deta tha (e.g. car_topCover: 21 products -> 28).
    distinct: true,
    where,
    limit,
    offset,
    order: [["createdAt", "DESC"]],
    include: [{ model: ProductVariant, as: 'variants' }]
  });

  return formatPagingResponse(data, page, limit);
};

// 15. Get Related Products
export const getRelatedProductsService = async (productId) => {
  const product = await Product.findByPk(productId);
  if (!product) throw new ApiError(404, "Product not found");

  const limit = 6;

  let related = await Product.findAll({
    where: {
      category: product.category,
      vehicleType: product.vehicleType,
      id: { [Op.ne]: productId },
    },
    limit: limit,
    order: [["createdAt", "DESC"]],
    include: [{ model: ProductVariant, as: 'variants' }]
  });

  if (related.length < limit) {
    const fetchedIds = related.map((p) => p.id);
    fetchedIds.push(productId);

    const categoryMatches = await Product.findAll({
      where: {
        category: product.category,
        id: { [Op.notIn]: fetchedIds },
      },
      limit: limit - related.length,
      order: [["createdAt", "DESC"]],
      include: [{ model: ProductVariant, as: 'variants' }]
    });

    related = [...related, ...categoryMatches];
  }

  if (related.length < limit) {
    const finalIds = related.map((p) => p.id);
    finalIds.push(productId);

    const genericMatches = await Product.findAll({
      where: {
        id: { [Op.notIn]: finalIds },
      },
      limit: limit - related.length,
      order: [
        ["isFeatured", "DESC"],
        ["createdAt", "DESC"],
      ],
      include: [{ model: ProductVariant, as: 'variants' }]
    });

    related = [...related, ...genericMatches];
  }

  return related;
};

// ============================================================
// STANDALONE VARIANT CRUD SERVICES
// ============================================================

// Add Single Variant
export const addVariantService = async (productId, body, file) => {
  const product = await Product.findByPk(productId);
  if (!product) throw new ApiError(404, "Parent product not found");

  const vType = body.variantType || "material";
  const vValue = body.variantValue || body.materialName;

  validateVariantsPayload([{ ...body, variantType: vType, variantValue: vValue }]);

  // Check duplicate variant in DB
  const existing = await ProductVariant.findOne({
    where: {
      productId,
      variantType: vType,
      variantValue: vValue,
    }
  });

  if (existing) {
    throw new ApiError(400, `Variant ${vType} - ${vValue} already exists for this product`);
  }

  let imageUrl = body.imageUrl || null;
  if (file) {
    imageUrl = await uploadBuffer({ buffer: file.buffer, folder: "products" });
  }

  const variant = await ProductVariant.create({
    productId: Number(productId),
    variantType: vType,
    variantValue: vValue,
    materialName: vValue,
    price: Number(body.price),
    salePrice: body.salePrice ? Number(body.salePrice) : null,
    stock: Number(body.stock ?? 50),
    imageUrl,
    sku: body.sku || null,
    status: body.status || "active",
  });

  return variant;
};

// Update Single Variant
export const updateVariantService = async (variantId, body, file) => {
  const variant = await ProductVariant.findByPk(variantId);
  if (!variant) throw new ApiError(404, "Product variant not found");

  const vType = body.variantType || variant.variantType;
  const vValue = body.variantValue || body.materialName || variant.variantValue;

  validateVariantsPayload([{
    price: body.price !== undefined ? body.price : variant.price,
    salePrice: body.salePrice !== undefined ? body.salePrice : variant.salePrice,
    stock: body.stock !== undefined ? body.stock : variant.stock,
    variantType: vType,
    variantValue: vValue,
    sku: body.sku !== undefined ? body.sku : variant.sku,
  }]);

  let imageUrl = variant.imageUrl;

  if (file) {
    if (variant.imageUrl) {
      try { await destroyByUrl({ url: variant.imageUrl, folder: "products" }); } catch (err) {}
    }
    imageUrl = await uploadBuffer({ buffer: file.buffer, folder: "products" });
  } else if (body.imageUrl === "" || body.imageUrl === null) {
    if (variant.imageUrl) {
      try { await destroyByUrl({ url: variant.imageUrl, folder: "products" }); } catch (err) {}
    }
    imageUrl = null;
  }

  await variant.update({
    variantType: vType,
    variantValue: vValue,
    materialName: vValue,
    price: body.price !== undefined ? Number(body.price) : variant.price,
    salePrice: body.salePrice !== undefined ? (body.salePrice ? Number(body.salePrice) : null) : variant.salePrice,
    stock: body.stock !== undefined ? Number(body.stock) : variant.stock,
    imageUrl,
    sku: body.sku !== undefined ? body.sku : variant.sku,
    status: body.status || variant.status,
  });

  return variant;
};

// Delete Single Variant
export const deleteVariantService = async (variantId) => {
  const variant = await ProductVariant.findByPk(variantId);
  if (!variant) throw new ApiError(404, "Product variant not found");

  if (variant.imageUrl) {
    try { await destroyByUrl({ url: variant.imageUrl, folder: "products" }); } catch (err) {}
  }

  await variant.destroy();
};

