// app/(shop)/products/page.tsx  (Server Component)
//
// Asal rendering productsView.tsx mein hai — wahi file pages 2+
// (/products/page/<n>) bhi render karti hai. Pehle poora page yahin tha aur
// sirf page 1 dikhata tha, bina kisi crawlable pagination ke.

// ⚠️ Literal value honi chahiye — Next isko statically analyze karta hai.
// Iske bagair naya product add karne pe ye page build waqt wali HTML hi
// dikhati rehti.
export const revalidate = 300;

import { Metadata } from "next";
import ProductsView, { buildProductsMetadata } from "./productsView";

export async function generateMetadata(): Promise<Metadata> {
  return buildProductsMetadata(1);
}

export default async function ProductsPage() {
  return <ProductsView page={1} />;
}
