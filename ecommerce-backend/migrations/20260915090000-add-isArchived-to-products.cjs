'use strict';

/**
 * Products.isArchived
 *
 * Duplicate products ko site se hatane ke liye. DELETE jaan bujh kar NAHI
 * karte: Products par lagi saari foreign keys (OrderItems, Reviews, CartItems,
 * Wishlists, ProductVariants) ON DELETE CASCADE hain, to ek duplicate product
 * delete karne se us ke customer orders ki items aur uske saare reviews bhi
 * mit jate hain. Order history kabhi bhi SEO cleanup ke liye qurban nahi honi
 * chahiye.
 *
 * Archived product:
 *   - kisi public listing (products, category, search, featured, sale,
 *     new arrivals, related) mein nahi aata
 *   - is liye sitemap se bhi apne aap nikal jata hai
 *   - uski purani URL client/config/productRedirects.json ke zariye keeper
 *     product par 301 ho jati hai
 *   - row DB mein rehti hai, to purane orders aur reviews waise ke waise
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Products', 'isArchived', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('Products', 'isArchived');
  },
};
