'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.removeColumn('Users', 'password');
    await queryInterface.removeColumn('Users', 'googleId');
    await queryInterface.removeColumn('Users', 'authProvider');
    await queryInterface.removeColumn('Users', 'resetOtp');
    await queryInterface.removeColumn('Users', 'resetOtpExpiry');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'password',       { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn('Users', 'googleId',       { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn('Users', 'authProvider',   { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn('Users', 'resetOtp',       { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn('Users', 'resetOtpExpiry', { type: Sequelize.DATE,   allowNull: true });
  }
};