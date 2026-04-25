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
    getRelatedProducts
} from "../controllers/product.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";
import adminMiddleware from "../middleware/admin.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const   router = express.Router();

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
router.post("/", authMiddleware, adminMiddleware, upload.array("images", 5), addProduct);
router.patch("/:id", authMiddleware, adminMiddleware, upload.array("images", 5), updateProduct);
router.delete("/:id", authMiddleware, adminMiddleware, deleteProduct);

export default router;