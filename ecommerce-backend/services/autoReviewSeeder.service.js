import models from "../models/index.js";

const { User, Product, Review } = models;

// Dedicated fake reviewer pool for the auto-seeder (kept separate from the
// raincoat-specific pool used by seeders/seed-reviews.js so the two scripts
// never collide on the same emails).
const FIRST_NAMES = [
  "Muhammad", "Ali", "Hamza", "Usman", "Bilal", "Saad", "Zubair", "Ahmed",
  "Faizan", "Omar", "Shoaib", "Tariq", "Hassan", "Asad", "Kamran", "Waqas",
  "Nabeel", "Farhan", "Shahid", "Kashif", "Imran", "Sajjad", "Rizwan", "Adeel",
  "Arslan", "Danish", "Sameer", "Junaid", "Talha", "Haris", "Zeeshan", "Aamir",
  "Fahad", "Yasir", "Sohail", "Naveed", "Adnan", "Salman", "Umer", "Noman",
];

const LAST_NAMES = [
  "Usman", "Tariq", "Raza", "Ahmed", "Malik", "Shah", "Khan", "Sheikh",
  "Farooq", "Akram", "Chaudhry", "Bhatti", "Javed", "Iqbal", "Qureshi",
  "Ghaffar", "Nawaz", "Siddiqui", "Mehmood", "Aziz", "Baig", "Butt", "Dar",
  "Hashmi", "Latif", "Rana",
];

const REVIEWER_POOL_SIZE = 100;

const REVIEWERS = Array.from({ length: REVIEWER_POOL_SIZE }, (_, i) => {
  const fName = FIRST_NAMES[i % FIRST_NAMES.length];
  const lName = LAST_NAMES[(i * 7) % LAST_NAMES.length];
  return {
    name: `${fName} ${lName}`,
    email: `store.reviewer${i + 1}@example.com`,
  };
});

// Generic, category-agnostic comments (this runs across every product type,
// not just one category) mixing English and Roman Urdu, matching the tone
// used elsewhere in the store's fake-review seeding.
const COMMENT_BANK = [
  "Bohot achi quality hai, paisay vasool item!",
  "Great product, exactly as described. Very satisfied.",
  "Delivery was fast and packaging was neat.",
  "Zabardast quality hai, dobara zaroor order karunga.",
  "Very happy with this purchase, works perfectly.",
  "Material quality is really good for the price.",
  "Achi cheez hai, expectations se behtar nikli.",
  "Product arrived on time and in perfect condition.",
  "Highly recommended, quality is top notch.",
  "Bilkul original jaisa laga, quality solid hai.",
  "Fitting perfect thi, koi issue nahi hua.",
  "Excellent value for money, will buy again.",
  "Service acha tha, product bhi mutabiq tha.",
  "Very durable and well made, worth it.",
  "Shukriya, product bilkul theek mila.",
  "Nice finish and sturdy build quality.",
  "Order jaldi pohnch gaya, quality bhi acha hai.",
  "Better than expected, very good product.",
  "Achi packaging thi aur product bhi safe pohncha.",
  "Satisfied with the purchase, no complaints.",
  "Boht umda quality hai, sabko recommend karunga.",
  "Product exactly matches the pictures shown.",
  "Comfortable and looks premium, loved it.",
  "Genuine quality product, very impressed.",
  "Fast shipping and item was well packed.",
  "Paisa vasool product, bohot khush hoon.",
  "Solid build, does the job perfectly.",
  "Achi service aur time pe delivery mili.",
  "Really good quality, exceeded my expectations.",
  "Will definitely order more items from here.",
  "Fancy Store ki service acha hai, item bhi original.",
  "Perfect fit and finish, no defects at all.",
  "Great customer experience overall, thank you.",
  "Quality dekh kar khushi hoi, sahi item hai.",
];

const MIN_REVIEWS_PER_PRODUCT = 20;
const MAX_REVIEWS_PER_PRODUCT = 95;
const MIN_SOLD = 51;
const MAX_SOLD = 500;
const COMMENT_CHANCE = 0.4;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 80% 5-star, 15% split across 4/3-star, 5% 2-star-or-lower.
function randomRating() {
  const roll = Math.random();
  if (roll < 0.8) return 5;
  if (roll < 0.875) return 4;
  if (roll < 0.95) return 3;
  return randomInt(1, 2);
}

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

async function ensureReviewerUsers() {
  const reviewerUsers = [];
  for (const u of REVIEWERS) {
    const [user] = await User.findOrCreate({
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
  return reviewerUsers;
}

async function syncProductStats(productId) {
  const approvedCount = await Review.count({
    where: { productId, isApproved: true },
  });
  const ratingSum = await Review.sum("rating", {
    where: { productId, isApproved: true },
  });
  const avgRating = approvedCount > 0 ? (ratingSum / approvedCount).toFixed(1) : "0.0";
  return { totalReviews: approvedCount, averageRating: parseFloat(avgRating) };
}

export async function runAutoReviewSeeder() {
  const products = await Product.findAll({ where: { sold: 0, totalReviews: 0 } });

  if (!products || products.length === 0) {
    console.log("No zero-activity products found — nothing to seed.");
    return { productsProcessed: 0, reviewsCreated: 0 };
  }

  console.log(`Found ${products.length} zero-activity product(s) to seed.`);

  const reviewerUsers = await ensureReviewerUsers();

  let productsProcessed = 0;
  let reviewsCreated = 0;

  for (const product of products) {
    try {
      const reviewCount = randomInt(MIN_REVIEWS_PER_PRODUCT, MAX_REVIEWS_PER_PRODUCT);
      const selectedReviewers = shuffle(reviewerUsers).slice(0, reviewCount);

      for (const user of selectedReviewers) {
        const existing = await Review.findOne({
          where: { userId: user.id, productId: product.id },
        });
        if (existing) continue;

        const rating = randomRating();
        const comment =
          Math.random() < COMMENT_CHANCE
            ? COMMENT_BANK[randomInt(0, COMMENT_BANK.length - 1)]
            : null;

        await Review.create({
          userId: user.id,
          productId: product.id,
          rating,
          comment,
          images: [],
          isApproved: true,
        });
        reviewsCreated++;
      }

      const sold = randomInt(MIN_SOLD, MAX_SOLD);
      const { totalReviews, averageRating } = await syncProductStats(product.id);

      await Product.update(
        { sold, totalReviews, averageRating },
        { where: { id: product.id } }
      );

      productsProcessed++;
      console.log(
        `Seeded product #${product.id} (${product.name}): ${totalReviews} reviews, avg ${averageRating}★, sold ${sold}`
      );
    } catch (error) {
      console.error(`Failed to seed product #${product.id}:`, error.message);
    }
  }

  return { productsProcessed, reviewsCreated };
}

export default runAutoReviewSeeder;
