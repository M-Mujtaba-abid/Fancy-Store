import { Op } from "sequelize";
import { Product, ProductVariant, sequelize } from "../models/index.js";

const CAR_COVER_CATEGORY = "car_topCover";
const isDryRun = String(process.env.DRY_RUN).toLowerCase() === "true";

const revertNonCarCoverDiscount = async () => {
  let productsAffected = 0;
  let variantsAffected = 0;
  const productNames = [];
  const transaction = await sequelize.transaction();

  try {
    const products = await Product.findAll({
      where: {
        isOnSale: true,
        category: { [Op.notILike]: CAR_COVER_CATEGORY },
      },
      include: [{ model: ProductVariant, as: "variants" }],
      order: [["id", "ASC"]],
      transaction,
    });

    console.log(`Mode: ${isDryRun ? "DRY RUN (no database changes)" : "LIVE UPDATE"}`);
    console.log(`Non-Car-Cover products found: ${products.length}`);

    for (const product of products) {
      const variants = product.variants || [];
      productNames.push(product.name);
      console.log(`- ${product.name} [${product.category}] (${variants.length} variant${variants.length === 1 ? "" : "s"})`);

      if (!isDryRun) {
        await product.update({ isOnSale: false, discountPrice: 0 }, { transaction });
        for (const variant of variants) {
          await variant.update({ salePrice: null }, { transaction });
        }
      }

      productsAffected += 1;
      variantsAffected += variants.length;
    }

    if (isDryRun) {
      await transaction.rollback();
    } else {
      await transaction.commit();
    }

    console.log(`Products ${isDryRun ? "that would be reverted" : "reverted"}: ${productsAffected}`);
    console.log(`Variants ${isDryRun ? "that would be reverted" : "reverted"}: ${variantsAffected}`);
    console.log("Product names:", productNames.length ? productNames.join(", ") : "None");
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

try {
  await revertNonCarCoverDiscount();
} catch (error) {
  console.error("Failed to revert non-Car-Cover discounts:", error.message);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
