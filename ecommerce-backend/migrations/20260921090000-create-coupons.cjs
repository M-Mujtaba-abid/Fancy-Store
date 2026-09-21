'use strict';

/**
 * Coupons table.
 *
 * Har coupon ek promoter/affiliate ka hota hai (ownerName). Customer checkout
 * par code daalta hai, discount lagta hai, aur CouponRedemptions mein record ho
 * jata hai ke kis ne istemal kiya - usi se promoter ki sale report banti hai.
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Coupons', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      // ⚠️ Hamesha UPPERCASE mein store hota hai (services/coupon.service.js ka
      // normalizeCode). Bina iske "abqd" aur "ABQD" do alag coupon ban jate aur
      // customer ka chhota likha hua code reject ho jata.
      code: {
        type: Sequelize.STRING(40),
        allowNull: false,
        unique: true,
      },

      // Jis bande ka coupon hai. Report isi naam se dikhti hai.
      ownerName: { type: Sequelize.STRING(120), allowNull: false },
      ownerPhone: { type: Sequelize.STRING(30), allowNull: true },
      ownerEmail: { type: Sequelize.STRING(160), allowNull: true },

      discountType: {
        type: Sequelize.ENUM('percent', 'fixed'),
        allowNull: false,
        defaultValue: 'percent',
      },
      discountValue: { type: Sequelize.FLOAT, allowNull: false },

      // Percent coupons par cap. 10% ka matlab Rs 10,000 ke order par Rs 1,000
      // hai; cap ke bagair ek bara order poora margin kha jata hai.
      // null = koi cap nahi.
      maxDiscount: { type: Sequelize.FLOAT, allowNull: true },

      // Discount SIRF items ke subtotal par lagta hai, shipping par nahi.
      // minOrderAmount bhi subtotal se compare hota hai.
      minOrderAmount: { type: Sequelize.FLOAT, allowNull: false, defaultValue: 0 },

      // Kul kitni baar chal sakta hai. null = unlimited. Code leak ho jaye to
      // yehi aakhri safety net hai.
      usageLimit: { type: Sequelize.INTEGER, allowNull: true },
      usedCount: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },

      // Ek customer (phone YA email) kitni baar. Default 1.
      usageLimitPerCustomer: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },

      // Bhare hue hon to coupon SIRF isi customer ke liye chalega (personal
      // coupon). Khali = sab ke liye khula (promoter wala normal case).
      // Values normalized shakal mein rakhi jati hain, dekho utils/contact.util.js
      restrictToPhone: { type: Sequelize.STRING(30), allowNull: true },
      restrictToEmail: { type: Sequelize.STRING(160), allowNull: true },

      startsAt: { type: Sequelize.DATE, allowNull: true },
      expiresAt: { type: Sequelize.DATE, allowNull: true },

      // Admin ka on/off switch. Delete ki jagah yehi use karein taake purane
      // orders ki attribution history na tootay.
      isActive: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },

      // Promoter ko sale ka kitna percent dena hai. Sirf report ke liye, order
      // ke total par is ka koi asar nahi.
      commissionPercent: { type: Sequelize.FLOAT, allowNull: false, defaultValue: 0 },

      notes: { type: Sequelize.TEXT, allowNull: true },

      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    await queryInterface.addIndex('Coupons', ['isActive']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('Coupons');
    // ENUM type table ke sath khud nahi jata.
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Coupons_discountType";');
  },
};
