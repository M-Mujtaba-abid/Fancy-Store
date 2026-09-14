/**
 * findDuplicateProducts.js  (READ ONLY - DB par kuch nahi likhta)
 *
 * Ek hi gaari/bike ke liye ek hi category mein do ya zyada products pare hain
 * to unhe group kar ke dikhata hai. Slug match kaafi nahi hota kyunke purane
 * products free-text names se bane hain ("new-alto-car-cover-black-coated...")
 * aur naye pipeline se ("car-topcover-silver-coated-suzuki-alto"), is liye
 * model token par match karte hain.
 *
 * Model tokens do jagah se aate hain:
 *   1. DB ke saaf `carModel` values (pipeline se bane products).
 *   2. MANUAL_TOKENS - legacy products jinka carModel junk hai ("All", "1000cc").
 *
 * Usage:
 *   node scripts/findDuplicateProducts.js
 *   node scripts/findDuplicateProducts.js --category car_topCover
 *   node scripts/findDuplicateProducts.js --all-categories
 */
import { Product, ProductVariant, sequelize } from "../models/index.js";

const args = process.argv.slice(2);
const categoryArg = args.includes("--category")
  ? args[args.indexOf("--category") + 1]
  : null;
const allCategories = args.includes("--all-categories");
const listGroups = args.includes("--list-groups");

// Ye carModel values model nahi hain - inhe token banane se sab kuch match ho jata.
const JUNK_MODELS = new Set([
  "all", "all models", "allmodelsblc", "all modelsblc", "suv", "premium",
  "silver", "", "-", "1000 cc", "1000cc", "2023", "2026", "(2019–2026)",
  "top cover", "car", "universal", "any", "na",
  "toyota", "honda", "suzuki", "kia", "nissan", "daihatsu", "mitsubishi",
]);

// Brand ka naam model key se hata dete hain, warna "Suzuki Alto" aur "Alto"
// do alag group ban jate hain.
// "toyotta" jaan boojh kar shamil hai - DB mein ek carModel ghalat likha hua
// hai ("Toyotta Corolla") aur wo alag group ban jata tha.
const BRANDS = [
  "suzuki", "toyota", "toyotta", "honda", "nissan", "daihatsu", "mitsubishi",
  "kia", "hyundai", "audi", "mini", "volkswagen", "peugeot", "chery",
  "chevrolet", "faw", "united", "ora", "honri", "yamaha", "mg", "changan",
];

// Legacy products jinka carModel junk hai ("All", "1000cc"). Ye sirf tab
// dekhe jate hain jab DB ke carModel tokens se match na ho.
const MANUAL_TOKENS = [
  "Mehran", "Bolan", "Carry Daba", "Carry Dabba", "Baleno", "Corolla",
  "Civic", "City", "Sportage", "Raize", "Aqua", "New Cultus", "Cultus",
  "Alto", "Wagon R", "Swift", "Every Daba", "Every", "Khyber",
  "CD 70", "Honda 70", "YBR", "Evee GenZ", "Genz Evee", "Evee", "GenZ",
];

// Alag alag likhe hue naam ek hi key par. Brand hatane ke BAAD apply hota hai.
const CANONICAL_FIXES = {
  "cultus old model": "cultus",
  "every daba": "every",
  "carry daba": "bolan",
  "carry dabba": "bolan",
  "bolan carry daba": "bolan",
  "bolan carry dabba": "bolan",
  "70": "cd 70",
  "ybr g top cover": "ybr",
  "ybr g": "ybr",
  "genz evee": "evee genz",
  "evee": "evee genz",
  "genz": "evee genz",
  "evee genz pro": "evee genz",
};

const clean = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Token poore word ke tor par match hona chahiye, "r" ka "car" se nahi. */
const hasToken = (text, token) =>
  new RegExp(`(^| )${escapeRegExp(clean(token)).replace(/ /g, " +")}( |$)`).test(text);

/** "Suzuki Wagon R" -> "wagon r", "New Cultus" -> "cultus". */
const canonicalKey = (token) => {
  let key = clean(token)
    .split(" ")
    .filter((word) => !BRANDS.includes(word))
    .join(" ")
    // Category ke naam aur model years key ka hissa nahi hone chahiye, warna
    // "Civic 2018 21" aur "Civic" alag group ban jate hain.
    .replace(/\b(top )?cover\b/g, "")
    .replace(/\b(dashboard|trunk|tray|mat|floor|steering|seat|custom|fit|to)\b/g, "")
    // Model years aur ranges: "2018 21", "2019 2024", "2026".
    // Akela chhota number NAHI hataate - "CD 70" ka 70 model ka hissa hai.
    .replace(/\b(19|20)\d{2}\b(\s+\d{2,4}\b)*/g, "")
    // "New Alto" / "New Cultus" wahi gaari hai jo "Alto" / "Cultus".
    .replace(/^new /, "")
    .replace(/ +/g, " ")
    .trim();

  key = CANONICAL_FIXES[key] || key;
  return key || clean(token);
};

const findDuplicateProducts = async () => {
  const where = {};
  if (categoryArg) where.category = categoryArg;

  const products = await Product.findAll({
    where,
    attributes: [
      "id", "name", "slug", "category", "carModel", "price", "discountPrice",
      "stock", "sold", "imageUrl", "totalReviews", "createdAt",
    ],
    include: [
      {
        model: ProductVariant,
        as: "variants",
        attributes: ["id"],
        required: false,
      },
    ],
    order: [["id", "ASC"]],
  });

  // Saaf carModel values se tokens banao. Sirf saal ya number wali values
  // ("2009-2018", "1000cc") model nahi hotin - unhe chhor do taake product ke
  // NAAM se match ho ("Honda City 2009-2018" -> city).
  const isYearOrNumber = (value) => /^[\d\s\-–—/().,cc]+$/i.test(value);

  const dbTokens = new Set();
  for (const product of products) {
    const model = String(product.carModel || "").trim();
    if (
      model.length >= 3 &&
      !JUNK_MODELS.has(model.toLowerCase()) &&
      !isYearOrNumber(model)
    ) {
      dbTokens.add(model);
    }
  }

  // Lamba token pehle, taake "Suzuki Wagon R" jeete "Wagon R" se.
  const byLength = (a, b) => clean(b).length - clean(a).length;
  const dbTokenList = [...dbTokens].sort(byLength);
  const manualTokenList = [...MANUAL_TOKENS].sort(byLength);

  const groups = new Map();
  const unmatched = [];

  for (const product of products) {
    const text = clean(`${product.name} ${product.carModel || ""}`);

    // Pehle DB ke saaf carModel tokens (in mein brand shamil hota hai),
    // phir curated legacy tokens. Dono ek hi canonical key par aate hain.
    const token =
      dbTokenList.find((candidate) => hasToken(text, candidate)) ??
      manualTokenList.find((candidate) => hasToken(text, candidate));

    if (!token) {
      unmatched.push(product);
      continue;
    }

    const model = canonicalKey(token);
    const key = `${product.category}|${model}`;
    if (!groups.has(key)) groups.set(key, { token: model, category: product.category, rows: [] });
    product.matchedToken = token;
    groups.get(key).rows.push(product);
  }

  const duplicates = [...groups.values()]
    .filter((group) => group.rows.length > 1)
    .sort((a, b) => b.rows.length - a.rows.length || a.category.localeCompare(b.category));

  const line = "=".repeat(78);
  console.log(`\n${line}`);
  console.log(`  Products scanned : ${products.length}${categoryArg ? `  (category: ${categoryArg})` : ""}`);
  console.log(`  Model groups     : ${groups.size}`);
  console.log(`  DUPLICATE groups : ${duplicates.length}`);
  console.log(line);

  if (listGroups) {
    console.log("\nSaare groups (matched token ke sath):");
    for (const [key, group] of [...groups.entries()].sort()) {
      console.log(`  ${key}  (${group.rows.length})`);
      for (const row of group.rows) {
        console.log(`      #${row.id} via "${row.matchedToken}"  ${String(row.name).slice(0, 50)}`);
      }
    }
  }

  let duplicateRows = 0;

  for (const group of duplicates) {
    duplicateRows += group.rows.length - 1;
    console.log(`\n[${group.category}]  ${group.token}   -> ${group.rows.length} products`);
    for (const row of group.rows) {
      const sale = row.discountPrice > 0 ? row.discountPrice : row.price;
      console.log(
        `   #${String(row.id).padStart(3)}  Rs ${String(sale).padEnd(5)}` +
          ` stock:${String(row.stock ?? 0).padEnd(4)} sold:${String(row.sold ?? 0).padEnd(3)}` +
          ` rev:${String(row.totalReviews ?? 0).padEnd(3)} var:${String(row.variants.length).padEnd(2)}` +
          ` ${new Date(row.createdAt).toISOString().slice(0, 10)}  ${String(row.name).slice(0, 52)}`
      );
    }
  }

  // Ek hi image do products par lagi ho to wo bhi duplicate ki nishani hai.
  const byImage = new Map();
  for (const product of products) {
    const url = String(product.imageUrl || "").trim();
    if (!url) continue;
    if (!byImage.has(url)) byImage.set(url, []);
    byImage.get(url).push(product);
  }
  const sharedImages = [...byImage.entries()].filter(([, rows]) => rows.length > 1);

  if (sharedImages.length) {
    console.log(`\n${line}`);
    console.log(`  Ek hi image share karne wale products: ${sharedImages.length} groups`);
    console.log(line);
    for (const [url, rows] of sharedImages) {
      console.log(`\n  ${url.slice(0, 70)}`);
      for (const row of rows) console.log(`     #${row.id}  ${String(row.name).slice(0, 58)}`);
    }
  }

  if (unmatched.length && allCategories) {
    console.log(`\n${line}`);
    console.log(`  Kisi model token se match nahi huye: ${unmatched.length}`);
    console.log(line);
    for (const row of unmatched) {
      console.log(`   #${String(row.id).padStart(3)} [${row.category}] ${String(row.name).slice(0, 58)}`);
    }
  }

  console.log(`\n${line}`);
  console.log(`  Extra (hataye ja sakne wale) rows : ${duplicateRows}`);
  console.log(`  Model token se match nahi huye     : ${unmatched.length}`);
  console.log(`${line}\n`);
};

try {
  await findDuplicateProducts();
} catch (error) {
  console.error("Duplicate scan fail hua:", error.message);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
