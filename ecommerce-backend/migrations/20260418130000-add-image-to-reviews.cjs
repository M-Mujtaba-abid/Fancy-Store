'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Reviews', 'images', {
      type: Sequelize.JSON,
      allowNull: true, //  optional hai
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Reviews', 'images');
  },
};