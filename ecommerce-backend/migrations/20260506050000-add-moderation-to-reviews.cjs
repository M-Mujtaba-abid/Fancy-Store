'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('Reviews');

    if (!tableInfo.isApproved) {
      await queryInterface.addColumn('Reviews', 'isApproved', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      });
    }

    if (!tableInfo.adminReply) {
      await queryInterface.addColumn('Reviews', 'adminReply', {
        type: Sequelize.TEXT,
        allowNull: true
      });
    }

    if (!tableInfo.images) {
      await queryInterface.addColumn('Reviews', 'images', {
        type: Sequelize.JSON,
        defaultValue: [],
        allowNull: true
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Reviews', 'isApproved');
    await queryInterface.removeColumn('Reviews', 'adminReply');
    await queryInterface.removeColumn('Reviews', 'images');
  }
};