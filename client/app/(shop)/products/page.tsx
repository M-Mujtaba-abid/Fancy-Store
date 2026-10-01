// app/(shop)/products/page.tsx  (Server Component)
//
// Asal rendering productsView.tsx mein hai — wahi file pages 2+
// (/products/page/<n>) bhi render karti hai. Pehle poora page yahin tha aur
// sirf page 1 dikhata tha, bina kisi crawlable pagination ke.

// ⚠️ Literal value honi chahiye — Next isko statically analyze karta hai.
// Iske bagair naya product add karne pe ye page build waqt wali HTML hi
// dikhati rehti.
//
// Aur 6 ghante jaan bujh kar hain, wapas chhota mat karna.
//
// Ye value pehle 300 (5 minute) thi. Har stale request ek ISR write banti
// hai, aur site par ~50 aise cached URLs hain. 50 x 288 writes/din =
// ~430K/mahina, jo Vercel ki free limit (200K) se do guna zyada tha. CPU bhi
// isi se jal rahi thi, kyunke har regeneration backend ki kai calls karti hai.
//
// 6 ghante mehfooz is liye hai ke admin se product add/edit karte hi ye page
// foran purge ho jata hai - dekho utils/revalidate.ts ka revalidateForProduct().
// Timer sirf un cheezon par lagta hai jo admin se nahi badaltin, jaise order
// se ghatne wala stock, aur wo bhi khatarnak nahi kyunke order lagate waqt
// backend khud stock check karta hai.
export const revalidate = 21600;

import { Metadata } from "next";
import ProductsView, { buildProductsMetadata } from "./productsView";

export async function generateMetadata(): Promise<Metadata> {
  return buildProductsMetadata(1);
}

export default async function ProductsPage() {
  return <ProductsView page={1} />;
}
