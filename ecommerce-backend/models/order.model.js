import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Order = sequelize.define(
  "Order",
  {
    userId: { type: DataTypes.INTEGER, allowNull: true },

    // Paise ka hisaab teen alag columns mein:
    //     totalAmount = subtotal - discountAmount + shippingFee
    //
    // subtotal ke bagair discount ke baad ye nahi pata chalta ke items kitne
    // ke thay, aur koi bhi report banani mushkil ho jati.
    subtotal: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    discountAmount: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    totalAmount: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    shippingFee: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 299 },

    couponId: { type: DataTypes.INTEGER, allowNull: true },
    // Plain text snapshot, sirf couponId nahi. Coupon baad mein edit ya delete
    // ho jaye to bhi purane order par wahi code likha rahe jo us waqt laga tha.
    couponCode: { type: DataTypes.STRING(40), allowNull: true },
    status: {
      type: DataTypes.ENUM("pending", "processing", "shipped", "delivered", "cancelled", "returned"),
      allowNull: false,
      defaultValue: "pending",
    },

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

// / ASSOCIATION YAHAN LIKHNA HAI
Order.associate = (models) => {
  // Order ka User ke saath relation
  Order.belongsTo(models.User, { foreignKey: "userId" });
  
  // Order ka OrderItem ke saath relation
  Order.hasMany(models.OrderItem, { foreignKey: "orderId", onDelete: "CASCADE" });

  // Coupon ke saath. onDelete Orders ki migration mein SET NULL hai: coupon
  // delete ho to order bacha rahe, bas link tootay.
  Order.belongsTo(models.Coupon, { foreignKey: "couponId", as: "coupon" });
  Order.hasOne(models.CouponRedemption, { foreignKey: "orderId", as: "couponRedemption" });
};

export default Order;

