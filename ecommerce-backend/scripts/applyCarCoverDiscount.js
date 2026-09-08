import { Op } from "sequelize";
import { Product, ProductVariant, sequelize } from "../models/index.js";

const CATEGORY = "car_topCover";
const DISCOUNT_MULTIPLIER = 0.6;
const isDryRun = String(process.env.DRY_RUN).toLowerCase() === "true";

const applyCarCoverDiscount = async () => {
  let productsUpdated = 0;
  let variantsUpdated = 0;
  const productNames = [];

  const transaction = await sequelize.transaction();

  try {
    const products = await Product.findAll({
      where: { category: { [Op.iLike]: CATEGORY } },
      include: [{ model: ProductVariant, as: "variants" }],
      order: [["id", "ASC"]],
      transaction,
    });

    console.log(`Mode: ${isDryRun ? "DRY RUN (no database changes)" : "LIVE UPDATE"}`);
    console.log(`Matching category: ${CATEGORY}`);
    console.log(`Products found: ${products.length}`);

    for (const product of products) {
      const discountedPrice = Math.round(Number(product.price) * DISCOUNT_MULTIPLIER);
      const variants = product.variants || [];

      productNames.push(product.name);
      console.log(
        `- ${product.name}: ${product.price} -> ${discountedPrice} (${variants.length} variant${variants.length === 1 ? "" : "s"})`
      );

      if (!isDryRun) {
        await product.update(
          { isOnSale: true, discountPrice: discountedPrice },
          { transaction }
        );

        for (const variant of variants) {
          const variantSalePrice = Math.round(Number(variant.price) * DISCOUNT_MULTIPLIER);
          await variant.update({ salePrice: variantSalePrice }, { transaction });
          variantsUpdated += 1;
        }
      } else {
        variantsUpdated += variants.length;
      }

      productsUpdated += 1;
    }

    if (isDryRun) {
      await transaction.rollback();
    } else {
      await transaction.commit();
    }

    console.log(`Products ${isDryRun ? "that would be updated" : "updated"}: ${productsUpdated}`);
    console.log(`Variants ${isDryRun ? "that would be updated" : "updated"}: ${variantsUpdated}`);
    console.log("Product names:", productNames.length ? productNames.join(", ") : "None");
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

try {
  await applyCarCoverDiscount();
} catch (error) {
  console.error("Failed to apply Car Cover discount:", error.message);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
