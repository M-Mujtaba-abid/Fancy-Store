"use client";
import React, { useState } from 'react';

export default function TrackOrder() {
  const [orderId, setOrderId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderId && phoneNumber) {
      setIsSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-text-main mb-4">
            Track Your Order
          </h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            Enter your order details below to track your Fancy Store purchase
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {!isSubmitted ? (
          <div className="bg-card rounded-lg shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="orderId" className="block text-sm font-medium text-text-main mb-2">
                  Order ID *
                </label>
                <input
                  type="text"
                  id="orderId"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full px-4 py-3 border border-border-custom rounded-md bg-background text-text-main focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your order ID"
                  required
                />
              </div>

              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-text-main mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-3 border border-border-custom rounded-md bg-background text-text-main focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="03XX XXXXXXX"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-md transition-colors duration-200"
              >
                Track Order
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-card rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-text-main mb-4">Order Tracking Request Submitted</h2>
            <p className="text-text-muted mb-6">
              We'll contact you shortly with the latest update on your order.
            </p>
            <button
              onClick={() => {
                setIsSubmitted(false);
                setOrderId('');
                setPhoneNumber('');
              }}
              className="bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-6 rounded-md transition-colors duration-200"
            >
              Track Another Order
            </button>
          </div>
        )}
      </div>
    </div>
  );
}