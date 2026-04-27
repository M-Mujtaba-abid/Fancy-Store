import { Sequelize } from "sequelize";
import pg from "pg"; // 👈 CHANGE 1: pg ko import kiya
import dotenv from "dotenv";

dotenv.config();

// Use the DATABASE_URL directly if it exists, otherwise fallback to separate vars
const sequelize = process.env.DATABASE_URL 
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: "postgres",
      dialectModule: pg, // 👈 CHANGE 2: Vercel bundler ko force karne ke liye
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
      logging: false,
    })
  : new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
        dialect: "postgres",
        dialectModule: pg, // 👈 CHANGE 3: Vercel bundler ko force karne ke liye (fallback mein bhi)
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        },
        logging: false,
      }
    );

export const dbConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully to Neon");
  } catch (error) {
    console.error("❌ DB connection failed:", error);
  }
};

export default sequelize;