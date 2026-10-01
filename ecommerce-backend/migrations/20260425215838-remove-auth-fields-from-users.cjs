'use strict';

/**
 * Users se purane auth columns hatana (auth ab UserIdentity table mein hai).
 *
 * ⚠️ Har column ko hatane se PEHLE check karte hain ke wo mojood bhi hai.
 *
 * Wajah: ye migration ek fresh database par toot jati thi. Is se pehle wali
 * `20260422174325-add-google-auth-fields-to-users.cjs` bilkul KHALI hai (sirf
 * sequelize-cli ka scaffold, kisi ne bhara hi nahi). Yani `googleId` aur
 * `authProvider` kabhi kisi migration ne banaye hi nahi - wo purane database
 * par haath se ya model sync se aaye the. Naye database par ye migration
 * "column googleId does not exist" par ruk jati thi aur poori chain wahin
 * khatam ho jati thi.
 *
 * Doosra faida: ye migration ab dobara chalayi ja sakti hai. Pehli koshish
 * mein `password` hat chuka tha magar migration record nahi hui thi, to
 * seedha re-run bhi "column password does not exist" deta.
 *
 * Migration ka maqsad "ye columns na hon" hai, "ye columns drop karo" nahi -
 * is liye mojood na hone par chup chaap aage barhna bilkul durust hai.
 */

const COLUMNS = ['password', 'googleId', 'authProvider', 'resetOtp', 'resetOtpExpiry'];

module.exports = {
  async up(queryInterface) {
    const table = await queryInterface.describeTable('Users');
    for (const column of COLUMNS) {
      if (table[column]) {
        await queryInterface.removeColumn('Users', column);
      }
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('Users');
    const types = {
      password: { type: Sequelize.STRING, allowNull: true },
      googleId: { type: Sequelize.STRING, allowNull: true },
      authProvider: { type: Sequelize.STRING, allowNull: true },
      resetOtp: { type: Sequelize.STRING, allowNull: true },
      resetOtpExpiry: { type: Sequelize.DATE, allowNull: true },
    };
    for (const column of COLUMNS) {
      if (!table[column]) {
        await queryInterface.addColumn('Users', column, types[column]);
      }
    }
  },
};
