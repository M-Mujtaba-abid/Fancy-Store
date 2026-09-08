import { Op } from "sequelize";
import { Product, sequelize } from "../models/index.js";

const CATEGORY = "car_topCover";
const DISCOUNT_FACTOR = 0.6;
const isDryRun = String(process.env.DRY_RUN).toLowerCase() === "true";

const tiers = [
  {
    name: "Small",
    discountPrice: 2100,
    keywords: [
      "Khyber", "Mehran", "Alto", "Wagon R", "Cultus", "Every", "Bolan", "Swift",
      "Baleno", "Picanto", "Santro", "Mira", "Move", "Tanto", "Vitz", "Passo", "Aqua",
      "N Box", "Pixis", "Cast", "Copen", "Esse", "Boon", "Colt", "Minica", "Toppo",
      "eK", "Dayz", "Moco", "March", "Note", "Otti", "Pino", "Roox", "Chery QQ",
      "Chevrolet Joy", "i10",
    ],
  },
  {
    name: "Medium",
    discountPrice: 2349,
    // Sportage is treated as a medium/compact SUV.
    keywords: ["City", "Corolla", "Raize", "Sportage"],
  },
  {
    name: "Large",
    discountPrice: 2500,
    keywords: ["Civic", "Camry", "Accord"],
  },
].map((tier) => ({
  ...tier,
  price: Math.round(tier.discountPrice / DISCOUNT_FACTOR),
}));

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const matchesKeyword = (value, keyword) => {
  const normalizedValue = String(value || "");
  const pattern = new RegExp(`(^|[^a-z0-9])${escapeRegExp(keyword)}($|[^a-z0-9])`, "i");
  return pattern.test(normalizedValue);
};

const getTierForProduct = (product) => {
  const searchableText = `${product.name || ""} ${product.carModel || ""}`;
  return tiers.find((tier) => tier.keywords.some((keyword) => matchesKeyword(searchableText, keyword)));
};

const updateCarCoverPricingByTier = async () => {
  const transaction = await sequelize.transaction();
  const updated = [];
  const unmatched = [];

  try {
    const products = await Product.findAll({
      where: { category: { [Op.iLike]: CATEGORY } },
      attributes: ["id", "name", "carModel", "price", "discountPrice", "isOnSale"],
      order: [["id", "ASC"]],
      transaction,
    });

    console.log(`Mode: ${isDryRun ? "DRY RUN (no database changes)" : "LIVE UPDATE"}`);
    console.log(`Matching category: ${CATEGORY}`);
    console.log(`Products found: ${products.length}`);
    console.log(`Sportage tier: Medium`);

    for (const product of products) {
      const tier = getTierForProduct(product);

      if (!tier) {
        unmatched.push(product);
        continue;
      }

      console.log(
        `- ${product.name} [${product.carModel || "no carModel"}] -> ${tier.name}: price=${tier.price}, discountPrice=${tier.discountPrice}`
      );

      if (!isDryRun) {
        await product.update(
          {
            price: tier.price,
            discountPrice: tier.discountPrice,
            isOnSale: true,
          },
          { transaction }
        );
      }

      updated.push({ product, tier });
    }

    if (unmatched.length) {
      console.log("UNMATCHED (not updated):");
      for (const product of unmatched) {
        console.log(`- ${product.name} [${product.carModel || "no carModel"}]`);
      }
    } else {
      console.log("UNMATCHED (not updated): None");
    }

    if (isDryRun) {
      await transaction.rollback();
    } else {
      await transaction.commit();
    }

    console.log(`Products ${isDryRun ? "that would be updated" : "updated"}: ${updated.length}`);
    console.log(`Unmatched products: ${unmatched.length}`);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

try {
  await updateCarCoverPricingByTier();
} catch (error) {
  console.error("Failed to update Car Cover tier pricing:", error.message);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
