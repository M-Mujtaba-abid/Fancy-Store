import models from "../models/index.js";
import sequelize from "../config/db.js";
import { Op } from "sequelize";

const { User, Product, Review } = models;

// 1. Generate 50 Unique Pakistani Customer Reviewers
const FIRST_NAMES = [
  "Muhammad", "Ali", "Hamza", "Usman", "Bilal", "Saad", "Zubair", "Ahmed",
  "Faizan", "Omar", "Shoaib", "Tariq", "Hassan", "Asad", "Kamran", "Waqas",
  "Nabeel", "Farhan", "Shahid", "Kashif", "Imran", "Sajjad", "Rizwan", "Adeel", "Arslan"
];

const LAST_NAMES = [
  "Usman", "Tariq", "Raza", "Ahmed", "Malik", "Shah", "Khan", "Sheikh",
  "Farooq", "Akram", "Chaudhry", "Bhatti", "Javed", "Iqbal", "Qureshi",
  "Ghaffar", "Nawaz", "Siddiqui", "Mehmood", "Aziz"
];

const REVIEWERS = Array.from({ length: 50 }, (_, i) => {
  const fName = FIRST_NAMES[i % FIRST_NAMES.length];
  const lName = LAST_NAMES[(i * 3) % LAST_NAMES.length];
  return {
    name: `${fName} ${lName}`,
    email: `raincoat.reviewer${i + 1}@example.com`,
  };
});

// 2. 50 Completely Unique 2-Line Raincoat Reviews (4.8 to 5.0 Rating Distribution)
const UNIQUE_RAINCOAT_REVIEWS = [
  { rating: 5, comment: "100% waterproof raincoat! Rode my bike in heavy rain and stayed completely dry underneath.\nFabric and stitching quality are amazing." },
  { rating: 5, comment: "Boht zabardast quality hai. Heavy rainfall mein bhi paani andar nahi jata.\nDelivery was super fast in Lahore." },
  { rating: 5, comment: "Excellent raincoat for daily bike commuters. The hood fitting is great and covers properly.\nVery happy with this purchase." },
  { rating: 5, comment: "Material is thick and durable, not cheap plastic at all.\nWorth every rupee, 100% recommended!" },
  { rating: 5, comment: "Best waterproof rain coat I have bought online. Size is perfect and comfortable.\nStitching is strong and clean." },
  { rating: 4.9, comment: "Great protection against rain while riding bike. Comes with a nice storage pouch.\nQuality is 10/10." },
  { rating: 5, comment: "Testing this during monsoon season and it works flawlessly.\nKeeps both clothes and bag safe from getting wet." },
  { rating: 5, comment: "Zabardast raincoat hai. High quality fabric with perfect fitting.\nPackaging was neat and delivered in 2 days." },
  { rating: 4.8, comment: "Premium quality raincoat! Button and zipper quality are sturdy.\nVery satisfied with Fancy Store service." },
  { rating: 5, comment: "Full body protection in heavy rain. Pants and jacket fitting is on point.\nMust-have item for every biker!" },
  { rating: 5, comment: "Boht achi raincoat hai. Water easily slides off without soaking the fabric.\nSuper lightweight and comfortable to carry." },
  { rating: 4.5, comment: "Very effective against heavy rain. Wore it during continuous downpour and remained dry.\nGood value for money." },
  { rating: 5, comment: "The material quality exceeded my expectations. Strong zipper and well sealed seams.\nHighly recommended product!" },
  { rating: 5, comment: "Bikers ke liye perfect choice hai. Heavy rain mein bilkul paani nahi lagta.\nDelivery was fast and seller is cooperative." },
  { rating: 5, comment: "Impressive waterproof coating! Used it twice in heavy rainfall and no leakage at all.\nFive stars for durability." },
  { rating: 5, comment: "Size guide is accurate and fitting is very comfortable.\nQuality of hood and wrist elastic is top notch." },
  { rating: 5, comment: "Bohot achha raincoat hai, kapra strong aur durable hai.\nPaisay vasool item, 100% genuine quality." },
  { rating: 5, comment: "Super heavy duty raincoat. Easily fits over backpack as well.\nGreat finish and sturdy buttons." },
  { rating: 4.8, comment: "Decent thickness and complete water resistance. Rode 20km in rain without an issue.\nVery satisfied with performance." },
  { rating: 5, comment: "Best rain suit for outdoor travel. Material doesn't tear easily and repels water instantly.\nWill buy again for brother." },
  { rating: 5, comment: "Top class quality! Waterproofing is 100% real and zip is smooth.\nThank you Fancy Store for fast shipping." },
  { rating: 5, comment: "Very comfortable to wear while driving bike. Double flap zipper stops any water ingress.\n10/10 rating!" },
  { rating: 5, comment: "Shandar product hai. Water repellency is excellent and material feels premium.\nArrived safe and sound." },
  { rating: 5, comment: "Heavy rainfall protection at a reasonable price. Elastic cuffs keep water out.\nHighly satisfied customer." },
  { rating: 5, comment: "Achi quality ka raincoat hai. Fabric is breathable yet fully waterproof.\nFits perfectly over clothes." },
  { rating: 4.8, comment: "Works really well in monsoon. Kept my office uniform clean and dry.\nVery practical and easy to fold." },
  { rating: 5, comment: "Exceptional quality raincoat. Strong stitching along all joints and hood fits comfortably.\nFive stars all the way!" },
  { rating: 5, comment: "Paani bilkul nahi andar jata. High quality waterproof material with elegant look.\nRecommended for everyone." },
  { rating: 5, comment: "Loved the quality and dark color finish. Zippers are heavy duty and don't get stuck.\nFast delivery." },
  { rating: 5, comment: "Biker essential item! Tested in storm rain and remained 100% dry.\nQuality is far better than local market ones." },
  { rating: 5, comment: "Great fitting and comfortable sleeve length. Reflective strip adds extra safety at night.\nSuperb product!" },
  { rating: 5, comment: "Mashallah bohot umda quality hai. Fabric is thick and wind-resistant as well.\nSatisfied with overall buying experience." },
  { rating: 5, comment: "Heavy duty raincoat suit. Easily covers shoulders and waist without tightness.\nBest online purchase this month." },
  { rating: 4.7, comment: "Nice design and strong material. Repels water effectively during daily commute.\nGood quality product." },
  { rating: 5, comment: "Truly 100% waterproof raincoat as promised. Very lightweight to keep in bike trunk.\nTop quality material." },
  { rating: 5, comment: "Boht lajawab raincoat hai. Stitching and seam sealing are very neat.\nHighly recommended to all bike riders." },
  { rating: 5, comment: "Excellent water repellent properties. Easy to dry after rain and folds compactly.\n5 star seller service!" },
  { rating: 5, comment: "Pura body dry rehta hai heavy rain mein bhi. High grade fabric used.\nFull marks for quality and packing." },
  { rating: 5, comment: "Very impressive raincoat set. Wrist and ankle elastics fit snugly.\nMust buy for rainy season!" },
  { rating: 5, comment: "Premium quality raincoat! Does not let a single drop through.\nVery happy with quick dispatch and delivery." },
  { rating: 5, comment: "Amazing product for long distance bike rides in rain. Hood coverage is complete.\nVery satisfied!" },
  { rating: 4, comment: "High quality waterproof fabric. Used in heavy downpour and worked like a charm.\nGood value for money." },
  { rating: 5, comment: "Bohot achi raincoat hai, fabric thick aur durable hai.\nPacking was excellent and delivery was on time." },
  { rating: 5, comment: "Super reliable rain protection. Zipper with press buttons gives extra security against leaks.\n100% recommended!" },
  { rating: 5, comment: "Best quality raincoat on the market! Water rolls off like magic.\nFancy Store never disappoints." },
  { rating: 5, comment: "Very durable material, no tears or loose threads. Fitting is spot on.\nVery happy with this raincoat." },
  { rating: 5, comment: "Rode in torrential rain for 40 minutes and stayed bone dry underneath.\nUnbelievable quality for this price!" },
  { rating: 5, comment: "Bohot zabardast product hai. Material is thick, soft, and completely leakproof.\nWill buy another one for my dad." },
  { rating: 5, comment: "Top quality raincoat with great hood design. Keeps head and neck fully protected.\nHighly recommended!" },
  { rating: 5, comment: "Awesome raincoat set! Light weight yet very tough against heavy rains.\nFive stars rating!" }
];

async function seedReviews() {
  console.log("🌱 Starting Rain Coat Review Seeding Script...");

  try {
    // Connect DB
    await sequelize.authenticate();
    console.log("✅ Database connected successfully.");

    // 1. Ensure 50 Reviewer Users exist in DB
    const reviewerUsers = [];
    for (const u of REVIEWERS) {
      let [user] = await User.findOrCreate({
        where: { email: u.email },
        defaults: {
          name: u.name,
          email: u.email,
          role: "user",
          avatar: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
        },
      });
      reviewerUsers.push(user);
    }
    console.log(`✅ ${reviewerUsers.length} unique reviewer accounts ready.`);

    // 2. Get ONLY Rain Coat products (by category, subCategory, or name)
    const products = await Product.findAll({
      where: {
        [Op.or]: [
          { category: { [Op.iLike || Op.like]: "%rain%" } },
          { subCategory: { [Op.iLike || Op.like]: "%rain%" } },
          { name: { [Op.iLike || Op.like]: "%rain%" } },
        ],
      },
    });

    if (!products || products.length === 0) {
      console.log("⚠️ No Rain Coat products found in database to seed reviews.");
      process.exit(0);
    }
    console.log(`📦 Found ${products.length} Rain Coat products to seed reviews for.`);

    let totalCreatedReviews = 0;

    // 3. Loop ONLY over Rain Coat products and attach 34 to 35 reviews per product
    for (const product of products) {
      // Pick 34 or 35 unique reviews per product
      const reviewCount = Math.floor(Math.random() * 2) + 34; // 34 or 35
      const selectedReviewers = reviewerUsers.slice(0, reviewCount);

      for (let i = 0; i < selectedReviewers.length; i++) {
        const user = selectedReviewers[i];
        const reviewTemplate = UNIQUE_RAINCOAT_REVIEWS[i % UNIQUE_RAINCOAT_REVIEWS.length];

        // Check if review already exists for (userId, productId) for idempotency
        const existing = await Review.findOne({
          where: { userId: user.id, productId: product.id },
        });

        if (!existing) {
          await Review.create({
            userId: user.id,
            productId: product.id,
            rating: reviewTemplate.rating,
            comment: reviewTemplate.comment,
            images: [],
            isApproved: true, // ✅ Approved so it displays immediately
          });
          totalCreatedReviews++;
        } else {
          // Update existing to approved and unique comment
          existing.rating = reviewTemplate.rating;
          existing.comment = reviewTemplate.comment;
          existing.isApproved = true;
          await existing.save();
        }
      }

      // 4. Sync product stats ONLY for this Rain Coat product (averageRating and totalReviews)
      const approvedCount = await Review.count({
        where: { productId: product.id, isApproved: true },
      });

      const ratingSum = await Review.sum("rating", {
        where: { productId: product.id, isApproved: true },
      });

      const avgRating =
        approvedCount > 0 ? (ratingSum / approvedCount).toFixed(1) : "0.0";

      await Product.update(
        {
          averageRating: parseFloat(avgRating),
          totalReviews: approvedCount,
        },
        { where: { id: product.id } }
      );

      console.log(
        `⭐ Rain Coat Product #${product.id} (${product.name}): ${approvedCount} reviews, Avg Rating: ${avgRating}`
      );
    }

    console.log(
      `\n🎉 Rain Coat Review Seeding Completed Successfully! Created/Updated ${totalCreatedReviews} reviews.`
    );
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding reviews:", error);
    process.exit(1);
  }
}

seedReviews();
