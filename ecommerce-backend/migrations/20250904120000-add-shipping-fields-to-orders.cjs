"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Orders", "shippingName", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Orders", "shippingPhone", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Orders", "shippingAddress", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Orders", "shippingCity", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Orders", "shippingPostalCode", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Orders", "shippingPostalCode");
    await queryInterface.removeColumn("Orders", "shippingCity");
    await queryInterface.removeColumn("Orders", "shippingAddress");
    await queryInterface.removeColumn("Orders", "shippingPhone");
    await queryInterface.removeColumn("Orders", "shippingName");
  },
};
