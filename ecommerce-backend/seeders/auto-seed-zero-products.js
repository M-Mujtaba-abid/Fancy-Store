import sequelize from "../config/db.js";
import { runAutoReviewSeeder } from "../services/autoReviewSeeder.service.js";

async function main() {
  console.log("Starting auto review/sold seeding for zero-activity products...");

  try {
    await sequelize.authenticate();
    console.log("Database connected successfully.");

    const { productsProcessed, reviewsCreated } = await runAutoReviewSeeder();

    console.log(
      `\nDone. Processed ${productsProcessed} product(s), created ${reviewsCreated} review(s).`
    );
    process.exit(0);
  } catch (error) {
    console.error("Error running auto review seeder:", error);
    process.exit(1);
  }
}

main();
