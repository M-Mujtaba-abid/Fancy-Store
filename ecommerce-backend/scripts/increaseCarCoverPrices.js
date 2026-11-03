/**
 * increaseCarCoverPrices.js
 *
 * Car top covers ki keemat barhata hai, taake delivery free ki ja sake:
 *
 *     Silver coated  : +Rs 500
 *     Black coated   : +Rs 300
 *
 * Cut price (price) aur sale price (salePrice / discountPrice) DONO barhte
 * hain, yani rupees mein discount ka gap wahi rehta hai.
 *
 * Do jagah price hoti hai, dono update hoti hain:
 *
 *   1. ProductVariant.price / salePrice  -> checkout yahi charge karta hai
 *      (services/order.service.js, cart.service.js)
 *   2. Product.price / discountPrice     -> product cards aur merchant feed
 *      yahi dikhate hain. Ye aam taur par silver variant ki copy hoti hai, to
 *      jis variant se match kare usi ka delta lagta hai.
 *
 * Material kaise pehchana jata hai (data mein spelling bikhri hui hai:
 * "Silver coated", "Black coat", "Silver Parachute", ...):
 *
 *   - "pvc" ho        -> skip (PVC + Cotton alag product hai)
 *   - "black" ho      -> +300
 *   - "silver" ho     -> +500
 *   - warna (plain "Parachute") product ke NAAM se decide hota hai, aur naam
 *     se bhi pata na chale to skip.
 *
 * Archived products chhor diye jate hain.
 *
 * ⚠️ Script idempotent NAHI hai: har --apply phir se +500/+300 lagata hai.
 * Is liye apply hone par price-logs/ mein before/after log likha jata hai, aur
 * wo log mojood ho to script dobara apply karne se inkar karti hai. Wahi log
 * --revert ke liye use hota hai.
 *
 * Apply ke baad live site ka cache (ISR, 6 ghante) /api/revalidate se purge
 * hota hai, warna nayi price ghanton tak nazar nahi aati.
 *
 * --fixes: jo products upar ke rule se skip hue, unke liye haath se diye gaye
 * faisle (FIXES neeche). Ye absolute values set karta hai, +delta nahi, is liye
 * dobara chalane se kuch nahi badalta. Purani values price-logs/ mein jati hain.
 *
 * Usage:
 *   node scripts/increaseCarCoverPrices.js            # dry run (default)
 *   node scripts/increaseCarCoverPrices.js --apply
 *   node scripts/increaseCarCoverPrices.js --revert   # log se purani prices wapas
 *   node scripts/increaseCarCoverPrices.js --fixes    # FIXES ka dry run
 *   node scripts/increaseCarCoverPrices.js --fixes --apply
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Op } from "sequelize";
import { Product, ProductVariant, sequelize } from "../models/index.js";

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const REVERT = args.includes("--revert");
const FIXES_MODE = args.includes("--fixes");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_FILE = path.resolve(__dirname, "..", "price-logs", "carCoverPriceIncrease.json");
const FIXES_LOG_FILE = path.resolve(__dirname, "..", "price-logs", "carCoverFixes.json");

/**
 * Skip hue products par haath se diye gaye faisle.
 *
 *   product  : Product par set hone wali fields
 *   variants : sab variants par set hone wali fields
 *
 * Slug jaan bujh kar nahi badalta (models/product.model.js), to naam badalne
 * se URL wahi rehta hai. videoUrl sirf DB se hatta hai, Cloudinary par file
 * rehti hai taake zaroorat pare to wapas lagayi ja sake.
 *
 * #51 Honda City Black PVC Cotton, #63 Toyota Aqua Grey PVC Cotton aur #58
 * Toyota Corolla jaan bujh kar yahan nahi hain: unki price waisi hi rehni hai.
 */
const FIXES = [
  {
    id: 46, // Mehran parachute: sale price 2099 -> 2499
    product: { price: 3500, discountPrice: 2499 },
    variants: { price: 3500, salePrice: 2499 },
  },
  {
    id: 53, // Kia Sportage: naam black, price wahi
    product: { name: "Kia Sportage Car Top Cover - Black Coated" },
  },
  {
    id: 185, // Honda Civic Reborn: naam silver, video hatao, price wahi
    product: { name: "Honda Civic Reborn Car Top Cover - Silver Coated", videoUrl: null },
  },
];

const CATEGORY = "car_topCover";
const SITE_URL = process.env.SITE_URL || "https://www.fancystore.store";

const SILVER_INCREASE = 500;
const BLACK_INCREASE = 300;

/** Text se material ka delta. null = pata nahi chala. 0 = jaan bujh kar skip. */
const deltaFromText = (text) => {
  const value = String(text || "").toLowerCase();
  if (value.includes("pvc")) return 0;
  if (value.includes("black")) return BLACK_INCREASE;
  if (value.includes("silver")) return SILVER_INCREASE;
  return null;
};

const labelFor = (delta) =>
  delta === SILVER_INCREASE ? "silver" : delta === BLACK_INCREASE ? "black" : "skip";

const variantDelta = (variant, product) =>
  deltaFromText(variant.variantValue) ?? deltaFromText(product.name) ?? 0;

/**
 * Product-level price kis variant ki copy hai? Wahi delta lagao. Koi match na
 * ho (purane products jahan product aur variant ki sale price alag hai) to
 * material, phir naam se decide.
 */
const productDelta = (product) => {
  const mirror = product.variants.find(
    (v) =>
      Number(v.price) === Number(product.price) &&
      Number(v.salePrice) === Number(product.discountPrice)
  );
  if (mirror) return variantDelta(mirror, product);
  return deltaFromText(product.material) ?? deltaFromText(product.name) ?? 0;
};

const bump = (value, delta) =>
  value === null || value === undefined || Number(value) <= 0
    ? value
    : Number(value) + delta;

const fileExists = async (file) => {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
};

/** Live site ka ISR cache purge. Non-fatal: fail ho to 6 ghante mein khud refresh. */
const revalidateSite = async (slugs) => {
  const paths = ["/", "/products", `/category/${CATEGORY}`, ...slugs.map((s) => `/products/${s}`)];
  const headers = { "Content-Type": "application/json" };
  if (process.env.REVALIDATE_SECRET) headers["x-revalidate-secret"] = process.env.REVALIDATE_SECRET;

  try {
    const res = await fetch(`${SITE_URL}/api/revalidate`, {
      method: "POST",
      headers,
      body: JSON.stringify({ paths }),
    });
    const body = await res.json().catch(() => ({}));
    console.log(
      `Cache purge (${SITE_URL}): HTTP ${res.status}, ${body.paths?.length ?? 0} paths` +
        (body.skipped?.length ? `, skipped ${body.skipped.length}` : "")
    );
  } catch (error) {
    console.log(`Cache purge fail hua (${error.message}). Prices 6 ghante mein khud refresh hongi.`);
  }
};

const buildPlan = async () => {
  const products = await Product.findAll({
    where: { category: { [Op.iLike]: CATEGORY }, isArchived: false },
    include: [{ model: ProductVariant, as: "variants" }],
    order: [["id", "ASC"]],
  });

  return products.map((product) => {
    const pDelta = productDelta(product);
    return {
      product,
      delta: pDelta,
      variants: product.variants
        .slice()
        .sort((a, b) => a.id - b.id)
        .map((variant) => ({ variant, delta: variantDelta(variant, product) })),
    };
  });
};

const apply = async () => {
  if (APPLY && (await fileExists(LOG_FILE))) {
    throw new Error(
      `${LOG_FILE} pehle se mojood hai, yani increase lag chuka hai. ` +
        `Dobara chalane se price do baar barh jayegi. Pehle --revert karein ya log hata dein.`
    );
  }

  const plan = await buildPlan();
  const line = "=".repeat(78);
  const log = { appliedAt: new Date().toISOString(), products: [], variants: [] };
  const changedSlugs = [];
  const skipped = [];
  const counts = { silver: 0, black: 0 };

  console.log(`\n${line}`);
  console.log(`  CAR COVER PRICE INCREASE${APPLY ? "" : "  (DRY RUN - kuch likha nahi ja raha)"}`);
  console.log(`  Silver +Rs ${SILVER_INCREASE}   Black +Rs ${BLACK_INCREASE}   products: ${plan.length}`);
  console.log(line);

  const transaction = APPLY ? await sequelize.transaction() : null;

  try {
    for (const { product, delta, variants } of plan) {
      const changes = [];

      if (delta) {
        const next = { price: bump(product.price, delta), discountPrice: bump(product.discountPrice, delta) };
        changes.push(
          `product ${product.price}/${product.discountPrice} -> ${next.price}/${next.discountPrice} (${labelFor(delta)})`
        );
        log.products.push({
          id: product.id,
          price: product.price,
          discountPrice: product.discountPrice,
          newPrice: next.price,
          newDiscountPrice: next.discountPrice,
        });
        if (APPLY) await product.update(next, { transaction });
      }

      for (const { variant, delta: vDelta } of variants) {
        if (!vDelta) {
          changes.push(`  v${variant.id} ${variant.variantValue}: skip`);
          continue;
        }
        const next = { price: bump(variant.price, vDelta), salePrice: bump(variant.salePrice, vDelta) };
        changes.push(
          `  v${variant.id} ${variant.variantValue}: ${variant.price}/${variant.salePrice} -> ${next.price}/${next.salePrice}`
        );
        counts[labelFor(vDelta)] += 1;
        log.variants.push({
          id: variant.id,
          productSlug: product.slug,
          price: variant.price,
          salePrice: variant.salePrice,
          newPrice: next.price,
          newSalePrice: next.salePrice,
        });
        if (APPLY) await variant.update(next, { transaction });
      }

      const touched = delta || variants.some((v) => v.delta);
      if (!touched) {
        skipped.push(product);
        continue;
      }

      changedSlugs.push(product.slug);
      console.log(`#${product.id} ${product.name}`);
      for (const change of changes) console.log(`   ${change}`);
    }

    if (APPLY) {
      await fs.mkdir(path.dirname(LOG_FILE), { recursive: true });
      await fs.writeFile(LOG_FILE, JSON.stringify(log, null, 2));
      await transaction.commit();
    }
  } catch (error) {
    if (transaction) await transaction.rollback();
    throw error;
  }

  console.log(line);
  console.log(`SKIP (koi price nahi badli): ${skipped.length}`);
  for (const product of skipped) {
    console.log(`   #${product.id} ${product.name} [material: ${product.material || "-"}]`);
  }
  console.log(line);
  console.log(`Products ${APPLY ? "updated" : "jo update honge"}: ${changedSlugs.length}`);
  console.log(`Variants: silver ${counts.silver}, black ${counts.black}`);

  if (APPLY) {
    console.log(`Log: ${LOG_FILE}`);
    await revalidateSite(changedSlugs);
  } else {
    console.log(`\nApply karne ke liye: node scripts/increaseCarCoverPrices.js --apply`);
  }
};

const revert = async () => {
  const log = JSON.parse(await fs.readFile(LOG_FILE, "utf-8"));
  const transaction = await sequelize.transaction();
  const slugs = [];

  try {
    for (const entry of log.products) {
      const product = await Product.findByPk(entry.id, { transaction });
      if (!product) continue;
      await product.update({ price: entry.price, discountPrice: entry.discountPrice }, { transaction });
      slugs.push(product.slug);
    }
    for (const entry of log.variants) {
      await ProductVariant.update(
        { price: entry.price, salePrice: entry.salePrice },
        { where: { id: entry.id }, transaction }
      );
      slugs.push(entry.productSlug);
    }
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }

  // Log ka naam badal do taake --apply dobara chal sake aur purana record bhi rahe.
  await fs.rename(LOG_FILE, LOG_FILE.replace(/\.json$/, `.reverted-${Date.now()}.json`));
  console.log(`Reverted: ${log.products.length} products, ${log.variants.length} variants`);
  await revalidateSite([...new Set(slugs.filter(Boolean))]);
};

const pick = (record, keys) => Object.fromEntries(keys.map((key) => [key, record[key]]));

const describe = (before, after) =>
  Object.keys(after)
    .filter((key) => before[key] !== after[key])
    .map((key) => `${key}: ${JSON.stringify(before[key])} -> ${JSON.stringify(after[key])}`);

const applyFixes = async () => {
  const line = "=".repeat(78);
  const log = { appliedAt: new Date().toISOString(), products: [], variants: [] };
  const slugs = [];

  console.log(`\n${line}`);
  console.log(`  CAR COVER FIXES${APPLY ? "" : "  (DRY RUN - kuch likha nahi ja raha)"}`);
  console.log(line);

  const transaction = APPLY ? await sequelize.transaction() : null;

  try {
    for (const fix of FIXES) {
      const product = await Product.findByPk(fix.id, {
        include: [{ model: ProductVariant, as: "variants" }],
        transaction,
      });
      if (!product) throw new Error(`Product #${fix.id} nahi mila.`);

      console.log(`#${product.id} ${product.name}`);
      const before = pick(product, Object.keys(fix.product));
      const changes = describe(before, fix.product);
      for (const change of changes) console.log(`   ${change}`);

      if (changes.length) {
        log.products.push({ id: product.id, before, after: fix.product });
        if (APPLY) await product.update(fix.product, { transaction });
      }

      let changed = changes.length > 0;
      for (const variant of fix.variants ? product.variants : []) {
        const vBefore = pick(variant, Object.keys(fix.variants));
        const vChanges = describe(vBefore, fix.variants);
        for (const change of vChanges) console.log(`   v${variant.id} ${variant.variantValue}: ${change}`);
        if (vChanges.length) {
          changed = true;
          log.variants.push({ id: variant.id, before: vBefore, after: fix.variants });
          if (APPLY) await variant.update(fix.variants, { transaction });
        }
      }

      if (!changed) {
        console.log("   (pehle se theek, kuch nahi badla)");
      }
      slugs.push(product.slug);
    }

    if (APPLY && (log.products.length || log.variants.length)) {
      await fs.mkdir(path.dirname(FIXES_LOG_FILE), { recursive: true });
      const previous = (await fileExists(FIXES_LOG_FILE))
        ? JSON.parse(await fs.readFile(FIXES_LOG_FILE, "utf-8"))
        : [];
      await fs.writeFile(FIXES_LOG_FILE, JSON.stringify([...previous, log], null, 2));
    }
    if (transaction) await transaction.commit();
  } catch (error) {
    if (transaction) await transaction.rollback();
    throw error;
  }

  console.log(line);
  if (APPLY) {
    console.log(`Log: ${FIXES_LOG_FILE}`);
    await revalidateSite(slugs);
  } else {
    console.log(`Apply karne ke liye: node scripts/increaseCarCoverPrices.js --fixes --apply`);
  }
};

try {
  await (FIXES_MODE ? applyFixes() : REVERT ? revert() : apply());
} catch (error) {
  console.error("Car cover price increase fail:", error.message);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
