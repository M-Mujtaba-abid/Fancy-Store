// models/couponRedemption.model.js
import { Model, DataTypes } from "sequelize";
import sequelize from "../config/db.js";

/**
 * "Kis ne kaun sa coupon istemal kiya."
 *
 * Do maqsad: promoter ki sale report, aur per-customer limit.
 *
 * ⚠️ Per-customer limit ki asal rok is model par nahi, DATABASE par hai.
 * Migration 20260921090100 do partial unique indexes banati hai
 * (couponId + phoneNormalized, aur couponId + emailNormalized, dono sirf
 * status='consumed' par). Sirf service mein SELECT kar ke check karna kaafi
 * nahi: ek hi bande ke do orders ek sath aayein to dono ka check khali aayega.
 */
class CouponRedemption extends Model {
  static associate(models) {
    CouponRedemption.belongsTo(models.Coupon, {
      foreignKey: "couponId",
      as: "coupon",
    });
    CouponRedemption.belongsTo(models.Order, {
      foreignKey: "orderId",
      as: "order",
    });
  }
}

CouponRedemption.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    couponId: { type: DataTypes.INTEGER, allowNull: false },
    orderId: { type: DataTypes.INTEGER, allowNull: true },
    userId: { type: DataTypes.INTEGER, allowNull: true },

    // Customer ne jo likha, dikhane ke liye.
    phone: { type: DataTypes.STRING(30), allowNull: true },
    email: { type: DataTypes.STRING(160), allowNull: true },

    // Compare hamesha in par. Dekho utils/contact.util.js.
    phoneNormalized: { type: DataTypes.STRING(30), allowNull: true },
    emailNormalized: { type: DataTypes.STRING(160), allowNull: true },

    discountAmount: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    orderSubtotal: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },

    status: {
      type: DataTypes.ENUM("consumed", "released"),
      allowNull: false,
      defaultValue: "consumed",
    },
    releasedAt: { type: DataTypes.DATE, allowNull: true },
    releaseReason: { type: DataTypes.STRING(200), allowNull: true },
  },
  {
    sequelize,
    modelName: "CouponRedemption",
    tableName: "CouponRedemptions",
    timestamps: true,
  }
);

export default CouponRedemption;
