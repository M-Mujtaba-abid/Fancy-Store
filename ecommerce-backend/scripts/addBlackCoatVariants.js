/**
 * addBlackCoatVariants.js
 *
 * Silver parachute wale 64 top cover products par "Black Coated" ka doosra
 * option chara deta hai. Naya product NAHI banata - wahi product, do variants.
 *
 * Har product par teen cheezein hoti hain:
 *
 *   1. NAAM material-neutral ho jata hai
 *        "Suzuki Alto Car Top Cover - Silver Parachute"
 *        -> "Suzuki Alto Car Top Cover | 100% Waterproof Quality"
 *      Zaroori hai: ab product dono materials bechta hai, to naam mein sirf
 *      "Silver Parachute" likha rehna galat ho jata. SEO title par koi asar
 *      nahi - utils/seo.ts ka coreProductName() separator se pehle wala hissa
 *      leta hai, jo dono soorton mein "Suzuki Alto Car Top Cover" hi hai.
 *
 *   2. DESCRIPTION mein do headings
 *        <h3>Silver Coat Quality</h3>  -> jo text pehle se tha
 *        <h3>Black Coat Quality</h3>   -> naya
 *
 *   3. DO VARIANTS (jahan pehle se na hon)
 *        Silver Coated : product ki mojooda price / discountPrice
 *        Black Coated  : discountPrice + 500, aur cut price aisi ke discount
 *                        40% se kam na ho
 *
 * Black cover ki image assets/BCQ/ se Cloudinary par jati hai. Upload ka
 * natija assets/BCQ/cloudinary.json mein cache hota hai, to dobara chalane par
 * wahi image phir se upload nahi hoti.
 *
 * Script idempotent hai aur har hissa alag se check hota hai: jis product par
 * "Black Coated" variant pehle se ho uska variant nahi banta (naam aur
 * description phir bhi update hote hain, warna wo product baqi se alag shakal
 * ka reh jata), aur jis description mein heading pehle se ho wo chhor di jati
 * hai. Dobara chalane se kuch duplicate nahi hota.
 *
 * Usage:
 *   node scripts/addBlackCoatVariants.js            # dry run (default)
 *   node scripts/addBlackCoatVariants.js --apply
 *   node scripts/addBlackCoatVariants.js --only car-topcover-silver-coated-suzuki-alto
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Op } from "sequelize";
import { Product, ProductVariant, sequelize } from "../models/index.js";
import { uploadBuffer } from "../utils/cloudinaryMedia.js";

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const ONLY = args.includes("--only") ? args[args.indexOf("--only") + 1] : null;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const BCQ_DIR = path.join(REPO_ROOT, "assets", "BCQ");
const UPLOAD_CACHE = path.join(BCQ_DIR, "cloudinary.json");

const SLUG_PREFIX = "car-topcover-silver-coated-";
const BLACK_VALUE = "Black Coated";
const SILVER_VALUE = "Silver Coated";
const VARIANT_TYPE = "material"; // mojooda variants isi casing par hain

/** Black quality ki keemat silver se itni zyada hai. */
const BLACK_PREMIUM = 500;

/** Cut price aisi ho ke discount is se kam na ho. */
const MIN_DISCOUNT = 0.4;

/**
 * Cut price nikalta hai: sale price ko 40% off banane wali asal keemat,
 * agle 100 par round up.
 *
 * Round UP karte hain, down nahi: 2599 ka theek 40% off 4331.67 banta hai,
 * aur 4300 par round karne se discount 39.6% reh jata aur "40% OFF" ka daawa
 * galat ho jata. 4400 par wo 40.9% hai.
 */
const cutPriceFor = (salePrice) =>
  Math.ceil(salePrice / (1 - MIN_DISCOUNT) / 100) * 100;

/** "Suzuki Alto Car Top Cover - Silver Parachute" -> "Suzuki Alto" */
const carNameFrom = (productName) =>
  String(productName).split(/\s+Car Top Cover/i)[0].trim();

const productTitleFor = (car) => `${car} Car Top Cover | 100% Waterproof Quality`;

/**
 * Black Coat wala section.
 *
 * Content jaan bujh kar imandaar hai aur site ki apni blog post
 * (/blog/silver-vs-black-coated-car-top-cover-which-one-should-you-buy) se
 * mail khata hai: black dekhne mein behtar hai aur mitti chhupata hai, magar
 * dhoop mein silver se zyada garam hota hai. Ulta likhne se blog aur product
 * page ek doosre ko jhutlate, aur customer wapsi karta.
 */
const blackSection = (car) => `<h3>Black Coat Quality</h3>` +
  `<p>Wahi tailored fit jo ${car} ke liye bani hai, magar gehre black coated ` +
  `parachute fabric mein. Dark surface road film, brake dust aur halki mitti ` +
  `ko silver ke muqable behtar chhupata hai, is liye cover do washes ke ` +
  `darmiyan bhi saaf nazar aata hai.</p>` +
  `<ul>` +
  `<li><strong>Black Coated Parachute:</strong> Wahi coated parachute fabric, ` +
  `black finish mein. Matte black look gaari par premium lagta hai.</li>` +
  `<li><strong>100% Waterproof:</strong> Monsoon barish, kichar aur road grime ` +
  `fabric se bah jate hain, andar body tak nahi pohanchte.</li>` +
  `<li><strong>Mitti Chhupata Hai:</strong> Dark color par dhool aur road film ` +
  `nazar nahi aati, to cover har hafte dhone ki zaroorat nahi parti.</li>` +
  `<li><strong>Scratchless Inner Lining:</strong> Narm brushed lining paint par ` +
  `phisalti hai, swirl marks nahi chorti.</li>` +
  `<li><strong>Windproof Elastic Hem:</strong> Aage peeche heavy duty elastic ` +
  `bumper ke neeche cover ko kas deta hai, tez hawa mein bhi nahi uthta.</li>` +
  `</ul>` +
  `<p><strong>Kaun sa lein?</strong> Agar aapki ${car} garage, shed ya saaye ` +
  `mein khari rehti hai to black coat behtar look deta hai aur mitti chhupata ` +
  `hai. Agar gaari sara din khuli dhoop mein khari rehti hai to silver coat ` +
  `andar se thanda rakhta hai. Fabric, fitting aur waterproofing dono mein ek ` +
  `jaisi hai.</p>`;

const silverHeading = "<h3>Silver Coat Quality</h3>";

const loadUploadCache = async () => {
  try {
    return JSON.parse(await fs.readFile(UPLOAD_CACHE, "utf-8"));
  } catch {
    return {};
  }
};

const run = async () => {
  const where = { slug: ONLY ? ONLY : { [Op.like]: `${SLUG_PREFIX}%` } };
  const products = await Product.findAll({
    where,
    include: [{ model: ProductVariant, as: "variants" }],
    order: [["id", "ASC"]],
  });

  if (products.length === 0) {
    throw new Error(`Koi product nahi mila (${ONLY || SLUG_PREFIX + "*"}).`);
  }

  const cache = await loadUploadCache();
  const line = "=".repeat(78);

  console.log(`\n${line}`);
  console.log(`  BLACK COAT VARIANTS${APPLY ? "" : "  (DRY RUN - kuch likha nahi ja raha)"}`);
  console.log(`  Products: ${products.length}   premium: +Rs ${BLACK_PREMIUM}   min discount: ${MIN_DISCOUNT * 100}%`);
  console.log(`  Images  : ${BCQ_DIR}`);
  console.log(`  Uploaded pehle se: ${Object.keys(cache).length}`);
  console.log(line);

  const plan = [];
  const skipped = [];
  const missingImages = [];

  for (const product of products) {
    const carSlug = product.slug.replace(SLUG_PREFIX, "");
    const imageName = `car-topcover-black-coated-${carSlug}.jpg`;
    const imagePath = path.join(BCQ_DIR, imageName);

    try {
      await fs.access(imagePath);
    } catch {
      missingImages.push(`${product.slug}  ->  ${imageName}`);
      continue;
    }

    // Jis product par black variant pehle se ho (e.g. purane duplicate se copy
    // hui thi) us ka SIRF variant banana chhorte hain. Naam aur description
    // phir bhi update hote hain, warna wo do products baqi 62 se alag shakal
    // ke reh jate.
    const existingBlack = product.variants.find(
      (v) => v.variantValue.toLowerCase().trim() === BLACK_VALUE.toLowerCase()
    );

    const hasSilver = product.variants.some(
      (v) => v.variantValue.toLowerCase().trim() === SILVER_VALUE.toLowerCase()
    );

    const car = carNameFrom(product.name);
    const silverSale = Number(product.discountPrice) || Number(product.price);
    const blackSale = silverSale + BLACK_PREMIUM;
    const blackCut = cutPriceFor(blackSale);

    if (existingBlack) {
      const current = `Rs ${existingBlack.price} / ${existingBlack.salePrice}`;
      const standard = `Rs ${blackCut} / ${blackSale}`;
      if (current !== standard) {
        skipped.push(
          `#${product.id} ${product.slug}: black variant pehle se hai aur uski ` +
          `price ${current} hai, nayi standard ${standard} se alag. ` +
          `Jaan bujh kar haath nahi lagaya, khud dekh lein.`
        );
      } else {
        skipped.push(`#${product.id} ${product.slug}: black variant pehle se hai`);
      }
    }

    plan.push({
      product,
      car,
      imageName,
      imagePath,
      hasSilver,
      existingBlack: Boolean(existingBlack),
      newName: productTitleFor(car),
      silver: { price: Number(product.price), salePrice: silverSale },
      black: { price: blackCut, salePrice: blackSale },
      needsDescription: !product.description?.includes("Black Coat Quality"),
    });
  }

  for (const item of plan.slice(0, APPLY ? plan.length : 6)) {
    const off = Math.round((1 - item.black.salePrice / item.black.price) * 100);
    console.log(`\n#${item.product.id}  ${item.product.slug}`);
    console.log(`   naam    : ${item.product.name}`);
    console.log(`          -> ${item.newName}`);
    console.log(`   silver  : Rs ${item.silver.price} / ${item.silver.salePrice}` +
      `${item.hasSilver ? "   (variant pehle se hai, chhor rahe hain)" : "   (variant banega)"}`);
    console.log(`   black   : Rs ${item.black.price} / ${item.black.salePrice}   ${off}% off` +
      `${item.existingBlack ? "   (variant pehle se hai, chhor rahe hain)" : "   (variant banega)"}`);
    console.log(`   image   : ${item.imageName}` +
      `${item.existingBlack ? "  (skip, black variant pehle se hai)" : cache[item.imageName] ? "  (upload ho chuki)" : "  (upload hogi)"}`);
    console.log(`   desc    : ${item.needsDescription ? "dono headings lagengi" : "heading pehle se hai, chhor rahe hain"}`);
  }
  if (!APPLY && plan.length > 6) console.log(`\n  ... aur ${plan.length - 6} products isi tarah`);

  if (missingImages.length) {
    console.log(`\n${line}\n  IMAGE NAHI MILI (${missingImages.length})\n${line}`);
    for (const m of missingImages) console.log(`   ${m}`);
    console.log("   Pehle chalayein: python build_black_cover_products.py");
  }
  if (skipped.length) {
    console.log(`\n${line}\n  DHYAN DO (${skipped.length})\n${line}`);
    for (const s of skipped) console.log(`   ${s}`);
  }

  console.log(`\n${line}`);
  if (!APPLY) {
    console.log(`  DRY RUN tha. ${plan.length} products par kaam hota.`);
    console.log(`  Asal mein chalane ke liye:  node scripts/addBlackCoatVariants.js --apply`);
    console.log(`${line}\n`);
    return;
  }

  let uploaded = 0;
  let variantsMade = 0;
  let renamed = 0;
  let described = 0;

  for (const item of plan) {
    // Upload transaction se BAHIR hai: network call lambi chalti hai aur usay
    // DB transaction ke andar rakhne se lock der tak khula rehta.
    let url = cache[item.imageName];
    if (!url && !item.existingBlack) {
      const buffer = await fs.readFile(item.imagePath);
      url = await uploadBuffer({ buffer, folder: "products" });
      cache[item.imageName] = url;
      uploaded += 1;
      await fs.writeFile(UPLOAD_CACHE, JSON.stringify(cache, null, 2) + "\n", "utf-8");
    }

    await sequelize.transaction(async (transaction) => {
      if (!item.hasSilver) {
        await ProductVariant.create({
          productId: item.product.id,
          variantType: VARIANT_TYPE,
          variantValue: SILVER_VALUE,
          materialName: SILVER_VALUE,
          price: item.silver.price,
          salePrice: item.silver.salePrice,
          stock: item.product.stock,
          imageUrl: item.product.imageUrl,
          status: "active",
        }, { transaction });
        variantsMade += 1;
      }

      if (!item.existingBlack) {
        await ProductVariant.create({
          productId: item.product.id,
          variantType: VARIANT_TYPE,
          variantValue: BLACK_VALUE,
          materialName: BLACK_VALUE,
          price: item.black.price,
          salePrice: item.black.salePrice,
          stock: item.product.stock,
          imageUrl: url,
          status: "active",
        }, { transaction });
        variantsMade += 1;
      }

      const updates = { name: item.newName };
      if (item.needsDescription) {
        updates.description =
          `${silverHeading}${item.product.description || ""}${blackSection(item.car)}`;
        described += 1;
      }
      await Product.update(updates, { where: { id: item.product.id }, transaction });
      renamed += 1;
    });

    console.log(`  ok  #${item.product.id}  ${item.car}`);
  }

  console.log(`\n${line}`);
  console.log(`  images upload hui     : ${uploaded}`);
  console.log(`  variants bane         : ${variantsMade}`);
  console.log(`  products rename hue   : ${renamed}`);
  console.log(`  descriptions badlin   : ${described}`);
  console.log(`  upload cache          : ${UPLOAD_CACHE}`);
  console.log(`\n  Slugs kisi ke nahi badle, koi URL nahi tooti.`);
  console.log(`${line}\n`);
};

try {
  await run();
} catch (error) {
  console.error("\nFail hua:", error.message);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
