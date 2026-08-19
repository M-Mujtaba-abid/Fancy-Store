'use strict';

// Categories = slug-based registry table.
// IMPORTANT: Products.category plain STRING hi rehta hai — koi FK nahi, koi
// backfill nahi. Ye table sirf us slug ke baare mein metadata rakhti hai
// (title, subtitle, image, order). Isi wajah se purana backend code is schema
// ke saath 100% compatible hai aur rollback ek Vercel button hai.

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Categories', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      // Products.category se isi value pe match hota hai
      slug: {
        type: Sequelize.STRING(60),
        allowNull: false,
        unique: true,
      },
      title: {
        type: Sequelize.STRING(80),
        allowNull: false,
      },
      subtitle: {
        type: Sequelize.STRING(160),
        allowNull: true,
      },
      // local path ("/category/seatCover.png") YA Cloudinary secure_url
      image: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      // Admin ke AddProduct form mein variant-type dropdown preset karta hai
      suggestedVariantType: {
        type: Sequelize.STRING(30),
        allowNull: false,
        defaultValue: 'Material',
      },
      // 'exact' | 'fuzzy' — 'fuzzy' sirf legacy grandfathering ke liye hai.
      // Naye categories hamesha 'exact' hote hain, warna un ka `_`->`%` pattern
      // doosri category ke products kha sakta hai.
      matchMode: {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: 'exact',
      },
      showOnHome: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      // Soft delete — products maujood hon to hard delete nahi karte
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      sortOrder: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Postgres ka plain UNIQUE case-sensitive hai, lekin matcher slugs ko
    // case-insensitively treat karta hai (ILIKE). Iske bina "Car_TopCover" aur
    // "car_topCover" dono ban jate — do rows, ek hi category.
    await queryInterface.sequelize.query(
      'CREATE UNIQUE INDEX categories_slug_lower_uniq ON "Categories" (LOWER(slug));'
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      'DROP INDEX IF EXISTS categories_slug_lower_uniq;'
    );
    await queryInterface.dropTable('Categories');
  },
};
