'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Orders', 'shippingFee', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 299,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Orders', 'shippingFee');
  }
};