'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Ek saath multiple columns add karne ke liye
    await queryInterface.addColumn('Products', 'isFeatured', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });
    await queryInterface.addColumn('Products', 'isNewArrival', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });
    await queryInterface.addColumn('Products', 'isOnSale', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });
    await queryInterface.addColumn('Products', 'discountPrice', {
      type: Sequelize.FLOAT,
      defaultValue: 0
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Rollback ke liye columns remove karna
    await queryInterface.removeColumn('Products', 'isFeatured');
    await queryInterface.removeColumn('Products', 'isNewArrival');
    await queryInterface.removeColumn('Products', 'isOnSale');
    await queryInterface.removeColumn('Products', 'discountPrice');
  }
};