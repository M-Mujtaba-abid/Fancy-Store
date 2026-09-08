import { Op } from "sequelize";
import { Product, ProductVariant, sequelize } from "../models/index.js";

const CAR_COVER_CATEGORY = "car_topCover";
const ACCESSORIES_CATEGORY_PATTERN = "%accessor%";
const isDryRun = String(process.env.DRY_RUN).toLowerCase() === "true";

const fixSaleFlags = async () => {
  let saleProductsAffected = 0;
  let saleVariantsAffected = 0;
  let accessoryProductsAffected = 0;
  const transaction = await sequelize.transaction();

  try {
    const nonCarCoverSaleProducts = await Product.findAll({
      where: {
        isOnSale: true,
        category: { [Op.notILike]: CAR_COVER_CATEGORY },
      },
      include: [{ model: ProductVariant, as: "variants" }],
      order: [["id", "ASC"]],
      transaction,
    });

    const accessoriesWithNewArrival = await Product.findAll({
      where: {
        isNewArrival: true,
        category: { [Op.iLike]: ACCESSORIES_CATEGORY_PATTERN },
      },
      order: [["id", "ASC"]],
      transaction,
    });

    console.log(`Mode: ${isDryRun ? "DRY RUN (no database changes)" : "LIVE UPDATE"}`);
    console.log(`Non-Car-Cover sale products found: ${nonCarCoverSaleProducts.length}`);
    console.log(`Car Accessories new-arrival products found: ${accessoriesWithNewArrival.length}`);

    console.log("SALE FLAGS TO REVERT:");
    for (const product of nonCarCoverSaleProducts) {
      const variants = product.variants || [];
      console.log(`- ${product.name} [${product.category}] (${variants.length} variant${variants.length === 1 ? "" : "s"})`);

      if (!isDryRun) {
        await product.update({ isOnSale: false, discountPrice: 0 }, { transaction });
        for (const variant of variants) {
          await variant.update({ salePrice: null }, { transaction });
        }
      }

      saleProductsAffected += 1;
      saleVariantsAffected += variants.length;
    }

    console.log("CAR ACCESSORIES NEW-ARRIVAL FLAGS TO REVERT:");
    for (const product of accessoriesWithNewArrival) {
      console.log(`- ${product.name} [${product.category}]`);

      if (!isDryRun) {
        await product.update({ isNewArrival: false }, { transaction });
      }

      accessoryProductsAffected += 1;
    }

    if (isDryRun) {
      await transaction.rollback();
    } else {
      await transaction.commit();
    }

    console.log(`Sale products ${isDryRun ? "that would be reverted" : "reverted"}: ${saleProductsAffected}`);
    console.log(`Sale variants ${isDryRun ? "that would be reverted" : "reverted"}: ${saleVariantsAffected}`);
    console.log(`Accessory new-arrival products ${isDryRun ? "that would be reverted" : "reverted"}: ${accessoryProductsAffected}`);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

try {
  await fixSaleFlags();
} catch (error) {
  console.error("Failed to fix sale flags:", error.message);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
