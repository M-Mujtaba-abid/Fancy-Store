import express from "express";
import {
    addProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getTotalProducts,
    searchProducts,
    getFeaturedProducts,
    getNewArrivals,
    getOnSaleProducts,
    getCarProducts,
    getBikeProducts,
    getProductsByFilter,
    getProductsByCategory,
    getRelatedProducts,
    syncProductEmbeddings,
    addVariant,
    updateVariant,
    deleteVariant
} from "../controllers/product.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";
import adminMiddleware from "../middleware/admin.middleware.js";
import { uploadWithLimits, uploadProductAndVariants } from "../middleware/multer.middleware.js";

const router = express.Router();

// --- Public Routes ---
router.get("/search", searchProducts);
router.get("/featured", getFeaturedProducts);
router.get("/new-arrivals", getNewArrivals);
router.get("/sale", getOnSaleProducts);
router.get("/count", getTotalProducts);
router.get("/cars", getCarProducts);
router.get("/bikes", getBikeProducts);
router.get("/category/:category", getProductsByCategory);  //  upar
router.get("/filter", getProductsByFilter);                //  upar
router.get("/", getProducts);
router.get("/:id/related", getRelatedProducts); // ✅ /:id se pehle rakho
router.get("/:id", getProductById);                        // hamesha sabse neeche

// --- Protected Routes (Admin) ---
// ✅ Use upload.fields() to handle multiple field types: images (array) + video (single file)
const uploadFields = uploadProductAndVariants.fields([
  { name: "images", maxCount: 5 },
  { name: "video", maxCount: 1 },
  { name: "variantImage_0", maxCount: 1 },
  { name: "variantImage_1", maxCount: 1 },
  { name: "variantImage_2", maxCount: 1 },
  { name: "variantImage_3", maxCount: 1 },
  { name: "variantImage_4", maxCount: 1 },
  { name: "variantImage_5", maxCount: 1 },
]);

router.post("/", authMiddleware, adminMiddleware, uploadFields, addProduct);
router.patch("/:id", authMiddleware, adminMiddleware, uploadFields, updateProduct);
router.delete("/:id", authMiddleware, adminMiddleware, deleteProduct);

// --- Standalone Variant Routes (Admin) ---
router.post("/:productId/variants", authMiddleware, adminMiddleware, uploadProductAndVariants.any(), addVariant);
router.patch("/variants/:id", authMiddleware, adminMiddleware, uploadProductAndVariants.any(), updateVariant);
router.delete("/variants/:id", authMiddleware, adminMiddleware, deleteVariant);

// vector embedding
// Admin-only: ye endpoint har product jiska embedding null hai uske liye ek
// PAID Cohere API call karta hai (serially, bina timeout). Pehle ye bilkul
// open tha — koi bhi hit kar ke API credits kharch kar sakta tha.
router.post("/sync-embeddings", authMiddleware, adminMiddleware, syncProductEmbeddings);

export default router;