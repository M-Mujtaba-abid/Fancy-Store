/**
 * applyTopCoverFlatSale.js - FLAT 40% OFF sale for car aur bike top covers.
 *
 * `price` = kati hui (crossed out) price, `discountPrice` = asli selling price.
 * Frontend ka "FLAT 40% OFF" badge tab dikhta hai jab discountPrice < price ho
 * (client/components/shop/share/ProductCard.tsx). Is liye har row ka cut price
 * itna rakha jata hai ke discount hamesha 40% ya us se thora zyada bane - kabhi
 * kam nahi, warna badge jhoot bolega.
 *
 * CAR  : after-sale price tier se aati hai (neeche CAR_TIERS).
 * BIKE : selling price jaisi hai waisi hi rehti hai, sirf cut price add hoti hai.
 *
 * Jin products ke variants hain, un ka sab se sasta variant tier price par set
 * hota hai aur mehngay material apna maujooda premium ratio rakhte hain, kyunke
 * card "Starting From <min variant>" dikhata hai.
 *
 * Script idempotent hai - absolute values set karti hai, multiply nahi karti,
 * is liye dobara chalane se prices aur neeche nahi girtin.
 *
 * Usage:
 *   node scripts/applyTopCoverFlatSale.js              # dry run (default)
 *   node scripts/applyTopCoverFlatSale.js --apply      # DB par likho
 */
import { Op } from "sequelize";
import { Product, ProductVariant, sequelize } from "../models/index.js";

const DISCOUNT_FACTOR = 0.6; // 40% off
const CAR_CATEGORY = "car_topCover";
const BIKE_CATEGORY = "bike_topCover";

const isDryRun =
  !process.argv.includes("--apply") &&
  String(process.env.DRY_RUN).toLowerCase() !== "false";

// After-sale (selling) prices. Cut price inhi se derive hoti hai.
const CAR_TIERS = {
  "hatchback:local": 2099,
  "hatchback:imported": 2299,
  "sedan:local": 2699,
  "sedan:imported": 2899,
  // SUV ki price origin par depend nahi karti.
  "suv:local": 3499,
  "suv:imported": 3499,
};

// Body type. SUV pehle check hota hai kyunke "Sportage" dono lists mein aa
// sakta hai. Jo kisi list mein na ho wo hatchback tier par jata hai - is mein
// vans aur kei/MPV (Bolan, Every, N Box, Wake, Roomy) bhi shamil hain.
const SUV_KEYWORDS = [
  "Sportage", "Raize", "Tucson", "Fortuner", "Prado", "Land Cruiser", "Vezel",
  "CR-V", "CRV", "HR-V", "HRV", "BR-V", "BRV", "Sorento", "Stonic", "Seltos",
  "MG HS", "MG ZS", "Glory", "Rocky", "X-Trail", "Juke", "Terios", "Kicks",
];
const SEDAN_KEYWORDS = [
  "Corolla", "Civic", "City", "Yaris", "Grande", "Baleno", "Camry", "Accord",
  "Elantra", "Sonata", "Altis", "GLI", "XLI", "Belta", "Premio", "Allion",
  "Axio", "Insight", "Grace", "Sunny", "Lancer", "Attrage", "Saloon",
];

// Pakistan mein locally assemble/sell hone wali gaariyan. Baaqi sab imported.
// Ye list build_products_csv.py ke LOCAL_SLUGS se aayi hai plus legacy products.
const LOCAL_KEYWORDS = [
  "Alto", "Cultus", "Wagon R", "WagonR", "Swift", "Every", "Khyber", "Mehran",
  "Bolan", "Carry Daba", "Ravi", "FAW V2", "United Alpha", "Santro",
  "Chevrolet Joy", "Chery QQ", "Picanto",
  "Corolla", "Civic", "City", "Baleno", "Yaris", "Grande", "GLI", "XLI",
];

// Classifier galat lage to yahan product id daal kar force kar do.
// Misal: 79: { body: "sedan", origin: "local" }
const OVERRIDES = {};

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const matchesKeyword = (text, keyword) =>
  new RegExp(`(^|[^a-z0-9])${escapeRegExp(keyword)}($|[^a-z0-9])`, "i").test(
    String(text || "")
  );

const matchesAny = (text, keywords) =>
  keywords.some((keyword) => matchesKeyword(text, keyword));

const classify = (product) => {
  const override = OVERRIDES[product.id];
  const text = `${product.name || ""} ${product.carModel || ""}`;

  const body =
    override?.body ??
    (matchesAny(text, SUV_KEYWORDS)
      ? "suv"
      : matchesAny(text, SEDAN_KEYWORDS)
        ? "sedan"
        : "hatchback");

  const origin =
    override?.origin ?? (matchesAny(text, LOCAL_KEYWORDS) ? "local" : "imported");

  return { body, origin, tierKey: `${body}:${origin}` };
};

/** Cut price: agle 100 par upar round, taake discount hamesha >= 40% rahe. */
const cutPriceFor = (salePrice) =>
  Math.ceil(salePrice / DISCOUNT_FACTOR / 100) * 100;

/** Premium variants ko 99 par khatam hone wale numbers par le aata hai. */
const roundTo99 = (value) => Math.max(99, Math.round(value / 10) * 10 - 1);

/** Variant ki maujooda asli selling price. */
const currentSellingPrice = (variant) => {
  const price = Number(variant.price);
  const salePrice = Number(variant.salePrice);
  return salePrice > 0 && salePrice < price ? salePrice : price;
};

const pct = (cut, sale) => (((cut - sale) / cut) * 100).toFixed(1);

/**
 * Ek product ka naya pricing plan. `basePrice` = sab se saste variant ki
 * (ya variant na hone par product ki) nayi selling price.
 *
 * `keepPrices` (bikes) par har variant apni maujooda selling price bilkul
 * waisi hi rakhta hai aur sirf cut price add hoti hai. Cars par sab se sasta
 * variant `basePrice` par aa jata hai aur baaqi apna premium ratio rakhte hain.
 */
const buildPlan = (product, basePrice, { keepPrices = false } = {}) => {
  const variants = product.variants || [];

  if (variants.length === 0) {
    return {
      product: { price: cutPriceFor(basePrice), discountPrice: basePrice },
      variants: [],
    };
  }

  const currentBase = Math.min(...variants.map(currentSellingPrice));

  const variantPlans = variants.map((variant) => {
    const current = currentSellingPrice(variant);
    const ratio = currentBase > 0 ? current / currentBase : 1;
    const salePrice = keepPrices
      ? current
      : ratio === 1
        ? basePrice
        : roundTo99(basePrice * ratio);
    return { variant, price: cutPriceFor(salePrice), salePrice };
  });

  const minSalePrice = Math.min(...variantPlans.map((plan) => plan.salePrice));

  return {
    // Product-level price card/detail page ke min variant se match karti hai.
    product: { price: cutPriceFor(minSalePrice), discountPrice: minSalePrice },
    variants: variantPlans,
  };
};

const applyTopCoverFlatSale = async () => {
  const transaction = await sequelize.transaction();

  try {
    const products = await Product.findAll({
      where: { category: { [Op.in]: [CAR_CATEGORY, BIKE_CATEGORY] } },
      attributes: [
        "id", "name", "carModel", "category", "price", "discountPrice", "isOnSale",
      ],
      include: [
        {
          model: ProductVariant,
          as: "variants",
          attributes: ["id", "variantValue", "price", "salePrice"],
          required: false,
        },
      ],
      order: [["category", "ASC"], ["id", "ASC"]],
      transaction,
    });

    console.log(`Mode           : ${isDryRun ? "DRY RUN (koi change nahi)" : "LIVE UPDATE"}`);
    console.log(`Products found : ${products.length}`);
    console.log("");

    let productCount = 0;
    let variantCount = 0;
    const tierCounts = {};

    for (const product of products) {
      const isBike = product.category === BIKE_CATEGORY;
      const variants = product.variants || [];

      // Bike ki selling price waisi hi rehti hai jaisi abhi lagi hai.
      // Car ki selling price tier se aati hai.
      let basePrice;
      let label;

      if (isBike) {
        basePrice =
          variants.length > 0
            ? Math.min(...variants.map(currentSellingPrice))
            : currentSellingPrice(product);
        label = "bike (price unchanged)";
      } else {
        const { tierKey } = classify(product);
        basePrice = CAR_TIERS[tierKey];
        label = tierKey;
      }

      if (!basePrice || Number.isNaN(basePrice)) {
        console.log(`! SKIP  #${product.id} ${product.name} - price nahi nikal saki`);
        continue;
      }

      const plan = buildPlan(product, basePrice, { keepPrices: isBike });

      console.log(
        `#${product.id} [${label}] ${product.name.slice(0, 60)}\n` +
          `    product : ${product.price} / ${product.discountPrice}` +
          `  ->  ${plan.product.price} / ${plan.product.discountPrice}` +
          `   (${pct(plan.product.price, plan.product.discountPrice)}% off)`
      );

      for (const variantPlan of plan.variants) {
        console.log(
          `    variant : ${String(variantPlan.variant.variantValue).slice(0, 24).padEnd(24)}` +
            ` ${variantPlan.variant.price} / ${variantPlan.variant.salePrice ?? "-"}` +
            `  ->  ${variantPlan.price} / ${variantPlan.salePrice}` +
            `   (${pct(variantPlan.price, variantPlan.salePrice)}% off)`
        );
      }

      if (!isDryRun) {
        await product.update(
          {
            price: plan.product.price,
            discountPrice: plan.product.discountPrice,
            isOnSale: true,
          },
          { transaction }
        );

        for (const variantPlan of plan.variants) {
          await variantPlan.variant.update(
            { price: variantPlan.price, salePrice: variantPlan.salePrice },
            { transaction }
          );
        }
      }

      productCount += 1;
      variantCount += plan.variants.length;
      tierCounts[label] = (tierCounts[label] || 0) + 1;
    }

    if (isDryRun) {
      await transaction.rollback();
    } else {
      await transaction.commit();
    }

    console.log("");
    console.log("Tier breakdown:");
    for (const [tier, count] of Object.entries(tierCounts).sort()) {
      const sale = CAR_TIERS[tier];
      const suffix = sale ? ` -> ${cutPriceFor(sale)} / ${sale}` : "";
      console.log(`  ${tier.padEnd(24)} ${String(count).padStart(3)}${suffix}`);
    }
    console.log("");
    console.log(`Products ${isDryRun ? "jo update hote" : "updated"} : ${productCount}`);
    console.log(`Variants ${isDryRun ? "jo update hote" : "updated"} : ${variantCount}`);
    if (isDryRun) {
      console.log("\nLive chalane ke liye: node scripts/applyTopCoverFlatSale.js --apply");
    }
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

try {
  await applyTopCoverFlatSale();
} catch (error) {
  console.error("Top cover sale apply nahi ho saki:", error.message);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
