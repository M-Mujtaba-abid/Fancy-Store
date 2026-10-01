require("dotenv").config();

/**
 * sequelize-cli (migrations) ka database config.
 *
 * ⚠️ Yahan koi username/password NAHI likhna.
 *
 * Pehle ye config.json thi jis mein Neon ka password plaintext likha hua tha,
 * aur wo file git mein committed thi — yani jis ne bhi repo dekha uske paas
 * poore production database ka access tha. Ab sab kuch .env ke DATABASE_URL se
 * aata hai, wahi jagah jahan se app khud (config/db.js) parhta hai.
 *
 * Teeno environments jaan bujh kar ek jaise hain: is project mein alag dev/test
 * database hai hi nahi, sirf DATABASE_URL badalta hai.
 *
 * ⚠️ Supabase par port ka farq yaad rakhein:
 *     6543  transaction pooler  -> app chalane ke liye (serverless)
 *     5432  session pooler      -> MIGRATIONS chalane ke liye
 *
 * Transaction pooler har query ko alag lena chahta hai aur session-level
 * cheezein support nahi karta, jinki migrations ko zaroorat parti hai. Migrate
 * karne se pehle .env mein port 5432 kar lein, baad mein wapas 6543.
 */
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL set nahi hai. ecommerce-backend/.env mein daalein " +
      "(migrations ke liye Supabase ka port 5432 wala session pooler)."
  );
}

const common = {
  use_env_variable: "DATABASE_URL",
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      // Supabase aur Neon dono apne CA ke sath aate hain; Node ke default
      // trust store mein wo na ho to connection self-signed samjha jata hai.
      rejectUnauthorized: false,
    },
  },
};

module.exports = {
  development: common,
  test: common,
  production: common,
};
