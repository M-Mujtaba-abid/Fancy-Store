/**
 * differentiateSimilarProducts.js
 *
 * Ye wo products hain jo duplicate LAGTE hain magar hain nahi. Farq asli hai
 * (color, material, ya gaari ka model year) lekin naam aur description se wo
 * farq nazar hi nahi aata, is liye Google inhe ek hi cheez samajh kar dono ko
 * index nahi karta aur customer bhi confuse hota hai.
 *
 * Yahan sirf `name`, `description` aur `carModel` badalte hain.
 *
 * ⚠️ `slug` NAHI badalta. Ye jaan bujh kar hai: services/product.service.js
 * update par slug ko haath nahi lagata, warna already indexed URLs 404 ho
 * jatin. Yani ye script kisi URL ko nahi torti.
 *
 * `carModel` isliye theek kar rahe hain ke kai rows mein junk para hai
 * (Honda City ka carModel "toyota", Corolla ka "Toyotta", Alto ka "All"). Ye
 * field AI search text aur duplicate detection dono mein jati hai.
 *
 * Usage:
 *   node scripts/differentiateSimilarProducts.js          # dry run (default)
 *   node scripts/differentiateSimilarProducts.js --apply  # DB likhta hai
 */
import { Product, sequelize } from "../models/index.js";

const APPLY = process.argv.includes("--apply");

const p = (...paragraphs) =>
  paragraphs.map((text) => `<p>${text}</p>`).join("");

const UPDATES = [
  {
    id: 75,
    pairWith: "#166 Suzuki Alto - Silver Parachute",
    name: "Suzuki Alto Car Top Cover - Black Coated Parachute",
    carModel: "Suzuki Alto",
    description: p(
      "Black coated parachute top cover cut for the Suzuki Alto. The black coating blocks sunlight completely and hides dust between washes, which suits cars parked under trees or on dusty streets.",
      "Fully waterproof, scratchless inner lining, and an elasticated hem so it grips the bumpers instead of flapping in wind. Carry bag included.",
      "If you want heat reflection instead of full light blocking, the silver parachute version of the Alto cover is listed separately."
    ),
  },
  {
    id: 72,
    pairWith: "#168 Suzuki Every - Silver Parachute",
    name: "Suzuki Every Daba Car Top Cover - Black Coated",
    carModel: "Suzuki Every Daba",
    description: p(
      "Black coated top cover made for the Suzuki Every Daba. The heavier black coating gives maximum sun blocking and does not show dirt, so the cover keeps looking clean for longer.",
      "100% waterproof and dustproof, with a soft inner surface that will not scratch paint and a tailored cut for the Every's tall body.",
      "A silver parachute version of the Every cover is also listed if you prefer heat reflection."
    ),
  },
  {
    id: 63,
    pairWith: "#171 Toyota Aqua - Silver Parachute",
    name: "Toyota Aqua Car Top Cover - Grey PVC Cotton",
    carModel: "Toyota Aqua",
    description: p(
      "PVC cotton top cover for the Toyota Aqua in grey. The PVC outer layer with cotton backing is thicker and tougher than parachute fabric, so it holds up better if the car stays parked outdoors all year.",
      "Waterproof, dustproof, and gentle on paint. Heavier to fold than parachute, but it lasts longer.",
      "A lighter silver parachute version of the Aqua cover is listed separately."
    ),
  },
  {
    id: 51,
    pairWith: "#76 Honda City - Silver Coated",
    name: "Honda City Car Top Cover - Black PVC Cotton",
    carModel: "Honda City",
    description: p(
      "PVC cotton top cover for the Honda City in black. The PVC outer with cotton lining is a heavier, longer lasting fabric than plain parachute, which makes it a good pick for cars parked outside day and night.",
      "Fully waterproof and dustproof, soft on the inside so it will not scuff the paint, and cut to sit flush on the City's body.",
      "A silver coated version of the City cover is listed separately if you want more heat reflection."
    ),
  },
  {
    id: 76,
    pairWith: "#51 Honda City - Black PVC Cotton",
    name: "Honda City Car Top Cover - Silver Coated",
    carModel: "Honda City",
    description: p(
      "Silver coated top cover for the newer shape Honda City. The silver surface reflects sunlight and keeps the cabin noticeably cooler than a dark cover, which is what most buyers want through a Pakistani summer.",
      "Waterproof, dustproof, tailored fit with an elasticated hem, and light enough to fold back into the carry bag in seconds.",
      "A black PVC cotton version of the City cover is listed separately if you want a heavier, longer lasting fabric."
    ),
  },
  {
    id: 53,
    pairWith: "#74 Kia Sportage - Silver Parachute",
    name: "Kia Sportage Car Top Cover - Green Parachute",
    carModel: "Kia Sportage",
    // ⚠️ Is row ki purani description mein GALTI se Evee GenZ scooty cover ka
    // text para tha (copy paste ki ghalti). Wo poori tarah replace ho rahi hai.
    description: p(
      "Parachute top cover tailored for the Kia Sportage in green. Cut for the Sportage's SUV height and length, so it sits flush on the body instead of flapping at the corners.",
      "Waterproof against monsoon rain, dustproof, and soft on the inside so the paint stays scratch free. Elasticated hem with tie down straps to hold it in wind.",
      "A silver parachute version of the Sportage cover is listed separately."
    ),
  },
  {
    id: 47,
    pairWith: "#70 Suzuki New Cultus, #167 Suzuki Cultus silver",
    name: "Suzuki Cultus Old Model Car Top Cover - Black Parachute",
    carModel: "Suzuki Cultus (Old Model)",
    description: p(
      "Black parachute top cover cut for the OLD shape Suzuki Cultus, not the 2017 onward model. The black coating blocks sun completely and hides dust, which suits cars parked in the open.",
      "Heat and water resistant, scratchless lining, and a snug fit with an elasticated hem.",
      "Check your model year before ordering. The new shape Cultus needs a different cut and is listed separately."
    ),
  },
  {
    id: 70,
    pairWith: "#47 Cultus Old Model black, #167 Suzuki Cultus silver",
    name: "Suzuki New Cultus Car Top Cover - Silver Parachute",
    carModel: "Suzuki New Cultus (2017 onward)",
    description: p(
      "Silver parachute top cover cut for the NEW shape Suzuki Cultus, 2017 onward. The silver surface reflects heat and keeps the cabin cooler, and the fabric is fully waterproof and dustproof.",
      "Tailored to the new Cultus body so it grips the bumpers rather than flapping in wind, with a scratchless inner surface.",
      "The old shape Cultus needs a different cut and is listed separately."
    ),
  },
  {
    id: 82,
    pairWith: "#83 Honda City 2021-2026 trunk tray",
    name: "Honda City 2009-2018 Trunk Tray Mat - PVC",
    carModel: "Honda City 2009-2018",
    description: p(
      "Custom fit PVC trunk tray for the Honda City 2009 to 2018 shape. Raised edges hold spills, mud and loose grocery items inside the tray instead of letting them soak into the boot carpet.",
      "Waterproof, easy to lift out and rinse under a tap, and it drops straight back in.",
      "Made for the older City boot. The 2021 onward City uses a different tray, listed separately."
    ),
  },
  {
    id: 83,
    pairWith: "#82 Honda City 2009-2018 trunk tray",
    name: "Honda City 2021-2026 Trunk Tray Mat - Rubber Foam",
    carModel: "Honda City 2021-2026",
    description: p(
      "Rubber foam trunk tray made for the Honda City 2021 to 2026 shape. Thicker and softer than the PVC tray, with better sound damping and a firm grip so luggage does not slide around.",
      "Waterproof and washable, with raised edges that contain spills.",
      "Cut specifically for the new City boot. The 2009 to 2018 City uses a different tray, listed separately."
    ),
  },
];

const stripHtml = (value) =>
  String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const run = async () => {
  const ids = UPDATES.map((u) => u.id);
  const rows = await Product.findAll({
    where: { id: ids },
    attributes: ["id", "name", "slug", "carModel", "description", "isArchived"],
  });
  const byId = new Map(rows.map((r) => [r.id, r]));

  const missing = ids.filter((id) => !byId.has(id));
  if (missing.length) {
    throw new Error(`Ye ids DB mein nahi milin: ${missing.join(", ")}`);
  }

  const line = "=".repeat(78);
  console.log(`\n${line}`);
  console.log(
    `  SIMILAR PRODUCTS KI WORDING${APPLY ? "" : "  (DRY RUN - DB par kuch nahi likha ja raha)"}`
  );
  console.log(`  Products: ${UPDATES.length}`);
  console.log(line);

  for (const update of UPDATES) {
    const row = byId.get(update.id);
    const oldDesc = stripHtml(row.description);
    const newDesc = stripHtml(update.description);

    console.log(`\n#${update.id}   /products/${row.slug}`);
    console.log(`   jori       : ${update.pairWith}`);
    console.log(`   naam       : ${row.name.trim()}`);
    console.log(`             -> ${update.name}`);
    console.log(`   carModel   : ${row.carModel || "(khali)"}  ->  ${update.carModel}`);
    console.log(`   desc       : ${oldDesc.length} chars: ${oldDesc.slice(0, 70)}...`);
    console.log(`             -> ${newDesc.length} chars: ${newDesc.slice(0, 70)}...`);
    if (row.isArchived) {
      console.log(`   ⚠️  ye product archived hai, wording badalne ka koi faida nahi`);
    }
  }

  console.log(`\n${line}`);
  if (APPLY) {
    await sequelize.transaction(async (transaction) => {
      for (const update of UPDATES) {
        await Product.update(
          {
            name: update.name,
            description: update.description,
            carModel: update.carModel,
          },
          { where: { id: update.id }, transaction }
        );
      }
    });
    console.log(`  ✅ ${UPDATES.length} products ki wording update ho gayi`);
    console.log(`  Slugs waise ke waise hain, koi URL nahi tooti.`);
  } else {
    console.log(`  DRY RUN tha. DB par kuch nahi likha gaya.`);
    console.log(`  Asal mein chalane ke liye:  node scripts/differentiateSimilarProducts.js --apply`);
  }
  console.log(`${line}\n`);
};

try {
  await run();
} catch (error) {
  console.error("\n❌ Update fail hua:", error.message);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
