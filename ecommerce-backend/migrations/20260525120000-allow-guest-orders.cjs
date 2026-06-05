"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE "Orders" ALTER COLUMN "userId" DROP NOT NULL;
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE "Orders" ALTER COLUMN "userId" SET NOT NULL;
    `);
  },
};
