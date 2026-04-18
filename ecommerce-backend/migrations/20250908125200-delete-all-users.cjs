'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Delete all users
    await queryInterface.bulkDelete('Users', {}, {});
  },

  async down(queryInterface, Sequelize) {
    // optional rollback
  }
};
