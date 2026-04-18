'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('CartItems', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      cartId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Carts', key: 'id' }, onDelete: 'CASCADE' },
      productId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Products', key: 'id' }, onDelete: 'CASCADE' },
      quantity: { type: Sequelize.INTEGER, defaultValue: 1 },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('CartItems');
  }
};
