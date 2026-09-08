import { Op } from "sequelize";
import { Product, sequelize } from "../models/index.js";

const CAR_COVER_CATEGORY = "car_topCover";
const isDryRun = String(process.env.DRY_RUN).toLowerCase() === "true";

const removeNewFlagFromCarCovers = async () => {
  const transaction = await sequelize.transaction();
  let productsAffected = 0;
  const productNames = [];

  try {
    const products = await Product.findAll({
      where: {
        category: { [Op.iLike]: CAR_COVER_CATEGORY },
        isNewArrival: true,
      },
      attributes: ["id", "name", "category", "isNewArrival"],
      order: [["id", "ASC"]],
      transaction,
    });

    console.log(`Mode: ${isDryRun ? "DRY RUN (no database changes)" : "LIVE UPDATE"}`);
    console.log(`Car Cover new-arrival products found: ${products.length}`);
    console.log("PRODUCTS TO UPDATE:");

    for (const product of products) {
      productNames.push(product.name);
      console.log(`- ${product.name} [${product.category}]`);

      if (!isDryRun) {
        await product.update({ isNewArrival: false }, { transaction });
      }

      productsAffected += 1;
    }

    if (isDryRun) {
      await transaction.rollback();
    } else {
      await transaction.commit();
    }

    console.log(`Products ${isDryRun ? "that would be updated" : "updated"}: ${productsAffected}`);
    console.log("Product names:", productNames.length ? productNames.join(", ") : "None");
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

try {
  await removeNewFlagFromCarCovers();
} catch (error) {
  console.error("Failed to remove Car Cover new-arrival flags:", error.message);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
