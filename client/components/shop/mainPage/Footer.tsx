"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  Phone,
  MapPin,
  ArrowUpRight,
  ChevronDown,
} from "lucide-react";
import { useTheme } from "next-themes";
import { HOME_CATEGORIES } from "@/constants/categoriesData";
import { staticCategoryToTile, type HomeCategoryTile } from "@/types/category.type";

/* ───────── MOBILE ACCORDION COMPONENT ───────── */
const FooterSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState("0px");

  useEffect(() => {
    if (contentRef.current) {
      setHeight(open ? `${contentRef.current.scrollHeight}px` : "0px");
    }
  }, [open]);

  return (
    <div className="border-b border-border-custom md:border-none">
      {/* Header (Mobile) */}
      <button
        className="md:hidden w-full flex justify-between items-center py-4"
        onClick={() => setOpen(!open)}
      >
        <span className="font-bold text-sm uppercase tracking-widest text-text-main">
          {title}
        </span>
        <ChevronDown
          size={16}
          className={`text-text-muted transition-transform duration-300 ${open ? "rotate-180" : ""
            }`}
        />
      </button>

      {/* Desktop Title */}
      <h4 className="hidden md:block font-bold text-sm mb-6 uppercase tracking-widest text-text-main">
        {title}
      </h4>

      {/* Content */}
      <div
        ref={contentRef}
        style={{ maxHeight: height }}
        className="overflow-hidden transition-all duration-300 md:max-h-none md:overflow-visible"
      >
        <div className="pb-4 md:pb-0">{children}</div>
      </div>
    </div>
  );
};

/* ───────── MAIN FOOTER ───────── */
interface FooterProps {
  /**
   * Live categories, app/layout.tsx se server par fetch ho kar AppShell ke
   * zariye yahan aati hain. Na milein to neeche static fallback chalta hai —
   * wahi pattern jo homepage ke Category.tsx par hai.
   */
  categories?: HomeCategoryTile[];
}

const Footer = ({ categories }: FooterProps) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const logoSrc =
    mounted && resolvedTheme === "dark" ? "/logoB.png" : "/logoW.png";

  const socialLinks = [
    {
      name: "Instagram",
      href: "https://www.instagram.com/fancy.store62/",
    },
    {
      name: "TikTok",
      href: "https://www.tiktok.com/@fancystore62",
    },
  ];

  const quickLinks = [
    { label: "Shop All", href: "/products" },
    { label: "New Arrivals", href: "/viewMore?filter=new-arrivals" },
    { label: "Car Covers", href: "/viewMore?filter=car-covers" },
    { label: "Bike Covers", href: "/viewMore?filter=bike-covers" },
    { label: "Sale", href: "/viewMore?filter=on-sale" },
    { label: "Blog", href: "/blog" },
  ];

  /**
   * Har page ke footer mein category links.
   *
   * Pehle site-wide navigation mein category ka EK bhi link nahi tha: Navbar
   * aur footer ke Quick Links ke ziada tar entries /viewMore?filter=... par
   * jati hain, jo jaan bujh kar noindex hain (viewMore/page.tsx). Category
   * pages tak raasta sirf homepage tiles (wo bhi sirf showOnHome=true wali)
   * aur /products se tha — aur yehi 11 URLs GSC mein "Discovered - currently
   * not indexed" par atki hui thin.
   *
   * Footer har page par hai, is liye yahan se har category do hop mein
   * crawlable ho jati hai.
   */
  // Khali categories yahan se nikal jati hain. Jis category mein ek bhi product
  // nahi, uska page sirf "This Category is Coming soon..." dikhata hai — wo bhi
  // 200 status ke sath, yani Google ke liye soft 404. Aise pages ko HAR page ke
  // footer se link karna crawl budget zaya karta hai aur site-wide thin content
  // ka signal deta hai. (Sitemap bhi inhe isi wajah se skip karta hai.)
  //
  // `productCount === undefined` wale rehne dete hain: matlab backend ka count
  // nahi aaya, aur aise mein link chhupa dena us se bura hai jo hum bacha rahe
  // hain.
  const liveCategories = categories?.filter((c) => c.productCount !== 0);

  const categoryLinks: HomeCategoryTile[] = liveCategories?.length
    ? liveCategories
    : HOME_CATEGORIES.map(staticCategoryToTile);

  const supportLinks = [
    { label: "Track Order", href: "/order" },
    { label: "Shipping Policy", href: "/shipping-policy" },
    { label: "Return & Exchange", href: "/return-policy" },
    { label: "FAQs", href: "/faqs" },
    { label: "Privacy Policy", href: "/privacy-policy" },
  ];

  return (
    <footer className="bg-background border-t border-border-custom text-text-main">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* GRID LAYOUT */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-0 md:gap-8 lg:gap-10 pt-10 md:pt-16 pb-10 md:pb-16">

          {/* COLUMN 1: BRAND */}
          <div className="space-y-5 py-8 md:py-0 border-b md:border-none border-border-custom">
            <Link href="/">
              <Image
                src={logoSrc}
                alt="Fancy Store"
                width={120}
                height={40}
              />
            </Link>
            <p className="text-sm text-text-muted max-w-xs">
              Premium vehicle covers for cars and bikes. Protect your passion
              with all-weather durable shields.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((s) => (
                <Link
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-border-custom/30 text-text-muted transition-all hover:scale-110 hover:bg-primary hover:text-white"
                >
                  {s.name === "Instagram" ? (
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-5 w-5"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                    </svg>
                  ) : (
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-5 w-5"
                    >
                      <path d="M16.7 3c.3 1.8 1.3 3 3.3 3.2v3.1c-1.3 0-2.4-.3-3.3-.9v6.3c0 4-2.9 6.3-6.5 6.3A5.2 5.2 0 0 1 5 15.9c0-3 2.2-5.4 5.2-5.6v3.2c-1.1.1-2 .9-2 2 0 1.2.9 2.1 2.1 2.1 1.4 0 2.2-.9 2.2-2.5V3h4.2Z" />
                    </svg>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* COLUMN 2: QUICK LINKS */}
          <FooterSection title="Quick Links">
            <ul className="space-y-3">
              {quickLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-text-muted hover:text-primary flex items-center gap-2 text-sm"
                  >
                    <ArrowUpRight size={12} />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterSection>

          {/* COLUMN 3: SHOP BY CATEGORY — SEO ke liye sab se ahem column.
              Ye links har page ke server HTML ka hissa hain, is liye Googlebot
              site ke kisi bhi safhe se seedha har category tak pohanch jata
              hai (aur wahan se PaginationNav ke zariye har product tak). */}
          <FooterSection title="Shop by Category">
            <ul className="space-y-3">
              {categoryLinks.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/category/${category.slug}`}
                    className="text-text-muted hover:text-primary flex items-center gap-2 text-sm"
                  >
                    <ArrowUpRight size={12} />
                    {category.title}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterSection>

          {/* COLUMN 4: SUPPORT */}
          <FooterSection title="Support">
            <ul className="space-y-3">
              {supportLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-text-muted hover:text-primary flex items-center gap-2 text-sm"
                  >
                    <ArrowUpRight size={12} />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterSection>

          {/* COLUMN 5: GET IN TOUCH */}
          <FooterSection title="Get In Touch">
            <div className="space-y-4 text-sm text-text-muted">
              <div className="flex gap-2 items-center">
                <MapPin size={16} className="text-primary shrink-0" />
                <span>Lahore, Pakistan</span>
              </div>
              <div className="flex gap-2 items-center">
                <Phone size={16} className="text-primary shrink-0" />
                <span>+92 3414159747</span>
              </div>
              <div className="flex gap-2 items-center">
                <Mail size={16} className="text-primary shrink-0" />
                <span>fancystore0078@gmail.com</span>
              </div>
            </div>
          </FooterSection>

        </div>

        {/* BOTTOM COPYRIGHT BAR */}
        <div className="border-t border-border-custom py-6 text-center">
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} Fancy Store. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;