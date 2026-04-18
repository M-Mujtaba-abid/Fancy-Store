
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const CartItem = sequelize.define(
  "CartItem",
  {
    cartId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  },
  {}
);

// Associations
CartItem.associate = (models) => {
  CartItem.belongsTo(models.Cart, { foreignKey: "cartId" });
  CartItem.belongsTo(models.Product, { foreignKey: "productId" });
};

export default CartItem;
