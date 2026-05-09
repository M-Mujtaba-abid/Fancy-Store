// import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
// import "./globals.css";
// import { Providers } from "@/context/Providers"; // Naya Providers import karein
// import AppShell from "@/components/layout/AppShell";
// import { Toaster } from "react-hot-toast";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// export const metadata: Metadata = {
//   title: "Top Covers Fancy Store | Car Covers , Top Covers",
//   description: "Get the best car covers for your vehicle",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html
//       lang="en"
//       suppressHydrationWarning // Hydration warning se bachne ke liye zaroori hai

//     >
//       <body
//         suppressHydrationWarning
//       className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col`}>
//         <Providers>
//           <AppShell>{children}</AppShell>
//         </Providers>
//         <Toaster position="top-right" />
//       </body>
//     </html>
//   );
// }



import type { Metadata, Viewport } from "next"; // ✅ Viewport import kiya
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/context/Providers";
import AppShell from "@/components/layout/AppShell";
import { Toaster } from "react-hot-toast";
import dynamic from 'next/dynamic';

const ChatWidget = dynamic(() => import('@/components/shop/chat/ChatWidget'), { ssr: false });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ==========================================
// 🌟 1. GLOBAL VIEWPORT SETTINGS (Next.js 14+)
// ==========================================
export const viewport: Viewport = {
  themeColor: "#ffffff", // Mobile browser ke top bar ka color
  width: "device-width",
  initialScale: 1,
};

// ==========================================
// 🌟 2. GLOBAL SEO METADATA
// ==========================================
export const metadata: Metadata = {
  metadataBase: new URL("https://www.fancystore.store"), // ✅ Zaroori hai images ke liye
  title: {
    default: "Fancy Store | Car Top Covers & Accessories", // Jab kisi page ka apna title na ho
    template: "%s | Fancy Store", // 🔥 MAGIC: Child page sirf "Cart" likhega, ye usko "Cart | Fancy Store" bana dega
  },
  description:
    "Get the best car top covers, dashboard mats, trunktray mats, and other car accessories for your vehicle in Pakistan with fast shipping.",
  keywords: [
    "Top covers",
    "Dashboard mats",
    "Trunktray mats",
    "Other car accessories",
    "Car covers",
    "Top Covers",
    "Car accessories Pakistan",
    "Fancy Store",
  ],

  // Default Open Graph (Agar kisi page par share link na ho toh yeh use hoga)
  // Default Open Graph
  openGraph: {
    title: "Fancy Store | Premium Car Covers & Accessories",
    description: "Get the best premium car covers, dashboard mats, and accessories for your vehicle.",
    url: "https://www.fancystore.store", // 👈 Yeh website ka URL hoga
    siteName: "Fancy Store",
    images: [ // 👈 Images is array ke andar jayengi
      {
        url: "https://www.fancystore.store/steeringCover_compressed.jpg", 
        width: 1200,
        height: 630,
        alt: "Fancy Store Global Banner",
      }
    ],
    locale: "en_PK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    images: ["https://www.fancystore.store/steeringCover_compressed.jpg"], // 👈 Twitter ki image
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning // Hydration warning se bachne ke liye zaroori hai
    >
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col`}
      >
        <Providers>
          <AppShell>{children}</AppShell>
          <ChatWidget />
        </Providers>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
