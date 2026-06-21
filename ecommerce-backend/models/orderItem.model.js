// models/OrderItem.js
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js"; // aapka sequelize instance

const OrderItem = sequelize.define("OrderItem", {
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  variantId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {});

// Associations
OrderItem.associate = (models) => {
  OrderItem.belongsTo(models.Order, { foreignKey: "orderId" });
  OrderItem.belongsTo(models.Product, { foreignKey: "productId" });
  OrderItem.belongsTo(models.ProductVariant, { foreignKey: "variantId", as: "variant" });
};

export default OrderItem;
