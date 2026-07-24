'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // 1. Backfill existing ProductVariants (where materialName exists but variantValue is null)
      const [existingVariants] = await queryInterface.sequelize.query(
        `SELECT id, "materialName", "variantType", "variantValue" FROM "ProductVariants" WHERE "variantValue" IS NULL AND "materialName" IS NOT NULL;`,
        { transaction }
      );

      for (const variant of existingVariants) {
        await queryInterface.sequelize.query(
          `UPDATE "ProductVariants" 
           SET "variantType" = COALESCE("variantType", 'material'), 
               "variantValue" = :materialName 
           WHERE id = :id;`,
          {
            replacements: { materialName: variant.materialName, id: variant.id },
            transaction
          }
        );
      }

      // 2. Auto-generate default variants for products without variants
      const [productsWithoutVariants] = await queryInterface.sequelize.query(
        `SELECT p.id, p.name, p.price, p."discountPrice", p.stock, p."imageUrl", p.material, p.color 
         FROM "Products" p 
         LEFT JOIN "ProductVariants" pv ON p.id = pv."productId" 
         WHERE pv.id IS NULL;`,
        { transaction }
      );

      const now = new Date();

      for (const product of productsWithoutVariants) {
        const vType = product.material ? 'material' : product.color ? 'color' : 'standard';
        const vValue = product.material || product.color || 'Standard';
        const priceVal = Number(product.price) || 0;
        const salePriceVal = product.discountPrice && Number(product.discountPrice) > 0 ? Number(product.discountPrice) : priceVal;

        await queryInterface.sequelize.query(
          `INSERT INTO "ProductVariants" ("productId", "variantType", "variantValue", "materialName", price, "salePrice", stock, "imageUrl", status, "createdAt", "updatedAt")
           VALUES (:productId, :variantType, :variantValue, :materialName, :price, :salePrice, :stock, :imageUrl, 'active', :createdAt, :updatedAt);`,
          {
            replacements: {
              productId: product.id,
              variantType: vType,
              variantValue: vValue,
              materialName: vValue,
              price: priceVal,
              salePrice: salePriceVal,
              stock: Number(product.stock) || 0,
              imageUrl: product.imageUrl || null,
              createdAt: now,
              updatedAt: now
            },
            transaction
          }
        );
      }

      await transaction.commit();
      console.log('✅ Data migration for ProductVariants completed successfully.');
    } catch (err) {
      await transaction.rollback();
      console.error('❌ Data migration for ProductVariants failed:', err);
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    // Revert is safe / optional as columns are preserved
  }
};
