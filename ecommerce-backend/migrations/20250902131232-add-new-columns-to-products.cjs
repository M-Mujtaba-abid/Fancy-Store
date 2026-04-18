module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Products", "carModel", {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.addColumn("Products", "color", {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn("Products", "material", {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn("Products", "images", {
      type: Sequelize.JSON,   // store multiple image URLs as JSON array
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Products", "carModel");
    await queryInterface.removeColumn("Products", "color");
    await queryInterface.removeColumn("Products", "material");
    await queryInterface.removeColumn("Products", "images");
  }
};
