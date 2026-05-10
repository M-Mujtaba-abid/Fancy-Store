"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import { useContactForm } from '@/hooks/useContact';
import { CONTACT_CATEGORIES } from '@/constants/contactCategories';

const ContactPage = () => {
  const { formData, handleChange, handleSubmit } = useContactForm();
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
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
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary mb-4">
            <MessageSquare size={16} />
            Contact Support
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
      href="tel:+923334140461"
      className="block hover:text-primary transition-colors"
    >
      +92 333 4140461
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
                          className={`w-full px-4 py-3 text-left text-sm transition hover:bg-primary/10 ${
                            formData.category === cat.value ? 'text-primary' : 'text-text-main'
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
    </div>
  );
};

export default ContactPage;