export interface FaqItem {
  question: string;
  answer: string;
}

// Keyed by category slug. Only categories with real, accurate answers are
// listed here — an empty/missing entry means no FAQ section renders for
// that category, which is intentional (better than a generic filler answer
// that reads as thin content).
export const CATEGORY_FAQS: Record<string, FaqItem[]> = {
  car_topCover: [
    {
      question: "What's the difference between silver and black coated top covers?",
      answer:
        "Silver coated covers reflect heat and UV rays better, making them ideal for outdoor parking in direct sun. Black coated covers look sleeker but absorb more heat, so they work best in a garage or shaded parking spot.",
    },
    {
      question: "Will a top cover damage my car's paint?",
      answer:
        "No. A well-fitted, breathable top cover protects paint from UV fading, dust, and rain. Avoid covering a wet or dirty car, since trapped moisture or grit can cause scratches over time.",
    },
    {
      question: "How do I know which size to buy?",
      answer:
        "Choose a cover made specifically for your car's model rather than a generic universal size, so it fits snugly without flapping in the wind or leaving parts exposed.",
    },
    {
      question: "Are these covers waterproof?",
      answer:
        "Our top covers use waterproof and dustproof parachute or PVC and cotton fabric, so they protect against rain, dust storms, and direct sun.",
    },
  ],
  bike_topCover: [
    {
      question: "What's the difference between silver and black coated bike covers?",
      answer:
        "Silver reflects heat and UV better, making it the safer choice for a bike parked outside in direct sun most of the day. Black looks sharper but runs hotter, so it suits covered or shaded parking better.",
    },
    {
      question: "Will a bike cover protect against rain?",
      answer:
        "Yes, as long as it's genuinely waterproof, not just water resistant. Check for a waterproof and dustproof rating before buying if you park outside during monsoon.",
    },
  ],
  towels: [
    {
      question: "Can I use a microfiber towel on my car's paint?",
      answer:
        "Yes. Microfiber is one of the safest materials for car paint since its fibers lift dirt instead of dragging it across the surface, unlike a regular cotton cloth.",
    },
    {
      question: "Do I need to wash a new microfiber towel before using it?",
      answer:
        "Yes, wash it once before first use to remove manufacturing residue that can reduce absorbency and cause streaking.",
    },
    {
      question: "Can I use fabric softener when washing microfiber towels?",
      answer:
        "No. Fabric softener coats the fibers and reduces their absorbency over time. Use a mild detergent instead.",
    },
  ],
  rain_coat: [
    {
      question: "What size rain coat should I buy for riding?",
      answer:
        "Size up from your normal clothing size so the rain coat fits comfortably over your riding jacket and pants, not just your regular clothes.",
    },
    {
      question: "Is a one-piece or two-piece rain suit better?",
      answer:
        "A two-piece jacket-and-pants set is easier to put on and take off in stages, making it more practical for daily commuting. A one-piece suit gives slightly more coverage with no waist gap.",
    },
    {
      question: "Will I still get wet in a rain coat during heavy rain?",
      answer:
        "Not if the ankle, wrist, and neck openings are properly sealed. Most leaks happen at these openings rather than through the fabric itself.",
    },
  ],
  dashboard_mat: [
    {
      question: "Does a dashboard mat damage the dashboard underneath?",
      answer:
        "No, it protects it. The mat absorbs heat and UV exposure instead of the factory dashboard plastic, which helps prevent fading and cracking over time.",
    },
    {
      question: "Will a dashboard mat block my air vents or sensors?",
      answer:
        "A properly made mat is cut to match your exact car model, with openings for vents and sensors, so nothing gets covered.",
    },
    {
      question: "Velvet or leather dashboard mat, which is better?",
      answer:
        "Both protect equally well. Velvet reduces glare more effectively, while leather is slightly easier to wipe clean. It mostly comes down to preference.",
    },
  ],
  trunk_tray: [
    {
      question: "What's the difference between a trunk mat and a boot liner?",
      answer:
        "A trunk mat is a flat sheet that covers the floor. A boot liner (trunk tray) has raised edges that contain spills and dirt, giving more complete protection.",
    },
    {
      question: "Are trunk mats waterproof?",
      answer: "Yes, they're designed to be waterproof and easy to wipe down or rinse off.",
    },
  ],
  headlight_bulb: [
    {
      question: "Are LED headlight bulbs legal to install?",
      answer:
        "Standard white LED bulbs designed for your specific headlight housing are generally fine. Avoid non-standard colors like blue or purple, which are restricted in many places.",
    },
    {
      question: "Will LED bulbs blind other drivers?",
      answer:
        "Only if fitted incorrectly. A bulb that doesn't match your headlight housing's beam pattern can scatter light upward into oncoming traffic, so always check compatibility before buying.",
    },
  ],
  floor_mat: [
    {
      question: "Do rubber mats really help cattle?",
      answer:
        "Yes. They keep cattle off wet, muddy, or hard concrete ground, which protects their hooves and significantly lowers the risk of lameness and hoof disease.",
    },
    {
      question: "Are these mats easy to clean?",
      answer:
        "Yes, a quick hose down and wipe is enough to keep them hygienic. They hold up to daily wear far longer than bare flooring alone.",
    },
  ],
};
