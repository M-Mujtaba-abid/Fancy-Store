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

/* ───────── MOBILE ACCORDION FIXED ───────── */
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

      {/* Header */}
      <button
        className="md:hidden w-full flex justify-between items-center py-4"
        onClick={() => setOpen(!open)}
      >
        <span className="font-bold text-sm uppercase tracking-widest text-text-main">
          {title}
        </span>

        <ChevronDown
          size={16}
          className={`text-text-muted transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Desktop title */}
      <h4 className="hidden md:block font-bold text-lg mb-6 uppercase tracking-widest text-text-main">
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

/* ───────── FOOTER ───────── */
const Footer = () => {
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
  ];

  const supportLinks = [
    { label: "Track Order", href: "/track-order" },
    { label: "Shipping Policy", href: "/shipping-policy" },
    { label: "Return & Exchange", href: "/return-policy" },
    { label: "FAQs", href: "/faqs" },
    { label: "Privacy Policy", href: "/privacy-policy" },
  ];

  return (
    <footer className="bg-background border-t border-border-custom text-text-main">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 md:gap-12 pt-10 md:pt-16">

          {/* BRAND */}
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
                  className="p-2 bg-border-custom/30 rounded-full hover:bg-primary hover:text-white transition"
                >
                  {s.name}
                </Link>
              ))}
            </div>
          </div>

          {/* QUICK LINKS */}
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

          {/* SUPPORT */}
          <FooterSection title="Support">
            <ul className="space-y-3">
              {supportLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-text-muted hover:text-primary text-sm"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterSection>

          {/* CONTACT */}
          <FooterSection title="Get In Touch">
            <div className="space-y-4 text-sm text-text-muted">

              <div className="flex gap-2">
                <MapPin size={16} className="text-primary" />
                Lahore, Pakistan
              </div>

              <div className="flex gap-2">
                <Phone size={16} className="text-primary" />
                +92 333 4140461
              </div>

              <div className="flex gap-2">
                <Mail size={16} className="text-primary" />
                fancystore0078@gmail.com
              </div>

            </div>
          </FooterSection>

        </div>

        {/* BOTTOM */}
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