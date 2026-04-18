
import sequelize from "../config/db.js";
import Cart from "./cart.model.js";
import CartItem from "./cartItem.model.js";
import Product from "./product.model.js";
import User from "./user.model.js";
import Order from "./order.model.js";
import OrderItem from "./orderItem.model.js";

// Initialize models
const models = {
  User,
  Product,
  Cart,
  CartItem,
  Order,
  OrderItem,
};

// Call associate for each model if exists
Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

export { sequelize };
export default models;
