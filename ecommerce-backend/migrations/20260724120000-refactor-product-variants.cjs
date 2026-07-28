'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const addCol = async (col, options) => {
      try {
        await queryInterface.addColumn('ProductVariants', col, options);
      } catch (e) {
        console.log(`Column "${col}" already exists in ProductVariants, skipping.`);
      }
    };

    await addCol('variantType', { type: Sequelize.STRING, allowNull: true, defaultValue: 'material' });
    await addCol('variantValue', { type: Sequelize.STRING, allowNull: true });
    await addCol('salePrice', { type: Sequelize.FLOAT, allowNull: true });
    await addCol('sku', { type: Sequelize.STRING, allowNull: true });
    await addCol('status', { type: Sequelize.STRING, allowNull: false, defaultValue: 'active' });

    try {
      await queryInterface.changeColumn('ProductVariants', 'materialName', {
        type: Sequelize.STRING,
        allowNull: true
      });
    } catch (e) {
      console.log('Error changing materialName column, skipping.');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('ProductVariants', 'variantType');
    await queryInterface.removeColumn('ProductVariants', 'variantValue');
    await queryInterface.removeColumn('ProductVariants', 'salePrice');
    await queryInterface.removeColumn('ProductVariants', 'sku');
    await queryInterface.removeColumn('ProductVariants', 'status');

    await queryInterface.changeColumn('ProductVariants', 'materialName', {
      type: Sequelize.STRING,
      allowNull: false
    });
  }
};
