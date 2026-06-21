'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Step 1: Check if old table exists and drop it
    try {
      await queryInterface.dropTable('ProductVariants');
    } catch (e) {
      // Table might not exist, that's fine
    }

    // Step 2: Recreate with properly quoted column names
    await queryInterface.sequelize.query(`
      CREATE TABLE "ProductVariants" (
        "id" SERIAL PRIMARY KEY,
        "productId" INTEGER NOT NULL REFERENCES "Products"("id") ON UPDATE CASCADE ON DELETE CASCADE,
        "materialName" VARCHAR(255) NOT NULL,
        "price" FLOAT NOT NULL,
        "stock" INTEGER DEFAULT 50,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ProductVariants');
  }
};
