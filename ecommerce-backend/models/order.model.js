import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Order = sequelize.define(
  "Order",
  {
    userId: { type: DataTypes.INTEGER, allowNull: false },
    totalAmount: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: "pending" },

    // Personal Information
    fullName: { type: DataTypes.STRING, allowNull: false },
    phoneNumber: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },

    // Delivery Information
    address: { type: DataTypes.STRING, allowNull: false },
    city: { type: DataTypes.STRING, allowNull: false },
    postalCode: { type: DataTypes.STRING, allowNull: false },
    country: { type: DataTypes.STRING, allowNull: false },

    // Payment
    paymentMethod: {
      type: DataTypes.ENUM("COD", "Bank Transfer", "Card"),
      allowNull: false,
      defaultValue: "COD",
    },

    // Stripe Session
    stripeSessionId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
  },
  {}
);

Order.associate = (models) => {
  Order.belongsTo(models.User, { foreignKey: "userId" });
  Order.hasMany(models.OrderItem, { foreignKey: "orderId" });
};

export default Order;

