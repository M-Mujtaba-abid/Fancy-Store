'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Products', 'averageRating', {
      type: Sequelize.DECIMAL(3, 1),
      defaultValue: 0.0,
      allowNull: false
    });
    await queryInterface.addColumn('Products', 'totalReviews', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Products', 'averageRating');
    await queryInterface.removeColumn('Products', 'totalReviews');
  }
};