'use strict';

/**
 * CouponRedemptions - "kis ne kaun sa coupon istemal kiya".
 *
 * Do kaam karti hai:
 *   1. Attribution: promoter ki sale report isi table se banti hai.
 *   2. Per-customer limit: wahi phone/email dobara coupon na le sake.
 *
 * ⚠️ Partial unique indexes hi asal rok hain.
 *
 * Sirf application mein SELECT kar ke check karna kaafi NAHI hai: ek hi bande
 * ke do orders ek sath aayein to dono ka SELECT khali aayega aur dono ko
 * discount mil jayega. Database level par unique index laga dene se doosra
 * order khud reject ho jata hai, timing chahe jaisi bhi ho.
 *
 * Index `WHERE status = 'consumed'` par hai, is liye released rows (cancel hue
 * orders) record mein rehti hain magar raasta nahi rokteen.
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('CouponRedemptions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      couponId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Coupons', key: 'id' },
        // Coupon delete ho jaye to uski redemption history bhi chali jati hai.
        // Isi liye admin panel mein delete ki jagah isActive=false suggest
        // kiya gaya hai.
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },

      orderId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Orders', key: 'id' },
        // Order delete ho to redemption bachi rahe (limit ka record), bas
        // orderId null ho jaye.
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },

      userId: { type: Sequelize.INTEGER, allowNull: true },

      // Customer ne jo likha (dikhane ke liye).
      phone: { type: Sequelize.STRING(30), allowNull: true },
      email: { type: Sequelize.STRING(160), allowNull: true },

      // Compare HAMESHA in par hota hai.
      //
      // Ek hi banda "03001234567", "0300-1234567", "+923001234567" likh kar
      // teen baar discount le sakta tha. phoneNormalized sab ko ek hi 11-digit
      // shakal mein laata hai. Gmail ke dots aur +suffix bhi ek hi inbox hain,
      // emailNormalized unhe bhi barabar kar deta hai.
      phoneNormalized: { type: Sequelize.STRING(30), allowNull: true },
      emailNormalized: { type: Sequelize.STRING(160), allowNull: true },

      discountAmount: { type: Sequelize.FLOAT, allowNull: false, defaultValue: 0 },
      orderSubtotal: { type: Sequelize.FLOAT, allowNull: false, defaultValue: 0 },

      status: {
        type: Sequelize.ENUM('consumed', 'released'),
        allowNull: false,
        defaultValue: 'consumed',
      },
      releasedAt: { type: Sequelize.DATE, allowNull: true },
      releaseReason: { type: Sequelize.STRING(200), allowNull: true },

      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    await queryInterface.addIndex('CouponRedemptions', ['couponId']);
    await queryInterface.addIndex('CouponRedemptions', ['orderId']);

    // Partial unique indexes. Sequelize ka addIndex `where` support karta hai
    // magar raw SQL yahan zyada saaf hai aur Postgres syntax bilkul wahi rehta.
    //
    // usageLimitPerCustomer > 1 wale coupons ke liye ye index sakht hai: aise
    // coupon par doosri redemption ruk jayegi. Abhi har coupon per-customer 1
    // hi hai; zaroorat par index hata kar service-level count par jana parega.
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX "coupon_redeem_phone_uniq"
        ON "CouponRedemptions" ("couponId", "phoneNormalized")
        WHERE "status" = 'consumed' AND "phoneNormalized" IS NOT NULL;
    `);

    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX "coupon_redeem_email_uniq"
        ON "CouponRedemptions" ("couponId", "emailNormalized")
        WHERE "status" = 'consumed' AND "emailNormalized" IS NOT NULL;
    `);
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS "coupon_redeem_phone_uniq";');
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS "coupon_redeem_email_uniq";');
    await queryInterface.dropTable('CouponRedemptions');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_CouponRedemptions_status";');
  },
};
