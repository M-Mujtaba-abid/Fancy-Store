// app/(shop)/viewMore/page.tsx (Server Component)
//
// Yeh page sirf query-string filters/search (?filter=on-sale, ?search=honda
// waghera) dikhata hai — same content har baar alag URL pe. Isi wajah se GSC
// "Duplicate without user-selected canonical" report karta tha (koi canonical
// tag hi nahi tha, kyunke pehle yeh poora "use client" tha aur client
// components metadata export nahi kar sakte).
//
// Fix: noindex, follow — Google in variants ko index nahi karega (real
// landing pages /products aur /category/<slug> hain), lekin links follow
// karke unhi asli pages tak link-equity pohcha dega.
import { Metadata } from "next";
import ViewMoreClient from "./ViewMoreClient";

export const metadata: Metadata = {
  title: "Browse Products | Fancy Store",
  robots: {
    index: false,
    follow: true,
  },
};

export default function ViewMorePage() {
  return <ViewMoreClient />;
}
