"use client";
import React, { useState } from 'react';

const faqs = [
  {
    question: "What materials are your covers made of?",
    answer: "Our covers are made from premium weather-resistant fabric that protects against dust, rain, and UV rays."
  },
  {
    question: "Do you offer custom sizes?",
    answer: "Yes! Contact us at fancystore0078@gmail.com for custom sizing requests."
  },
  {
    question: "How long does delivery take?",
    answer: "Standard: 3–5 working days. Express (Lahore only): 1–2 working days."
  },
  {
    question: "Can I return a product?",
    answer: "Yes, within 7 days of delivery if unused and in original packaging. See our Return Policy."
  },
  {
    question: "How do I track my order?",
    answer: "Visit our Track Order page and enter your Order ID and phone number."
  },
  {
    question: "What payment methods do you accept?",
    answer: "Cash on Delivery (COD), EasyPaisa, and Bank Transfer."
  }
];

export default function FAQs() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-text-main mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            Find answers to common questions about our premium car and bike covers
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-card rounded-lg shadow-md overflow-hidden">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-primary/5 transition-colors duration-200"
              >
                <h3 className="text-lg font-semibold text-text-main pr-4">
                  {faq.question}
                </h3>
                <svg
                  className={`w-5 h-5 text-primary transform transition-transform duration-200 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-text-muted leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-primary/5 rounded-lg border border-primary/20 text-center">
          <h3 className="text-lg font-semibold text-text-main mb-2">Still have questions?</h3>
          <p className="text-text-muted mb-4">
            Can't find the answer you're looking for? We're here to help!
          </p>
          <a
            href="mailto:fancystore0078@gmail.com"
            className="inline-block bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-6 rounded-md transition-colors duration-200"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}