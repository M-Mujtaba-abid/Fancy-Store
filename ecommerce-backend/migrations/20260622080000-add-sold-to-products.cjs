'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.addColumn('Products', 'sold', {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      });
    } catch (err) {
      console.log('Column "sold" already exists, skipping addColumn.');
    }

    // Populate existing products with random sold values between 20 and 150
    try {
      const [products] = await queryInterface.sequelize.query('SELECT id FROM "Products"');
      for (const prod of products) {
        const randomSold = Math.floor(Math.random() * 131) + 20; // 20 to 150
        await queryInterface.sequelize.query(
          'UPDATE "Products" SET "sold" = :sold WHERE "id" = :id',
          {
            replacements: { sold: randomSold, id: prod.id }
          }
        );
      }
    } catch (err) {
      console.error('Error seeding random sold counts during migration:', err);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Products', 'sold');
  }
};
