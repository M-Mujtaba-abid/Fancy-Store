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
import Script from "next/script"; // ✅ TikTok Pixel ke liye
import "./globals.css";
import { Providers } from "@/context/Providers";
import AppShell from "@/components/layout/AppShell";
import { Toaster } from "react-hot-toast";
import FloatingWidgets from "@/components/shop/chat/FloatingWidgets";

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
    description:
      "Get the best premium car covers, dashboard mats, and accessories for your vehicle.",
    url: "https://www.fancystore.store", // 👈 Yeh website ka URL hoga
    siteName: "Fancy Store",
    images: [
      // 👈 Images is array ke andar jayengi
      {
        url: "https://www.fancystore.store/steeringCover_compressed.jpg",
        width: 1200,
        height: 630,
        alt: "Fancy Store Global Banner",
      },
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
        {/* ==========================================
            🎯 META (FACEBOOK) PIXEL CODE
            ========================================== */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '2119855908881672');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=2119855908881672&ev=PageView&noscript=1"
            alt="Meta Pixel"
          />
        </noscript>
        {/* ==========================================
            🎯 TIKTOK PIXEL CODE
            ========================================== */}
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`
            !function (w, d, t) {
              w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
              ttq.load('D8FSN2JC77U5P5NBO52G');
              ttq.page();
            }(window, document, 'ttq');
          `}
        </Script>
        <Providers>
          <AppShell>{children}</AppShell>
          <FloatingWidgets />
        </Providers>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
