'use strict';

// Maujooda 11 categories ko registry mein daalta hai.
//
// Values VERBATIM in teen hardcoded lists se copy ki gayi hain, taake deploy ke
// baad homepage bilkul waisa hi dikhe jaisa aaj dikhta hai:
//   - title / subtitle / image  -> client/constants/categoriesData.ts
//   - suggestedVariantType      -> client/components/admin/products/AddProduct.tsx:98-108
//   - sortOrder 1-8             -> HOME_CATEGORIES ka exact order
//
// showOnHome: pehle 8 true (aaj ke homepage tiles), aakhri 3 false —
// helmet / bike_accessories / car_accessories ka aaj koi tile nahi hai.
//
// matchMode: sab 'exact'. Pre-flight audit (49 products) mein har slug pe
// exact_ct === fuzzy_ct nikla, matlab exact matching aaj ka behaviour bilkul
// reproduce karti hai bina kisi product ko kho ne ke.
//
// NOTE: ye seed jaan-boojh kar migration hai, seeders/ folder mein nahi. Ye 11
// rows sample data nahi — homepage aur category pages inpe depend karte hain.

const now = new Date();

const CATEGORY_SEED = [
  // ---- Homepage tiles (aaj ke 8, HOME_CATEGORIES ke order mein) ----
  {
    slug: 'seat_cover',
    title: 'Seat Cover',
    subtitle: 'Custom fit for your car seats',
    image: '/category/seatCover.png',
    suggestedVariantType: 'Material',
    showOnHome: true,
    sortOrder: 1,
  },
  {
    slug: 'dashboard_mat',
    title: 'Dashboard Mat',
    subtitle: 'High quality protection for your dashboard',
    image: '/category/dashboardMat.png',
    suggestedVariantType: 'Material',
    showOnHome: true,
    sortOrder: 2,
  },
  {
    // "Trunc" typo jaan-boojh kar preserve kiya hai — aaj live yehi text hai.
    // Theek karna ho to alag change mein, warna ye migration visual diff banayegi.
    slug: 'trunk_tray',
    title: 'Trunc Tray Mat',
    subtitle: 'High-performance protection for your seats',
    image: '/category/trunkTrayMat.png',
    suggestedVariantType: 'Material',
    showOnHome: true,
    sortOrder: 3,
  },
  {
    slug: 'steering_cover',
    title: 'Steering Cover',
    subtitle: 'Easy grip and control of the steering wheel',
    image: '/category/steeringCover.png',
    suggestedVariantType: 'Material',
    showOnHome: true,
    sortOrder: 4,
  },
  {
    slug: 'car_topCover',
    title: 'Car Top Cover',
    // trailing space bhi as-is (categoriesData.ts:39)
    subtitle: 'Dust, Scratch, Water proof 100% ',
    // ye /category/ convention se bahar hai, lekin aaj yehi live hai
    image: '/sportage.png',
    suggestedVariantType: 'Material',
    showOnHome: true,
    sortOrder: 5,
  },
  {
    slug: 'floor_mat',
    title: 'Floor Mat',
    subtitle: 'clean and easy to remove',
    image: '/category/footMat.png',
    suggestedVariantType: 'Material',
    showOnHome: true,
    sortOrder: 6,
  },
  {
    slug: 'bike_topCover',
    title: 'Bike Top Cover',
    subtitle: 'High protection for your bike',
    image: '/category/bikeTopCover.png',
    suggestedVariantType: 'Material',
    showOnHome: true,
    sortOrder: 7,
  },
  {
    slug: 'rain_coat',
    title: 'Rain Coat',
    subtitle: '100% WaterProof',
    image: '/category/raincoat.jpeg',
    suggestedVariantType: 'Color',
    showOnHome: true,
    sortOrder: 8,
  },

  // ---- Backend-only categories (admin dropdown mein hain, tile nahi) ----
  {
    slug: 'helmet',
    title: 'Helmet',
    subtitle: null,
    image: null,
    suggestedVariantType: 'Size',
    showOnHome: false,
    sortOrder: 9,
  },
  {
    slug: 'bike_accessories',
    title: 'Bike Accessories',
    subtitle: null,
    image: null,
    suggestedVariantType: 'Edition',
    showOnHome: false,
    sortOrder: 10,
  },
  {
    slug: 'car_accessories',
    title: 'Car Accessories',
    subtitle: null,
    image: null,
    suggestedVariantType: 'Finish',
    showOnHome: false,
    sortOrder: 11,
  },
];

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert(
      'Categories',
      CATEGORY_SEED.map((c) => ({
        ...c,
        matchMode: 'exact',
        isActive: true,
        // bulkInsert createdAt/updatedAt auto-fill NAHI karta, aur woh
        // allowNull: false hain — explicitly dena zaroori hai.
        createdAt: now,
        updatedAt: now,
      })),
      // Re-run safe (ON CONFLICT DO NOTHING)
      { ignoreDuplicates: true }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Categories', {
      slug: { [Sequelize.Op.in]: CATEGORY_SEED.map((c) => c.slug) },
    });
  },
};
