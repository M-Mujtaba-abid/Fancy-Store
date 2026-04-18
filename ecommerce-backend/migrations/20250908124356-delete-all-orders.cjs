"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Deletes all rows in Orders table
    await queryInterface.bulkDelete('Orders', null, {});
  },

  async down(queryInterface, Sequelize) {
    // Nothing to revert
  }
};
