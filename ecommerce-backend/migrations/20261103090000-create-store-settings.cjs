'use strict';

/**
 * StoreSettings table: admin se badalne wali store-wide settings.
 *
 * Key/value is liye ke har nayi setting ke liye naya migration na banana
 * pare. Abhi do keys hain (dekho services/settings.service.js):
 *
 *     shippingFee   delivery charge, 0 = free delivery
 *     sale          11.11 jaisi sale ka popup/strip (on/off, khatam hone ka waqt)
 *
 * Row na ho to service constants/index.js ka SHIPPING_FEE default leti hai,
 * is liye table khali hone par bhi checkout chalta rehta hai.
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('StoreSettings', {
      key: {
        type: Sequelize.STRING(60),
        primaryKey: true,
        allowNull: false,
      },
      value: { type: Sequelize.JSONB, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('StoreSettings');
  },
};
