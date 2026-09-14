'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Products', 'videoUrl', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'images',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Products', 'videoUrl');
  }
};
