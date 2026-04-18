"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove old shipping columns
    await queryInterface.removeColumn("Orders", "shippingName");
    await queryInterface.removeColumn("Orders", "shippingPhone");
    await queryInterface.removeColumn("Orders", "shippingAddress");
    await queryInterface.removeColumn("Orders", "shippingCity");
    await queryInterface.removeColumn("Orders", "shippingPostalCode");

    // Add new personal info
    await queryInterface.addColumn("Orders", "fullName", { type: Sequelize.STRING, allowNull: false });
    await queryInterface.addColumn("Orders", "phoneNumber", { type: Sequelize.STRING, allowNull: false });
    await queryInterface.addColumn("Orders", "email", { type: Sequelize.STRING, allowNull: false });

    // Add delivery info
    await queryInterface.addColumn("Orders", "address", { type: Sequelize.STRING, allowNull: false });
    await queryInterface.addColumn("Orders", "city", { type: Sequelize.STRING, allowNull: false });
    await queryInterface.addColumn("Orders", "postalCode", { type: Sequelize.STRING, allowNull: false });
    await queryInterface.addColumn("Orders", "country", { type: Sequelize.STRING, allowNull: false });

    // Add payment
    await queryInterface.addColumn("Orders", "paymentMethod", {
      type: Sequelize.ENUM("COD", "Bank Transfer", "Card"),
      allowNull: false,
      defaultValue: "COD",
    });
  },

  async down(queryInterface, Sequelize) {
    // Re-add old shipping fields (rollback)
    await queryInterface.addColumn("Orders", "shippingName", { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn("Orders", "shippingPhone", { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn("Orders", "shippingAddress", { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn("Orders", "shippingCity", { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn("Orders", "shippingPostalCode", { type: Sequelize.STRING, allowNull: true });

    // Remove new fields
    await queryInterface.removeColumn("Orders", "fullName");
    await queryInterface.removeColumn("Orders", "phoneNumber");
    await queryInterface.removeColumn("Orders", "email");
    await queryInterface.removeColumn("Orders", "address");
    await queryInterface.removeColumn("Orders", "city");
    await queryInterface.removeColumn("Orders", "postalCode");
    await queryInterface.removeColumn("Orders", "country");
    await queryInterface.removeColumn("Orders", "paymentMethod");

    // If you are on PostgreSQL, keep this line. If on MySQL, delete this line.
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Orders_paymentMethod";');
  },
};
