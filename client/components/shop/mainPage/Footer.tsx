"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin, ArrowUpRight, ChevronDown } from 'lucide-react';
import { useTheme } from 'next-themes';

// Accordion for mobile — opens/closes each section
const FooterSection = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border-custom md:border-none">
      {/* Mobile: clickable header */}
      <button
        className="md:hidden w-full flex justify-between items-center py-4 text-left"
        onClick={() => setOpen((p) => !p)}
        aria-expanded={open}
      >
        <span className="font-bold text-sm uppercase tracking-widest text-text-main">{title}</span>
        <ChevronDown
          size={16}
          className={`text-text-muted transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Desktop: always visible heading */}
      <h4 className="hidden md:block font-bold text-lg mb-6 uppercase tracking-widest text-text-main">{title}</h4>

      {/* Content — hidden on mobile unless open */}
      <div className={`overflow-hidden transition-all duration-300 md:overflow-visible md:max-h-none md:pb-0
        ${open ? 'max-h-96 pb-4' : 'max-h-0'}`}>
        {children}
      </div>
    </div>
  );
};

const Footer = () => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const logoSrc = mounted && resolvedTheme === "dark" ? "/logoB.png" : "/logoW.png";

  const socialLinks = [
    {
      name: 'Instagram',
      href: 'https://www.instagram.com/fancy.store62/',
      svg: (
        <>
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </>
      )
    },
    {
      name: 'TikTok',
      href: 'https://www.tiktok.com/@fancystore62',
      svg: <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    },
  ];

  const quickLinks = [
    { label: 'Shop All', href: '/products' },
    { label: 'New Arrivals', href: '/viewMore?filter=new-arrivals' },
    { label: 'Car Covers', href: '/viewMore?filter=car-covers' },
    { label: 'Bike Covers', href: '/viewMore?filter=bike-covers' },
    { label: 'Sale', href: '/viewMore?filter=on-sale' },
  ];

  const supportLinks = [
    { label: 'Track Order', href: '/track-order' },
    { label: 'Shipping Policy', href: '/shipping-policy' },
    { label: 'Return & Exchange', href: '/return-policy' },
    { label: 'FAQs', href: '/faqs' },
    { label: 'Privacy Policy', href: '/privacy-policy' },
  ];

  return (
    <footer className="bg-background border-t border-border-custom text-text-main transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Main Grid ── */}
        <div className="pt-10 pb-2 md:pt-16 md:pb-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 md:gap-12">

          {/* Column 1: Brand — always visible, no accordion */}
          <div className="py-8 md:py-0 space-y-5 border-b border-border-custom md:border-none">
            <Link href="/" className="inline-block">
              <Image
                src={logoSrc}
                alt="Fancy Store"
                width={120}
                height={42}
                className="object-contain"
              />
            </Link>
            <p className="text-text-muted text-sm leading-relaxed max-w-xs">
              Premium vehicle covers for cars and bikes.
              Protect your passion with all-weather durable shields.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 bg-border-custom/30 rounded-full hover:bg-primary hover:text-white transition-all text-text-main"
                  aria-label={social.name}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round">
                    {social.svg}
                  </svg>
                </Link>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <FooterSection title="Quick Links">
            <ul className="space-y-3 md:space-y-4">
              {quickLinks.map((item) => (
                <li key={item.label}>
                  <Link href={item.href}
                    className="text-text-muted hover:text-primary flex items-center group text-sm transition-colors">
                    <ArrowUpRight size={13} className="mr-2 opacity-0 group-hover:opacity-100 transition-all shrink-0" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterSection>

          {/* Column 3: Support */}
          <FooterSection title="Support">
            <ul className="space-y-3 md:space-y-4">
              {supportLinks.map((item) => (
                <li key={item.label}>
                  <Link href={item.href}
                    className="text-text-muted hover:text-primary text-sm transition-colors block">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterSection>

          {/* Column 4: Contact */}
          <FooterSection title="Get In Touch">
            <ul className="space-y-4">
              <li className="flex items-start space-x-3 text-sm text-text-muted">
                <MapPin size={18} className="text-primary shrink-0 mt-0.5" />
                <a href="https://www.google.com/maps/search/?api=1&query=Sham+Nagar+Chuburji+Lahore"
                  target="_blank" rel="noopener noreferrer"
                  className="hover:text-primary transition-colors duration-200 leading-relaxed">
                  Sham Nagar Chuburji, Lahore
                </a>
              </li>
              <li className="flex items-center space-x-3 text-sm text-text-muted">
                <Phone size={18} className="text-primary shrink-0" />
                <a href="tel:+923334140461"
                  className="hover:text-primary transition-colors duration-200">
                  +92 333 4140461
                </a>
              </li>
              <li className="flex items-center space-x-3 text-sm text-text-muted">
                <Phone size={18} className="text-primary shrink-0" />
                <a href="tel:+923051365856"
                  className="hover:text-primary transition-colors duration-200">
                  +92 305 1365856
                </a>
              </li>
              <li className="flex items-center space-x-3 text-sm text-text-muted">
                <Mail size={18} className="text-primary shrink-0" />
                <a href="mailto:fancystore0078@gmail.com"
                  className="hover:text-primary transition-colors duration-200 break-all">
                  fancystore0078@gmail.com
                </a>
              </li>
            </ul>
          </FooterSection>

        </div>

        {/* ── Bottom Bar ── */}
        <div className="py-6 border-t border-border-custom text-center">
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()}{' '}
            <span className="font-bold text-text-main">Fancy Store</span>.
            All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;