'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // contacts table mein is_replied column add kar rahe hain
    await queryInterface.addColumn('contacts', 'is_replied', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });
  },

  async down (queryInterface, Sequelize) {
    // Agar migration wapas leni ho (rollback), toh column remove ho jaye
    await queryInterface.removeColumn('contacts', 'is_replied');
  }
};