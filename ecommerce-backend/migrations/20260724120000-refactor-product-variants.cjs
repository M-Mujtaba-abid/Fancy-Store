'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Add variantType
    await queryInterface.addColumn('ProductVariants', 'variantType', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: 'material'
    });

    // 2. Add variantValue
    await queryInterface.addColumn('ProductVariants', 'variantValue', {
      type: Sequelize.STRING,
      allowNull: true
    });

    // 3. Add salePrice
    await queryInterface.addColumn('ProductVariants', 'salePrice', {
      type: Sequelize.FLOAT,
      allowNull: true
    });

    // 4. Add sku
    await queryInterface.addColumn('ProductVariants', 'sku', {
      type: Sequelize.STRING,
      allowNull: true
    });

    // 5. Add status
    await queryInterface.addColumn('ProductVariants', 'status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'active'
    });

    // 6. Alter materialName to allow nulls
    await queryInterface.changeColumn('ProductVariants', 'materialName', {
      type: Sequelize.STRING,
      allowNull: true
    });
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
