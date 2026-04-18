// routes/search.route.js
import express from 'express';
import { searchProducts } from '../controllers/search.controller.js';

const router = express.Router();

// GET /api/search?query=abc
router.get('/', searchProducts);

export default router;
