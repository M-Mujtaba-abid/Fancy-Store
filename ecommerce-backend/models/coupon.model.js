// models/coupon.model.js
import { Model, DataTypes } from "sequelize";
import sequelize from "../config/db.js";

/**
 * Promoter/affiliate ka discount coupon.
 *
 * Code hamesha UPPERCASE store hota hai (utils/contact.util.js ka
 * normalizeCouponCode). Discount SIRF items ke subtotal par lagta hai,
 * shipping par nahi.
 */
class Coupon extends Model {}

Coupon.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    code: { type: DataTypes.STRING(40), allowNull: false, unique: true },

    ownerName: { type: DataTypes.STRING(120), allowNull: false },
    ownerPhone: { type: DataTypes.STRING(30), allowNull: true },
    ownerEmail: { type: DataTypes.STRING(160), allowNull: true },

    discountType: {
      type: DataTypes.ENUM("percent", "fixed"),
      allowNull: false,
      defaultValue: "percent",
    },
    discountValue: { type: DataTypes.FLOAT, allowNull: false },

    // Percent coupons ka cap. null = koi cap nahi.
    maxDiscount: { type: DataTypes.FLOAT, allowNull: true },

    minOrderAmount: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },

    usageLimit: { type: DataTypes.INTEGER, allowNull: true },
    usedCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    usageLimitPerCustomer: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },

    // Bhare hue hon to coupon sirf isi customer ke liye. Normalized shakal
    // mein rakhe jate hain taake compare seedha ho.
    restrictToPhone: { type: DataTypes.STRING(30), allowNull: true },
    restrictToEmail: { type: DataTypes.STRING(160), allowNull: true },

    startsAt: { type: DataTypes.DATE, allowNull: true },
    expiresAt: { type: DataTypes.DATE, allowNull: true },

    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },

    // Sirf report ke liye. Order ke total par is ka koi asar nahi.
    commissionPercent: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },

    notes: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    sequelize,
    modelName: "Coupon",
    tableName: "Coupons",
    timestamps: true,
  }
);

export default Coupon;
