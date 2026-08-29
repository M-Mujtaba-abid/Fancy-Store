import sequelize from "../config/db.js";
import models from "../models/index.js";
import { slugify } from "../utils/slugify.js";

const { Product } = models;

async function generateUniqueSlug(name) {
  const base = slugify(name) || "product";
  let candidate = base;
  let counter = 2;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await Product.findOne({ where: { slug: candidate } });
    if (!existing) return candidate;
    candidate = `${base}-${counter}`;
    counter++;
  }
}

async function main() {
  console.log("Backfilling slugs for products missing one...");

  try {
    await sequelize.authenticate();
    console.log("Database connected successfully.");

    const products = await Product.findAll({ where: { slug: null } });

    if (!products || products.length === 0) {
      console.log("No products missing a slug — nothing to do.");
      process.exit(0);
    }

    console.log(`Found ${products.length} product(s) missing a slug.`);

    let updated = 0;
    for (const product of products) {
      const slug = await generateUniqueSlug(product.name);
      await product.update({ slug });
      updated++;
      console.log(`#${product.id} (${product.name}) -> ${slug}`);
    }

    console.log(`\nDone. Backfilled ${updated} product(s).`);
    process.exit(0);
  } catch (error) {
    console.error("Error backfilling product slugs:", error);
    process.exit(1);
  }
}

main();
