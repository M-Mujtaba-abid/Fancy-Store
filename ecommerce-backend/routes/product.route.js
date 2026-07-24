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
router.post("/", authMiddleware, adminMiddleware, uploadProductAndVariants.any(), addProduct);
router.patch("/:id", authMiddleware, adminMiddleware, uploadProductAndVariants.any(), updateProduct);
router.delete("/:id", authMiddleware, adminMiddleware, deleteProduct);

// --- Standalone Variant Routes (Admin) ---
router.post("/:productId/variants", authMiddleware, adminMiddleware, uploadProductAndVariants.any(), addVariant);
router.patch("/variants/:id", authMiddleware, adminMiddleware, uploadProductAndVariants.any(), updateVariant);
router.delete("/variants/:id", authMiddleware, adminMiddleware, deleteVariant);

// vector embedding
router.post("/sync-embeddings", syncProductEmbeddings);

export default router;