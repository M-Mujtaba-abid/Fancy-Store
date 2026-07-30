"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, MessageCircle, X, Headphones, Clock, ShieldCheck } from 'lucide-react';
import { useContactForm } from '@/hooks/useContact';
import { CONTACT_CATEGORIES } from '@/constants/contactCategories';

const ContactPage = () => {
  const { formData, handleChange, handleSubmit } = useContactForm();
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsChatModalOpen(false);
      }
    };
    if (isChatModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isChatModalOpen]);

  const openGlobalLiveChat = () => {
    setIsChatModalOpen(false);
    window.dispatchEvent(new CustomEvent('open-livechat'));
  };

  const openGlobalAIChat = () => {
    setIsChatModalOpen(false);
    window.dispatchEvent(new CustomEvent('open-chatwidget'));
  };

  const selectedCategory = CONTACT_CATEGORIES.find((cat) => cat.value === formData.category);

  const handleCategorySelect = (value: string) => {
    handleChange({
      target: {
        name: 'category',
        value,
      },
    } as React.ChangeEvent<HTMLSelectElement>);
    setIsCategoryOpen(false);
  };

  return (
    <div className="min-h-screen bg-surface text-text-main">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
            {/* <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              <MessageSquare size={16} />
              Contact Support
            </div> */}
            <button
              type="button"
              onClick={() => setIsChatModalOpen(true)}
              className="inline-flex items-center gap-2.5 rounded-full bg-primary/10 hover:bg-primary/20 px-4 py-2 text-sm font-semibold text-primary transition-all duration-200 hover:scale-105 cursor-pointer border border-primary/20 shadow-sm active:scale-95 group"
              aria-label="Open Live Chat Modal"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <MessageCircle size={17} className="group-hover:rotate-12 transition-transform" />
              <span>Live Chat</span>
            </button>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-text-main mb-4">
            Need Help? Get in Touch with Our Support Team
          </h1>
          <p className="mx-auto max-w-2xl text-sm sm:text-base text-text-muted leading-relaxed">
            Have questions about our premium car covers, orders, returns or anything else? Send us a message and our team will reply as quickly as possible.
          </p>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <section className="hidden lg:block space-y-6 rounded-[28px] border border-border/50 bg-card p-6 shadow-sm shadow-black/5 sm:p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Mail size={22} />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-primary/90 font-semibold">Contact Information</p>
                <h2 className="mt-2 text-2xl font-semibold text-text-main">We’re here to help</h2>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border border-border/50 bg-surface p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-main">Visit Our Store</p>

                    <a
                      href="https://maps.google.com/?q=Sham+Nagar+Chauburji+Lahore+Pakistan"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block text-sm leading-6 text-text-muted hover:text-primary transition-colors"
                    >
                      Sham Nagar, Chauburji,<br />
                      Lahore, Pakistan
                    </a>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-border/50 bg-surface p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-main">Call Us</p>

                    <div className="mt-1 text-sm leading-6 text-text-muted">
                      <a
                        href="tel:+923051365856"
                        className="block hover:text-primary transition-colors"
                      >
                        +92 305 1365856
                      </a>

                      <a
                        href="tel:+923414159747"
                        className="block hover:text-primary transition-colors"
                      >
                        +92 3414159747
                      </a>

                      <span className="text-sm text-text-muted">
                        Mon - Sat: 10:00 AM - 8:00 PM
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-border/50 bg-surface p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-500">
                    <Mail size={20} />
                  </div>
                  <div>
                    <div>
                      <p className="text-sm font-semibold text-text-main">Email Us</p>
                      <p className="mt-1 text-sm leading-6 text-text-muted">
                        <a
                          href="mailto:fancystore0078@gmail.com"
                          className="hover:text-primary transition-colors"
                        >
                          fancystore0078@gmail.com
                        </a>
                        <br />
                        <span className="text-sm text-text-muted">
                          Available for customer support & inquiries
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
              <div className="rounded-3xl border border-border/50 bg-surface p-5 text-center">
                <p className="text-2xl font-semibold text-primary">24/7</p>
                <p className="text-sm text-text-muted mt-1">Support</p>
              </div>
              <div className="rounded-3xl border border-border/50 bg-surface p-5 text-center">
                <p className="text-2xl font-semibold text-primary">&lt;1 hr</p>
                <p className="text-sm text-text-muted mt-1">Average response</p>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-border/50 bg-card p-6 shadow-sm shadow-black/5 sm:p-8">
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Send size={20} />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-primary/90 font-semibold">Send a message</p>
                <h2 className="mt-2 text-2xl font-semibold text-text-main">Reach out to our team</h2>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-text-main mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                    className="w-full rounded-2xl border border-border/50 bg-surface px-4 py-4 text-text-main outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-text-main mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your@email.com"
                    className="w-full rounded-2xl border border-border/50 bg-surface px-4 py-4 text-text-main outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-semibold text-text-main mb-2">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="What can we help you with?"
                  className="w-full rounded-2xl border border-border/50 bg-surface px-4 py-4 text-text-main outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-semibold text-text-main mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="relative" ref={categoryDropdownRef}>
                  <button
                    type="button"
                    id="category"
                    name="category"
                    onClick={() => setIsCategoryOpen((prev) => !prev)}
                    className="w-full rounded-2xl border border-border/50 bg-card px-4 py-4 pr-10 text-left text-text-main outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                  >
                    {selectedCategory?.label ?? 'Select a category'}
                  </button>
                  <div className="pointer-events-none absolute inset-y-0 right-4 top-1/2 -translate-y-1/2 text-text-muted">
                    <svg className={`h-5 w-5 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  {isCategoryOpen && (
                    <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-border/50 bg-card shadow-lg shadow-black/10">
                      {CONTACT_CATEGORIES.map((cat) => (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => handleCategorySelect(cat.value)}
                          className={`w-full px-4 py-3 text-left text-sm transition hover:bg-primary/10 ${formData.category === cat.value ? 'text-primary' : 'text-text-main'
                            }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-text-main mb-2">
                  Your Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  required
                  placeholder="Tell us how we can help you..."
                  className="w-full rounded-2xl border border-border/50 bg-surface px-4 py-4 text-text-main outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 resize-none"
                />
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-primary px-6 py-4 text-sm font-semibold text-white transition hover:bg-primary/90 focus:outline-none focus:ring-4 focus:ring-primary/20"
              >
                <Send size={20} />
                <span>Send Message</span>
              </button>

              <p className="text-center text-sm text-text-muted">
                We respect your privacy. Your information is secure and will never be shared.
              </p>
            </form>
          </section>
        </div>
      </div>

      {/* Live Chat Modal Popup */}
      {isChatModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsChatModalOpen(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-3xl border border-border/50 bg-card p-6 sm:p-8 shadow-2xl shadow-black/20 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsChatModalOpen(false)}
              className="absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-full bg-surface border border-border/50 text-text-muted hover:text-text-main hover:bg-primary/10 transition-colors"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20">
                <MessageCircle size={24} />
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-card p-0.5">
                  <span className="h-full w-full rounded-full bg-emerald-500" />
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-text-main">Live Support Chat</h3>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online
                  </span>
                </div>
                <p className="text-xs text-text-muted mt-0.5">
                  Connect with our team instantly for quick assistance
                </p>
              </div>
            </div>

            {/* Content / Options */}
            <div className="space-y-3.5">
              {/* Option 1: Live Chat Agent */}
              <button
                type="button"
                onClick={openGlobalLiveChat}
                className="w-full group text-left rounded-2xl border border-primary/20 bg-primary/5 hover:bg-primary/10 p-4 transition-all duration-200 flex items-center justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
                    <MessageCircle size={22} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-text-main group-hover:text-primary transition-colors">
                      Live Customer Agent
                    </h4>
                    <p className="text-xs text-text-muted mt-0.5">
                      Talk directly with our support team in real-time
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full group-hover:bg-primary group-hover:text-white transition-all">
                  Chat Now
                </span>
              </button>

              {/* Option 2: AI Assistant */}
              <button
                type="button"
                onClick={openGlobalAIChat}
                className="w-full group text-left rounded-2xl border border-border/50 bg-surface hover:border-primary/40 p-4 transition-all duration-200 flex items-center justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500 group-hover:scale-105 transition-transform">
                    <Headphones size={22} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-text-main group-hover:text-primary transition-colors">
                      AI Product Assistant
                    </h4>
                    <p className="text-xs text-text-muted mt-0.5">
                      Instant answers about car cover sizes & compatibility
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-text-muted group-hover:text-primary transition-colors">
                  Ask AI &rarr;
                </span>
              </button>

              {/* Option 3: WhatsApp Support */}
              <a
                href="https://wa.me/923051365856?text=Hi%2C%20I%20need%20help%20with%20an%20order%20or%20product%20inquiry."
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsChatModalOpen(false)}
                className="w-full group text-left rounded-2xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 p-4 transition-all duration-200 flex items-center justify-between block"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                    <MessageSquare size={22} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-text-main group-hover:text-emerald-600 transition-colors">
                      WhatsApp Live Chat
                    </h4>
                    <p className="text-xs text-text-muted mt-0.5">
                      Fastest response on WhatsApp (+92 305 1365856)
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  Open WhatsApp
                </span>
              </a>

              {/* Option 4: Direct Phone Call */}
              <a
                href="tel:+923051365856"
                onClick={() => setIsChatModalOpen(false)}
                className="w-full group text-left rounded-2xl border border-border/50 bg-surface hover:border-primary/40 p-4 transition-all duration-200 flex items-center justify-between block"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 group-hover:scale-105 transition-transform">
                    <Phone size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-text-main group-hover:text-primary transition-colors">
                      Phone Support Call
                    </h4>
                    <p className="text-xs text-text-muted mt-0.5">
                      Mon - Sat: 10:00 AM - 8:00 PM
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-text-muted group-hover:text-primary transition-colors">
                  Call Now &rarr;
                </span>
              </a>
            </div>

            {/* Footer note */}
            <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between text-xs text-text-muted">
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-primary" />
                Avg Response: &lt; 5 mins
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-500" />
                24/7 Support
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactPage;