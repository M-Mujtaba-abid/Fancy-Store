"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Mail, 
  Phone, 
  MapPin,
  ArrowUpRight
} from 'lucide-react';
import { useTheme } from 'next-themes';

const Footer = () => {
  const { resolvedTheme } = useTheme();
  
  const logoSrc = resolvedTheme === "dark" ? "/logoB.png" : "/logoW.png";

  // Social Links with Custom SVG Icons for consistency and theme support
  const socialLinks = [
    {
      name: 'Facebook',
      href: '#',
      svg: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
    },
    {
      name: 'Instagram',
      href: '#',
      svg: (
        <>
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
        </>
      )
    },
    {
      name: 'X',
      href: '#',
      svg: <path d="M4 4l11.733 16h4.267l-11.733-16zM4 20l6.768-6.768m2.464-2.464l6.768-6.768"></path>
    },
    {
      name: 'TikTok',
      href: '#',
      svg: <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
    },
    {
      name: 'Youtube',
      href: '#',
      svg: (
        <>
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.11 1 12 1 12s0 3.89.46 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.89 23 12 23 12s0-3.89-.46-5.58z"></path>
          <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon>
        </>
      )
    }
  ];

  return (
    <footer className="bg-background border-t border-border-custom text-text-main pt-16 pb-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Column 1: Brand Info */}
          <div className="space-y-6">
            <Link href="/" className="inline-block">
              <Image 
                src={logoSrc} 
                alt="Fancy Store" 
                width={130} 
                height={45} 
                className="object-contain"
              />
            </Link>
            <p className="text-text-muted text-sm leading-relaxed max-w-xs">
              Providing premium quality vehicle covers for cars and bikes. 
              Protect your passion with our all-weather durable shields.
            </p>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social) => (
                <Link 
                  key={social.name} 
                  href={social.href} 
                  className="p-2 bg-border-custom/30 rounded-full hover:bg-primary hover:text-white transition-all text-text-main"
                  aria-label={social.name}
                >
                  <svg 
                    width="18" 
                    height="18" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    {social.svg}
                  </svg>
                </Link>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-6 uppercase tracking-widest text-text-main">Quick Links</h4>
            <ul className="space-y-4">
              {['Shop All', 'New Arrivals', 'Car Covers', 'Bike Covers', 'Sale'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-text-muted hover:text-primary flex items-center group text-sm transition-colors">
                    <ArrowUpRight size={14} className="mr-2 opacity-0 group-hover:opacity-100 transition-all" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Support */}
          <div>
            <h4 className="font-bold text-lg mb-6 uppercase tracking-widest text-text-main">Support</h4>
            <ul className="space-y-4">
              {['Track Order', 'Shipping Policy', 'Return & Exchange', 'FAQs', 'Privacy Policy'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-text-muted hover:text-primary text-sm transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div>
            <h4 className="font-bold text-lg mb-6 uppercase tracking-widest text-text-main">Get In Touch</h4>
            <ul className="space-y-5">
              <li className="flex items-start space-x-3 text-sm text-text-muted">
                <MapPin size={20} className="text-primary shrink-0" />
                <span>Lahore, Punjab, Pakistan<br />Main Boulevard, Gulberg III</span>
              </li>
              <li className="flex items-center space-x-3 text-sm text-text-muted">
                <Phone size={20} className="text-primary shrink-0" />
                <span>+92 300 1234567</span>
              </li>
              <li className="flex items-center space-x-3 text-sm text-text-muted">
                <Mail size={20} className="text-primary shrink-0" />
                <span>support@fancystore.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border-custom flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0">
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} <span className="font-bold text-text-main">Fancy Store</span>. All rights reserved.
          </p>
          
        </div>
      </div>
    </footer>
  );
};

export default Footer;