import Product from '../models/product.model.js';
import { Op } from 'sequelize';

export const searchProducts = async (req, res) => {
  try {
    let { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Query is required' });
    }

    // Trim spaces/newlines
    query = query.trim();

    // Optional: convert to lowercase if you want case-insensitive search
    // query = query.toLowerCase();

    // console.log('Searching for:', query);

    const results = await Product.findAll({
      where: {
        name: { [Op.like]: `%${query}%` },
      },
      limit: 10,
      // logging: console.log // <-- optional: see generated SQL in console
    });

    // console.log('Results:', results);

    res.status(200).json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
