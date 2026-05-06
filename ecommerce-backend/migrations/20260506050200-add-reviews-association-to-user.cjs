'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Product page par fast loading ke liye composite index
    await queryInterface.addIndex('Reviews', ['productId', 'isApproved'], {
      name: 'reviews_product_approval_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('Reviews', 'reviews_product_approval_idx');
  }
};