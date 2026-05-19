'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Sab se pehle ensure karein ke vector extension enabled hai
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS vector;');
    
    // 2. Products table mein embedding ka naya column add karein
    // Note: Agar aapke table ka naam lowercase mein "products" hai, to yahan bhi "products" likhein
    await queryInterface.sequelize.query('ALTER TABLE "Products" ADD COLUMN embedding vector(384);');
  },

  async down(queryInterface, Sequelize) {
    // Rollback ke waqt column drop kar dein
    await queryInterface.sequelize.query('ALTER TABLE "Products" DROP COLUMN embedding;');
  }
};