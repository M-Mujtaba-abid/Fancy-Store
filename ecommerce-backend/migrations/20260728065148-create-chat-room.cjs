'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ChatRooms', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      userId: {
        type: Sequelize.INTEGER, // Aapke Users table ki primary key type ke mutabiq
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      guestId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      userType: {
        type: Sequelize.ENUM('guest', 'registered'),
        allowNull: false,
        defaultValue: 'guest'
      },
      status: {
        type: Sequelize.ENUM('active', 'closed', 'archived'),
        allowNull: false,
        defaultValue: 'active'
      },
      lastMessage: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      lastMessageAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      unreadAdminCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      unreadUserCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ChatRooms');
  }
};