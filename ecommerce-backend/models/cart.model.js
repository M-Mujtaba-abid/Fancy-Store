// models/Cart.js
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js"; // apne sequelize instance ka path adjust karo
import CartItem from "./cartItem.model.js";
import User from "./user.model.js";

const Cart = sequelize.define("Cart", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {});

// Associations
Cart.belongsTo(User, { foreignKey: "userId" });
Cart.hasMany(CartItem, { foreignKey: "cartId" });

export default Cart;
