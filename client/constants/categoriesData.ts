// src/constants/categoriesData.ts
//
// ⚠️ Ye ab OFFLINE FALLBACK hai, source of truth nahi.
// Live categories GET /api/categories se aati hain (Categories table).
// Ye array sirf tab render hota hai jab backend reachable na ho — Safety Net #2.
// Is liye ise delete mat karna, aur naye categories yahan add karne ki bhi
// zaroorat nahi (woh admin panel se banti hain).
//
// NOTE: yahan `id` asal mein SLUG hai, numeric PK nahi. Rendering se pehle
// staticCategoryToTile() se normalize karein (types/category.type.ts).
//
// `direction` field hata di gayi — woh framer-motion ka x-offset tha jo pehle
// item pe -50 aur baaki sab pe 50 hota tha. Ab Category.tsx usko index se
// derive karta hai (index === 0 ? -50 : 50), to DB column ki zaroorat nahi.
import type { StaticCategoryEntry } from "@/types/category.type";

export const HOME_CATEGORIES: StaticCategoryEntry[] = [
  // 1
  {
    id: "seat_cover", // 👈 Link ke liye use hoga
    title: "Seat Cover",
    subtitle: "Custom fit for your car seats",
    image: "/category/seatCover.png",
  },
  //   2
  {
    id: "dashboard_mat",
    title: "Dashboard Mat",
    subtitle: "High quality protection for your dashboard",
    image: "/category/dashboardMat.png",
  },
  //   3
  {
    id: "trunk_tray",
    title: "Trunc Tray Mat",
    subtitle: "High-performance protection for your seats",
    image: "/category/trunkTrayMat.png",
  },
  //   4
  {
    id: "steering_cover",
    title: "Steering Cover",
    subtitle: "Easy grip and control of the steering wheel",
    image: "/category/steeringCover.png",
  },
  //   5
  {
    id: "car_topCover",
    title: "Car Top Cover",
    subtitle: "Dust, Scratch, Water proof 100% ",
    image: "/sportage.png",
  },
  //   6
  {
    id: "floor_mat",
    title: "Floor Mat",
    subtitle: "clean and easy to remove",
    image: "/category/footMat.png",
  },
  //   7
  {
    id: "bike_topCover",
    title: "Bike Top Cover",
    subtitle: "High protection for your bike",
    image: "/category/bikeTopCover.png",
  },
  //   8
  {
    id: "rain_coat",
    title: "Rain Coat",
    subtitle: "100% WaterProof",
    image: "/category/raincoat.jpeg",
  },
];
