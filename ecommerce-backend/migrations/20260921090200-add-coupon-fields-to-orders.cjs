'use strict';

/**
 * Orders par coupon ke columns.
 *
 * `subtotal` bhi yahan add ho raha hai. Abhi order sirf totalAmount aur
 * shippingFee rakhta hai, to discount aane ke baad hisaab audit karna mumkin
 * nahi rehta: totalAmount dekh kar ye nahi pata chalta ke items kitne ke thay.
 * Ab teeno alag hain:
 *
 *     totalAmount = subtotal - discountAmount + shippingFee
 *
 * `couponCode` jaan bujh kar plain text snapshot hai, sirf couponId nahi.
 * Coupon baad mein edit ya delete ho jaye to bhi purane order par wahi code
 * likha rahega jo us waqt laga tha.
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Orders', 'subtotal', {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addColumn('Orders', 'discountAmount', {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addColumn('Orders', 'couponCode', {
      type: Sequelize.STRING(40),
      allowNull: true,
    });

    await queryInterface.addColumn('Orders', 'couponId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'Coupons', key: 'id' },
      // Coupon delete ho jaye to order bacha rahe, bas link toot jaye.
      // couponCode ka text phir bhi order par likha rehta hai.
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    // Purane orders par subtotal 0 para hai. Un ka koi discount nahi tha, to
    // subtotal = totalAmount - shippingFee. Ek dafa bhar dete hain taake
    // reports mein purane aur naye orders ek jaise nazar aayen.
    await queryInterface.sequelize.query(`
      UPDATE "Orders"
      SET "subtotal" = GREATEST("totalAmount" - "shippingFee", 0)
      WHERE "subtotal" = 0;
    `);
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('Orders', 'couponId');
    await queryInterface.removeColumn('Orders', 'couponCode');
    await queryInterface.removeColumn('Orders', 'discountAmount');
    await queryInterface.removeColumn('Orders', 'subtotal');
  },
};
