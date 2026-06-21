
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const CartItem = sequelize.define(
  "CartItem",
  {
    cartId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    variantId: { type: DataTypes.INTEGER, allowNull: true },
  },
  {}
);

// Associations
CartItem.associate = (models) => {
  CartItem.belongsTo(models.Cart, { foreignKey: "cartId" });
  CartItem.belongsTo(models.Product, { foreignKey: "productId" });
  CartItem.belongsTo(models.ProductVariant, { foreignKey: "variantId", as: "variant" });
};

export default CartItem;
