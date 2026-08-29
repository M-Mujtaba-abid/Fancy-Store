'use strict';

// Blog posts (SEO content marketing) — see models/blogPost.model.js for the
// "no association, slug-string links only" rationale.

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('BlogPosts', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING(120),
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      excerpt: {
        type: Sequelize.STRING(300),
        allowNull: true,
      },
      body: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      coverImage: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      coverImageAlt: {
        type: Sequelize.STRING(160),
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: 'draft',
      },
      publishedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      author: {
        type: Sequelize.STRING(80),
        allowNull: false,
        defaultValue: 'Fancy Store',
      },
      metaTitle: {
        type: Sequelize.STRING(70),
        allowNull: true,
      },
      metaDescription: {
        type: Sequelize.STRING(180),
        allowNull: true,
      },
      relatedProductSlugs: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      relatedCategorySlugs: {
        type: Sequelize.JSON,
        allowNull: true,
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

    // Case-insensitive uniqueness — Sequelize's `unique: true` on the model
    // is case-sensitive at the Postgres level, same fix as categories/products.
    await queryInterface.sequelize.query(
      'CREATE UNIQUE INDEX blog_posts_slug_lower_uniq ON "BlogPosts" (LOWER(slug));'
    );

    // Backs the public-listing query (status='published' order by publishedAt desc).
    await queryInterface.sequelize.query(
      'CREATE INDEX blog_posts_status_published_at_idx ON "BlogPosts" (status, "publishedAt" DESC);'
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      'DROP INDEX IF EXISTS blog_posts_status_published_at_idx;'
    );
    await queryInterface.sequelize.query(
      'DROP INDEX IF EXISTS blog_posts_slug_lower_uniq;'
    );
    await queryInterface.dropTable('BlogPosts');
  },
};
