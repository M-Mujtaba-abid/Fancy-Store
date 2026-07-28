'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('LiveChatMessages', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      chatRoomId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'ChatRooms',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      senderType: {
        type: Sequelize.ENUM('user', 'guest', 'admin'),
        allowNull: false
      },
      senderId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      messageType: {
        type: Sequelize.ENUM('text', 'image', 'file'),
        allowNull: false,
        defaultValue: 'text'
      },
      fileUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      isRead: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
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
    await queryInterface.dropTable('LiveChatMessages');
  }
};