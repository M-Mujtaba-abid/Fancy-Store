/**
 * seedReviews.js - Text Only Reviews Seed
 * Run: node scripts/seedReviews.js
 */

import models, { sequelize } from "../models/index.js";
const { User, Product, Review } = models;

// ─── Comments by rating ───────────────────────────────────────────────────────
const fiveStarComments = [
  "Yaar kya product hai bilkul! Maine pehle ek local market se cover liya tha jo 2 mahine mein hi fadh gaya tha lekin ye wala quality mein bohot superior hai. Stitching ekdum tight hai, aur material feel karo to samajh aata hai ke paisa vasool hua. Mere neighbor ne bhi abhi order kiya hai uski car ke liye. Highly recommended for anyone who wants long-term protection.",
  "Gari pe lagaya to ekdum perfect fit aaya, jaise factory fitted ho. Zabardast waterproof quality hai — kal raat baarish aayi thi, subah check kiya to andar se bilkul dry tha. Jo log sochte hain online se cover lena risky hota hai unhe ek baar zaroor try karna chahiye. Packaging bhi acha tha, bubble wrap mein aaya tha koi damage nahi.",
  "3 saal se ye store se le raha hoon aur quality hamesha consistent rahi hai. Is dafa bhi same experience — ekdum genuine product. Color bhi wahi nikla jo picture mein dikhaya tha, koi misleading photography nahi. Jo log colors dekhke order karte hain unhe bilkul accurate product milta hai. Keep it up Fancy Store!",
  "Meri gari bahar dhoop mein khadi rehti hai, bohot tension thi paint kharab hone ki. Is cover ne sach mein fark kar diya hai. 6 mahine ho gaye hain, paint aur interior dono protected hai. Material UV resistant lagta hai kyunki dhoop mein bhi cover ka color nahi gaya. Worth every rupee spent.",
  "Delivery speed se aai, 2 din mein ghar pe tha. Cover lagana ek bande ka kaam hai, koi special skill nahi chahiye. Bag mein pack tha jo reuse ke liye bhi kaam aa raha hai. Is price range mein ye quality milna mushkil hai. Mera second order hai is store se, pehla bhi 100% satisfied tha.",
  "Bhai pehle main Amazon se mangata tha lekin wo ajeeb sizes mein aate the, kabhi zyada bade kabhi chhote. Is store ka cover model-specific tha aur fit bilkul accurate aaya. Seams sab corners pe perfect hain, koi extra cloth nahi, koi kheenchao nahi. Ye attention to detail bohot rare hai local stores mein.",
  "Monsoon se pehle order kiya tha, itna acha decision tha. Cover paani bilkul andar nahi aane deta. Is ke upar dust bhi asan se jhad jaati hai, koi special cleaning nahi chahiye. Material soft hai andar se to gari ki body pe koi scratch nahi aata. Overall best purchase this year.",
];

const fourStarComments = [
  "Product overall bohot acha hai, quality se satisfied hoon. Sirf ek cheez — delivery 4 din mein aayi, expected 2 din mein aati. Lekin jab aaya to condition perfect thi, koi damage nahi. Cover ka material thick hai aur waterproofing genuine lagti hai. Ek baar baarish mein test hua, bilkul theek raha. 4 star isliye ke delivery time thora improve honi chahiye.",
  "Gari pe fit perfect hai, quality bhi achi hai. Color real picture se thora light nikla lekin acceptable hai. Stitching solid hai, koi loose thread nahi. Price ke hisaab se ye value for money hai. Warna local market mein itni quality ke liye 2x price manga jata hai. Recommend karoonga lekin color check zaroor karo pehle.",
  "Bohot achi quality ka cover hai. Ek minor complaint — elastic bottom mein thori tight hai initially, pehli dafa lagane mein thora force lagna pada. Lekin 2-3 baar use ke baad settle ho gaya. Ab fit bilkul accurate hai. Honestly is price mein minor inconvenience is acceptable. Product durable lagta hai, long term use dekhna hai.",
  "Second time order kiya hai is store se. Pehla cover 1.5 saal chala jo mere hisaab se achi life hai for the price. Is wala bhi same quality lagta hai. Ek upgrade ye hai ke is baar material slightly thicker hai. Roz subah dew se gari protect rehti hai. Bas delivery packaging thori better ho sakti thi.",
  "Material quality se khush hoon lekin pouch/bag jo cover ke sath diya, wo thora flimsy hai. Cover khud bohot acha hai, UV protection aur water resistance dono genuine lagte hain. Ek chhoti buckle loose thi, manually tight karni pari. Customer service ne message reply kiya jo good sign hai. Overall positive experience.",
];

const threeStarComments = [
  "Cover average quality ka hai, price ke hisaab se theek hai. Na bohot acha na bohot bura. Waterproofing achi hai lekin stitching kuch areas mein thori loose lagti hai, dekhna padega ke kitni life deta hai. Delivery time reasonable tha. Fir update karoonga agar koi issue aaya.",
  "Kuch expectations thi jo puri nahi huin. Color picture se clearly different tha, almost ek shade darker. Fit thora loose hai sides pe, hawaon mein udate rehta hai. Lekin quality of material itself acha hai, soft feel hai. Mixed feelings hain, isliye 3 star. Sochta hoon ke next time koi aur try karoonga.",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function randomDate(monthsBack = 8) {
  const now = Date.now();
  const past = now - monthsBack * 30 * 24 * 60 * 60 * 1000;
  return new Date(past + Math.random() * (now - past));
}

function weightedRating() {
  const r = Math.random() * 100;
  if (r < 40) return 5;
  if (r < 78) return 4;
  if (r < 93) return 3;
  return 2;
}

function pickComment(rating, usedComments) {
  const pool = rating === 5 ? fiveStarComments : rating === 4 ? fourStarComments : threeStarComments;
  const available = pool.filter((c) => !usedComments.has(c));
  const source = available.length > 0 ? available : pool;
  const picked = source[Math.floor(Math.random() * source.length)];
  usedComments.add(picked);
  return picked;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function seedReviews() {
  try {
    await sequelize.authenticate();
    console.log("✅ DB connected");

    console.log("🗑️  Purging existing reviews...");
    await Review.destroy({ where: {}, truncate: true });
    console.log("✅ Old reviews cleared\n");

    const users = await User.findAll();
    const products = await Product.findAll();
    console.log(`Found ${users.length} users | ${products.length} products\n`);

    for (const product of products) {
      const reviewCount = Math.min(users.length, 20 + Math.floor(Math.random() * 6));
      const reviewers = shuffle(users).slice(0, reviewCount);
      const usedComments = new Set();

      const rows = reviewers.map((user) => {
        const rating = weightedRating();
        return {
          userId: user.id,
          productId: product.id,
          rating,
          comment: pickComment(rating, usedComments),
          images: [],
          isApproved: true,
          createdAt: randomDate(8),
          updatedAt: new Date(),
        };
      });

      await Review.bulkCreate(rows);

      const allR = await Review.findAll({ where: { productId: product.id, isApproved: true } });
      const avg = allR.reduce((s, r) => s + r.rating, 0) / allR.length;
      await product.update({
        averageRating: parseFloat(avg.toFixed(1)),
        totalReviews: allR.length,
      });

      console.log(`✔ ${product.name.substring(0, 55)}...`);
      console.log(`  → ${rows.length} reviews | avg ${avg.toFixed(1)}⭐\n`);
    }

    console.log("🎉 Done! Text-only reviews seeded successfully.");
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await sequelize.close();
  }
}

seedReviews();