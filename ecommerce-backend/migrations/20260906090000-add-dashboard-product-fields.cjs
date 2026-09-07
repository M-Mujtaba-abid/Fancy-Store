'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Products', 'costPrice', {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.addColumn('Products', 'stockQuantity', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.sequelize.query('UPDATE "Products" SET "stockQuantity" = "stock"');
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Products', 'stockQuantity');
    await queryInterface.removeColumn('Products', 'costPrice');
  },
};