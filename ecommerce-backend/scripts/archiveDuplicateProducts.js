/**
 * archiveDuplicateProducts.js
 *
 * Wo duplicates jo WAQAI ek hi product do (ya teen) baar hain. Har group mein
 * se ek "keeper" rehta hai, baqi archive ho jate hain aur unki URL keeper par
 * 301 ho jati hai.
 *
 * ⚠️ DELETE jaan bujh kar NAHI karte.
 * Products par lagi saari foreign keys ON DELETE CASCADE hain:
 *     OrderItems.productId   ON DELETE CASCADE
 *     Reviews.productId      ON DELETE CASCADE
 *     CartItems.productId    ON DELETE CASCADE
 *     Wishlists.productId    ON DELETE CASCADE
 *     ProductVariants.productId ON DELETE CASCADE
 * Yani ek duplicate product DELETE karne se us ke customer orders ki items aur
 * uske saare reviews bhi mit jate. #68 (Wagon R) ki 3 order items hain, #73
 * (Swift) ki 2, #58 (Corolla) ki 1. Order history kabhi SEO cleanup ke liye
 * qurban nahi honi chahiye.
 *
 * Archive karne se SEO ka natija bilkul wahi milta hai:
 *   - product kisi listing mein nahi aata (services/product.service.js ka
 *     PUBLIC_VISIBLE filter), is liye sitemap se bhi nikal jata hai
 *   - purani URL keeper par 301 ho jati hai, to Google signals keeper par
 *     jama kar deta hai
 *   - row DB mein rehti hai, orders aur reviews mehfooz
 *
 * Usage:
 *   node scripts/archiveDuplicateProducts.js            # dry run (default)
 *   node scripts/archiveDuplicateProducts.js --apply    # DB likhta hai
 *   node scripts/archiveDuplicateProducts.js --restore  # isArchived wapas false
 *
 * --apply ke baad ye client/config/productRedirects.json likhta hai. Redirects
 * asar mein tab aayenge jab frontend deploy hoga (next.config.ts is file ko
 * parhta hai).
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Op } from "sequelize";
import { Product, ProductVariant, sequelize } from "../models/index.js";

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const RESTORE = args.includes("--restore");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REDIRECTS_FILE = path.resolve(
  __dirname,
  "../../client/config/productRedirects.json"
);

/**
 * Har group mein keeper wo hai jiske paas zyada sold, zyada reviews, behtar
 * description aur zyada stock hai. `note` batata hai ke faisla kis bina par
 * hua, taake baad mein koi review kar sake.
 */
const GROUPS = [
  {
    label: "New Alto (black coated)",
    keep: 75,
    archive: [80],
    note: "#75: 139 sold, 39 reviews, discount price set. #80: 36 sold, 0 reviews, color/material khali, koi discount nahi.",
  },
  {
    label: "Suzuki Wagon R (silver parachute)",
    keep: 170,
    archive: [68],
    // #68 par "Black Coated" ka asli option tha jo keeper par nahi. Archive
    // karne se wo customers ke liye khatam ho jata, is liye keeper par copy
    // kar rahe hain. "Silver Coated" wala variant copy NAHI karte kyunke
    // keeper khud silver hai aur usi price par hai - wo bas duplicate option
    // ban jata.
    copyVariants: [{ fromProductId: 68, variantValue: "Black Coated" }],
    note: "#170: 364 sold, 42 reviews, 50 stock, saaf description. #68 ka Black Coated option keeper par copy ho raha hai.",
  },
  {
    label: "Suzuki Swift (silver parachute)",
    keep: 169,
    archive: [73],
    note: "#169: 83 sold, 40 reviews, 50 stock. #73: 65 sold, 3 reviews, 11 stock.",
  },
  {
    label: "Toyota Corolla (black)",
    keep: 58,
    archive: [59],
    note: "#58: 91 sold, 30 reviews, slug 73 characters. #59 ka slug 207 characters ka keyword-stuffed hai.",
  },
  {
    label: "Suzuki Every (silver parachute)",
    keep: 168,
    archive: [71],
    note: "#168: 299 sold, 44 reviews, description 928 chars. #71: 65 sold, 4 reviews, description 415 chars.",
  },
  {
    label: "Suzuki Cultus old model (silver)",
    keep: 167,
    archive: [69],
    copyVariants: [{ fromProductId: 69, variantValue: "Black Coated" }],
    note: "#167: 173 sold, 45 reviews. #69: 85 sold, 3 reviews, slug 137 characters. #69 ka Black Coated option keeper par copy ho raha hai.",
  },
  {
    label: "Honda CD 70 bike cover",
    keep: 106,
    archive: [50, 64],
    // #64 par "PVC + Cotton" ka asli material option hai jo keeper #106 par
    // bilkul nahi. Baqi chhorte hue variants (#50 ka "Parachute") keeper ke
    // apne base product jaise hi hain, sirf price thora alag hai.
    copyVariants: [
      { fromProductId: 64, variantValue: "PVC + Cotton" },
      { fromProductId: 64, variantValue: "Black Coated" },
    ],
    note: "#106: 259 sold, 43 reviews, 100 stock. #50: 96 sold. #64: sirf 9 stock. #64 ka PVC + Cotton option keeper par copy ho raha hai.",
  },
  {
    label: "Evee GenZ Pro scooty cover",
    keep: 52,
    archive: [61],
    note: "#52: 131 sold, 29 reviews, description 1708 chars. #61 ki description sirf 35 characters ki hai.",
  },
];

const ARCHIVE_IDS = GROUPS.flatMap((g) => g.archive);
const KEEP_IDS = GROUPS.map((g) => g.keep);

/** Ek hi product ke related rows gin lo, taake report mein dikha sakein. */
const relatedCounts = async (ids) => {
  if (ids.length === 0) return new Map();
  const [rows] = await sequelize.query(`
    SELECT p.id,
      (SELECT COUNT(*) FROM "OrderItems" oi WHERE oi."productId" = p.id) AS order_items,
      (SELECT COUNT(*) FROM "Reviews" r WHERE r."productId" = p.id) AS reviews,
      (SELECT COUNT(*) FROM "Wishlists" w WHERE w."productId" = p.id) AS wishlists
    FROM "Products" p WHERE p.id IN (${ids.join(",")})
  `);
  return new Map(rows.map((r) => [Number(r.id), r]));
};

const run = async () => {
  const products = await Product.findAll({
    where: { id: [...ARCHIVE_IDS, ...KEEP_IDS] },
    attributes: ["id", "name", "slug", "category", "isArchived"],
    include: [{ model: ProductVariant, as: "variants", required: false }],
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  // Missing ids par chup chaap aage barhna khatarnak hai — redirect ka target
  // hi na mile to hum ek live product ko bina jaga ke hata denge.
  const missing = [...ARCHIVE_IDS, ...KEEP_IDS].filter((id) => !byId.has(id));
  if (missing.length) {
    throw new Error(
      `Ye product ids DB mein nahi milin: ${missing.join(", ")}. ` +
        `Script ka GROUPS section update karna paray ga.`
    );
  }

  const counts = await relatedCounts(ARCHIVE_IDS);
  const line = "=".repeat(78);

  if (RESTORE) {
    console.log(`\n${line}\n  RESTORE${APPLY ? "" : "  (dry run)"}\n${line}`);
    for (const id of ARCHIVE_IDS) {
      const p = byId.get(id);
      console.log(`   #${id}  isArchived ${p.isArchived} -> false   ${p.name.slice(0, 50)}`);
    }
    if (APPLY) {
      await Product.update({ isArchived: false }, { where: { id: ARCHIVE_IDS } });
      console.log("\n  ✅ Restore ho gaya. productRedirects.json khud hataana parega.");
    } else {
      console.log("\n  Dry run tha. Asal mein chalane ke liye: --restore --apply");
    }
    return;
  }

  console.log(`\n${line}`);
  console.log(`  DUPLICATE ARCHIVE${APPLY ? "" : "  (DRY RUN - DB par kuch nahi likha ja raha)"}`);
  console.log(`  Groups: ${GROUPS.length}   Archive hone wale products: ${ARCHIVE_IDS.length}`);
  console.log(line);

  const redirects = [];
  const warnings = [];

  for (const group of GROUPS) {
    const keeper = byId.get(group.keep);
    console.log(`\n[${group.label}]`);
    console.log(`   RAKHNA   #${keeper.id}  /products/${keeper.slug}`);
    console.log(`            ${keeper.name}`);

    for (const id of group.archive) {
      const p = byId.get(id);
      const c = counts.get(id) || {};
      console.log(`   ARCHIVE  #${p.id}  /products/${p.slug}`);
      console.log(`            ${p.name.slice(0, 64)}`);
      console.log(
        `            mehfooz rahenge -> orders: ${c.order_items ?? 0}, reviews: ${c.reviews ?? 0}, wishlist: ${c.wishlists ?? 0}`
      );
      console.log(`            301 -> /products/${keeper.slug}`);

      // Sirf wo variants warn karo jo keeper par na pehle se hain na copy ho
      // rahe hain. Warna har archive par jhooti warning aati hai.
      const copying = new Set(
        (group.copyVariants || [])
          .filter((c) => c.fromProductId === p.id)
          .map((c) => c.variantValue)
      );
      const keeperValues = new Set(keeper.variants.map((v) => v.variantValue));
      const lost = p.variants.filter(
        (v) => !copying.has(v.variantValue) && !keeperValues.has(v.variantValue)
      );
      for (const v of lost) {
        warnings.push(
          `#${p.id} ka variant "${v.variantType}: ${v.variantValue}" (Rs ${v.salePrice || v.price}, stock ${v.stock}) ` +
            `keeper #${keeper.id} par nahi hai aur copy bhi nahi ho raha. Archive ke baad ye option customers ko nahi dikhega.`
        );
      }

      redirects.push({ from: p.slug, to: keeper.slug });
    }
    for (const copy of group.copyVariants || []) {
      const source = byId.get(copy.fromProductId);
      const variant = source?.variants.find((v) => v.variantValue === copy.variantValue);
      if (!variant) {
        throw new Error(
          `#${copy.fromProductId} par "${copy.variantValue}" naam ka variant nahi mila. ` +
            `GROUPS ka copyVariants section update karna paray ga.`
        );
      }
      console.log(
        `   VARIANT  #${copy.fromProductId} ka "${variant.variantType}: ${variant.variantValue}" ` +
          `(Rs ${variant.salePrice || variant.price}, stock ${variant.stock}) -> #${keeper.id} par copy hoga`
      );
    }
    console.log(`   wajah    ${group.note}`);
  }

  if (warnings.length) {
    console.log(`\n${line}\n  ⚠️  DHYAN DO\n${line}`);
    for (const w of warnings) console.log(`   ${w}`);
  }

  console.log(`\n${line}`);
  if (APPLY) {
    let copied = 0;
    await sequelize.transaction(async (transaction) => {
      // Variants pehle copy karo, phir archive. Purana variant row chhorte
      // hain (move nahi karte) kyunke OrderItems.variantId us par lagi hui hai
      // - use doosre product par le jaane se purani orders ka record ghalat ho
      // jata.
      for (const group of GROUPS) {
        const keeper = byId.get(group.keep);
        const keeperValues = new Set(keeper.variants.map((v) => v.variantValue));

        for (const copy of group.copyVariants || []) {
          if (keeperValues.has(copy.variantValue)) continue; // pehle se hai
          const source = byId
            .get(copy.fromProductId)
            .variants.find((v) => v.variantValue === copy.variantValue);

          await ProductVariant.create(
            {
              productId: keeper.id,
              variantType: source.variantType,
              variantValue: source.variantValue,
              price: source.price,
              salePrice: source.salePrice,
              stock: source.stock,
              imageUrl: source.imageUrl,
            },
            { transaction }
          );
          copied += 1;
        }
      }

      await Product.update(
        { isArchived: true },
        { where: { id: ARCHIVE_IDS }, transaction }
      );
    });

    await fs.mkdir(path.dirname(REDIRECTS_FILE), { recursive: true });
    await fs.writeFile(
      REDIRECTS_FILE,
      JSON.stringify(redirects, null, 2) + "\n",
      "utf-8"
    );

    console.log(`  ✅ ${ARCHIVE_IDS.length} products archive ho gaye`);
    console.log(`  ✅ ${copied} variants keeper products par copy huin`);
    console.log(`  ✅ ${redirects.length} redirects likhe: ${REDIRECTS_FILE}`);
    console.log(`\n  AGLA QADAM: frontend deploy karo, warna 301 redirects live nahi honge.`);
    console.log(`  Wapas lene ke liye: node scripts/archiveDuplicateProducts.js --restore --apply`);
  } else {
    console.log(`  DRY RUN tha. DB par kuch nahi likha gaya.`);
    console.log(`  Asal mein chalane ke liye:  node scripts/archiveDuplicateProducts.js --apply`);
  }
  console.log(`${line}\n`);
};

try {
  await run();
} catch (error) {
  console.error("\n❌ Archive fail hua:", error.message);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
