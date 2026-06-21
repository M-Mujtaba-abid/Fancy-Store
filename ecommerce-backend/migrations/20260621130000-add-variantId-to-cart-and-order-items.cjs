'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add variantId to CartItems
    await queryInterface.addColumn('CartItems', 'variantId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'ProductVariants',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    // Add variantId to OrderItems
    await queryInterface.addColumn('OrderItems', 'variantId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'ProductVariants',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('CartItems', 'variantId');
    await queryInterface.removeColumn('OrderItems', 'variantId');
  }
};
