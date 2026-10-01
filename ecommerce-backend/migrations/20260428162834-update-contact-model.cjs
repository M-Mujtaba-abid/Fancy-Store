'use strict';

/**
 * contacts: email ka unique constraint hatao, category column add karo.
 *
 * ⚠️ Ye file pehle ESM syntax (`export const up = ...`) mein likhi hui thi
 * jabke extension `.cjs` hai. Node `.cjs` ko hamesha CommonJS samajhta hai, to
 * `export` par "Unexpected token 'export'" aata tha aur migration chain yahin
 * ruk jati thi. Baqi saari migrations CommonJS hain; sirf yehi ek alag thi, is
 * liye purane database par kabhi pakri nahi gayi (wahan ye pehle hi chal chuki
 * thi aur dobara chalti nahi).
 *
 * Logic bilkul wahi hai jo pehle thi, sirf module syntax badla hai.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('contacts', 'contacts_email_key');
    await queryInterface.addColumn('contacts', 'category', {
      type: Sequelize.ENUM('order_issue', 'payment', 'return_refund', 'general', 'other'),
      defaultValue: 'general',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('contacts', 'category');
    // ENUM type column ke sath khud nahi jata.
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_contacts_category";');
  },
};
