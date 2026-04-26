import sequelize from "../config/db.js";
import Cart from "./cart.model.js";
import CartItem from "./cartItem.model.js";
import Product from "./product.model.js";
import User from "./user.model.js";
import UserIdentity from "./userIdentity.model.js";  // ✅ add
import Order from "./order.model.js";
import OrderItem from "./orderItem.model.js";
import Review from "./review.model.js";
import Wishlist from "./wishlist.model.js";

const models = {
  User,
  UserIdentity,  // ✅ add
  Product,
  Cart,
  CartItem,
  Order,
  OrderItem,
  Review,
  Wishlist,
};

// Associations
User.hasMany(UserIdentity, { foreignKey: "userId", onDelete: "CASCADE" });
UserIdentity.belongsTo(User, { foreignKey: "userId" });

// Baaki associations
Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

export { sequelize, User, UserIdentity };  // ✅ export bhi karo
export default models;