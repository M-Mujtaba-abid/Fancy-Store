'use strict';

// SEO: purani URLs `/products/<id>` thi (numeric), jisme keyword hi nahi hota
// tha. Slug column add kar rahe hain taake public URLs `/products/<slug>` ban
// sakein — exact product-name searches mein ranking ke liye zaroori.
//
// Nullable rakha hai: naye products create time pe slug generate karte hain
// (services/product.service.js), purane products ke liye alag backfill
// script (seeders/backfill-product-slugs.js) chalega. Isi wajah se unique
// index bhi PARTIAL hai (WHERE slug IS NOT NULL) — warna backfill se pehle
// multiple NULL rows unique constraint todtin.

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Products', 'slug', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Categories slug jaisa hi pattern — case-insensitive uniqueness, warna
    // "Honda-Civic-Mat" aur "honda-civic-mat" dono ban jate.
    await queryInterface.sequelize.query(
      'CREATE UNIQUE INDEX products_slug_lower_uniq ON "Products" (LOWER(slug)) WHERE slug IS NOT NULL;'
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      'DROP INDEX IF EXISTS products_slug_lower_uniq;'
    );
    await queryInterface.removeColumn('Products', 'slug');
  },
};
