'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UserIdentities', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER,  // ✅ Users.id ke sath match
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE',
      },
      provider: {
        type: Sequelize.ENUM('local', 'google'),
        allowNull: false,
      },
      providerId:     { type: Sequelize.STRING, allowNull: true },
      password:       { type: Sequelize.STRING, allowNull: true },
      resetOtp:       { type: Sequelize.STRING, allowNull: true },
      resetOtpExpiry: { type: Sequelize.DATE,   allowNull: true },
      createdAt:      { type: Sequelize.DATE,   allowNull: false },
      updatedAt:      { type: Sequelize.DATE,   allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('UserIdentities');
  }
};